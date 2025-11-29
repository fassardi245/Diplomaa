import DriverForm from "@/components/admin/DriverForm"; // Importamos el componente
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewDriverPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link href="/admin/choferes" className="flex items-center gap-2 text-gray-500 mb-6 hover:text-black w-fit">
         <ArrowLeft className="w-4 h-4"/> Volver a la lista
      </Link>
      
      <div className="flex items-center justify-between mb-6">
         <h1 className="text-3xl font-bold text-gray-900">Registrar Chofer</h1>
      </div>
      
      <DriverForm />
    </div>
  );
}