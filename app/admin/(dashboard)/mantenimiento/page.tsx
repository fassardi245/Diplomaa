import { client } from "@/sanity/lib/client";
import Link from "next/link";
import { Plus, Wrench, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

// Interfaces
interface Maintenance {
  _id: string;
  type: string;
  description: string;
  cost: number;
  date: string;
  status: string;
  vehicle: {
    model: string;
    plate: string;
  };
}

async function getMaintenances() {
  // Traemos el mantenimiento y los datos del vehículo asociado (JOIN)
  const query = `*[_type == "maintenance"] | order(date desc) {
    _id, type, description, cost, date, status,
    vehicle->{ model, plate }
  }`;
  return await client.fetch(query, {}, { cache: "no-store" });
}

export default async function MaintenancePage() {
  const mantenimientos: Maintenance[] = await getMaintenances();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <span className="bg-orange-100 p-2 rounded-xl text-orange-600">
               <Wrench className="w-8 h-8" />
            </span>
            Taller y Mantenimiento
          </h1>
          <p className="text-gray-500 mt-2">Historial de reparaciones y servicios de la flota.</p>
        </div>
        
        <Link href="/admin/mantenimiento/nuevo" className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-gray-800 transition">
          <Plus className="w-5 h-5" />
          Nuevo Servicio
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase font-bold">
            <tr>
              <th className="px-6 py-4">Vehículo</th>
              <th className="px-6 py-4">Tipo / Detalle</th>
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4">Costo</th>
              <th className="px-6 py-4">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mantenimientos.map((m) => (
              <tr key={m._id} className="hover:bg-orange-50/30 transition">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{m.vehicle?.model || "Vehículo Borrado"}</div>
                  <div className="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded w-fit mt-1">{m.vehicle?.plate}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-800 capitalize">{m.type === 'preventive' ? 'Service' : m.type}</div>
                  <div className="text-xs text-gray-500 truncate max-w-[200px]">{m.description}</div>
                </td>
                <td className="px-6 py-4 text-gray-600 font-mono text-xs">
                  {m.date}
                </td>
                <td className="px-6 py-4 font-bold text-gray-700">
                  ${m.cost?.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  {m.status === 'completed' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                      <CheckCircle2 className="w-3 h-3" /> Finalizado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 animate-pulse">
                      <Clock className="w-3 h-3" /> En Taller
                    </span>
                  )}
                </td>
                    <td className="px-6 py-4 text-right">
                    <Link 
                        href={`/admin/mantenimiento/${m._id}`} 
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:border-black hover:bg-gray-50 transition shadow-sm">
                            Gestionar
                      </Link>
                    </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {mantenimientos.length === 0 && (
            <div className="p-12 text-center text-gray-400">No hay registros de mantenimiento.</div>
        )}
      </div>
    </div>
  );
}