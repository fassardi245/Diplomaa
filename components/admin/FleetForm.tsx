"use client";

import { useState, useRef } from "react";
import { createVehicle } from "@/actions/createVehicle";
import { updateVehicle } from "@/actions/updateVehicle"; // Importamos la nueva acción
import { Save, Image as ImageIcon, X, Upload } from "lucide-react";
import Image from "next/image";

// Definimos qué datos esperamos recibir si es edición
interface FleetFormProps {
  vehicle?: {
    _id: string;
    model: string;
    plate: string;
    status: string;
    fuelLevel: number;
    mileage?: number;
    lastMaintenance?: string;
    currentRoute?: string;
    imageUrl?: string;
  }
}

export default function FleetForm({ vehicle }: FleetFormProps) {
  // Si hay vehículo, es EDICIÓN. Si no, es CREACIÓN.
  const isEditing = !!vehicle;

  // Estados iniciales (Si editamos, usamos los datos del vehículo)
  const [status, setStatus] = useState(vehicle?.status || "available");
  const [preview, setPreview] = useState<string | null>(vehicle?.imageUrl || null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  };

  const clearImage = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* MAGIA AQUÍ: 
         Si es edición -> usa updateVehicle 
         Si es nuevo -> usa createVehicle 
      */}
      <form action={isEditing ? updateVehicle : createVehicle} className="p-6">
        
        {/* Si editamos, necesitamos enviar el ID oculto */}
        {isEditing && <input type="hidden" name="id" value={vehicle._id} />}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-6">
          
          {/* COLUMNA IZQUIERDA */}
          <div className="space-y-4">
             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Modelo</label>
                <input name="model" type="text" required placeholder="Ej: Toyota Hilux" defaultValue={vehicle?.model}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition" />
             </div>

             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Patente</label>
                <input name="plate" type="text" required minLength={6} maxLength={10} placeholder="AA 123 BB" defaultValue={vehicle?.plate}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none uppercase font-mono tracking-wide" />
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kilometraje</label>
                   <input name="mileage" type="number" min="0" placeholder="0" required defaultValue={vehicle?.mileage || 0}
                     className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Combustible %</label>
                   <input name="fuelLevel" type="number" min="0" max="100" defaultValue={vehicle?.fuelLevel || 100}
                     className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none" />
                </div>
             </div>
             
             <div>
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Última Revisión</label>
               <input name="lastMaintenance" type="date" defaultValue={vehicle?.lastMaintenance}
                 className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none text-gray-600" />
            </div>
          </div>

          {/* COLUMNA DERECHA */}
          <div className="space-y-4">
             
             {/* FOTO */}
             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fotografía</label>
                <div className="flex items-start gap-4">
                   <div className="relative shrink-0">
                     <div className="w-32 h-32 rounded-lg bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative">
                        {preview ? (
                          <Image src={preview} alt="Preview" fill className="object-cover" />
                        ) : (
                          <ImageIcon className="w-10 h-10 text-gray-300" />
                        )}
                     </div>
                     {preview && (
                       <button type="button" onClick={clearImage} className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md border border-gray-200 hover:bg-red-50 transition">
                         <X className="w-4 h-4 text-red-500" />
                       </button>
                     )}
                   </div>
                   <div className="flex-1">
                      <input type="file" name="image" accept="image/*" onChange={handleImageChange} ref={fileInputRef} className="hidden" />
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition shadow-sm mb-2">
                        <Upload className="w-4 h-4" />
                        {isEditing ? "Cambiar Imagen" : "Seleccionar Imagen"}
                      </button>
                      <p className="text-[10px] text-gray-400">JPG, PNG o WEBP. Máx 5MB.</p>
                   </div>
                </div>
             </div>

             <hr className="border-gray-100 my-6" />

             {/* ESTADO */}
             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Estado Actual</label>
                <select name="status" value={status} onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black bg-white cursor-pointer">
                    <option value="available">🟢 Disponible</option>
                    <option value="in_transit">🚚 En Ruta</option>
                    <option value="maintenance">🔧 Mantenimiento</option>
                </select>
             </div>

             {/* RUTA */}
             <div className={`transition-opacity duration-300 ${status !== 'in_transit' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Destino / Ciudad</label>
                <input name="currentRoute" type="text" disabled={status !== 'in_transit'} defaultValue={vehicle?.currentRoute}
                  placeholder={status === 'in_transit' ? "Ej: Buenos Aires" : "Bloqueado"}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none disabled:bg-gray-100" />
             </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button type="submit" className="flex items-center gap-2 bg-black text-white px-8 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-800 transition shadow-lg hover:shadow-xl active:scale-95">
            <Save className="w-4 h-4" />
            {isEditing ? "Guardar Cambios" : "Guardar Vehículo"}
          </button>
        </div>
      </form>
    </div>
  );
}