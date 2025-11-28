"use server";

import { backendClient } from "@/sanity/lib/backendClient";
import { revalidatePath } from "next/cache";

export async function completeShipment(shipmentId: string) {
  // Traemos envío + vehículo + orden + chofer
  const shipment = await backendClient.fetch(
    `*[_type == "shipment" && _id == $id][0]{
      _id,
      vehicle->{_id},
      order->{_id},
      driver->{_id} 
    }`,
    { id: shipmentId }
  );

  if (!shipment) throw new Error("Envío no encontrado");

  try {
    const deliveryDate = new Date().toISOString();

    // 1. Actualizar ENVÍO -> Entregado
    await backendClient.patch(shipmentId).set({ 
        status: "delivered",
        deliveryDate: deliveryDate
      }).commit();

    // 2. Actualizar PEDIDO -> Entregado
    if (shipment.order?._id) {
      await backendClient.patch(shipment.order._id).set({ status: "entregado" }).commit();
    }

    // 3. LIBERAR VEHÍCULO -> Disponible
    if (shipment.vehicle?._id) {
      await backendClient.patch(shipment.vehicle._id).set({ 
          status: "available",
          currentRoute: "" 
        }).commit();
    }

    // 4. LIBERAR CHOFER -> Disponible
    if (shipment.driver?._id) {
      await backendClient.patch(shipment.driver._id).set({ status: "available" }).commit();
    }

    console.log("✅ Entrega confirmada. Recursos liberados.");
    revalidatePath("/admin/envios");
    revalidatePath("/admin/flota");
    revalidatePath("/admin/orders");

  } catch (error) {
    console.error("Error completando envío:", error);
    throw new Error("No se pudo registrar la entrega.");
  }
}