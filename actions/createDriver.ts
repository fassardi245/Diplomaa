"use server";

import { backendClient } from "@/sanity/lib/backendClient";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createDriver(formData: FormData) {
  const name = formData.get("name") as string;
  // CAMBIO: Leemos 'licenseNumber'
  const licenseNumber = formData.get("licenseNumber") as string; 
  const status = formData.get("status") as string;
  const photoFile = formData.get("photo") as File;

  if (!name || !licenseNumber) {
    throw new Error("Faltan datos obligatorios");
  }

  let photoAsset = undefined;
  if (photoFile && photoFile.size > 0 && photoFile.name !== "undefined") {
    try {
      const buffer = Buffer.from(await photoFile.arrayBuffer());
      const asset = await backendClient.assets.upload('image', buffer, {
        contentType: photoFile.type, filename: photoFile.name
      });
      photoAsset = { _type: 'image', asset: { _type: "reference", _ref: asset._id } };
    } catch (error) { console.error(error); }
  }

  try {
    await backendClient.create({
      _type: "driver",
      name,
      licenseNumber, // <--- CAMBIO: Guardamos con el nombre correcto
      status: status || "available",
      photo: photoAsset,
    });

    revalidatePath("/admin/choferes");
  } catch (error) {
    console.error("Error:", error);
    throw new Error("No se pudo crear");
  }

  redirect("/admin/choferes");
}