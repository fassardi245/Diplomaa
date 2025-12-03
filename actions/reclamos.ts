"use server";

import { client } from "@/sanity/lib/client";
import { revalidatePath } from "next/cache";

// Ahora aceptamos orderId como parámetro
export async function resolveClaimAction(claimId: string, orderId: string, status: string, adminResponse: string) {
  try {
    const writeClient = client.withConfig({
      token: process.env.SANITY_API_TOKEN, 
      useCdn: false,
    });

    // 1. Actualizamos el RECLAMO (Como antes)
    await writeClient
      .patch(claimId)
      .set({ 
        status: status,
        adminResponse: adminResponse 
      })
      .commit();

    // 2. EL ARREGLO: Si se aprueba, actualizamos la ORDEN a "Devuelto"
    if (status === 'approved' && orderId) {
      await writeClient
        .patch(orderId)
        .set({ status: 'Devuelto' }) // Esto cambia el texto en la lista de pedidos
        .commit();
    }

    // Actualizamos ambas pantallas
    revalidatePath("/admin/reclamos");
    revalidatePath("/orders"); 
    
    return { success: true };
  } catch (error) {
    console.error("Error en Server Action:", error);
    return { success: false, error: "Error al actualizar" };
  }
}