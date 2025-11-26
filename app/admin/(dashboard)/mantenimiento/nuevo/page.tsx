import { client } from "@/sanity/lib/client";
import MaintenanceForm from "@/components/admin/MaintenanceForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

async function getVehicles() {
  return await client.fetch(`*[_type == "vehicle"]{ _id, model, plate }`);
}

export default async function NewMaintenancePage() {
  const vehicles = await getVehicles();

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

      <MaintenanceForm vehicles={vehicles} />
    </div>
  );
}