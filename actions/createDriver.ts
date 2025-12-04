"use server";

import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import { revalidatePath } from "next/cache";
// import { redirect } from "next/navigation"; <--- BORRA ESTA LÍNEA O COMENTALA

const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

export async function createDriver(formData: FormData) {
  const name = formData.get("name") as string;
  const license = formData.get("license") as string;
  const photo = formData.get("photo") as File | null;

  try {
    let photoAssetId = null;

    if (photo && photo.size > 0) {
      const arrayBuffer = await photo.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const asset = await writeClient.assets.upload("image", buffer, {
        contentType: photo.type,
        filename: photo.name,
      });
      photoAssetId = asset._id;
    }

    await writeClient.create({
      _type: "driver",
      name: name,
      licenseNumber: license,
      status: "available",
      photo: photoAssetId
        ? { _type: "image", asset: { _type: "reference", _ref: photoAssetId } }
        : null,
    });

    revalidatePath("/admin/choferes");
    
    // RETORNAMOS ÉXITO EN LUGAR DE REDIRECCIONAR
    return { success: true }; 
    
  } catch (error) {
    console.error("Error Sanity:", error);
    throw new Error("Fallo al crear el chofer");
  }

  // ELIMINAMOS EL REDIRECT DEL FINAL
  // redirect("/admin/choferes"); 
}