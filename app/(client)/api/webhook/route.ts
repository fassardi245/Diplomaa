import { Metadata } from "@/actions/createCheckoutSession";
import stripe from "@/lib/stripe";
import { backendClient } from "@/sanity/lib/backendClient";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { OrderFacade } from "@/lib/patterns/OrderFacade";

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
      // 1. Creamos la orden en Sanity (Esto hace que aparezca en "Pendientes")
      const order = await createOrderInSanity(session, invoice);
      
      const orderData = {
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          email: order.email,
          invoiceUrl: invoice?.hosted_invoice_url || null
      };
      
      // 2. CORRECCIÓN: DETENEMOS LA LOGÍSTICA AUTOMÁTICA
      // Comentamos estas líneas para que NO se asigne vehículo ni chofer automáticamente al pagar.
      // Ahora el sistema esperará a que tú hagas clic en "Iniciar Logística" en el Dashboard.
      
      /* await OrderFacade.handlePostSaleProcesses(
          session.id, 
          orderData, 
          session.line_items?.data || []
      );
      */

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

  const shippingInfo = shipping_details || (payment_intent as any)?.shipping || customer_details;
  const shippingAddress = shippingInfo?.address ? {
    line1: shippingInfo.address.line1,
    line2: shippingInfo.address.line2 || "",
    city: shippingInfo.address.city,
    state: shippingInfo.address.state,
    postal_code: shippingInfo.address.postal_code,
    country: shippingInfo.address.country,
  } : null;

  // Lógica de Envío (Nombre y Costo Real)
  const realShippingCost = shipping_cost?.amount_total || 0;
  let shippingMethodName = "Envío"; 
  
  if (shipping_cost?.shipping_rate) {
    try {
        const rateId = typeof shipping_cost.shipping_rate === 'string' 
            ? shipping_cost.shipping_rate 
            : shipping_cost.shipping_rate.id;
            
        const rate = await stripe.shippingRates.retrieve(rateId);
        
        if (rate.display_name) {
            shippingMethodName = rate.display_name;
        }
    } catch (err) {
        console.error("Error recuperando nombre del envío desde Stripe:", err);
        if (typeof shipping_cost.shipping_rate !== 'string' && shipping_cost.shipping_rate?.display_name) {
            shippingMethodName = shipping_cost.shipping_rate.display_name;
        }
    }
  }

  const lineItems = session.line_items?.data || [];
  const sanityProducts = lineItems.map((item: any) => {
    const product = item.price?.product as Stripe.Product;
    return {
      _key: crypto.randomUUID(),
      product: {
        _type: "reference",
        _ref: product.metadata?.id,
      },
      name: product.name,
      quantity: item?.quantity || 0,
      price: item.price?.unit_amount || 0,
      image: product.images?.[0] || ""
    };
  });

  const paymentIntentId = typeof payment_intent === 'string' ? payment_intent : payment_intent?.id;

  const order = await backendClient.createIfNotExists({
    _id: id,
    _type: "order",
    orderNumber,
    stripeCheckoutSessionId: id,
    stripePaymentIntentId: paymentIntentId,
    customerName,
    stripeCustomerId: customerEmail,
    clerkUserId,
    email: customerEmail,
    currency,
    amountDiscount: total_details?.amount_discount || 0,
    shippingCost: realShippingCost, 
    shippingMethodName: shippingMethodName, 
    shippingAddress,
    products: sanityProducts,
    totalPrice: amount_total || 0,
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