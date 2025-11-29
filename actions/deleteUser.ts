"use server";

import { backendClient } from "@/sanity/lib/backendClient";
import { revalidatePath } from "next/cache";
import { clerkClient } from "@clerk/nextjs/server"; // Importamos el cliente de Clerk

export async function deleteUser(sanityId: string, clerkId: string) {
  try {
    console.log(`🗑️ Intentando eliminar usuario. SanityID: ${sanityId}, ClerkID: ${clerkId}`);
    
    // 1. Eliminar de Clerk (Si existe un ID de Clerk)
    if (clerkId && clerkId !== "N/A") {
      try {
        const client = await clerkClient();
        await client.users.deleteUser(clerkId);
        console.log("✅ Usuario eliminado de Clerk");
      } catch (clerkError) {
        console.error("⚠️ Error al eliminar de Clerk (puede que ya no exista):", clerkError);
        // No detenemos el proceso, seguimos para borrarlo de Sanity
      }
    }

    // 2. Eliminar el documento en Sanity
    // IMPORTANTE: backendClient debe tener un token con permisos de ESCRITURA en tu .env
    await backendClient.delete(sanityId);
    console.log("✅ Usuario eliminado de Sanity");
    
    // 3. Revalidar la ruta para actualizar la tabla visualmente
    revalidatePath("/admin/users");
    
    return { success: true, message: "Usuario eliminado de todos los sistemas correctamente" };
  } catch (error) {
    console.error("❌ Error CRÍTICO al eliminar usuario:", error);
    return { success: false, message: "Hubo un error al eliminar el usuario." };
  }
}