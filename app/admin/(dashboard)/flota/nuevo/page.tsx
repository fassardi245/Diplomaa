import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import FleetForm from "@/components/admin/FleetForm"; // Importamos el componente cliente

export default function NuevoVehiculoPage() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/flota" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Registrar Unidad</h1>
           <p className="text-xs text-gray-500">Completa la ficha técnica del vehículo.</p>
        </div>
      </div>

      {/* Renderizamos el Formulario Interactivo */}
      <FleetForm />
    </div>
  );
}