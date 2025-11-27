"use server";

import { backendClient } from "@/sanity/lib/backendClient";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const price = Number(formData.get("price"));
  const discount = Number(formData.get("discount")) || 0; // Campo Obligatorio
  const stock = Number(formData.get("stock"));
  const categoryId = formData.get("categoryId") as string;
  const description = formData.get("description") as string;
  const intro = formData.get("intro") as string;
  const status = formData.get("status") as string;
  const variant = formData.get("variant") as string;
  
  const imageFile = formData.get("image") as File;

  if (!name || !categoryId) throw new Error("Faltan datos requeridos");

  // Slug automático
  const slugValue = name.toLowerCase().replace(/\s+/g, '-').slice(0, 96);

  // Subir Imagen (Adaptado para Array)
  let imagesArray = undefined;
  
  if (imageFile && imageFile.size > 0) {
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const asset = await backendClient.assets.upload('image', buffer, {
      contentType: imageFile.type, filename: imageFile.name
    });
    
    // IMPORTANTE: Tu schema pide un ARRAY de imágenes
    imagesArray = [
      { 
        _key: crypto.randomUUID(), // Necesario para arrays en Sanity
        _type: 'image', 
        asset: { _type: "reference", _ref: asset._id } 
      }
    ];
  }

  await backendClient.create({
    _type: "product",
    name,
    slug: { _type: "slug", current: slugValue },
    price,
    discount, // Obligatorio
    stock,
    description,
    intro,
    status,   // Opcional pero útil
    variant,  // Opcional pero útil
    categories: [{ _type: 'reference', _ref: categoryId, _key: crypto.randomUUID() }],
    images: imagesArray, // Usamos 'images' (plural) y pasamos un array
  });

  revalidatePath("/admin/products");
  // Redirigir a la categoría seleccionada para ver el producto ahí
  redirect(`/admin/products/${categoryId}`);
}