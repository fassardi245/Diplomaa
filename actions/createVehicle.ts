'use server'

import { backendClient } from "@/sanity/lib/backendClient";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createVehicle(formData: FormData) {
  // 1. Datos
  const model = formData.get("model") as string;
  const plate = formData.get("plate") as string;
  const status = formData.get("status") as string;
  const currentRoute = formData.get("currentRoute") as string;
  const fuelLevel = Number(formData.get("fuelLevel")) || 0;
  const mileage = Number(formData.get("mileage")) || 0;
  const lastMaintenance = formData.get("lastMaintenance") as string;
  
  // Archivo de imagen
  const imageFile = formData.get("image") as File;

  // 2. Validaciones Manuales (Backup por si alguien hackea el HTML)
  if (!model || !plate) {
    throw new Error("Faltan datos requeridos");
  }
  // Sanity pide max 10 chars. Si mandan más, cortamos o damos error.
  if (plate.length > 10 || plate.length < 6) {
    throw new Error("La patente debe tener entre 6 y 10 caracteres");
  }

  const slugValue = plate.toLowerCase().replace(/\s+/g, '-').trim();

  // 3. Subida de Imagen ROBUSTA
  let imageAsset = undefined;

  // Verificamos que sea un archivo real y tenga tamaño
  if (imageFile && imageFile.size > 0 && imageFile.name !== "undefined") {
    try {
      console.log("📤 Subiendo imagen a Sanity...");
      
      // TRUCO: Convertir File a Buffer para asegurar compatibilidad con Node.js
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Subimos el Buffer
      const asset = await backendClient.assets.upload('image', buffer, {
        contentType: imageFile.type,
        filename: imageFile.name,
      });
      
      console.log("✅ Imagen subida, ID:", asset._id);

      // Creamos el objeto de referencia para Sanity
      imageAsset = {
        _type: 'image',
        asset: {
          _type: "reference",
          _ref: asset._id
        }
      };
    } catch (err) {
      console.error("❌ Error subiendo imagen:", err);
      // No frenamos la creación, solo avisamos en consola
    }
  }

  try {
    // 4. Crear documento
    await backendClient.create({
      _type: "vehicle",
      model,
      plate,
      status: status || "available",
      fuelLevel,
      mileage,
      lastMaintenance,
      // Solo guardamos ruta si no está vacía
      ...(currentRoute && { currentRoute }),
      
      // Asignamos la imagen (puede ser undefined si no hubo)
      image: imageAsset,
      
      slug: { _type: "slug", current: slugValue }
    });

    console.log("✅ Vehículo guardado exitosamente.");
    revalidatePath("/admin/flota");

  } catch (error) {
    console.error("❌ Error al guardar vehículo:", error);
    throw new Error("Error crítico al crear vehículo");
  }
  
  redirect("/admin/flota");
}