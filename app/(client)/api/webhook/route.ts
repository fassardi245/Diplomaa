import { Metadata } from "@/actions/createCheckoutSession";
import stripe from "@/lib/stripe";
import { backendClient } from "@/sanity/lib/backendClient";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from 'resend';
import ReceiptEmail from '@/components/emails/ReceiptEmail';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.log("Stripe webhook secret is not set");
    return NextResponse.json({ error: "Stripe webhook secret is not set" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: `Webhook Error: ${error}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const sessionRaw = event.data.object as Stripe.Checkout.Session;

    // --- 1. RECUPERAR DATOS EXPANDIDOS (AQUÍ ESTÁ LA SOLUCIÓN) ---
    // Agregamos 'payment_intent' para buscar la dirección ahí si falta en la sesión
    const session = await stripe.checkout.sessions.retrieve(sessionRaw.id, {
      expand: [
        'line_items.data.price.product', 
        'shipping_cost.shipping_rate',
        'payment_intent' // <--- ¡ESTO ES LO QUE FALTABA!
      ]
    });

    // --- Check de Idempotencia ---
    try {
        const existingOrder = await backendClient.fetch(
            `*[_type == "order" && stripeCheckoutSessionId == $sessionId][0]`,
            { sessionId: session.id }
        );
        if (existingOrder) {
            return NextResponse.json({ message: "Order already processed" });
        }
    } catch (err) {
        console.error("Error checking idempotency", err);
    }

    const invoice = session.invoice
      ? await stripe.invoices.retrieve(session.invoice as string)
      : null;

    try {
      await createOrderInSanity(session, invoice);
    } catch (error) {
      console.error("Error creating order in sanity:", error);
      return NextResponse.json({ error: `Error creating order: ${error}` }, { status: 400 });
    }
  }
  return NextResponse.json({ received: true });
}

async function createOrderInSanity(
  session: Stripe.Checkout.Session,
  invoice: Stripe.Invoice | null
) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const sessionData = session as any;

  // Extraemos el Payment Intent expandido
  const paymentIntent = sessionData.payment_intent as Stripe.PaymentIntent;

  // --- LÓGICA DE DIRECCIÓN "A PRUEBA DE BALAS" ---
  // 1. Buscamos en shipping_details de la sesión.
  // 2. SI NO ESTÁ (tu caso): Buscamos en el payment_intent.shipping.
  // 3. SI NO ESTÁ: Buscamos en customer_details (último recurso).
  const shippingDetails = 
      sessionData.shipping_details || 
      paymentIntent?.shipping || 
      sessionData.customer_details;

  console.log("📍 Dirección encontrada en:", sessionData.shipping_details ? "Session" : (paymentIntent?.shipping ? "PaymentIntent" : "CustomerDetails"));
  
  const {
    id,
    amount_total,
    currency,
    metadata,
    payment_intent,
    total_details,
    shipping_cost,   
  } = sessionData;
  
  const { orderNumber, customerName, customerEmail, clerkUserId } =
    metadata as unknown as Metadata;

  // 1. Obtener NOMBRE del envío
  const shippingRate = shipping_cost?.shipping_rate as Stripe.ShippingRate;
  const shippingMethodName = shippingRate?.display_name || "Envío"; 

  // 2. Preparar Productos
  const lineItems = session.line_items?.data || [];
  const sanityProducts = lineItems.map((item) => {
    const product = item.price?.product as Stripe.Product;
    return {
      _key: crypto.randomUUID(),
      product: {
        _type: "reference",
        _ref: product?.metadata?.id,
      },
      name: product.name,
      quantity: item?.quantity || 0,
      price: (item.price?.unit_amount || 0) / 100,
      image: product.images?.[0] || null,
    };
  });

  // 3. Preparar Dirección
  const shippingAddress = shippingDetails?.address ? {
    line1: shippingDetails.address.line1,
    line2: shippingDetails.address.line2 || "",
    city: shippingDetails.address.city,
    state: shippingDetails.address.state,
    postal_code: shippingDetails.address.postal_code,
    country: shippingDetails.address.country,
  } : null;

  // 4. CREAR LA ORDEN
  const order = await backendClient.create({
    _type: "order",
    orderNumber,
    stripeCheckoutSessionId: id,
    stripePaymentIntentId: typeof payment_intent === 'string' ? payment_intent : payment_intent?.id,
    customerName,
    stripeCustomerId: customerEmail,
    clerkUserId: clerkUserId,
    email: customerEmail,
    currency,
    amountDiscount: total_details?.amount_discount ? total_details.amount_discount / 100 : 0,
    
    shippingCost: total_details?.amount_shipping ? total_details.amount_shipping / 100 : 0,
    shippingMethodName: shippingMethodName,
    shippingAddress: shippingAddress, 

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
  
  // 5. ENVIAR EMAIL
  if (customerEmail) {
      try {
        await resend.emails.send({
            from: 'onboarding@resend.dev', 
            to: [customerEmail], 
            subject: `Recibo de compra #${orderNumber}`,
            react: ReceiptEmail({
                orderNumber: orderNumber,
                customerName: customerName,
                invoiceUrl: invoice?.hosted_invoice_url || null
            }),
        });
      } catch (error) {
          console.error("Error enviando recibo:", error);
      }
  }

  return order;
}