'use server'

import { clerkClient } from "@clerk/nextjs/server";
import { backendClient } from "@/sanity/lib/backendClient";
import { revalidatePath } from "next/cache";

export async function syncUsers() {
  try {
    // 1. Traer TODOS los usuarios VIVOS de Clerk
    const clerkClientInstance = await clerkClient();
    const clerkUsersResponse = await clerkClientInstance.users.getUserList({ limit: 100 });
    const clerkUsers = clerkUsersResponse.data;

    // Creamos un Set (lista rápida) con los IDs de Clerk para buscar rápido
    const clerkUserIds = new Set(clerkUsers.map(u => u.id));

    console.log(`🔄 Sincronizando. Usuarios en Clerk: ${clerkUsers.length}`);

    // ---------------------------------------------------------
    // PASO A: CREAR USUARIOS NUEVOS (Lo que ya tenías)
    // ---------------------------------------------------------
    let creados = 0;
    for (const cUser of clerkUsers) {
      const email = cUser.emailAddresses[0]?.emailAddress;
      if (!email) continue;

      // Verificamos si existe en Sanity
      const existingUser = await backendClient.fetch(
        `*[_type == "usuario" && clerkId == $clerkId][0]._id`,
        { clerkId: cUser.id }
      );

      if (!existingUser) {
        await backendClient.create({
          _type: "usuario",
          clerkId: cUser.id,
          email: email,
          rolesAsignados: []
        });
        console.log(`✅ Usuario creado: ${email}`);
        creados++;
      }
    }

    // ---------------------------------------------------------
    // PASO B: ELIMINAR USUARIOS FANTASMA (Lo nuevo)
    // ---------------------------------------------------------
    // 1. Traemos todos los usuarios que hay en Sanity actualmente
    const sanityUsers = await backendClient.fetch(
      `*[_type == "usuario"] { _id, clerkId, email }`
    );

    let eliminados = 0;

    // 2. Recorremos los de Sanity y preguntamos: "¿Este ID sigue existiendo en Clerk?"
    for (const sUser of sanityUsers) {
      // Si el usuario de Sanity tiene un clerkId, pero ese ID NO está en la lista de Clerk...
      if (sUser.clerkId && !clerkUserIds.has(sUser.clerkId)) {
        
        console.log(`🗑️ Eliminando usuario obsoleto: ${sUser.email} (ID: ${sUser.clerkId})`);
        
        // ...Lo borramos de la base de datos
        await backendClient.delete(sUser._id);
        eliminados++;
      }
    }

    console.log(`🏁 Sincronización terminada. Creados: ${creados} | Eliminados: ${eliminados}`);
    
    // Refrescamos la pantalla
    revalidatePath("/admin/users");
    
    return { success: true, creados, eliminados };

  } catch (error) {
    console.error("❌ Error sincronizando usuarios:", error);
    return { success: false, error };
  }
}