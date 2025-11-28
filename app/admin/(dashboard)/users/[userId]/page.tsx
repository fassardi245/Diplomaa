import { currentUser } from "@clerk/nextjs/server";
import { obtenerUsuarioSeguridad } from "@/sanity/lib/securityFactory";
import { client } from "@/sanity/lib/client";
import { updateUserRoles } from "@/actions/updateUserRoles";
import Link from "next/link";
import { 
  ArrowLeft, 
  Save, 
  Users, 
  Zap, 
  Shield, 
  Check 
} from "lucide-react";

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

async function getUsuario(id: string) {
  return await client.fetch<UsuarioEdit>(
    `*[_type == "usuario" && _id == $id][0]{ _id, email, rolesAsignados }`, 
    { id },
    { cache: 'no-store' }
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

  const user = await currentUser();
  if (!user) return <div>Inicia sesión.</div>;
  
  const usuarioSeguridad = await obtenerUsuarioSeguridad(user.id, user.emailAddresses[0].emailAddress);
  if (!usuarioSeguridad.puedo("ver_usuarios")) {
    return <div className="p-10 text-red-600 font-bold">⛔ Acceso Denegado</div>;
  }

  const [usuarioEdit, allRoles] = await Promise.all([
    getUsuario(userId),
    getAllRoles()
  ]);

  if (!usuarioEdit) return <div className="p-10">Usuario no encontrado</div>;

  const rolesActualesIds = new Set(usuarioEdit.rolesAsignados?.map(r => r._ref) || []);

  return (
    <div className="max-w-5xl mx-auto pb-20 p-8">
      
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
                <p className="text-gray-500 mt-1 flex items-center gap-2">
                    Usuario: <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">{usuarioEdit.email}</span>
                </p>
            </div>
        </div>
      </div>

      <form action={updateUserRoles}>
        <input type="hidden" name="userId" value={usuarioEdit._id} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* --- COLUMNA 1: GRUPOS (AZUL) --- */}
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
                    className="peer sr-only"
                  />
                  
                  {/* CARD GRUPO */}
                  <div className="p-4 rounded-xl border-2 border-gray-100 bg-gray-50/50 transition-all duration-200 
                    hover:border-blue-200 hover:bg-blue-50/30
                    group-has-[:checked]:border-blue-500 group-has-[:checked]:bg-blue-50 group-has-[:checked]:shadow-sm flex items-center justify-between">
                    
                    <div className="flex items-center gap-3">
                        {/* Círculo con Tick (AZUL) */}
                        <div className="w-6 h-6 rounded-full border-2 border-gray-300 bg-white 
                                        group-has-[:checked]:bg-blue-500 group-has-[:checked]:border-blue-500 
                                        flex items-center justify-center transition-all duration-200 shrink-0">
                             <Check className="w-3.5 h-3.5 text-white opacity-0 group-has-[:checked]:opacity-100 transition-opacity" />
                        </div>
                        <span className="font-semibold text-gray-700 group-has-[:checked]:text-blue-700">
                            {rol.nombre}
                        </span>
                    </div>

                    {rol.nombre === 'Admin' && (
                        <Shield className="w-4 h-4 text-gray-400 group-has-[:checked]:text-blue-600" />
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* --- COLUMNA 2: ACCIONES (VIOLETA) --- */}
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
                <label key={rol._id} className="relative block cursor-pointer group">
                  <input 
                    type="checkbox" 
                    name="roles" 
                    value={rol._id} 
                    defaultChecked={rolesActualesIds.has(rol._id)}
                    className="peer sr-only"
                  />
                  
                  {/* CARD ACCIÓN */}
                  <div className="p-3 rounded-lg border border-gray-200 bg-white transition-all duration-200 
                    hover:border-purple-300 hover:bg-purple-50/30
                    group-has-[:checked]:border-purple-500 group-has-[:checked]:bg-purple-50 group-has-[:checked]:shadow-sm">
                    
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider bg-purple-100 px-1.5 py-0.5 rounded">Acción</span>
                        
                        {/* Círculo con Tick (VIOLETA) */}
                        <div className="w-5 h-5 rounded-full border border-gray-300 bg-white 
                                        group-has-[:checked]:bg-purple-500 group-has-[:checked]:border-purple-500 
                                        flex items-center justify-center transition-all duration-200">
                            <Check className="w-3 h-3 text-white opacity-0 group-has-[:checked]:opacity-100 transition-opacity" />
                        </div>

                    </div>
                    <span className="font-bold text-gray-800 text-sm group-has-[:checked]:text-purple-900 leading-tight block">
                        {rol.nombre}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

        </div>

        <div className="mt-8 flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <Link href="/admin/users" className="px-6 py-3 rounded-xl text-gray-600 font-medium hover:bg-gray-100 transition-colors">
                Cancelar
            </Link>
            <button 
                type="submit" 
                className="group flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-xl shadow-gray-200 hover:bg-indigo-600 hover:shadow-indigo-200 hover:scale-[1.02] transition-all active:scale-95"
            >
                <Save className="w-4 h-4" />
                Guardar Cambios
            </button>
        </div>
      </form>
    </div>
  );
}