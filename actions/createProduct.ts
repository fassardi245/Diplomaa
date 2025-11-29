"use server";

import { backendClient } from "@/sanity/lib/backendClient";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProduct(formData: FormData) {
  // 1. Extraer datos
  const name = formData.get("name") as string;
  const categoryId = formData.get("categoryId") as string; // IMPORTANTE: Lo necesitamos para el redirect
  
  const price = Number(formData.get("price"));
  const discount = Number(formData.get("discount")) || 0;
  const stock = Number(formData.get("stock")) || 0;
  
  const description = (formData.get("description") as string) || undefined;
  const intro = (formData.get("intro") as string) || undefined;
  
  const statusRaw = formData.get("status") as string;
  const status = statusRaw && statusRaw !== "" ? statusRaw : undefined;
  
  // Recibimos la variante automática desde el input oculto
  const variantRaw = formData.get("variant") as string;
  const variant = variantRaw && variantRaw !== "" ? variantRaw : undefined;
  
  const imageFile = formData.get("image") as File;

  if (!name || !categoryId) {
    throw new Error("Faltan datos requeridos");
  }

  const baseSlug = name.toLowerCase().replace(/\s+/g, '-').slice(0, 90);
  const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

  try {
    let imagesArray = undefined;
    
    if (imageFile && imageFile.size > 0 && imageFile.name !== "undefined") {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const asset = await backendClient.assets.upload('image', buffer, {
        contentType: imageFile.type, filename: imageFile.name
      });
      
      imagesArray = [
        { 
          _key: crypto.randomUUID(), 
          _type: 'image', 
          asset: { _type: "reference", _ref: asset._id } 
        }
      ];
    }

    await backendClient.create({
      _type: "product",
      name,
      slug: { _type: "slug", current: uniqueSlug },
      price,
      discount,
      stock,
      description,
      intro,
      status,
      variant, // Se guarda la variante automática
      categories: [{ 
        _type: 'reference', 
        _ref: categoryId, 
        _key: crypto.randomUUID() 
      }],
      ...(imagesArray && { images: imagesArray }),
    });

    console.log("✅ Producto creado exitosamente");
    
    // Revalidamos las rutas para actualizar las listas
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${categoryId}`);

  } catch (error) {
    console.error("❌ Error creando producto:", error);
    throw new Error("Error al guardar el producto");
  }

  // 6. REDIRECCIÓN ESPECÍFICA A LA CATEGORÍA
  redirect(`/admin/products/${categoryId}`);
}