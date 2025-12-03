"use server";

import { client } from "@/sanity/lib/client";
import { revalidatePath } from "next/cache";
import stripe from "@/lib/stripe"; // Asegúrate de tener configurado lib/stripe.ts

export async function resolveClaimAction(claimId: string, orderId: string, status: string, adminResponse: string) {
  try {
    const writeClient = client.withConfig({
      token: process.env.SANITY_API_TOKEN, 
      useCdn: false,
    });

    // 1. Actualizamos el reclamo
    await writeClient
      .patch(claimId)
      .set({ status: status, adminResponse: adminResponse })
      .commit();

    // 2. Si se aprueba, ejecutamos Stripe y actualizamos la orden
    if (status === 'approved' && orderId) {
      
      // A. Obtener el paymentIntentId de la orden
      const order = await writeClient.fetch(`*[_type == "order" && _id == $id][0]{ stripePaymentIntentId }`, { id: orderId });
      
      if (order?.stripePaymentIntentId) {
        // B. Reembolsar en Stripe
        const refund = await stripe.refunds.create({
          payment_intent: order.stripePaymentIntentId,
          reason: 'requested_by_customer',
        });

        // C. Obtener la URL del recibo
        let receiptUrl = null;
        if (refund.charge) {
          const charge = await stripe.charges.retrieve(refund.charge as string);
          receiptUrl = charge.receipt_url;
        }

        // D. Guardar URL y cambiar estado a 'devuelto' (minúscula)
        await writeClient
          .patch(orderId)
          .set({ 
            status: 'devuelto',
            refundReceiptUrl: receiptUrl 
          })
          .commit();
      }
    }

    revalidatePath("/admin/reclamos");
    revalidatePath("/admin/orders");
    revalidatePath("/orders"); 
    
    return { success: true };
  } catch (error) {
    console.error("Error en Server Action:", error);
    return { success: false, error: "Error al actualizar" };
  }
}