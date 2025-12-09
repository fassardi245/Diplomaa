import { client } from "@/sanity/lib/client";
import Link from "next/link";
import Image from "next/image";
import { Plus, User } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import { obtenerUsuarioSeguridad } from "@/lib/patterns/securityFactory"; 

interface Driver {
  _id: string;
  name: string;
  licenseNumber: string;
  status: 'available' | 'busy'; 
  photoUrl?: string;
}

async function getDrivers() {
  return await client.fetch(`*[_type == "driver"]{
    _id, name, licenseNumber, status, "photoUrl": photo.asset->url
  }`, {}, { cache: "no-store" });
}

export default async function DriversPage() {
  const user = await currentUser();
  if (!user) return <div>Inicia sesión.</div>;

  const usuarioSeguridad = await obtenerUsuarioSeguridad(user.id, user.emailAddresses[0].emailAddress);
  
  //Permiso para entrar
  if (!usuarioSeguridad.puedo("ver_choferes")) return <div className="p-6 text-red-600 font-medium">⛔ Acceso Denegado</div>;

  const drivers: Driver[] = await getDrivers();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span className="bg-yellow-100 p-2 rounded-xl text-yellow-600">
            <User className="w-8 h-8"/>
          </span>
          Choferes
        </h1>
        
        {/*Usa "ver_choferes" para mostrar el boton */}
        {usuarioSeguridad.puedo("ver_choferes") && (
          <Link href="/admin/choferes/nuevo" className="bg-black text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-800 transition shadow-lg">
            <Plus className="w-4 h-4" /> Nuevo Chofer
          </Link>
        )}
      </div>

      {/* LISTA DE TARJETAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drivers.map((driver) => (
          <Link 
            key={driver._id} 
            href={`/admin/choferes/${driver._id}`}
            className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4 hover:shadow-md hover:border-gray-300 hover:-translate-y-1 transition-all cursor-pointer group"
          >
            {/* FOTO */}
            <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden relative border border-gray-200 shrink-0">
              {driver.photoUrl ? (
                <Image src={driver.photoUrl} alt={driver.name} fill className="object-cover"/>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                   <User className="w-8 h-8"/>
                </div>
              )}
            </div>
            {/* DATOS */}
            <div className="overflow-hidden">
              <h3 className="font-bold text-lg truncate group-hover:text-indigo-600 transition-colors">
                {driver.name}
              </h3>
              <p className="text-sm text-gray-500 mb-1">
                 {driver.licenseNumber}
              </p>
              {/* ESTADO */}
              <span className={`text-xs font-bold flex items-center gap-1 ${
                 driver.status === 'available' ? 'text-green-600' : 'text-orange-600'
              }`}>
                {driver.status === 'available' ? "🟢 Disponible" : "🚚 En Viaje"}
              </span>
            </div>
          </Link>
        ))}
        
        {drivers.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
                No hay choferes registrados.
            </div>
        )}
      </div>
    </div>
  );
}