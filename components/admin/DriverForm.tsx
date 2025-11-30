"use client";

import { useState, useRef } from "react";
import { createDriver } from "@/actions/createDriver";
import { updateDriver } from "@/actions/updateDriver"; 
import { deleteDriver } from "@/actions/deleteDriver"; // <--- 1. IMPORTAR ACCIÓN
import { Save, Upload, X, User as UserIcon, Trash2 } from "lucide-react"; // <--- 2. IMPORTAR ICONO TRASH
import Image from "next/image";

interface DriverData {
  _id: string;
  name: string;
  licenseNumber: string;
  status: string;
  photoUrl?: string;
}

interface DriverFormProps {
  driver?: DriverData;
}

export default function DriverForm({ driver }: DriverFormProps) {
  const isEditing = !!driver;
  // Estado de carga para el borrado (opcional, para UX)
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [preview, setPreview] = useState<string | null>(driver?.photoUrl || null);
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

  // --- 3. FUNCIÓN PARA ELIMINAR ---
  const handleDelete = async () => {
    if (!driver?._id) return;

    // Confirmación simple del navegador
    const confirmed = window.confirm("¿Estás seguro de que quieres eliminar este chofer? Esta acción no se puede deshacer.");
    
    if (confirmed) {
      setIsDeleting(true);
      // Llamamos a la Server Action directamente
      await deleteDriver(driver._id);
    }
  };

  return (
    <form action={isEditing ? updateDriver : createDriver} className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-6">
      
      {isEditing && <input type="hidden" name="id" value={driver._id} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* COLUMNA DATOS */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre Completo</label>
            <input 
              name="name" 
              required 
              defaultValue={driver?.name} 
              placeholder="Ej: Juan Pérez" 
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none transition" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Licencia</label>
            <input 
              name="licenseNumber" 
              required 
              defaultValue={driver?.licenseNumber} 
              placeholder="Ej: 123456" 
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none transition" 
            />
          </div>
          
          {/* LOGICA DEL ESTADO (Tu código anterior) */}
          {!isEditing ? (
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Estado Inicial</label>
                <select 
                  name="status" 
                  defaultValue="available" 
                  className="w-full px-4 py-2 border rounded-lg bg-white cursor-pointer focus:ring-2 focus:ring-black outline-none"
                >
                   <option value="available">🟢 Disponible</option>
                   <option value="busy">🚚 En Viaje</option>
                </select>
            </div>
          ) : (
            <input type="hidden" name="status" value={driver?.status} />
          )}
        </div>

        {/* COLUMNA FOTO (Tu código anterior) */}
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

            <input type="file" name="photo" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
            
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition"
            >
               <Upload className="w-3 h-3" /> {isEditing ? "Cambiar Foto" : "Subir Foto"}
            </button>
        </div>
      </div>

      {/* --- 4. BOTONES DE ACCIÓN --- */}
      <div className="pt-4 border-t border-gray-100 flex gap-3">
        
        {/* Botón Guardar (Ocupa el espacio restante) */}
        <button type="submit" className="bg-black text-white px-6 py-3 rounded-lg font-bold flex-1 flex justify-center gap-2 hover:bg-gray-800 transition shadow-lg active:scale-95">
          <Save className="w-4 h-4" /> {isEditing ? "Guardar Cambios" : "Guardar Chofer"}
        </button>

        {/* Botón Eliminar (Solo aparece si estamos editando) */}
        {isEditing && (
          <button 
            type="button" // Importante: type="button" para que no haga submit del form
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-50 text-red-600 px-4 py-3 rounded-lg font-bold border border-red-100 hover:bg-red-100 hover:border-red-200 transition active:scale-95 flex items-center gap-2"
          >
            {isDeleting ? "..." : <Trash2 className="w-5 h-5" />}
          </button>
        )}

      </div>
    </form>
  );
}