import stripe from "@/lib/stripe";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { OrderFacade } from "@/lib/patterns/OrderFacade";
import { logAction } from "@/lib/auditLogger"; 

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) return NextResponse.json({ error: "No secret" }, { status: 400 });

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (error: any) {
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const sessionRaw = event.data.object as Stripe.Checkout.Session;

    // Recuperamos la sesión expandiendo lo necesario
    const session = await stripe.checkout.sessions.retrieve(sessionRaw.id, {
      expand: [
        'line_items.data.price.product', 
        'payment_intent',
        'shipping_cost.shipping_rate' 
      ]
    });

    const invoice = session.invoice
      ? await stripe.invoices.retrieve(session.invoice as string)
      : null;

    try {
      // Usamos el Facade para CREAR la orden
      const order = await OrderFacade.createOrder(session, invoice);
      
      const orderData = {
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          email: order.email,
          invoiceUrl: invoice?.hosted_invoice_url || null
      };

      //  AUDITORÍA: Registramos el nacimiento del Pedido
      await logAction({
        action: "CREATE",
        entityType: "Pedido",
        entityId: order._id || `Order-${order.orderNumber}`, // Usamos _id de Sanity si el Facade lo devuelve, sino el número
        userEmail: order.email,
        ipAddress: headersList.get("x-forwarded-for") || "Stripe-Webhook",
        changes: {
          event: "Pago Confirmado (Stripe)",
          status: "Pagado", // Estado inicial
          total: session.amount_total ? session.amount_total / 100 : 0,
          currency: session.currency,
          stripeSessionId: session.id
        }
      });
      // ---------------------------------------------------------
      
      // 2. Usamos el Facade para procesos Post-Venta (Emails y Stock)
      await OrderFacade.handlePostSaleProcesses(
          session.id, 
          orderData, 
          session.line_items?.data || [],
      );

    } catch (error: any) {
      console.error("Error en proceso de orden:", error);
      // Opcional: Podrías auditar el error también si quisieras
      return NextResponse.json({ error: `Error: ${error.message}` }, { status: 500 });
    }
  }
  return NextResponse.json({ received: true });
}