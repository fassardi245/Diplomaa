"use server";

import { backendClient } from "@/sanity/lib/backendClient";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteDriver(id: string) {
  if (!id) throw new Error("ID es requerido");

  try {
    console.log(`🗑️ Iniciando proceso de eliminación para: ${id}`);

    // 1. Buscamos todos los documentos que estén usando a este chofer
    // (Por ejemplo: Vehículos asignados, Viajes, etc.)
    const references = await backendClient.fetch(
      `*[references($id)]`, 
      { id }
    );

    if (references.length > 0) {
      console.log(`⚠️ Se encontraron ${references.length} documentos vinculados. Desvinculando...`);
      
      // Creamos una transacción para asegurar que todo se haga junto
      const transaction = backendClient.transaction();

      references.forEach((doc: any) => {
        // ASUNCIÓN: Asumimos que el campo en los otros documentos se llama "driver".
        // Si en tu Schema de vehículos el campo se llama de otra forma (ej: "chofer"),
        // cambia 'driver' por el nombre correcto abajo.
        transaction.patch(doc._id, (p) => p.unset(['driver']));
      });

      // Agregamos la eliminación del chofer a la transacción
      transaction.delete(id);

      // Ejecutamos todo
      await transaction.commit();
      console.log("✅ Referencias eliminadas y chofer borrado.");

    } else {
      // Si nadie lo usa, lo borramos directo
      await backendClient.delete(id);
      console.log("✅ Chofer eliminado (no tenía referencias).");
    }

    revalidatePath("/admin/choferes");
    
  } catch (error: any) {
    console.error("❌ Error eliminando chofer:", error);
    // Lanzamos el error para que se vea en consola si algo falla muy grave
    throw new Error(`Error al eliminar: ${error.message}`);
  }

  redirect("/admin/choferes");
}