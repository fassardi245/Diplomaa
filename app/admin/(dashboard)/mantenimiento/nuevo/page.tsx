import { client } from "@/sanity/lib/client";
import MaintenanceForm from "@/components/admin/MaintenanceForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import { obtenerUsuarioSeguridad } from "@/lib/patterns/securityFactory";

async function getAvailableVehicles() {
  const allVehiclesQuery = `*[_type == "vehicle"]{ _id, model, plate }`;

  const busyInShipmentQuery = `*[_type == "shipment" && status == "in_transit"].vehicle._ref`;


  const busyInMaintenanceQuery = `*[_type == "maintenance" && status == "in_progress"].vehicle._ref`;

  const [vehicles, busyShipmentIds, busyMaintenanceIds] = await Promise.all([
    client.fetch(allVehiclesQuery, {}, { cache: "no-store" }),
    client.fetch<string[]>(busyInShipmentQuery, {}, { cache: "no-store" }),
    client.fetch<string[]>(busyInMaintenanceQuery, {}, { cache: "no-store" })
  ]);


  const busyIds = new Set([...busyShipmentIds, ...busyMaintenanceIds]);

  return vehicles.filter((v: any) => !busyIds.has(v._id));
}

export default async function NewMaintenancePage() {
  const user = await currentUser();
    if (!user) return <div>Inicia sesión.</div>;
  
    const usuarioSeguridad = await obtenerUsuarioSeguridad(user.id, user.emailAddresses[0].emailAddress);
    if (!usuarioSeguridad.puedo("ver_mantenimiento")) return <div className="p-6 text-red-600 font-medium">⛔ Acceso Denegado</div>;
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