import { Metadata } from "@/actions/createCheckoutSession";
import stripe from "@/lib/stripe";
import { backendClient } from "@/sanity/lib/backendClient";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      {
        error: "No signature",
      },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.log("Stripe webhook secret is not set");
    return NextResponse.json(
      {
        error: "Stripe webhook secret is not set",
      },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json(
      {
        error: `Webhook Error: ${error}`,
      },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const invoice = session.invoice
      ? await stripe.invoices.retrieve(session.invoice as string)
      : null;
    // console.log("session", session, "invoice", invoice);

    try {
      await createOrderInSanity(session, invoice);
      // const order = await createOrderInSanity(session);
      // console.log("Order created in Sanity:", order);
    } catch (error) {
      console.error("Error creating order in sanity:", error);
      return NextResponse.json(
        {
          error: `Error creating order: ${error}`,
        },
        { status: 400 }
      );
    }
  }
  return NextResponse.json({ received: true });
}

async function createOrderInSanity(
  session: Stripe.Checkout.Session,
  invoice: Stripe.Invoice | null
) {
  const {
    id,
    amount_total,
    currency,
    metadata,
    payment_intent,
    total_details,
  } = session;

  const { orderNumber, customerName, customerEmail, clerkUserId } =
    metadata as unknown as Metadata;

  // 1. Traemos los items expandidos para leer la metadata del producto
  const lineItemsWithProduct = await stripe.checkout.sessions.listLineItems(
    id,
    { expand: ["data.price.product"] }
  );

  // 2. Preparamos los productos para guardarlos en la Orden de Sanity
  const sanityProducts = lineItemsWithProduct.data.map((item) => ({
    _key: crypto.randomUUID(),
    product: {
      _type: "reference",
      _ref: (item.price?.product as Stripe.Product)?.metadata?.id,
    },
    quantity: item?.quantity || 0,
  }));

  // 3. CREAMOS LA ORDEN (Esto ya lo tenías)
  const order = await backendClient.create({
    _type: "order",
    orderNumber,
    stripeCheckoutSessionId: id,
    stripePaymentIntentId: payment_intent,
    customerName,
    stripeCustomerId: customerEmail,
    clerkUserId: clerkUserId,
    email: customerEmail,
    currency,
    amountDiscount: total_details?.amount_discount
      ? total_details.amount_discount / 100
      : 0,
    products: sanityProducts,
    totalPrice: amount_total ? amount_total / 100 : 0,
    status: "pagado",
    orderDate: new Date().toISOString(),
    invoice: invoice
      ? {
          id: invoice.id,
          number: invoice.number,
          hosted_invoice_url: invoice.hosted_invoice_url,
        }
      : null,
  });
  
  // 4. DESCONTAMOS STOCK de cada producto comprado
  console.log("Iniciando descuento de stock...");

  for (const item of lineItemsWithProduct.data) {
    const stripeProduct = item.price?.product as Stripe.Product;
    // Usamos el ID que guardaste en la metadata de Stripe
    const sanityId = stripeProduct?.metadata?.id; 
    const quantityBought = item.quantity || 1;

    if (sanityId) {
      try {
        await backendClient
          .patch(sanityId) // Buscamos el producto por su ID de Sanity
          .dec({ stock: quantityBought }) // Restamos la cantidad (.dec = decrement)
          .commit(); // Guardamos los cambios
          
        console.log(`Stock descontado (-${quantityBought}) para el producto: ${sanityId}`);
      } catch (err) {
        console.error(`Error restando stock al producto ${sanityId}:`, err);
        // No detenemos el proceso si falla uno, seguimos con el siguiente
      }
    } else {
        console.warn("No se encontró ID de Sanity en la metadata del producto de Stripe");
    }
  }

  return order;
}
