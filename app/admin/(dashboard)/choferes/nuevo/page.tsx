import { createDriver } from "@/actions/createDriver";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export default function NewDriverPage() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link href="/admin/choferes" className="flex items-center gap-2 text-gray-500 mb-6 hover:text-black"><ArrowLeft className="w-4 h-4"/> Volver</Link>
      <h1 className="text-2xl font-bold mb-6">Registrar Chofer</h1>
      
      <form action={createDriver} className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-6">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre Completo</label>
          <input name="name" required className="w-full px-4 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Licencia</label>
          <input name="license" required className="w-full px-4 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Foto</label>
          <input type="file" name="photo" accept="image/*" className="w-full text-sm" />
        </div>
        <button type="submit" className="bg-black text-white px-6 py-3 rounded-lg font-bold w-full flex justify-center gap-2">
          <Save className="w-4 h-4" /> Guardar Chofer
        </button>
      </form>
    </div>
  );
}