'use server'

import { backendClient } from "@/sanity/lib/backendClient";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateVehicle(formData: FormData) {
  const id = formData.get("id") as string;
  const model = formData.get("model") as string;
  const plate = formData.get("plate") as string;
  const fuelLevel = Number(formData.get("fuelLevel")) || 0;
  const mileage = Number(formData.get("mileage")) || 0;
  const imageFile = formData.get("image") as File;

  if (!id) throw new Error("Falta ID");

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

  // PATCH: NO tocamos 'status' ni 'currentRoute'
  const patch = backendClient.patch(id).set({
    model,
    plate,
    fuelLevel,
    mileage,
    ...(imageAsset && { image: imageAsset }),
  });

  await patch.commit();
  revalidatePath("/admin/flota");
  redirect("/admin/flota");
}