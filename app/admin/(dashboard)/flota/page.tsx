import { currentUser } from "@clerk/nextjs/server";
import { obtenerUsuarioSeguridad } from "@/sanity/lib/securityFactory";
import { client } from "@/sanity/lib/client";
import Link from "next/link";
import Image from "next/image";
import { 
  Plus, MapPin, AlertCircle, CheckCircle2, Wrench, Truck
} from "lucide-react";

// Interfaz para TypeScript
interface Vehicle {
  _id: string;
  model: string;
  plate: string;
  status: string;
  fuelLevel: number;
  mileage?: number;         // Puede venir o no
  lastMaintenance?: string; // Puede venir o no
  currentRoute?: string;
  imageUrl?: string;
}

async function getVehiculos() {
  // OJO: Aquí pedimos explícitamente 'mileage', 'lastMaintenance', 'currentRoute'
  const query = `*[_type == "vehicle"] | order(_createdAt desc) {
    _id, model, plate, status, fuelLevel, 
    mileage, lastMaintenance, currentRoute,
    "imageUrl": image.asset->url 
  }`;
  
  // Usamos fetch con 'no-store' para que NO use caché y veas los cambios al instante
  return await client.fetch(query, {}, { cache: 'no-store' });
}

export default async function FleetPage() {
  const user = await currentUser();
  if (!user) return <div>Inicia sesión.</div>;

  const usuarioSeguridad = await obtenerUsuarioSeguridad(user.id, user.emailAddresses[0].emailAddress);
  if (!usuarioSeguridad.puedo("ver_flota")) return <div className="p-6 text-red-600 font-medium">⛔ Acceso Denegado</div>;

  const vehiculos: Vehicle[] = await getVehiculos();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200"><CheckCircle2 className="w-3 h-3 mr-1"/>Disponible</span>;
      case 'in_transit': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"><Truck className="w-3 h-3 mr-1"/>En Ruta</span>;
      case 'maintenance': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200"><Wrench className="w-3 h-3 mr-1"/>Mantenimiento</span>;
      default: return <span className="text-gray-500 text-xs">{status}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Gestión de Flota</h1>
          <p className="text-xs text-gray-500 mt-0.5">Vista general de {vehiculos.length} unidades.</p>
        </div>
        {usuarioSeguridad.puedo("editar_vehiculo") && (
          <Link href="/admin/flota/nuevo" className="flex items-center gap-1.5 bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-800 transition">
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Vehículo</span>
          </Link>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Unidad</th>
                <th className="px-4 py-3">Estado / Ruta</th>
                <th className="px-4 py-3">Kilometraje</th>
                <th className="px-4 py-3">Último Service</th>
                <th className="px-4 py-3">Combustible</th>
                <th className="px-4 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vehiculos.map((v) => (
                <tr key={v._id} className="hover:bg-gray-50/50 transition">
                  {/* UNIDAD */}
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden relative">
                        {v.imageUrl ? <Image src={v.imageUrl} alt={v.model} fill className="object-cover" /> : <span className="text-xs">🚛</span>}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 leading-none">{v.model}</div>
                        <div className="font-mono text-[10px] text-gray-500 mt-1 bg-gray-100 px-1 rounded w-fit border border-gray-200 uppercase">{v.plate}</div>
                      </div>
                    </div>
                  </td>

                  {/* ESTADO */}
                  <td className="px-4 py-2.5">
                    <div className="flex flex-col gap-1 items-start">
                      {getStatusBadge(v.status)}
                      {v.status === 'in_transit' && v.currentRoute && (
                        <div className="flex items-center gap-1 text-[10px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                          <MapPin className="w-3 h-3 text-red-500" />
                          {v.currentRoute}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* KILOMETRAJE */}
                  <td className="px-4 py-2.5 font-mono text-xs text-gray-600">
                    {/* Verificamos si existe el dato, sino mostramos '-' */}
                    {(v.mileage !== undefined && v.mileage !== null) ? v.mileage.toLocaleString() + " km" : "-"}
                  </td>

                  {/* FECHA */}
                  <td className="px-4 py-2.5 text-xs text-gray-600">
                    {v.lastMaintenance ? v.lastMaintenance : <span className="text-gray-300 italic">--/--/--</span>}
                  </td>

                  {/* COMBUSTIBLE */}
                  <td className="px-4 py-2.5 w-32">
                    <div className="flex items-center gap-2">
                       <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${v.fuelLevel < 20 ? 'bg-red-500' : 'bg-green-500'}`} 
                            style={{ width: `${v.fuelLevel}%` }}
                          />
                       </div>
                       <span className="text-[10px] font-bold w-6 text-right">{v.fuelLevel}%</span>
                    </div>
                  </td>
                  {/* COLUMNA ACCIONES */}
                  <td className="px-4 py-2.5 text-right">
                    {usuarioSeguridad.puedo("editar_vehiculo") && (
                      <Link 
                        href={`/admin/flota/${v._id}`} 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:border-black hover:bg-gray-50 transition shadow-sm"
                      >
                        {/* Puedes importar Pencil de lucide-react */}
                         Editar
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {vehiculos.length === 0 && <div className="p-6 text-center text-gray-400 text-sm">No hay vehículos registrados.</div>}
        </div>
      </div>
    </div>
  );
}