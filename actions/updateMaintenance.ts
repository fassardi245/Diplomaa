"use server";

import { backendClient } from "@/sanity/lib/backendClient";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateMaintenance(formData: FormData) {
  const id = formData.get("id") as string;
  const vehicleId = formData.get("vehicleId") as string;
  const type = formData.get("type") as string;
  const description = formData.get("description") as string;
  const date = formData.get("date") as string; // La nueva fecha
  const cost = Number(formData.get("cost")) || 0;
  const status = formData.get("status") as string; 

  if (!id || !vehicleId) throw new Error("Datos incompletos");

  try {
    // 1. Actualizar el registro de Mantenimiento (La ficha del taller)
    await backendClient.patch(id).set({
      type,
      description,
      date,
      cost,
      status
    }).commit();

    // 2. ACTUALIZAR EL VEHÍCULO (La ficha de la flota)
    // Aquí determinamos el estado Y actualizamos la fecha
    const newStatus = status === "completed" ? "available" : "maintenance";

    await backendClient
      .patch(vehicleId)
      .set({ 
        status: newStatus,
        lastMaintenance: date // <--- ¡ESTA LÍNEA FALTABA! Ahora actualiza la fecha en el vehículo.
      })
      .commit();

    console.log("✅ Mantenimiento y Vehículo sincronizados.");

    revalidatePath("/admin/flota");
    revalidatePath("/admin/mantenimiento");

  } catch (error) {
    console.error("Error updating maintenance:", error);
    throw new Error("No se pudo actualizar");
  }

  redirect("/admin/mantenimiento");
}