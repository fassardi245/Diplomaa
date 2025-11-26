'use server'

import { backendClient } from "@/sanity/lib/backendClient";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createVehicle(formData: FormData) {
  // 1. Extraemos los datos del formulario
  const model = formData.get("model") as string;
  const plate = formData.get("plate") as string;
  const fuelLevel = Number(formData.get("fuelLevel"));
  const status = formData.get("status") as string;

  // 2. Validaciones básicas antes de llamar a Sanity
  if (!model || !plate) {
    throw new Error("Faltan datos requeridos (Modelo o Patente)");
  }

  // 3. Generamos el Slug automáticamente basado en la patente
  // Ejemplo: "AB 123 CD" -> "ab-123-cd"
  const slugValue = plate.toLowerCase().replace(/\s+/g, '-').trim();

  try {
    // 4. Guardamos en Sanity
    await backendClient.create({
      _type: "vehicle", // ¡Muy importante! Debe coincidir con tu schema
      model: model,
      plate: plate,
      fuelLevel: fuelLevel,
      status: status || "available", // Si no eligen nada, por defecto "Disponible"
      
      // El campo slug en Sanity es un objeto, no un string simple
      slug: {
        _type: "slug",
        current: slugValue
      }
      // Nota: Por ahora no subimos la imagen para no complicar el código inicial.
      // Si funciona esto, luego agregamos la lógica de subida de archivos.
    });

    console.log("✅ Vehículo creado en Sanity");

    // 5. Actualizamos la caché de la lista de flotas
    revalidatePath("/admin/flota");
    
  } catch (error) {
    console.error("❌ Error creando vehículo:", error);
    // En una app real, aquí devolverías el error al frontend
    throw new Error("No se pudo guardar el vehículo");
  }
  
  // 6. Redirigimos al usuario a la lista
  redirect("/admin/flota");
}