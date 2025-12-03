import { client } from "@/sanity/lib/client";
import DriverForm from "@/components/admin/DriverForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { obtenerUsuarioSeguridad } from "@/sanity/lib/securityFactory";

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
  if (!user) return redirect("/sign-in");

  const usuarioSeguridad = await obtenerUsuarioSeguridad(
    user.id,
    user.emailAddresses[0]?.emailAddress
  );

  if (!usuarioSeguridad.puedo("ver_choferes")) {
    return redirect("/admin");
  }

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