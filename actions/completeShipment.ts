"use server";

import { backendClient } from "@/sanity/lib/backendClient";
import { revalidatePath } from "next/cache";

export async function completeShipment(shipmentId: string) {
  // 1. Traemos el envío para saber qué vehículo y pedido están involucrados
  const shipment = await backendClient.fetch(
    `*[_type == "shipment" && _id == $id][0]{
      _id,
      vehicle->{_id},
      order->{_id}
    }`,
    { id: shipmentId }
  );

  if (!shipment) throw new Error("Envío no encontrado");

  try {
    const deliveryDate = new Date().toISOString();

    // 2. Actualizar ENVÍO -> Entregado
    await backendClient
      .patch(shipmentId)
      .set({ 
        status: "delivered",
        deliveryDate: deliveryDate
      })
      .commit();

    // 3. Actualizar PEDIDO -> Entregado
    if (shipment.order?._id) {
      await backendClient
        .patch(shipment.order._id)
        .set({ status: "entregado" }) // O "delivered" según tu lista
        .commit();
    }

    // 4. LIBERAR VEHÍCULO -> Disponible (Aquí ocurre la magia)
    if (shipment.vehicle?._id) {
      await backendClient
        .patch(shipment.vehicle._id)
        .set({ 
          status: "available",
          currentRoute: "" // Limpiamos la ruta
        })
        .commit();
    }

    console.log("✅ Entrega confirmada. Vehículo liberado.");
    revalidatePath("/admin/envios");
    revalidatePath("/admin/flota");
    revalidatePath("/admin/orders");

  } catch (error) {
    console.error("Error completando envío:", error);
    throw new Error("No se pudo registrar la entrega.");
  }
}