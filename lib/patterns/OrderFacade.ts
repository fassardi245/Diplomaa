import { backendClient } from "@/sanity/lib/backendClient";
import { Resend } from "resend";
import ReceiptEmail from "@/components/emails/ReceiptEmail";
import LowStockAlertEmail from "@/components/emails/LowStockAlertEmail";
import Stripe from "stripe";
import stripe from "@/lib/stripe"; 
import { Metadata } from "@/actions/createCheckoutSession"; 

const resend = new Resend(process.env.RESEND_API_KEY);

export class OrderFacade {
  
  static async createOrder(session: Stripe.Checkout.Session, invoice: Stripe.Invoice | null) {
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

    // Logica de Envio 
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

  static async handlePostSaleProcesses(
    orderId: string, 
    orderData: { orderNumber: string; customerName: string; email: string | null; invoiceUrl: string | null }, 
    lineItems: Stripe.LineItem[],
    runLogistics: boolean = false 
  ) {
    console.time("Velocidad_Procesamiento");

    const tasks: Promise<any>[] = [
      this.updateStockAndAlert(lineItems),
      this.sendCustomerReceipt(orderData),
    ];

    if (runLogistics) {
      tasks.push(this.assignLogistics(orderId));
    }

    await Promise.allSettled(tasks);

    console.timeEnd("Velocidad_Procesamiento");
    console.log("✅ [Facade] Tareas post-venta finalizadas (Logística: " + (runLogistics ? "SI" : "NO") + ")");
  }

  //  Stock y Alertas 
  private static async updateStockAndAlert(lineItems: Stripe.LineItem[]) {
    const updates = lineItems.map(async (item) => {
      const product = item.price?.product as Stripe.Product;
      const sanityId = product?.metadata?.id;
      const quantity = item.quantity || 1;

      if (sanityId) {
        try {
          const productDoc = await backendClient.fetch(`*[_id == $id][0]{name, stock}`, { id: sanityId });
          
          if (productDoc) {
            const newStock = (productDoc.stock || 0) - quantity;
            await backendClient.patch(sanityId).dec({ stock: quantity }).commit();
            
            if (newStock <= 5) {
               console.log(`⚠️ [Stock] Alerta enviada para: ${productDoc.name}`);
               await resend.emails.send({
                  from: 'onboarding@resend.dev',
                  to: ['francoignacio.crovetto@gmail.com'], 
                  subject: `⚠️ Stock Bajo: ${productDoc.name}`,
                  react: LowStockAlertEmail({ 
                      productName: productDoc.name, 
                      remainingStock: newStock, 
                      productId: sanityId 
                  })
              });
            }
          }
        } catch (error) {
          console.error(`❌ Error Stock ${sanityId}:`, error);
        }
      }
    });
    await Promise.all(updates);
  }

  // Email al Cliente
  private static async sendCustomerReceipt(data: any) {
    if (!data.email) return;
    try {
      await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: [data.email], 
          subject: `Recibo de compra #${data.orderNumber}`,
          react: ReceiptEmail({
              orderNumber: data.orderNumber,
              customerName: data.customerName,
              invoiceUrl: data.invoiceUrl
          })
      });
      console.log(`📧 [Email] Recibo enviado a cliente.`);
    } catch (error) {
      console.error("❌ Error enviando recibo:", error);
    }
  }

  // --- TAREA 3: Logística Automática ---
  private static async assignLogistics(orderId: string) {
    try {
      const vehicle = await backendClient.fetch(`*[_type == "vehicle" && status == "available"][0]`);
      if (vehicle) {
          console.log(`🚚 [Logística] Asignando vehículo: ${vehicle.plate}`);
          await Promise.all([
              backendClient.patch(orderId).set({ 
                  assignedVehicle: { _type: 'reference', _ref: vehicle._id },
              }).commit(),
              backendClient.patch(vehicle._id).set({ status: 'in_transit' }).commit()
          ]);
      } else {
          console.log("🚚 [Logística] No hay vehículos disponibles.");
      }
    } catch (error) {
      console.error("❌ Error Logística:", error);
    }
  }
}