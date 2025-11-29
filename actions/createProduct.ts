"use server";

import { backendClient } from "@/sanity/lib/backendClient";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProduct(formData: FormData) {
  // 1. Extraer datos con valores por defecto seguros
  const name = formData.get("name") as string;
  const categoryId = formData.get("categoryId") as string;
  
  const price = Number(formData.get("price"));
  const discount = Number(formData.get("discount")) || 0;
  const stock = Number(formData.get("stock")) || 0;
  
  // Limpiamos strings: Si viene vacío o null, mandamos undefined para que Sanity lo ignore
  const description = (formData.get("description") as string) || undefined;
  const intro = (formData.get("intro") as string) || undefined;
  
  // Para los selects, si viene "" (vacío), mandamos undefined
  const statusRaw = formData.get("status") as string;
  const status = statusRaw && statusRaw !== "" ? statusRaw : undefined;
  
  const imageFile = formData.get("image") as File;

  // 2. Validación crítica
  if (!name || !categoryId) {
    console.error("❌ Faltan datos requeridos: Nombre o Categoría");
    throw new Error("Faltan datos requeridos");
  }

  // 3. Generar Slug Único (Agregamos 4 dígitos random para evitar errores de duplicado)
  const baseSlug = name.toLowerCase().replace(/\s+/g, '-').slice(0, 90);
  const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

  try {
    // 4. Subir Imagen (si existe)
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

    // 5. Crear en Sanity
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
      // variant ELIMINADO
      categories: [{ 
        _type: 'reference', 
        _ref: categoryId, 
        _key: crypto.randomUUID() 
      }],
      ...(imagesArray && { images: imagesArray }), // Solo agregamos si hay imagen
    });

    console.log("✅ Producto creado exitosamente");
    
    revalidatePath("/admin/products");

  } catch (error) {
    console.error("❌ Error creando producto en Sanity:", error);
    throw new Error("Error al guardar el producto");
  }

  // 6. Redirigir al éxito
  redirect(`/admin/products/${categoryId}`);
}