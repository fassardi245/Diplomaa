"use server";

import { backendClient } from "@/sanity/lib/backendClient";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAction } from "@/lib/auditLogger";
import { currentUser } from "@clerk/nextjs/server"; // <--- 1. IMPORTAR CLERK

export async function updateProduct(formData: FormData) {
  const id = formData.get("id") as string;
  
  const name = formData.get("name") as string;
  const categoryId = formData.get("categoryId") as string;
  const price = Number(formData.get("price"));
  const discount = Number(formData.get("discount")) || 0;
  const stock = Number(formData.get("stock")) || 0;
  const description = formData.get("description") as string;
  const intro = formData.get("intro") as string;
  const variant = formData.get("variant") as string;
  const imageFile = formData.get("image") as File;

  // 2. OBTENER USUARIO ACTUAL (CLERK)
  const user = await currentUser();
  // Puedes elegir guardar el Email (Recomendado para auditoría) o el Nombre
  const userIdentifier = user?.emailAddresses[0]?.emailAddress || "Usuario Desconocido";
  // Si prefieres el nombre, usa esta línea en su lugar:
  // const userIdentifier = user ? `${user.firstName} ${user.lastName}` : "Usuario Desconocido";

  try {
    // 1. Snapshot del valor original (Antes)
    const previousProduct = await backendClient.fetch(
      `*[_type == "product" && _id == $id][0]{
        name, price, stock, description, discount, variant, intro
      }`, 
      { id }
    );

    // Lógica de Imagen
    let imageOperation = {};
    const hasNewImage = imageFile && imageFile.size > 0 && imageFile.name !== "undefined";
    
    if (hasNewImage) {
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

    const newData = {
      name, price, discount, stock, description, intro, variant,
      categories: [{ _type: 'reference', _ref: categoryId, _key: crypto.randomUUID() }],
    };

    // 2. Actualizar Producto
    await backendClient.patch(id).set({
      ...newData,
      ...imageOperation,
    }).commit();

    console.log("✅ Producto actualizado por:", userIdentifier);

    // 3. Guardar Log con el Usuario Real
    await logAction({
      action: "UPDATE",
      resource: "products",
      entityId: id,
      userEmail: userIdentifier, // <--- AQUÍ PASAMOS EL DATO CLAVE
      details: {
        before: previousProduct || "No disponible",
        after: {
          ...newData,
          imageUpdated: hasNewImage
        }
      }
    });
    
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${categoryId}`);

  } catch (error) {
    console.error("❌ Error actualizando:", error);
    throw new Error("Error al actualizar");
  }

  redirect(`/admin/products/${categoryId}`);
}