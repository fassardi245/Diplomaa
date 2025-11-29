"use server";

import { backendClient } from "@/sanity/lib/backendClient";
import { revalidatePath } from "next/cache";

export async function deleteProduct(productId: string) {
  try {
    await backendClient.delete(productId);
    
    // Revalidamos para que desaparezca de la lista al instante
    revalidatePath("/admin/products");
    
  } catch (error) {
    console.error("Error eliminando producto:", error);
    throw new Error("No se pudo eliminar el producto");
  }
}