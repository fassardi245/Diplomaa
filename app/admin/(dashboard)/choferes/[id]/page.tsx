import { client } from "@/sanity/lib/client";
import DriverForm from "@/components/admin/DriverForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { obtenerUsuarioSeguridad } from "@/lib/patterns/securityFactory";

async function getDriver(id: string) {
  return await client.fetch(
    `*[_type == "driver" && _id == $id][0]{
      _id, 
      name, 
      licenseNumber, 
      status, 
      "photoUrl": photo.asset->url
    }`, 
    { id }, 
    { cache: "no-store" }
  );
}

export default async function EditDriverPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return <div>Inicia sesión.</div>;

  const usuarioSeguridad = await obtenerUsuarioSeguridad(user.id, user.emailAddresses[0].emailAddress);
  
  // 1. Permiso para entrar
  if (!usuarioSeguridad.puedo("ver_choferes")) return <div className="p-6 text-red-600 font-medium">⛔ Acceso Denegado</div>;

  const { id } = await params;
  const driver = await getDriver(id);

  if (!driver) return <div>Chofer no encontrado</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/choferes" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition">
           <ArrowLeft className="w-5 h-5 text-gray-600"/> 
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Editar Chofer</h1>
      </div>
      
      <DriverForm driver={driver} />
    </div>
  );
}