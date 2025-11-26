'use server'

import { backendClient } from "@/sanity/lib/backendClient";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createVehicle(formData: FormData) {
  const model = formData.get("model") as string;
  const plate = formData.get("plate") as string;
  const fuelLevel = Number(formData.get("fuelLevel")) || 0;
  const mileage = Number(formData.get("mileage")) || 0;
  const imageFile = formData.get("image") as File;

  if (!model || !plate) throw new Error("Faltan datos");

  // Lógica de imagen (Igual que antes)
  let imageAsset = undefined;
  if (imageFile && imageFile.size > 0 && imageFile.name !== "undefined") {
    try {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const asset = await backendClient.assets.upload('image', buffer, {
        contentType: imageFile.type,
        filename: imageFile.name,
      });
      imageAsset = { _type: 'image', asset: { _type: "reference", _ref: asset._id } };
    } catch (err) { console.error(err); }
  }

  const slugValue = plate.toLowerCase().replace(/\s+/g, '-').trim();

  await backendClient.create({
    _type: "vehicle",
    model,
    plate,
    status: "available", // <--- SIEMPRE DISPONIBLE AL CREAR
    fuelLevel,
    mileage,
    currentRoute: "", // Sin ruta inicial
    image: imageAsset,
    slug: { _type: "slug", current: slugValue }
  });

  revalidatePath("/admin/flota");
  redirect("/admin/flota");
}