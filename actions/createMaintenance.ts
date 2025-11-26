"use server";

import { backendClient } from "@/sanity/lib/backendClient";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createMaintenance(formData: FormData) {
  const vehicleId = formData.get("vehicleId") as string;
  const type = formData.get("type") as string;
  const description = formData.get("description") as string;
  const date = formData.get("date") as string;
  const cost = Number(formData.get("cost")) || 0;
  const status = "in_progress"; 

  if (!vehicleId || !date || !type) {
    throw new Error("Faltan datos");
  }

  try {
    // 1. Crear el registro de Mantenimiento
    await backendClient.create({
      _type: "maintenance",
      vehicle: { _type: "reference", _ref: vehicleId },
      type,
      description,
      date,
      cost,
      status,
    });

    // 2. Actualizar el vehículo
    // Forzamos el estado a mantenimiento y guardamos la fecha ingresada
    await backendClient
      .patch(vehicleId)
      .set({ 
        status: "maintenance", 
        lastMaintenance: date // Se guarda la fecha en el vehículo
      })
      .commit();

    console.log("✅ Nuevo mantenimiento creado y fecha actualizada.");
    
    revalidatePath("/admin/flota");
    revalidatePath("/admin/mantenimiento");

  } catch (error) {
    console.error("Error:", error);
    throw new Error("No se pudo registrar el mantenimiento");
  }

  redirect("/admin/mantenimiento");
}