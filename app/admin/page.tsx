import { currentUser } from "@clerk/nextjs/server";
import { obtenerUsuarioSeguridad } from "@/sanity/lib/securityFactory";
import Link from "next/link";
import { redirect } from "next/navigation";



// Definimos las "Apps" o módulos disponibles en el sistema
// Aquí vinculamos: Nombre visual <-> Permiso necesario <-> Ruta
const SYSTEM_MODULES = [
  {
    title: "Gestión de Flota",
    description: "Control de vehículos, estados y combustible.",
    href: "/admin/flota",
    permission: "ver_flota", // <--- Slug de la Acción en Sanity
    icon: "🚛",
    color: "bg-blue-500",
  },
  {
    title: "Base de Datos (Studio)",
    description: "Acceso directo al CMS para editar datos crudos.",
    href: "/admin/studio", // Ruta por defecto de Sanity
    permission: "acceso_studio", // ¡Crea esta acción en Sanity!
    icon: "🗄️",
    color: "bg-purple-600",
  },
  {
    title: "Pedidos y Reclamos",
    description: "Ver órdenes de clientes y gestionar devoluciones.",
    href: "/admin/pedidos", // (Página futura)
    permission: "ver_pedidos",
    icon: "📦",
    color: "bg-orange-500",
  },
  {
    title: "Configuración de Seguridad",
    description: "Gestionar roles, usuarios y permisos del sistema.",
    href: "/admin/studio/structure/usuario", // Atajo al Studio
    permission: "gestionar_seguridad",
    icon: "🛡️",
    color: "bg-gray-700",
  },
];

export default async function AdminDashboard() {
  // 1. Auth Check
  const user = await currentUser();
  if (!user) return redirect("/sign-in");
console.log("MI CLERK ID REAL ES:", user?.id); // <--- Agrega esto

  // 2. Security Check (Composite Pattern)
  const usuarioSeguridad = await obtenerUsuarioSeguridad(
    user.id,
    user.emailAddresses[0]?.emailAddress
  );

  
  // Filtramos los módulos: Solo mostramos aquellos donde .puedo() sea true
  const modulosDisponibles = SYSTEM_MODULES.filter((modulo) =>
    usuarioSeguridad.puedo(modulo.permission)
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header de Bienvenida */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">
            Hola, {user.firstName || "Empleado"} 👋
          </h1>
          <p className="text-gray-500 mt-2">
            Bienvenido al Panel de Control. Aquí tienes las herramientas habilitadas para tu rol.
          </p>
          
          {/* Debug pequeño para que veas tus roles (puedes borrarlo luego) */}
          <div className="mt-2 text-xs text-gray-400 font-mono">
            ID: {user.id} | Email: {user.emailAddresses[0]?.emailAddress}
          </div>
        </div>

        {/* Grilla de Módulos */}
        {modulosDisponibles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modulosDisponibles.map((modulo) => (
              <Link
                key={modulo.title}
                href={modulo.href}
                className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-lg ${modulo.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                  {modulo.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {modulo.title}
                </h3>
                <p className="text-gray-500 text-sm">
                  {modulo.description}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          // Estado Vacío (Si no tiene permisos)
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Tu usuario no tiene módulos asignados. Contacta al administrador para que te asigne un Grupo o Permisos en Sanity.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}