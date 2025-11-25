import { backendClient } from "@/sanity/lib/backendClient";
import { Accion, Component, Grupo, Usuario } from "./CompositePattern";

// 1. Función Recursiva: Convierte JSON de Sanity -> Clases TypeScript
function construirArbol(data: any): Component | null {
  if (!data) return null;

  // A. Si es una Acción (Hoja)
  if (data._type === "accion") {
    return new Accion(data.titulo, data.slug.current);
  }

  // B. Si es un Grupo (Composite)
  if (data._type === "grupo") {
    const grupo = new Grupo(data.nombre);
    
    // Si tiene hijos, los procesamos uno por uno (RECURSIVIDAD)
    if (data.hijos && Array.isArray(data.hijos)) {
      data.hijos.forEach((hijoData: any) => {
        const hijoConstruido = construirArbol(hijoData);
        if (hijoConstruido) {
          grupo.agregarHijo(hijoConstruido);
        }
      });
    }
    return grupo;
  }

  return null;
}

// 2. Función Principal: La que llamarás desde tus páginas
export async function obtenerUsuarioSeguridad(clerkId: string, email: string) {
  // Query GROQ profunda: Trae al usuario y sus roles anidados (hasta 3 niveles de profundidad)
  const query = `*[_type == "usuario" && clerkId == $clerkId][0]{
    ...,
    rolesAsignados[]->{
      _type, nombre, titulo, slug,
      hijos[]->{
        _type, nombre, titulo, slug,
        hijos[]->{
            _type, nombre, titulo, slug,
            hijos[]->{ _type, nombre, titulo, slug }
        }
      }
    }
  }`;

  const userSanity = await backendClient.fetch(query, { clerkId });



  // Si no existe en Sanity, devolvemos un usuario sin permisos
  if (!userSanity || !userSanity.rolesAsignados) {
    return new Usuario(clerkId, email, []);
  }

  // Convertimos el array de JSONs en un array de Componentes (Clases)
  const listaRoles = userSanity.rolesAsignados
    .map((rolData: any) => construirArbol(rolData))
    .filter((rol: any): rol is Component => rol !== null);

  // Retornamos el objeto Usuario listo para usar con .puedo()
  return new Usuario(clerkId, email, listaRoles);
}