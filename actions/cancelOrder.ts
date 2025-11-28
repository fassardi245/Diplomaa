"use server";

import { backendClient } from "@/sanity/lib/backendClient";
import { revalidatePath } from "next/cache";

export async function cancelOrder(orderId: string) {
  try {
    // Actualizamos el estado a "cancelado"
    await backendClient
      .patch(orderId)
      .set({ status: "cancelado" })
      .commit();

    console.log(`✅ Pedido ${orderId} cancelado por el usuario.`);
    
    // Revalidamos para que la UI se actualice al instante
    revalidatePath("/orders");
    revalidatePath("/admin/orders");

  } catch (error) {
    console.error("Error al cancelar pedido:", error);
    throw new Error("No se pudo cancelar el pedido.");
  }
}