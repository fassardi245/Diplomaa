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

  // 2. BUSCAR VEHÍCULO DISPONIBLE (RF2 - Automático)
  // Filtramos que NO esté en mantenimiento y que esté 'available'
  const availableVehicle = await backendClient.fetch(
    `*[_type == "vehicle" && status == "available"][0]`
  );

  if (!availableVehicle) {
    // Si no hay vehículos, lanzamos error (o podrías ponerlo en cola de espera)
    throw new Error("No hay vehículos disponibles en la flota en este momento.");
  }

  try {
    const departureDate = new Date().toISOString();

    // 3. CREAR EL ENVÍO
    await backendClient.create({
      _type: "shipment",
      order: { _type: "reference", _ref: orderId },
      vehicle: { _type: "reference", _ref: availableVehicle._id },
      driverName: "Chofer Automático #1", // Aquí podrías tener una tabla de choferes
      destinationAddress: "Dirección del Cliente (Simulada)", 
      status: "in_transit",
      departureDate: departureDate,
    });

    // 4. ACTUALIZAR EL PEDIDO -> "En Camino"
    await backendClient
      .patch(orderId)
      .set({ status: "en camino" })
      .commit();

    // 5. ACTUALIZAR EL VEHÍCULO -> "En Ruta" (Y bloqueamos su ruta)
    await backendClient
      .patch(availableVehicle._id)
      .set({ 
        status: "in_transit",
        currentRoute: `Entrega Pedido #${order.orderNumber.slice(-6)}`
      })
      .commit();

    console.log(`✅ Logística asignada: Pedido ${orderId} -> Vehículo ${availableVehicle.plate}`);
    
    revalidatePath("/admin/envios");
    revalidatePath("/admin/orders");
    revalidatePath("/admin/flota");

  } catch (error) {
    console.error("Error en logística:", error);
    throw new Error("Fallo en el proceso logístico automático.");
  }

  redirect("/admin/envios");
}