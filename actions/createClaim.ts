"use server";

import { backendClient } from "@/sanity/lib/backendClient";
import { revalidatePath } from "next/cache";

export async function createClaim(formData: FormData) {
  const orderId = formData.get("orderId") as string;
  const reason = formData.get("reason") as string;
  const description = formData.get("description") as string;
  const orderNumber = formData.get("orderNumber") as string; // Para revalidar path

  if (!orderId || !reason) throw new Error("Faltan datos");

  try {
    await backendClient.create({
      _type: "claim",
      order: { _type: "reference", _ref: orderId },
      reason,
      description,
      status: "pending",
      date: new Date().toISOString(),
    });

    // Opcional: Podríamos marcar el pedido con una flag "tiene_reclamo" si quisiéramos
    
    revalidatePath(`/orders/${orderNumber}`);
    return { success: true };

  } catch (error) {
    console.error("Error creating claim:", error);
    throw new Error("No se pudo enviar el reclamo");
  }
}