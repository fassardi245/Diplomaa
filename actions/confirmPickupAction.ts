"use server";

import { backendClient } from "@/sanity/lib/backendClient";
import { revalidatePath } from "next/cache";

export async function confirmPickupAction(orderId: string) {
  try {
    await backendClient
      .patch(orderId)
      .set({ status: "entregado" })
      .commit();

    revalidatePath("/admin/envios");
  } catch (error) {
    console.error("Error confirmando retiro:", error);
    throw new Error("No se pudo confirmar la entrega.");
  }
}