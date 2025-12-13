"use server";

// 1. IMPORTAMOS EL CLIENTE DE BACKEND (EL QUE TIENE PERMISOS)
import { backendClient } from "@/sanity/lib/backendClient"; 
import { revalidatePath } from "next/cache";

export async function createGroup(formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const accionesSeleccionadas = formData.getAll("acciones") as string[];

  if (!nombre) return;

  try {
    // 2. USAMOS DIRECTAMENTE backendClient
    // Ya viene configurado con el token en tu archivo backendClient.ts
    await backendClient.create({
      _type: "grupo", 
      nombre: nombre,
      hijos: accionesSeleccionadas.map((id) => ({
        _type: "reference",
        _ref: id,
        _key: id,
      })),
    });

    
    revalidatePath("/admin/users", "layout"); 
    
  } catch (error) {
    console.error("Error creando grupo:", error);
    throw new Error("No se pudo crear el grupo");
  }
}