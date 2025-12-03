import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { obtenerUsuarioSeguridad } from "@/lib/patterns/securityFactory";

export default async function AdminAccessButton() {
  // 1. Obtenemos usuario de Clerk
  const user = await currentUser();
  if (!user) return null; // Si no está logueado, no mostramos nada

  // 2. Consultamos tus permisos en Sanity
  const usuarioSeguridad = await obtenerUsuarioSeguridad(
    user.id,
    user.emailAddresses[0]?.emailAddress
  );

  // 3. Verificamos si tiene la "llave" para entrar
  if (!usuarioSeguridad.puedo("acceso_panel_admin")) {
    return null; // Si es cliente normal, no mostramos el botón
  }

  // 4. Si tiene permiso, mostramos el botón
  return (
    <Link 
      href="/admin" 
      className="fixed bottom-5 right-5 z-50 bg-black text-white px-6 py-3 rounded-full shadow-xl hover:scale-105 transition-transform font-bold flex items-center gap-2"
    >
      ⚙️ Panel de Control
    </Link>
  );
}