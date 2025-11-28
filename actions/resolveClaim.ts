"use server";

import { backendClient } from "@/sanity/lib/backendClient";
import { revalidatePath } from "next/cache";

export async function resolveClaim(claimId: string, orderId: string, resolution: "approved" | "rejected") {
  try {
    // 1. Actualizar el Reclamo
    await backendClient.patch(claimId).set({ 
      status: resolution,
      // resolvedAt: new Date().toISOString() // Si tu schema lo tuviera
    }).commit();

    // 2. Si se APRUEBA -> Cambiar estado de la orden a "devuelto"
    if (resolution === "approved") {
      await backendClient.patch(orderId).set({ status: "devuelto" }).commit();
    } 
    // 3. Si se RECHAZA -> Podemos dejarla "entregado" o poner "reclamo_rechazado"
    else {
      // Opcional: Podrías crear un estado específico si quieres
      // await backendClient.patch(orderId).set({ status: "reclamo_rechazado" }).commit();
    }

    revalidatePath("/admin/reclamos");
    revalidatePath("/admin/orders");
  } catch (error) {
    console.error(error);
    throw new Error("Error al resolver reclamo");
  }
}