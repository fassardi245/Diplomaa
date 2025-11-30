import { client } from "@/sanity/lib/client";
import MaintenanceForm from "@/components/admin/MaintenanceForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// --- LÓGICA DE FILTRADO ---
async function getAvailableVehicles() {
  // 1. Traemos TODOS los vehículos
  const allVehiclesQuery = `*[_type == "vehicle"]{ _id, model, plate }`;

  // 2. Traemos IDs de vehículos en RUTA (Envíos activos)
  // Asumimos que el estado "en camino" se guarda como 'in_transit' en tus envíos
  const busyInShipmentQuery = `*[_type == "shipment" && status == "in_transit"].vehicle._ref`;

  // 3. Traemos IDs de vehículos en TALLER (Mantenimientos activos)
  // Asumimos que el estado activo es 'in_progress'. 
  // Si usas otro (ej: 'pending'), agrégalo: status in ["in_progress", "pending"]
  const busyInMaintenanceQuery = `*[_type == "maintenance" && status == "in_progress"].vehicle._ref`;

  // Ejecutamos las 3 consultas en paralelo
  const [vehicles, busyShipmentIds, busyMaintenanceIds] = await Promise.all([
    client.fetch(allVehiclesQuery, {}, { cache: "no-store" }),
    client.fetch<string[]>(busyInShipmentQuery, {}, { cache: "no-store" }),
    client.fetch<string[]>(busyInMaintenanceQuery, {}, { cache: "no-store" })
  ]);

  // Creamos una lista única de IDs ocupados (Set es más rápido para buscar)
  // Combinamos los que están en ruta + los que están en taller
  const busyIds = new Set([...busyShipmentIds, ...busyMaintenanceIds]);

  // FILTRO FINAL: Devolvemos solo los vehículos cuyo ID NO esté en la lista de ocupados
  return vehicles.filter((v: any) => !busyIds.has(v._id));
}

export default async function NewMaintenancePage() {
  // Usamos la nueva función filtrada
  const availableVehicles = await getAvailableVehicles();

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/mantenimiento" className="w-10 h-10 flex items-center justify-center rounded-full bg-white border hover:bg-gray-50 transition shadow-sm">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Registrar Servicio</h1>
           <p className="text-xs text-gray-500">Ingresa un vehículo al taller.</p>
        </div>
      </div>

      {/* Pasamos la lista filtrada al formulario */}
      <MaintenanceForm vehicles={availableVehicles} />
    </div>
  );
}