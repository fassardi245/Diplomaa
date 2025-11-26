import { currentUser } from "@clerk/nextjs/server";
import { obtenerUsuarioSeguridad } from "@/sanity/lib/securityFactory";
import { client } from "@/sanity/lib/client";
import Link from "next/link";
import Image from "next/image";

// 1. Definimos la interfaz EXACTA según tu schema vehicleType.ts
interface Vehicle {
  _id: string;
  model: string;      // Antes era 'modelo'
  plate: string;      // Antes era 'patente'
  status: string;     // "available" | "in_transit" | "maintenance"
  fuelLevel: number;  // Tu schema tiene nivel de combustible, no capacidad
  imageUrl?: string;  // Para la foto
}

// 2. Función para traer los datos con los nombres correctos
async function getVehiculos() {
  // OJO AQUÍ: _type debe ser "vehicle" (como dice en name: 'vehicle')
  const query = `*[_type == "vehicle"] {
    _id,
    model,
    plate,
    status,
    fuelLevel,
    "imageUrl": image.asset->url 
  }`;
  
  // "imageUrl": image.asset->url  <-- Esto es magia de GROQ para sacar el link de la foto
  
  return await client.fetch(query);
}

export default async function FleetPage() {
  // --- SEGURIDAD ---
  const user = await currentUser();
  if (!user) return <div>Inicia sesión por favor.</div>;

  const usuarioSeguridad = await obtenerUsuarioSeguridad(
    user.id, 
    user.emailAddresses[0].emailAddress
  );

  if (!usuarioSeguridad.puedo("ver_flota")) {
    return <div className="p-10 text-red-600 font-bold">⛔ Acceso Denegado</div>;
  }

  // --- DATOS ---
  // Le decimos a Next.js que no cachee esto para ver cambios al instante
  const vehiculos: Vehicle[] = await getVehiculos();

  // Helper para traducir los estados de inglés (Schema) a español (Vista)
  const traducirEstado = (status: string) => {
    switch (status) {
      case 'available': return { texto: '🟢 Disponible', clase: 'bg-green-100 text-green-800' };
      case 'in_transit': return { texto: '🚚 En Ruta', clase: 'bg-blue-100 text-blue-800' };
      case 'maintenance': return { texto: '🔧 Mantenimiento', clase: 'bg-yellow-100 text-yellow-800' };
      default: return { texto: status, clase: 'bg-gray-100' };
    }
  };

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🚛 Gestión de Flota</h1>
        
        {usuarioSeguridad.puedo("editar_vehiculo") && (
          <Link 
            href="/admin/flota/nuevo" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition shadow-md"
          >
            + Agregar Nuevo Vehículo
          </Link>
        )}
      </div>

      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-50 text-left border-b border-gray-200">
              <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Vehículo</th>
              <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Patente</th>
              <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Combustible</th>
            </tr>
          </thead>
          <tbody>
            {vehiculos.map((v) => {
              const estadoInfo = traducirEstado(v.status);
              
              return (
                <tr key={v._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="px-5 py-4 bg-white">
                    <div className="flex items-center">
                      {/* Si tiene imagen, la mostramos */}
                      <div className="flex-shrink-0 w-10 h-10 relative mr-3">
                        {v.imageUrl ? (
                          <Image 
                            src={v.imageUrl} 
                            alt={v.model} 
                            fill 
                            className="rounded-full object-cover border"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-xl">🚛</div>
                        )}
                      </div>
                      <p className="text-gray-900 font-bold">{v.model || "Sin Modelo"}</p>
                    </div>
                  </td>
                  
                  <td className="px-5 py-4 bg-white text-sm">
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-700 border">
                      {v.plate}
                    </span>
                  </td>
                  
                  <td className="px-5 py-4 bg-white text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${estadoInfo.clase}`}>
                      {estadoInfo.texto}
                    </span>
                  </td>
                  
                  <td className="px-5 py-4 bg-white text-sm">
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                        <div 
                          className={`h-2.5 rounded-full ${v.fuelLevel < 20 ? 'bg-red-500' : 'bg-green-500'}`} 
                          style={{ width: `${v.fuelLevel}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{v.fuelLevel}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {vehiculos.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg">No se encontraron vehículos.</p>
          </div>
        )}
      </div>
    </div>
  );
}