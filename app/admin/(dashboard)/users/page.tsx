import { currentUser } from "@clerk/nextjs/server";
import { obtenerUsuarioSeguridad } from "@/sanity/lib/securityFactory";
import { client } from "@/sanity/lib/client";
import { syncUsers } from "@/actions/syncUsers";
import DeleteUserButton from "@/components/admin/DeleteUserButton";
import Link from "next/link";
import { 
  RefreshCw, 
  Shield, 
  ShieldAlert, 
  UserCog, 
  Search,
  CheckCircle2,
  Users
} from "lucide-react";

// --- INTERFACES CORREGIDAS ---
// Usamos un nombre único para evitar conflictos con el tipo 'User' de Clerk
interface SystemUser {
  _id: string;
  email: string;
  name?: string; // Agregamos name como opcional
  clerkId: string;
  roles: { name: string; type: "grupo" | "accion" }[] | null; 
}

// --- DATA FETCHING ---
async function getUsuarios() {
  // Query corregida para traer también el nombre si existe
  const query = `*[_type == "usuario"] | order(_createdAt desc) {
    _id,
    email,
    name, 
    clerkId,
    "roles": rolesAsignados[]->{
      "name": coalesce(nombre, titulo),
      "type": _type
    }
  }`;
  
  // Especificamos el tipo SystemUser[] en el fetch
  return await client.fetch<SystemUser[]>(query, {}, { cache: 'no-store' });
}

export default async function UsuariosPage() {
  // 1. SEGURIDAD
  const authUser = await currentUser();
  if (!authUser) return <div>Inicia sesión por favor.</div>;

  const usuarioSeguridad = await obtenerUsuarioSeguridad(
    authUser.id, 
    authUser.emailAddresses[0].emailAddress
  );

  if (!usuarioSeguridad.puedo("ver_usuarios")) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500 animate-in fade-in duration-700">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4 opacity-80" />
        <h1 className="text-2xl font-bold text-gray-800">Acceso Restringido</h1>
        <p>No tienes permisos suficientes para ver este módulo.</p>
      </div>
    );
  }

  // 2. DATOS
  const usuarios = await getUsuarios();

  // 3. SERVER ACTION WRAPPER
  async function handleSync() {
    "use server";
    await syncUsers();
  }

  // --- UI ---
  return (
    <div className="max-w-7xl mx-auto p-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
             <span className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
                <Users className="w-8 h-8" />
             </span>
             Gestión de Usuarios
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Controla el acceso y los roles de los <strong>{usuarios.length}</strong> miembros del equipo.
          </p>
        </div>
        
        <form action={handleSync}>
          <button 
            type="submit" 
            className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white font-bold text-xs transition-all hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-95"
          >
            <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
            <span>Sincronizar Clerk</span>
          </button>
        </form>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Roles & Permisos</th>
                <th className="px-6 py-4 hidden md:table-cell">ID Sistema</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {usuarios.map((u) => (
                <tr key={u._id} className="hover:bg-indigo-50/20 transition-colors duration-200 group">
                  
                  {/* USUARIO */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center font-bold text-sm shadow-inner ring-1 ring-white border border-indigo-50">
                        {u.email?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
                            {/* Mostramos nombre si existe, sino email */}
                            {u.name || u.email}
                        </span>
                        {u.name && <span className="text-xs text-gray-400">{u.email}</span>}
                        <span className="text-[10px] text-green-600 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Verificado
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* ROLES */}
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {u.roles && u.roles.length > 0 ? (
                        u.roles.map((rol, index) => {
                          if (!rol.name) return null;

                          // Lógica de colores según tipo de rol
                          if (rol.type === 'accion') {
                            return (
                              <span key={index} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border shadow-sm bg-purple-50 text-purple-700 border-purple-200">
                                {rol.name}
                              </span>
                            );
                          }
                          if (rol.name === 'Admin') {
                            return (
                              <span key={index} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border shadow-sm bg-violet-900 text-white border-violet-950">
                                <Shield className="w-3 h-3 mr-1" />
                                {rol.name}
                              </span>
                            );
                          }
                          return (
                            <span key={index} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border shadow-sm bg-white text-indigo-700 border-indigo-100">
                              {rol.name}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-xs text-gray-400 italic px-2 py-1 bg-gray-50 rounded-md border border-gray-100">
                          Sin roles
                        </span>
                      )}
                    </div>
                  </td>

                  {/* ID */}
                  <td className="px-6 py-4 hidden md:table-cell">
                    <code className="bg-gray-50 text-gray-500 px-2 py-1 rounded-lg text-[10px] font-mono border border-gray-100">
                      {u.clerkId ? u.clerkId.slice(0, 12) + "..." : "N/A"}
                    </code>
                  </td>

                  {/* ACCIONES */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin/users/${u._id}`} 
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm"
                        >
                          <UserCog className="w-3.5 h-3.5" />
                          Editar
                        </Link>
                        
                        {/* BOTÓN DE ELIMINAR */}
                        <DeleteUserButton 
                          userId={u._id} 
                          clerkId={u.clerkId} // <--- AGREGAR ESTA LÍNEA
                          userEmail={u.email} 
                        />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {usuarios.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center justify-center bg-gray-50/30">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No hay usuarios aún</h3>
            <p className="text-gray-500 max-w-xs mx-auto mt-1 mb-6 text-sm">
              Haz clic en "Sincronizar" para importar los usuarios desde Clerk.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}