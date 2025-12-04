import { currentUser } from "@clerk/nextjs/server";
import { obtenerUsuarioSeguridad } from "@/lib/patterns/securityFactory"; // Ojo con la ruta
import NewDriverForm from "@/components/admin/NewDriverForm";

export default async function NewDriverPage() {
  const user = await currentUser();
  if (!user) return <div>Inicia sesión.</div>;

  const usuarioSeguridad = await obtenerUsuarioSeguridad(user.id, user.emailAddresses[0].emailAddress);
  
  // Usamos "ver_choferes" para permitir la entrada
  if (!usuarioSeguridad.puedo("ver_choferes")) {
      return <div className="p-6 text-red-600 font-medium">⛔ Acceso Denegado</div>;
  }

  return <NewDriverForm />;
}