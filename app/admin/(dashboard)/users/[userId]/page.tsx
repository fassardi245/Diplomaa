import { currentUser } from "@clerk/nextjs/server";
import { obtenerUsuarioSeguridad } from "@/sanity/lib/securityFactory";
import { client } from "@/sanity/lib/client";
import { updateUserRoles } from "@/actions/updateUserRoles";
import Link from "next/link";
import { 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  Users, 
  Zap, 
  Shield 
} from "lucide-react";

// --- INTERFACES ---
interface RolDisponible {
  _id: string;
  _type: "grupo" | "accion";
  nombre: string;
}

interface UsuarioEdit {
  _id: string;
  email: string;
  rolesAsignados: { _ref: string }[] | null;
}

// --- DATA FETCHING ---
async function getUsuario(id: string) {
  return await client.fetch<UsuarioEdit>(
    `*[_type == "usuario" && _id == $id][0]{ _id, email, rolesAsignados }`, 
    { id }
  );
}

async function getAllRoles() {
  return await client.fetch<RolDisponible[]>(
    `*[_type in ["grupo", "accion"]] | order(_type desc) {
      _id, _type, "nombre": coalesce(nombre, titulo) 
    }`
  );
}

export default async function EditUserPage({ params }: { params: { userId: string } }) {
  const { userId } = params;

  // 1. SEGURIDAD
  const user = await currentUser();
  if (!user) return <div>Inicia sesión.</div>;
  
  const usuarioSeguridad = await obtenerUsuarioSeguridad(user.id, user.emailAddresses[0].emailAddress);
  if (!usuarioSeguridad.puedo("ver_usuarios")) {
    return <div className="p-10 text-red-600 font-bold">⛔ Acceso Denegado</div>;
  }

  // 2. CARGA PARALELA
  const [usuarioEdit, allRoles] = await Promise.all([
    getUsuario(userId),
    getAllRoles()
  ]);

  if (!usuarioEdit) return <div className="p-10">Usuario no encontrado</div>;

  const rolesActualesIds = new Set(usuarioEdit.rolesAsignados?.map(r => r._ref) || []);

  // --- UI ---
  return (
    <div className="max-w-5xl mx-auto pb-20">
      
      {/* HEADER DE NAVEGACIÓN */}
      <div className="mb-8">
        <Link 
          href="/admin/users" 
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4 group"
        >
          <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center mr-2 shadow-sm group-hover:border-gray-400 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Volver a la lista
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Editar Permisos</h1>
                <p className="text-black mt-1 flex items-center gap-2">
                    Usuario: <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">{usuarioEdit.email}</span>
                </p>
            </div>
        </div>
      </div>

      {/* FORMULARIO PRINCIPAL */}
      <form action={updateUserRoles}>
        <input type="hidden" name="userId" value={usuarioEdit._id} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* COLUMNA 1: GRUPOS (Roles Mayores) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                    <Users className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Grupos</h3>
                    <p className="text-xs text-gray-500">Asigna conjuntos de permisos predefinidos.</p>
                </div>
            </div>
            
            <div className="space-y-3">
              {allRoles.filter(r => r._type === 'grupo').map((rol) => (
                <label key={rol._id} className="relative block cursor-pointer group">
                  <input 
                    type="checkbox" 
                    name="roles" 
                    value={rol._id} 
                    defaultChecked={rolesActualesIds.has(rol._id)}
                    className="peer sr-only" // Ocultamos el checkbox feo
                  />
                  
                  {/* DISEÑO TARJETA INTERACTIVA (usando peer-checked) */}
                  <div className="p-4 rounded-xl border-2 border-gray-100 bg-gray-50/50 transition-all duration-200 
                    hover:border-blue-200 hover:bg-blue-50/30
                    peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:shadow-sm flex items-center justify-between">
                    
                    <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full border-2 border-gray-300 peer-checked:border-blue-500 peer-checked:bg-blue-500 flex items-center justify-center transition-colors">
                             {/* Icono check simulado (se maneja con css del padre si quieres, pero aqui es visual) */}
                             <div className="w-2.5 h-2.5 bg-blue-500 rounded-full opacity-0 peer-checked:opacity-100" />
                        </span>
                        <span className="font-semibold text-gray-700 peer-checked:text-blue-700">
                            {rol.nombre}
                        </span>
                    </div>

                    {rol.nombre === 'Admin' && (
                        <Shield className="w-4 h-4 text-gray-400 peer-checked:text-blue-600" />
                    )}
                  </div>
                  
                  {/* Icono de check absoluto para confirmación visual extra */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 text-blue-600 transition-opacity">
                    <CheckCircle2 className="w-5 h-5 fill-blue-100" />
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* COLUMNA 2: ACCIONES (Permisos Micro) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                    <Zap className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Permisos Extra</h3>
                    <p className="text-xs text-gray-500">Acciones específicas fuera de los grupos.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allRoles.filter(r => r._type === 'accion').map((rol) => (
                <label key={rol._id} className="relative block cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="roles" 
                    value={rol._id} 
                    defaultChecked={rolesActualesIds.has(rol._id)}
                    className="peer sr-only"
                  />
                  
                  <div className="p-3 rounded-lg border border-gray-200 bg-white transition-all duration-200 
                    hover:border-purple-300 
                    peer-checked:border-purple-500 peer-checked:bg-purple-50 peer-checked:shadow-sm">
                    
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Acción</span>
                        <div className={`w-4 h-4 rounded-full border border-gray-300 peer-checked:bg-purple-500 peer-checked:border-purple-500`} />
                    </div>
                    <span className="font-medium text-gray-800 text-sm peer-checked:text-purple-900">
                        {rol.nombre}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

        </div>

        {/* BARRA DE ACCIÓN FLOTANTE O FINAL */}
        <div className="mt-8 flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <Link href="/admin/users" className="px-6 py-3 rounded-xl text-gray-600 font-medium hover:bg-gray-100 transition-colors">
                Cancelar
            </Link>
            <button 
                type="submit" 
                className="group flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-xl shadow-gray-200 hover:bg-indigo-600 hover:shadow-indigo-200 hover:scale-[1.02] transition-all active:scale-95"
            >
                
                Guardar Cambios
            </button>
        </div>
      </form>
    </div>
  );
}