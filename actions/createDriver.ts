"use server";

import { backendClient } from "@/sanity/lib/backendClient";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createDriver(formData: FormData) {
  const name = formData.get("name") as string;
  const license = formData.get("license") as string;
  const status = formData.get("status") as string;
  const photoFile = formData.get("photo") as File;

  if (!name || !license) {
    throw new Error("Faltan datos obligatorios");
  }

  // Subir Foto a Sanity (si existe)
  let photoAsset = undefined;
  if (photoFile && photoFile.size > 0 && photoFile.name !== "undefined") {
    try {
      const buffer = Buffer.from(await photoFile.arrayBuffer());
      const asset = await backendClient.assets.upload('image', buffer, {
        contentType: photoFile.type,
        filename: photoFile.name
      });
      photoAsset = {
        _type: 'image',
        asset: { _type: "reference", _ref: asset._id }
      };
    } catch (error) {
      console.error("Error subiendo foto:", error);
    }
  }

  try {
    await backendClient.create({
      _type: "driver",
      name,
      license,
      status: status || "available",
      photo: photoAsset, // Guardamos la referencia de la imagen
    });

    console.log("✅ Chofer creado");
    revalidatePath("/admin/choferes");

  } catch (error) {
    console.error("Error creando chofer:", error);
    throw new Error("No se pudo crear el chofer");
  }

  redirect("/admin/choferes");
}