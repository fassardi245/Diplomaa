import { client } from "@/sanity/lib/client";
import Link from "next/link";
import Image from "next/image";
import { Plus, User, Truck } from "lucide-react";

async function getDrivers() {
  return await client.fetch(`*[_type == "driver"]{
    _id, name, license, status, "photoUrl": photo.asset->url
  }`, {}, { cache: "no-store" });
}

export default async function DriversPage() {
  const drivers = await getDrivers();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span className="bg-yellow-100 p-2 rounded-xl text-yellow-600"><User className="w-8 h-8"/></span>
          Choferes
        </h1>
        <Link href="/admin/choferes/nuevo" className="bg-black text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nuevo Chofer
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {drivers.map((driver: any) => (
          <div key={driver._id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden relative border">
              {driver.photoUrl ? <Image src={driver.photoUrl} alt={driver.name} fill className="object-cover"/> : <User className="w-8 h-8 m-auto text-gray-400 mt-4"/>}
            </div>
            <div>
              <h3 className="font-bold text-lg">{driver.name}</h3>
              <p className="text-xs text-gray-500 font-mono bg-gray-100 px-1 rounded w-fit">{driver.license}</p>
              <span className={`text-xs font-bold ${driver.status === 'available' ? 'text-green-600' : 'text-orange-600'}`}>
                {driver.status === 'available' ? '🟢 Disponible' : '🚚 En Viaje'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}