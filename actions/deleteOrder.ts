"use server";

import { backendClient } from "@/sanity/lib/backendClient";
import { revalidatePath } from "next/cache";

export async function deleteOrder(orderId: string) {
  if (!orderId) throw new Error("No se recibió ID de pedido");

  console.log(`🗑️ Iniciando proceso de eliminación para: ${orderId}`);

  try {
    // 1. BUSQUEDA AMPLIA DE REFERENCIAS
    // Buscamos CUALQUIER documento que esté apuntando a este pedido.
    // Esto incluye 'shipment' y cualquier otro futuro schema que crees.
    const referencesQuery = `*[references($orderId)]._id`;
    const referencingIds = await backendClient.fetch(referencesQuery, { orderId });

    console.log(`🔎 Se encontraron ${referencingIds.length} documentos asociados.`);

    // 2. CREAR TRANSACCIÓN
    const transaction = backendClient.transaction();

    // A. Si hay referencias (envíos, etc.), las borramos primero
    if (referencingIds.length > 0) {
      referencingIds.forEach((refId: string) => {
        console.log(`   - Agendando borrado de dependencia: ${refId}`);
        transaction.delete(refId);
      });
    }

    // B. Borramos el pedido principal
    console.log(`   - Agendando borrado de pedido principal: ${orderId}`);
    transaction.delete(orderId);

    // 3. EJECUTAR
    await transaction.commit();
    console.log("✅ Eliminación en cascada exitosa.");

    // 4. REVALIDAR
    revalidatePath("/admin/orders");
    revalidatePath("/admin/envios");
    revalidatePath("/admin/flota");

    // Retornamos éxito (para que el cliente no reciba JSON vacío)
    return { success: true };

  } catch (error: any) {
    console.error("❌ ERROR CRÍTICO EN DELETE:", error);
    // IMPORTANTE: Lanzar el error para que el cliente lo note, pero con mensaje claro
    throw new Error(`Fallo al eliminar: ${error.message}`);
  }
}