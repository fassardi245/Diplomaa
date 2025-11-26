import { client } from "@/sanity/lib/client";
import MaintenanceForm from "@/components/admin/MaintenanceForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

async function getData(id: string) {
  const maintenance = await client.fetch(`*[_type == "maintenance" && _id == $id][0]`, { id }, { cache: "no-store" });
  const vehicles = await client.fetch(`*[_type == "vehicle"]{ _id, model, plate }`);
  return { maintenance, vehicles };
}

export default async function EditMaintenancePage({ params }: { params: { id: string } }) {
  const { maintenance, vehicles } = await getData(params.id);

  if (!maintenance) return <div>No encontrado</div>;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/mantenimiento" className="w-10 h-10 flex items-center justify-center rounded-full bg-white border hover:bg-gray-50 transition shadow-sm">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Editar Servicio</h1>
           <p className="text-xs text-gray-500">Actualizar estado o detalles.</p>
        </div>
      </div>

      <MaintenanceForm vehicles={vehicles} maintenance={maintenance} />
    </div>
  );
}