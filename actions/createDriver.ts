"use server";
import { backendClient } from "@/sanity/lib/backendClient";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createDriver(formData: FormData) {
  const name = formData.get("name") as string;
  const license = formData.get("license") as string;
  const status = formData.get("status") as string;
  const imageFile = formData.get("photo") as File;

  let imageAsset = undefined;
  if (imageFile && imageFile.size > 0) {
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const asset = await backendClient.assets.upload('image', buffer, { contentType: imageFile.type, filename: imageFile.name });
    imageAsset = { _type: 'image', asset: { _type: "reference", _ref: asset._id } };
  }

  await backendClient.create({
    _type: "driver",
    name,
    license,
    status: status || "available",
    photo: imageAsset
  });

  revalidatePath("/admin/choferes");
  redirect("/admin/choferes");
}