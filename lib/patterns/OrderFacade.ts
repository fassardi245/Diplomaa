import { backendClient } from "@/sanity/lib/backendClient";
import { Resend } from "resend";
import ReceiptEmail from "@/components/emails/ReceiptEmail";
import LowStockAlertEmail from "@/components/emails/LowStockAlertEmail";
import Stripe from "stripe";

const resend = new Resend(process.env.RESEND_API_KEY);

export class OrderFacade {
  /**
   * 🚀 MÉTODO MÁGICO: Ejecuta todo en paralelo
   */
  static async handlePostSaleProcesses(
    orderId: string, 
    orderData: { orderNumber: string; customerName: string; email: string | null; invoiceUrl: string | null }, 
    lineItems: Stripe.LineItem[]
  ) {
    console.time("Velocidad_Procesamiento"); // Para que veas la velocidad en consola

    // Lanzamos las 3 tareas al mismo tiempo. No esperan a la anterior.
    await Promise.allSettled([
      this.updateStockAndAlert(lineItems),
      this.sendCustomerReceipt(orderData),
      this.assignLogistics(orderId) // Asignación automática de vehículo
    ]);

    console.timeEnd("Velocidad_Procesamiento");
    console.log("✅ [Facade] Todas las tareas post-venta finalizadas.");
  }

  // --- TAREA 1: Stock y Alertas (Tu lógica anterior, pero optimizada) ---
  private static async updateStockAndAlert(lineItems: Stripe.LineItem[]) {
    // Procesamos todos los productos en paralelo también
    const updates = lineItems.map(async (item) => {
      const product = item.price?.product as Stripe.Product;
      const sanityId = product?.metadata?.id;
      const quantity = item.quantity || 1;

      if (sanityId) {
        try {
          // Traemos info actual para chequear stock bajo
          const productDoc = await backendClient.fetch(`*[_id == $id][0]{name, stock}`, { id: sanityId });
          
          if (productDoc) {
            const newStock = (productDoc.stock || 0) - quantity;
            
            // Restamos stock en Sanity
            await backendClient.patch(sanityId).dec({ stock: quantity }).commit();
            
            // Si hay stock bajo, mandamos alerta
            if (newStock <= 5) {
               console.log(`⚠️ [Stock] Alerta enviada para: ${productDoc.name}`);
               await resend.emails.send({
                  from: 'onboarding@resend.dev',
                  to: ['francoignacio.crovetto@gmail.com'], // TU EMAIL ADMIN
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

  // --- TAREA 2: Email al Cliente ---
  private static async sendCustomerReceipt(data: any) {
    if (!data.email) return;
    
    try {
      await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: [data.email], // En modo test, solo a tu email registrado
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

  // --- TAREA 3: Logística Automática (Vehículo) ---
  private static async assignLogistics(orderId: string) {
    try {
      // Buscar vehículo libre
      const vehicle = await backendClient.fetch(`*[_type == "vehicle" && status == "available"][0]`);
      
      if (vehicle) {
          console.log(`🚚 [Logística] Asignando vehículo: ${vehicle.plate}`);
          // Actualizamos orden y vehículo en paralelo
          await Promise.all([
              backendClient.patch(orderId).set({ 
                  assignedVehicle: { _type: 'reference', _ref: vehicle._id },
                  shippingCost: 1500 // Costo simulado
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