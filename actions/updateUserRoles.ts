'use server'

import { backendClient } from "@/sanity/lib/backendClient";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateUserRoles(formData: FormData) {
  const userId = formData.get("userId") as string;
  
  // formData.getAll obtiene TODOS los valores de los checkboxes con el mismo nombre
  const selectedRoleIds = formData.getAll("roles") as string[];

  try {
    // 1. Construimos el array de referencias para Sanity
    // Sanity espera objetos así: { _type: 'reference', _ref: 'ID_DEL_ROL' }
    const rolesReferences = selectedRoleIds.map(roleId => ({
      _key: roleId, // Sanity pide una key única para arrays
      _type: "reference",
      _ref: roleId
    }));

    // 2. Hacemos el Patch (Actualización)
    await backendClient
      .patch(userId) // Buscamos al usuario por su ID de Sanity
      .set({ rolesAsignados: rolesReferences }) // Reemplazamos el array viejo por el nuevo
      .commit();

    console.log(`✅ Roles actualizados para el usuario ${userId}`);

    // 3. Actualizamos la caché
    revalidatePath("/admin/users");

  } catch (error) {
    console.error("❌ Error actualizando roles:", error);
    throw new Error("No se pudieron actualizar los roles");
  }

  // 4. Volvemos a la lista
  redirect("/admin/users");
}