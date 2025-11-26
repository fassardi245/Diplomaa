'use server'

import { backendClient } from "@/sanity/lib/backendClient";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateVehicle(formData: FormData) {
  const id = formData.get("id") as string; // El ID oculto
  const model = formData.get("model") as string;
  const plate = formData.get("plate") as string;
  const status = formData.get("status") as string;
  const currentRoute = formData.get("currentRoute") as string;
  const fuelLevel = Number(formData.get("fuelLevel")) || 0;
  const mileage = Number(formData.get("mileage")) || 0;
  const lastMaintenance = formData.get("lastMaintenance") as string;
  const imageFile = formData.get("image") as File;

  if (!id || !model || !plate) {
    throw new Error("Faltan datos requeridos");
  }

  // Lógica de Imagen (Solo actualizamos si suben una nueva)
  let imageAsset = undefined;
  if (imageFile && imageFile.size > 0 && imageFile.name !== "undefined") {
    try {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const asset = await backendClient.assets.upload('image', buffer, {
        contentType: imageFile.type,
        filename: imageFile.name,
      });
      imageAsset = {
        _type: 'image',
        asset: { _type: "reference", _ref: asset._id }
      };
    } catch (err) {
      console.error("Error subiendo nueva imagen:", err);
    }
  }

  try {
    // PATCH: Actualizamos solo los campos que cambiaron
    const patch = backendClient.patch(id).set({
      model,
      plate,
      status,
      fuelLevel,
      mileage,
      lastMaintenance,
      currentRoute: currentRoute || "", // Si lo borran, guardamos string vacío
      ...(imageAsset && { image: imageAsset }), // Solo actualiza imagen si hay nueva
    });

    await patch.commit();
    console.log("✅ Vehículo actualizado");
    revalidatePath("/admin/flota");

  } catch (error) {
    console.error("❌ Error al actualizar:", error);
    throw new Error("No se pudo actualizar el vehículo");
  }
  
  redirect("/admin/flota");
}