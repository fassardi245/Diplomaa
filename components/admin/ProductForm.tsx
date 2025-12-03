"use client";

import { useState, useRef } from "react";
import { createProduct } from "@/actions/createProduct";
import { updateProduct } from "@/actions/updateProduct"; 
import { Save, Upload, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface Category {
  _id: string;
  title: string;
}

interface ProductFormProps {
  categories: Category[];
  product?: any; 
  initialCategoryId?: string; 
}

export default function ProductForm({ categories, product, initialCategoryId }: ProductFormProps) {
  const isEditing = !!product;
  
  // 1. Estado para la categoría seleccionada
  const [selectedCatId, setSelectedCatId] = useState(
    product?.categories?.[0]?._ref || initialCategoryId || ""
  );

  // 2. Lógica Automática: Mapea Título de Categoría -> Valor de Variante
  const getAutoVariant = (catId: string) => {
    const category = categories.find(c => c._id === catId);
    if (!category) return "otros";

    const title = category.title.toLowerCase();
    
    // Reglas de negocio
    if (title.includes("remera")) return "remera";
    if (title.includes("campera")) return "campera";
    if (title.includes("pantal")) return "pantalon"; 
    if (title.includes("buzo")) return "buzo";
    if (title.includes("short")) return "short";
    
    return "otros";
  };

  const autoVariant = getAutoVariant(selectedCatId);

  // --- Imagen ---
  const initialImage = product?.images && product.images[0] ? product.imageUrl : null;
  const [preview, setPreview] = useState<string | null>(initialImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
      <form action={isEditing ? updateProduct : createProduct}>
        {isEditing && <input type="hidden" name="id" value={product._id} />}
        
        {/* INPUT OCULTO: Envía la variante calculada automáticamente */}
        <input type="hidden" name="variant" value={autoVariant} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* FOTO */}
          <div className="lg:col-span-1 space-y-4">
            <label className="block text-xs font-bold text-gray-500 uppercase">Imagen Principal</label>
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative bg-gray-50 h-64 overflow-hidden">
               {preview ? (
                 <Image src={preview} alt="Preview" fill className="object-contain p-2" />
               ) : (
                 <div className="text-gray-400">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <span className="text-xs">Subir Imagen</span>
                 </div>
               )}
               {preview && (
                 <button type="button" onClick={() => {setPreview(null); if(fileInputRef.current) fileInputRef.current.value=""}} className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-md hover:text-red-500"><X className="w-4 h-4"/></button>
               )}
            </div>
            <input type="file" name="image" accept="image/*" onChange={handleImageChange} ref={fileInputRef} className="hidden" />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold hover:bg-gray-50">
               {preview ? "Cambiar Foto" : "Seleccionar Foto"}
            </button>
          </div>

          {/* DATOS */}
          <div className="lg:col-span-2 space-y-5">
             <div className="grid grid-cols-1 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre</label>
                    <input name="name" type="text" required defaultValue={product?.name} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" placeholder="Ej: Remera Básica" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Materiales</label>
                    <input name="intro" type="text" defaultValue={product?.intro} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" placeholder="Ej: 100% Algodón" />
                </div>
             </div>

             <div className="grid grid-cols-3 gap-4">
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Precio ($)</label>
                   <input name="price" type="number" step="0.01" required defaultValue={product?.price} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descuento ($)</label>
                   <input name="discount" type="number" step="0.01" defaultValue={product?.discount || 0} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Stock</label>
                   <input name="stock" type="number" required defaultValue={product?.stock || 0} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" />
                </div>
             </div>

             {/* SELECTOR DE CATEGORÍA Y ETIQUETA (Variante automática y oculta) */}
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoría</label>
                    <select 
                      name="categoryId" 
                      value={selectedCatId}
                      onChange={(e) => setSelectedCatId(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black bg-white"
                    >
                      {categories.map((c) => (
                          <option key={c._id} value={c._id}>{c.title}</option>
                      ))}
                    </select>
                    {/* Mensaje visual pequeño */}
                    <p className="text-[10px] text-gray-400 mt-1">Variante interna: <strong>{autoVariant}</strong></p>
                </div>
             </div>

             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción Detallada</label>
                <textarea name="description" rows={4} defaultValue={product?.description} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none"></textarea>
             </div>

             <div className="pt-4 flex justify-end">
                <button type="submit" className="flex items-center gap-2 bg-black text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition shadow-lg">
                   <Save className="w-4 h-4" /> {isEditing ? "Guardar Cambios" : "Crear Producto"}
                </button>
             </div>
          </div>

        </div>
      </form>
    </div>
  );
}