"use server";

import { backendClient } from "@/sanity/lib/backendClient";
import { revalidatePath } from "next/cache";

export async function deleteOrder(orderId: string) {
  try {
    await backendClient.delete(orderId);
    revalidatePath("/admin/orders");
  } catch (error) {
    console.error("Error al eliminar pedido:", error);
    throw new Error("No se pudo eliminar el pedido");
  }
}