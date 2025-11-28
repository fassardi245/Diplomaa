"use server";

import { backendClient } from "@/sanity/lib/backendClient";
import { revalidatePath } from "next/cache";

export async function deleteOrder(orderId: string) {
  try {
    console.log(`🗑️ Intentando eliminar pedido: ${orderId}`);

    // 1. BUSCAR DEPENDENCIAS (Envíos asociados)
    // Buscamos si existe algún 'shipment' que apunte a este pedido
    const shipmentQuery = `*[_type == "shipment" && order._ref == $orderId]._id`;
    const shipmentsToDelete = await backendClient.fetch(shipmentQuery, { orderId });

    // 2. PREPARAR TRANSACCIÓN
    // Usamos una transacción para que se borre todo junto o nada (más seguro)
    const transaction = backendClient.transaction();

    // A. Si hay envíos asociados, los agendamos para borrar
    if (shipmentsToDelete.length > 0) {
      console.log(`⚠️ Se encontraron ${shipmentsToDelete.length} envíos asociados. Borrando...`);
      shipmentsToDelete.forEach((shipId: string) => {
        transaction.delete(shipId);
      });
    }

    // B. Agendamos el borrado del pedido
    transaction.delete(orderId);

    // 3. EJECUTAR
    await transaction.commit();
    
    console.log("✅ Pedido y sus dependencias eliminados correctamente.");
    revalidatePath("/admin/orders");
    revalidatePath("/admin/envios");

  } catch (error: any) {
    // Esto te mostrará el error REAL en tu terminal de VS Code
    console.error("❌ Error detallado de Sanity:", error.message);
    throw new Error("No se pudo eliminar el pedido (Revisa la terminal)");
  }
}