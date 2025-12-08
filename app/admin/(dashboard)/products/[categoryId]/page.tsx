import { client } from "@/sanity/lib/client";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Edit, Plus } from "lucide-react";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import { currentUser } from "@clerk/nextjs/server";
import { obtenerUsuarioSeguridad } from "@/lib/patterns/securityFactory";

// Funcion para traer datos de Sanity
async function getData(categoryId: string) {
  const category = await client.fetch(`*[_type == "category" && _id == $id][0]{title}`, { id: categoryId });
  
  // Traemos los productos de esa categoria
  const products = await client.fetch(`*[_type == "product" && references($id)] | order(_createdAt desc) { 
    _id, 
    name, 
    price, 
    stock, 
    "imageUrl": images[0].asset->url 
  }`, { id: categoryId });
  
  return { category, products };
}

export default async function ProductListPage({ 
  params 
}: { 
  params: Promise<{ categoryId: string }> 
}) {
     const user = await currentUser();
  if (!user) return <div>Inicia sesión.</div>;

  const usuarioSeguridad = await obtenerUsuarioSeguridad(
    user.id,
    user.emailAddresses[0]?.emailAddress
  );

  // SEGURIDAD
  if (!usuarioSeguridad.puedo("gestionar_productos")) {
     return <div className="p-6 text-red-600 font-medium">⛔ Acceso Denegado</div>;
  }
  // 2. Esperamos a que los params estén listos (Next.js 15 Requirement)
  const { categoryId } = await params;

  // 3. Usamos el ID ya procesado
  const { category, products } = await getData(categoryId);

  return (
    <div className="max-w-7xl mx-auto p-8">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
         <div className="flex items-center gap-4">
            <Link href="/admin/products" className="p-2 hover:bg-gray-100 rounded-full transition">
               <ArrowLeft className="w-5 h-5 text-gray-600"/>
            </Link>
            <h1 className="text-3xl font-extrabold text-gray-900">{category?.title || "Productos"}</h1>
         </div>
         <Link 
            href={`/admin/products/nuevo?cat=${categoryId}`} 
            className="group flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-purple-600 hover:shadow-purple-200 transition-all active:scale-95"
         >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" /> 
            Agregar en {category?.title}
         </Link>
      </div>

      {/* TABLA */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
         <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold tracking-wider">
                <tr>
                    <th className="px-6 py-4">Producto</th>
                    <th className="px-6 py-4">Precio</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {products.map((p: any) => (
                    <tr key={p._id} className="hover:bg-purple-50/20 transition-colors group">
                        
                        {/* PRODUCTO + IMAGEN */}
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg border border-gray-200 relative overflow-hidden shrink-0">
                                    {p.imageUrl ? (
                                        <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-xs text-gray-400">📷</div>
                                    )}
                                </div>
                                <span className="font-bold text-gray-900">{p.name}</span>
                            </div>
                        </td>

                        {/* PRECIO */}
                        <td className="px-6 py-4 font-mono font-medium text-gray-700">
                            ${p.price}
                        </td>

                        {/* STOCK */}
                        <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${p.stock > 0 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                {p.stock} un.
                            </span>
                        </td>

                        {/* ACCIONES (Editar + Eliminar) */}
                        <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                                <Link 
                                    href={`/admin/products/editar/${p._id}`} 
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition shadow-sm"
                                >
                                    <Edit className="w-3.5 h-3.5" /> Editar
                                </Link>
                                
                                {/* BOTÓN ELIMINAR */}
                                <DeleteProductButton productId={p._id} />
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
         </div>
         {products.length === 0 && (
            <div className="py-20 text-center text-gray-400 flex flex-col items-center">
                <p>No hay productos en esta categoría.</p>
                <Link href={`/admin/products/nuevo?cat=${categoryId}`} className="text-purple-600 font-bold hover:underline mt-2">
                    ¡Crea el primero ahora!
                </Link>
            </div>
         )}
      </div>
    </div>
  );
}