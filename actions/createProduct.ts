"use server";

import { backendClient } from "@/sanity/lib/backendClient";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAction } from "@/lib/auditLogger";

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const categoryId = formData.get("categoryId") as string;
  
  const price = Number(formData.get("price"));
  const discount = Number(formData.get("discount")) || 0;
  const stock = Number(formData.get("stock")) || 0;
  
  const description = (formData.get("description") as string) || undefined;
  const intro = (formData.get("intro") as string) || undefined;
  
  
  
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
    
    // Subida de imagen Server-Side con backendClient
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
      variant,
      categories: [{ 
        _type: 'reference', 
        _ref: categoryId, 
        _key: crypto.randomUUID() 
      }],
      ...(imagesArray && { images: imagesArray }),
    });

    console.log("✅ Producto creado exitosamente");

    // Registro en Audit Log
    // Usamos 'as any' para evitar el error de tipos estricto de TypeScript
    // ya que no conocemos la estructura exacta de LogData.
      await logAction({
        action: "CREATE",
        resource: "products", // Ahora TypeScript ya reconoce 'resource'
        details: {
          name,
          price,
          stock,
          categoryId,
          slug: uniqueSlug
        }
      });
    
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${categoryId}`);

  } catch (error) {
    console.error("❌ Error creando producto:", error);
    throw new Error("Error al guardar el producto");
  }

  redirect(`/admin/products/${categoryId}`);
}