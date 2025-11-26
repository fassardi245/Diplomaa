import { currentUser } from "@clerk/nextjs/server";
import { obtenerUsuarioSeguridad } from "@/sanity/lib/securityFactory";
import { client } from "@/sanity/lib/client";
import { syncUsers } from "@/actions/syncUsers";
import Image from "next/image";
import Link from "next/link"; // <--- IMPORTANTE: Importar Link

// 1. Definimos la interfaz
interface UsuarioSanity {
  _id: string;
  email: string;
  clerkId: string;
  roles: string[] | null; 
  imageUrl?: string;
}

async function getUsuarios() {
  const query = `*[_type == "usuario"] {
    _id,
    email,
    clerkId,
    "roles": rolesAsignados[]->nombre
  }`;
  return await client.fetch(query);
}

export default async function UsuariosPage() {
  // --- A. SEGURIDAD ---
  const user = await currentUser();
  if (!user) return <div>Inicia sesión por favor.</div>;

  const usuarioSeguridad = await obtenerUsuarioSeguridad(
    user.id, 
    user.emailAddresses[0].emailAddress
  );

  if (!usuarioSeguridad.puedo("ver_usuarios")) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-red-600">
        <h1 className="text-2xl font-bold">⛔ Acceso Denegado</h1>
        <p>No tienes permisos para gestionar usuarios.</p>
      </div>
    );
  }

  // --- B. DATOS ---
  const usuarios: UsuarioSanity[] = await getUsuarios();

  // --- SOLUCIÓN AL ERROR DE TYPESCRIPT ---
  async function handleSync() {
    "use server";
    await syncUsers();
  }

  // --- C. UI ---
  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">👥 Gestión de Usuarios</h1>
          <p className="text-gray-500 text-sm mt-1">Administra roles y permisos del sistema</p>
        </div>
        
        {/* Botón de Sincronización */}
        <form action={handleSync}>
          <button 
            type="submit" 
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition shadow flex items-center gap-2"
          >
            <span>🔄</span> Sincronizar con Clerk
          </button>
        </form>

      </div>

      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-50 text-left border-b border-gray-200">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Usuario</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Roles / Permisos</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Clerk ID</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Acción</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                
                <td className="px-6 py-4 bg-white">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xl">
                      {/* Agregué el ? para evitar error si no hay email */}
                      {u.email?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{u.email}</p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 bg-white">
                  <div className="flex flex-wrap gap-2">
                    {u.roles && u.roles.length > 0 ? (
                      u.roles.map((rol, index) => (
                        <span 
                          key={index} 
                          className="px-2 py-1 text-xs font-semibold leading-tight text-indigo-700 bg-indigo-100 rounded-full border border-indigo-200"
                        >
                          {rol}
                        </span>
                      ))
                    ) : (
                      <span className="px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded-full">
                        Sin roles asignados
                      </span>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4 bg-white text-sm">
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">
                    {u.clerkId ? u.clerkId.slice(0, 15) + "..." : "No vinculado"}
                  </code>
                </td>

                <td className="px-6 py-4 bg-white text-center">
                <Link 
                  href={`/admin/users/${u._id}`} 
                  // Agregué: 'whitespace-nowrap' y 'inline-block'
                  className="text-indigo-600 hover:text-indigo-900 font-medium text-sm bg-indigo-50 px-3 py-1 rounded hover:bg-indigo-100 transition whitespace-nowrap inline-block"
                >
                  Editar Roles
                </Link>
              </td>
              </tr>
            ))}
          </tbody>
        </table>

        {usuarios.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <p>No se encontraron usuarios registrados en Sanity.</p>
            <p className="text-sm mt-2">Haz clic en &quot;Sincronizar&quot; para traerlos desde Clerk.</p>
          </div>
        )}
      </div>
    </div>
  );
}