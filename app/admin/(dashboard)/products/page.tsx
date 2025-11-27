import { client } from "@/sanity/lib/client";
import Link from "next/link";
import Image from "next/image";
import { Tag, ArrowRight, Plus, PackageSearch } from "lucide-react";

// 1. Traemos las categorías con su imagen
async function getCategories() {
  return await client.fetch(`*[_type == "category"] | order(title asc) {
    _id, 
    title, 
    "imageUrl": image.asset->url 
  }`, {}, { cache: "no-store" });
}

export default async function ProductsDashboardPage() {
  const categories = await getCategories();

  return (
    <div className="max-w-7xl mx-auto p-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
         <div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                <span className="bg-purple-100 p-2 rounded-xl text-purple-600">
                  <Tag className="w-8 h-8" />
                </span>
                Catálogo de Productos
            </h1>
            <p className="text-gray-500 mt-2">Selecciona una categoría para gestionar su inventario.</p>
         </div>
         
         {/* Botón Global para agregar (sin categoría predefinida) */}
         <Link 
            href="/admin/products/nuevo" 
            className="group flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-purple-600 hover:shadow-purple-200 transition-all active:scale-95"
         >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> 
            Nuevo Producto
         </Link>
      </div>

      {/* GRID DE CATEGORÍAS */}
      {categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((cat: any) => (
              <Link 
                key={cat._id} 
                href={`/admin/products/${cat._id}`} 
                className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-purple-200 transition-all duration-300 hover:-translate-y-1 block"
              >
                {/* Imagen de Fondo / Cover */}
                <div className="h-48 bg-gray-50 relative overflow-hidden">
                    {cat.imageUrl ? (
                      <Image 
                        src={cat.imageUrl} 
                        alt={cat.title} 
                        fill 
                        sizes="(max-width: 768px) 100vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-300 bg-gray-100">
                          <Tag className="w-12 h-12 opacity-50" />
                      </div>
                    )}
                    
                    {/* Overlay sutil al hacer hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                </div>

                {/* Footer de la tarjeta */}
                <div className="p-5 flex justify-between items-center bg-white relative z-10">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-purple-700 transition-colors">
                        {cat.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1 font-medium uppercase tracking-wider">Ver productos</p>
                    </div>
                    
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                </div>
              </Link>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center flex flex-col items-center justify-center bg-gray-50/50 rounded-3xl border border-dashed border-gray-300">
           <PackageSearch className="w-12 h-12 text-gray-300 mb-3" />
           <h3 className="text-lg font-bold text-gray-900">No hay categorías</h3>
           <p className="text-gray-500 max-w-sm mx-auto">Crea categorías en Sanity Studio primero para poder organizar tus productos.</p>
        </div>
      )}
    </div>
  );
}