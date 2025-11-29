"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { client } from "@/sanity/lib/client"; // Asegúrate de importar tu cliente de escritura o server action

export default function NewDriverPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Estados del formulario
  const [name, setName] = useState("");
  const [license, setLicense] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  // Función para subir imagen a Sanity (si no la tienes ya, usa esta lógica)
  const uploadImage = async (file: File) => {
    const asset = await client.assets.upload("image", file, {
      contentType: file.type,
      filename: file.name,
    });
    return asset._id;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !license) return;

    setLoading(true);
    try {
      let photoAssetId = null;
      if (photo) {
        photoAssetId = await uploadImage(photo);
      }

      // CREAMOS EL DOCUMENTO
      await client.create({
        _type: "driver",
        name: name,
        licenseNumber: license,
        status: "available", // <--- FORZAMOS SIEMPRE "DISPONIBLE"
        photo: photoAssetId ? { _type: "image", asset: { _type: "reference", _ref: photoAssetId } } : null
      });

      router.push("/admin/choferes");
      router.refresh();
    } catch (error) {
      console.error("Error creating driver:", error);
      alert("Error al crear el chofer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Link href="/admin/choferes" className="flex items-center text-sm text-gray-500 hover:text-black mb-6 w-fit">
        <ArrowLeft className="w-4 h-4 mr-1" /> Volver a la lista
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Registrar Chofer</h1>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8">
        
        {/* COLUMNA IZQUIERDA: DATOS TEXTO */}
        <div className="flex-1 space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nombre Completo</label>
            <Input 
              placeholder="Ej: Juan Pérez" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-gray-50 border-gray-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Licencia</label>
            <Input 
              placeholder="Ej: B1 - 123456" 
              value={license} 
              onChange={(e) => setLicense(e.target.value)}
              required
              className="bg-gray-50 border-gray-200"
            />
          </div>

          {/* --- AQUÍ ELIMINAMOS EL SELECTOR DE ESTADO --- */}
          {/* El estado ya no se elige, se asigna automático en el código */}

        </div>

        {/* COLUMNA DERECHA: FOTO */}
        <div className="w-full md:w-64 flex flex-col items-center">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-4 self-start">Foto de Perfil</label>
          
          <div className="w-40 h-40 rounded-full bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative group cursor-pointer hover:border-gray-400 transition">
             {photo ? (
               <img src={URL.createObjectURL(photo)} alt="Preview" className="w-full h-full object-cover" />
             ) : (
               <div className="text-center text-gray-400">
                 <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                 <span className="text-xs">Subir</span>
               </div>
             )}
             
             {/* Input invisible */}
             <input 
               type="file" 
               accept="image/*"
               onChange={(e) => e.target.files && setPhoto(e.target.files[0])}
               className="absolute inset-0 opacity-0 cursor-pointer"
             />
          </div>
          <p className="text-xs text-blue-600 font-medium mt-3 pointer-events-none">
             {photo ? "Cambiar Foto" : "Subir Foto"}
          </p>
        </div>

      </form>
      
      {/* BOTÓN GUARDAR (FUERA DEL FLEX PARA OCUPAR ANCHO) */}
      <div className="mt-6">
        <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="w-full bg-black text-white hover:bg-gray-800 py-6 text-lg rounded-xl"
        >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2"/> : null}
            Guardar Chofer
        </Button>
      </div>

    </div>
  );
}