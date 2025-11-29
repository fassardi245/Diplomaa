"use client";

import { useState, useRef } from "react";
import { createDriver } from "@/actions/createDriver";
import { Save, Upload, X, User as UserIcon } from "lucide-react";
import Image from "next/image";

export default function DriverForm() {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <form action={createDriver} className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* COLUMNA DATOS */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre Completo</label>
            <input name="name" required placeholder="Ej: Juan Pérez" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Licencia</label>
            <input name="license" required placeholder="Ej: B1 - 123456" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" />
          </div>
          
          {/* Estado Inicial (Oculto o Visible si quieres) */}
          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Estado Inicial</label>
             <select name="status" className="w-full px-4 py-2 border rounded-lg bg-white">
                <option value="available">🟢 Disponible</option>
                <option value="off_duty">🏖️ De Licencia</option>
             </select>
          </div>
        </div>

        {/* COLUMNA FOTO */}
        <div className="flex flex-col items-center justify-center space-y-4 border-l pl-6 border-gray-100">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 self-start">Foto de Perfil</label>
            
            <div className="relative w-32 h-32 rounded-full border-4 border-gray-100 overflow-hidden bg-gray-50 shadow-inner group">
               {preview ? (
                 <Image src={preview} alt="Preview" fill className="object-cover" />
               ) : (
                 <div className="flex items-center justify-center h-full text-gray-300">
                    <UserIcon className="w-12 h-12" />
                 </div>
               )}
               
               {/* Botón X para borrar */}
               {preview && (
                 <button 
                   type="button" 
                   onClick={clearImage}
                   className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                 >
                   <X className="w-8 h-8" />
                 </button>
               )}
            </div>

            <input 
              type="file" 
              name="photo" 
              accept="image/*" 
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden" 
            />
            
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
               <Upload className="w-3 h-3" /> Subir Foto
            </button>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <button type="submit" className="bg-black text-white px-6 py-3 rounded-lg font-bold w-full flex justify-center gap-2 hover:bg-gray-800 transition shadow-lg">
          <Save className="w-4 h-4" /> Guardar Chofer
        </button>
      </div>
    </form>
  );
}