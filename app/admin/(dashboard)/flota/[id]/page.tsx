import { client } from "@/sanity/lib/client";
import FleetForm from "@/components/admin/FleetForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import { obtenerUsuarioSeguridad } from "@/lib/patterns/securityFactory";

// Función para obtener un vehículo específico
async function getVehicleById(id: string) {
  const query = `*[_type == "vehicle" && _id == $id][0] {
    _id, model, plate, status, fuelLevel, mileage, lastMaintenance, currentRoute,
    "imageUrl": image.asset->url
  }`;
  // cache: 'no-store' para asegurar que traemos los datos frescos al editar
  return await client.fetch(query, { id }, { cache: 'no-store' });
}

export default async function EditarVehiculoPage({ params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return <div>Inicia sesión.</div>;

  const usuarioSeguridad = await obtenerUsuarioSeguridad(user.id, user.emailAddresses[0].emailAddress);
  
  if (!usuarioSeguridad.puedo("ver_flota")) {
    return <div className="p-6 text-red-600 font-medium">⛔ Acceso Denegado</div>;
  }
  const { id } = params;
  const vehicle = await getVehicleById(id);

  if (!vehicle) {
    return <div className="p-10">Vehículo no encontrado.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/flota" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Editar Unidad</h1>
           <p className="text-xs text-gray-500">Modificando: <span className="font-mono text-gray-700 font-bold">{vehicle.plate}</span></p>
        </div>
      </div>

      {/* Le pasamos los datos al formulario para que se autorellene */}
      <FleetForm vehicle={vehicle} />
    </div>
  );
}