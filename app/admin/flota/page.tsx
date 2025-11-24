import { currentUser } from "@clerk/nextjs/server";
import { obtenerUsuarioSeguridad } from "../../../sanity/lib/securityFactory";
import { redirect } from "next/navigation";

export default async function FleetPage() {
  // 1. Autenticación (Clerk): ¿Quién eres?
  const user = await currentUser();
  if (!user) return <div>Inicia sesión por favor.</div>;

  // 2. Autorización (Tu Patrón Composite): ¿Qué puedes hacer?
  // Le pasamos el ID y el Email para armar el objeto
  const usuarioSeguridad = await obtenerUsuarioSeguridad(
    user.id, 
    user.emailAddresses[0].emailAddress
  );

  // 3. Verificamos el permiso usando el método limpio
  // OJO: Asegúrate de crear una acción en Sanity con slug 'ver_flota'
  if (!usuarioSeguridad.puedo("ver_flota")) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-600">
        <h1 className="text-2xl font-bold">⛔ Acceso Denegado</h1>
        <p>No tienes el permiso 'ver_flota' en ninguno de tus grupos asignados.</p>
      </div>
    );
  }

  // 4. Si pasa el if, mostramos la página
  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-4">🚛 Gestión de Flota</h1>
      
      {/* Ejemplo: Botón que solo ve quien puede editar */}
      {usuarioSeguridad.puedo("editar_vehiculo") && (
        <button className="bg-blue-600 text-white px-4 py-2 rounded mb-4">
          + Agregar Nuevo Vehículo
        </button>
      )}

      <p>Aquí va la lista de vehículos...</p>
    </div>
  );
}