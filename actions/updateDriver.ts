"use server";

import { backendClient } from "@/sanity/lib/backendClient";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateDriver(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const licenseNumber = formData.get("licenseNumber") as string;
  const status = formData.get("status") as string;
  const photoFile = formData.get("photo") as File;

  if (!id || !name || !licenseNumber) {
    throw new Error("Faltan datos obligatorios");
  }

  // Subir Nueva Foto (solo si el usuario seleccionó una nueva)
  let photoOperation = {};
  if (photoFile && photoFile.size > 0 && photoFile.name !== "undefined") {
    try {
      const buffer = Buffer.from(await photoFile.arrayBuffer());
      const asset = await backendClient.assets.upload('image', buffer, {
        contentType: photoFile.type,
        filename: photoFile.name
      });
      
      // Preparamos la operación de actualización para la foto
      photoOperation = {
        photo: { 
          _type: 'image', 
          asset: { _type: "reference", _ref: asset._id } 
        }
      };
    } catch (error) {
      console.error("Error subiendo nueva foto:", error);
    }
  }

  try {
    // Actualizamos el documento existente
    await backendClient.patch(id).set({
      name,
      licenseNumber,
      status,
      ...photoOperation, // Solo se incluye si hubo foto nueva
    }).commit();

    console.log("✅ Chofer actualizado");
    revalidatePath("/admin/choferes");

  } catch (error) {
    console.error("Error actualizando chofer:", error);
    throw new Error("No se pudo actualizar el chofer");
  }

  redirect("/admin/choferes");
}