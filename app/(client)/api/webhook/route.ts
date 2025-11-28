import { Metadata } from "@/actions/createCheckoutSession";
import stripe from "@/lib/stripe";
import { backendClient } from "@/sanity/lib/backendClient";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from 'resend';
import LowStockAlertEmail from '@/components/emails/LowStockAlertEmail';
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
    const session = event.data.object as Stripe.Checkout.Session;

    // --- 1. CHECK DE IDEMPOTENCIA (Anti-Duplicados) ---
    // Preguntamos a Sanity si ya existe una orden con este ID de sesión
    try {
        const existingOrder = await backendClient.fetch(
            `*[_type == "order" && stripeCheckoutSessionId == $sessionId][0]`,
            { sessionId: session.id }
        );

        if (existingOrder) {
            console.log(`⚠️ Orden duplicada detectada (${existingOrder.orderNumber}). Ignorando creación.`);
            return NextResponse.json({ message: "Order already processed" });
        }
    } catch (err) {
        console.error("Error verificando idempotencia:", err);
    }
    // --------------------------------------------------

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
  
  const {
    id,
    amount_total,
    currency,
    metadata,
    payment_intent,
    total_details, // <--- Aquí viene el shipping de Stripe
  } = session;

  const { orderNumber, customerName, customerEmail, clerkUserId } =
    metadata as unknown as Metadata;

  const lineItemsWithProduct = await stripe.checkout.sessions.listLineItems(
    id,
    { expand: ["data.price.product"] }
  );

  const sanityProducts = lineItemsWithProduct.data.map((item) => ({
    _key: crypto.randomUUID(),
    product: {
      _type: "reference",
      _ref: (item.price?.product as Stripe.Product)?.metadata?.id,
    },
    quantity: item?.quantity || 0,
  }));

  // 2. CREAMOS LA ORDEN
  const order = await backendClient.create({
    _type: "order",
    orderNumber,
    stripeCheckoutSessionId: id,
    stripePaymentIntentId: payment_intent as string,
    customerName,
    stripeCustomerId: customerEmail,
    clerkUserId: clerkUserId,
    email: customerEmail,
    currency,
    amountDiscount: total_details?.amount_discount
      ? total_details.amount_discount / 100
      : 0,
    
    // --- 3. GUARDAMOS EL COSTO DE ENVÍO ---
    shippingCost: total_details?.amount_shipping 
      ? total_details.amount_shipping / 100 
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
  
  // 4. GESTIÓN DE STOCK Y ALERTAS
  console.log("Iniciando gestión de stock y alertas...");

  for (const item of lineItemsWithProduct.data) {
    const stripeProduct = item.price?.product as Stripe.Product;
    const sanityId = stripeProduct?.metadata?.id; 
    const quantityBought = item.quantity || 1;

    if (sanityId) {
      try {
        const productDoc = await backendClient.fetch(
            `*[_type == "product" && _id == $id][0]{name, stock}`, 
            { id: sanityId }
        );

        if (productDoc) {
            const currentStock = productDoc.stock || 0;
            const newStock = currentStock - quantityBought;

            await backendClient
              .patch(sanityId)
              .dec({ stock: quantityBought })
              .commit();
            
            console.log(`Stock descontado (-${quantityBought}). Nuevo stock: ${newStock}`);

            if (newStock <= 5) {
                console.log("⚠️ ALERTA: Stock bajo. Enviando email al admin...");
                await resend.emails.send({
                    from: 'onboarding@resend.dev',
                    to: ['francoignacio.crovetto@gmail.com'], 
                    subject: `⚠️ Alerta de Stock Bajo: ${productDoc.name}`,
                    react: LowStockAlertEmail({
                        productName: productDoc.name,
                        remainingStock: newStock,
                        productId: sanityId
                    }),
                });
            }
        }
      } catch (err) {
        console.error(`Error gestionando stock para ${sanityId}:`, err);
      }
    }
  }

  // 5. ENVIAR RECIBO AL CLIENTE
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
        console.log(`Recibo enviado a ${customerEmail}`);
      } catch (error) {
          console.error("Error enviando recibo al cliente:", error);
      }
  }

  return order;
}