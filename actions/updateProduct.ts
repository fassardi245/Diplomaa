"use server";

import { backendClient } from "@/sanity/lib/backendClient";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateProduct(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const categoryId = formData.get("categoryId") as string;
  
  const price = Number(formData.get("price"));
  const discount = Number(formData.get("discount")) || 0;
  const stock = Number(formData.get("stock")) || 0;
  const description = formData.get("description") as string;
  const intro = formData.get("intro") as string;
  const status = formData.get("status") as string;
  
  // RECIBIMOS LA VARIANTE AUTOMÁTICA
  const variant = formData.get("variant") as string;
  
  const imageFile = formData.get("image") as File;

  try {
    let imageOperation = {};
    if (imageFile && imageFile.size > 0 && imageFile.name !== "undefined") {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const asset = await backendClient.assets.upload('image', buffer, {
        contentType: imageFile.type, filename: imageFile.name
      });
      imageOperation = {
        images: [{ 
          _key: crypto.randomUUID(), 
          _type: 'image', 
          asset: { _type: "reference", _ref: asset._id } 
        }]
      };
    }

    await backendClient.patch(id).set({
      name,
      price,
      discount,
      stock,
      description,
      intro,
      status,
      variant, // SE ACTUALIZA AQUÍ
      categories: [{ _type: 'reference', _ref: categoryId, _key: crypto.randomUUID() }],
      ...imageOperation,
    }).commit();

    console.log("✅ Producto actualizado");
    revalidatePath("/admin/products");

  } catch (error) {
    console.error("❌ Error actualizando:", error);
    throw new Error("Error al actualizar");
  }

  redirect("/admin/products");
}