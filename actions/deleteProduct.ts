"use server";

import { backendClient } from "@/sanity/lib/backendClient";
import { revalidatePath } from "next/cache";
import { logAction } from "@/lib/auditLogger";
import { currentUser } from "@clerk/nextjs/server";

export async function deleteProduct(productId: string) {
  try {
    const user = await currentUser();
    // Obtenemos el producto antes de borrarlo para guardar su nombre y datos
    const productBefore = await backendClient.fetch(`*[_id == $id][0]`, { id: productId });

    await backendClient.delete(productId);
    
    await logAction({
      action: "DELETE",
      entityType: "Producto",
      entityId: productId,
      userEmail: user?.emailAddresses?.[0]?.emailAddress || "Desconocido",
      // timestamp: new Date().toISOString(), // <--- ELIMINADO: El logger lo pone automático
      changes: JSON.stringify({
        name: productBefore?.name || "Producto Eliminado",
        before: productBefore,
        after: null
      })
    });

    revalidatePath("/admin/products");
    
  } catch (error) {
    console.error("Error eliminando producto:", error);
    throw new Error("No se pudo eliminar el producto");
  }
}