import { Metadata } from "@/actions/createCheckoutSession";
import stripe from "@/lib/stripe";
import { backendClient } from "@/sanity/lib/backendClient";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { OrderFacade } from "@/lib/patterns/OrderFacade"; // <--- Importamos la Fachada

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
  } catch (error) {
    return NextResponse.json({ error: `Webhook Error: ${error}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const sessionRaw = event.data.object as Stripe.Checkout.Session;

    // 1. Expandimos datos necesarios
    const session = await stripe.checkout.sessions.retrieve(sessionRaw.id, {
      expand: ['line_items.data.price.product', 'payment_intent']
    });

    const invoice = session.invoice
      ? await stripe.invoices.retrieve(session.invoice as string)
      : null;

    try {
      // 2. CREAMOS LA ORDEN (Lógica Crítica)
      const order = await createOrderInSanity(session, invoice);
      
      // 3. LLAMAMOS A LA FACHADA (Lógica Pesada en Paralelo)
      // Extraemos los datos necesarios para no pasar el objeto session entero
      const orderData = {
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          email: order.email,
          invoiceUrl: invoice?.hosted_invoice_url || null
      };
      
      // ¡Esto ejecuta Stock + Email + Vehículo a la vez!
      await OrderFacade.handlePostSaleProcesses(
          session.id, 
          orderData, 
          session.line_items?.data || []
      );

    } catch (error: any) {
      console.error("Error en proceso de orden:", error);
      return NextResponse.json({ error: `Error: ${error.message}` }, { status: 500 });
    }
  }
  return NextResponse.json({ received: true });
}

async function createOrderInSanity(
  session: Stripe.Checkout.Session,
  invoice: Stripe.Invoice | null
) {
  const { id, amount_total, currency, metadata, payment_intent, total_details, shipping_cost, shipping_details, customer_details } = session as any;
  const { orderNumber, customerName, customerEmail, clerkUserId } = metadata as unknown as Metadata;

  // Lógica de dirección (Tu lógica "A prueba de balas")
  const shippingInfo = shipping_details || (payment_intent as any)?.shipping || customer_details;
  const shippingAddress = shippingInfo?.address ? {
    line1: shippingInfo.address.line1,
    line2: shippingInfo.address.line2 || "",
    city: shippingInfo.address.city,
    state: shippingInfo.address.state,
    postal_code: shippingInfo.address.postal_code,
    country: shippingInfo.address.country,
  } : null;

  // Preparar productos para guardar en la orden
  const lineItems = session.line_items?.data || [];
  const sanityProducts = lineItems.map((item) => ({
    _key: crypto.randomUUID(),
    product: {
      _type: "reference",
      _ref: (item.price?.product as Stripe.Product)?.metadata?.id,
    },
    quantity: item?.quantity || 0,
    price: (item.price?.unit_amount || 0) / 100
  }));

  // ID de Payment Intent
  const paymentIntentId = typeof payment_intent === 'string' ? payment_intent : payment_intent?.id;

  // --- CREACIÓN SEGURA (IDEMPOTENCIA) ---
  // Usamos createIfNotExists para evitar duplicados si Stripe reintenta
  const order = await backendClient.createIfNotExists({
    _id: id, // Usamos ID de Stripe como llave
    _type: "order",
    orderNumber,
    stripeCheckoutSessionId: id,
    stripePaymentIntentId: paymentIntentId,
    customerName,
    stripeCustomerId: customerEmail,
    clerkUserId,
    email: customerEmail,
    currency,
    amountDiscount: total_details?.amount_discount ? total_details.amount_discount / 100 : 0,
    shippingCost: total_details?.amount_shipping ? total_details.amount_shipping / 100 : 0,
    shippingMethodName: shipping_cost?.shipping_rate?.display_name || "Envío",
    shippingAddress,
    products: sanityProducts,
    totalPrice: amount_total ? amount_total / 100 : 0,
    status: "pagado",
    orderDate: new Date().toISOString(),
    invoice: invoice ? {
        id: invoice.id,
        number: invoice.number,
        hosted_invoice_url: invoice.hosted_invoice_url,
    } : null,
  });

  return order;
}