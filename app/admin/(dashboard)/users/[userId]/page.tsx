import { currentUser } from "@clerk/nextjs/server";
import { obtenerUsuarioSeguridad } from "@/sanity/lib/securityFactory";
import { client } from "@/sanity/lib/client";
import { updateUserRoles } from "@/actions/updateUserRoles";
import Link from "next/link";

// Interfaces
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

// Funciones de carga de datos
async function getUsuario(id: string) {
  return await client.fetch<UsuarioEdit>(
    `*[_type == "usuario" && _id == $id][0]{
      _id, 
      email, 
      rolesAsignados
    }`, 
    { id }
  );
}

async function getAllRoles() {
  // coalesce(nombre, titulo) -> Si es Grupo usa 'nombre', si es Acción usa 'titulo'
  return await client.fetch<RolDisponible[]>(
    `*[_type in ["grupo", "accion"]] | order(_type desc) {
      _id, 
      _type, 
      "nombre": coalesce(nombre, titulo) 
    }`
  );
}

export default async function EditUserPage({ params }: { params: { userId: string } }) {
  const { userId } = params;

  // 1. Seguridad
  const user = await currentUser();
  if (!user) return <div>Inicia sesión.</div>;
  
  const usuarioSeguridad = await obtenerUsuarioSeguridad(user.id, user.emailAddresses[0].emailAddress);
  if (!usuarioSeguridad.puedo("ver_usuarios")) { // O idealmente un permiso 'editar_usuarios'
    return <div className="p-10 text-red-600">⛔ No tienes permisos para editar usuarios.</div>;
  }

  // 2. Cargar datos en paralelo
  const [usuarioEdit, allRoles] = await Promise.all([
    getUsuario(userId),
    getAllRoles()
  ]);

  if (!usuarioEdit) return <div className="p-10">Usuario no encontrado</div>;

  // 3. Crear un Set con los IDs que el usuario YA TIENE (para marcar los checkboxes)
  const rolesActualesIds = new Set(usuarioEdit.rolesAsignados?.map(r => r._ref) || []);

  return (
    <div className="p-10 max-w-3xl mx-auto">
      <div className="flex items-center mb-6">
        <Link href="/admin/users" className="text-gray-500 hover:text-gray-800 mr-4">← Volver</Link>
        <h1 className="text-2xl font-bold">Editar Roles: <span className="text-indigo-600">{usuarioEdit.email}</span></h1>
      </div>

      <div className="bg-white shadow-md rounded-lg p-8 border border-gray-200">
        <form action={updateUserRoles}>
          {/* Input oculto para enviar el ID del usuario a la Server Action */}
          <input type="hidden" name="userId" value={usuarioEdit._id} />

          <div className="space-y-6">
            
            {/* SECCIÓN DE GRUPOS */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Grupos (Roles)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allRoles.filter(r => r._type === 'grupo').map((rol) => (
                  <label key={rol._id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="roles" 
                      value={rol._id} 
                      defaultChecked={rolesActualesIds.has(rol._id)}
                      className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-700 font-medium">{rol.nombre}</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Grupo</span>
                  </label>
                ))}
              </div>
            </div>

            {/* SECCIÓN DE PERMISOS INDIVIDUALES */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Permisos Extra (Acciones)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allRoles.filter(r => r._type === 'accion').map((rol) => (
                  <label key={rol._id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="roles" 
                      value={rol._id} 
                      defaultChecked={rolesActualesIds.has(rol._id)}
                      className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-700 font-medium">{rol.nombre}</span>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">Acción</span>
                  </label>
                ))}
              </div>
            </div>

          </div>

          <div className="mt-8 flex justify-end">
            <button 
              type="submit" 
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition shadow-lg"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}