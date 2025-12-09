"use server";

import { backendClient } from "@/sanity/lib/backendClient";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function assignLogistics(orderId: string) {
  // 1. Obtener datos del pedido
  const order = await backendClient.fetch(`*[_type == "order" && _id == $id][0]`, { id: orderId });
  
  if (!order) throw new Error("Pedido no encontrado");
  if (order.status === "en camino" || order.status === "entregado") {
    throw new Error("Este pedido ya tiene logística asignada");
  }

  
  // A. Buscar Vehículo
  const availableVehicle = await backendClient.fetch(
    `*[_type == "vehicle" && status == "available"][0]`
  );

  // B. Buscar Chofer
  const availableDriver = await backendClient.fetch(
    `*[_type == "driver" && status == "available"][0]`
  );

  if (!availableVehicle) {
    throw new Error("No hay vehículos disponibles en la flota.");
  }

  if (!availableDriver) {
    throw new Error("No hay choferes disponibles para realizar el viaje.");
  }

  try {
    const departureDate = new Date().toISOString();

    let formattedAddress = "Retiro en Local / Dirección no especificada";

    if (order.shippingAddress) {
      const { line1, city, state, postal_code, country } = order.shippingAddress;
      const parts = [line1, city, state, postal_code, country].filter(Boolean);
      if (parts.length > 0) {
        formattedAddress = parts.join(", ");
      }
    }

    // 3. CREAR EL ENVÍO (Con referencia a Chofer)
    await backendClient.create({
      _type: "shipment",
      order: { _type: "reference", _ref: orderId },
      vehicle: { _type: "reference", _ref: availableVehicle._id },
      driver: { _type: "reference", _ref: availableDriver._id }, 
      destinationAddress: formattedAddress, 
      status: "in_transit",
      departureDate: departureDate,
    });

    // 4. ACTUALIZAR ESTADOS
    
    // Pedido -> En Camino
    await backendClient.patch(orderId).set({ status: "en camino" }).commit();

    // Vehículo -> En Tránsito
    await backendClient.patch(availableVehicle._id).set({ 
        status: "in_transit",
        currentRoute: `Entrega Pedido #${order.orderNumber.slice(-6)}`
      }).commit();

    // Chofer -> Ocupado (Busy)
    await backendClient.patch(availableDriver._id).set({ status: "busy" }).commit();

    console.log(`✅ Logística asignada: Pedido ${orderId} -> Vehículo ${availableVehicle.plate} -> Chofer ${availableDriver.name}`);
    
    revalidatePath("/admin/envios");
    revalidatePath("/admin/orders");
    revalidatePath("/admin/flota");

  } catch (error) {
    console.error("Error en logística:", error);
    throw new Error("Fallo en el proceso logístico automático.");
  }

  redirect("/admin/envios");
}