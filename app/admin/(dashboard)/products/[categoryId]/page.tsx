import { client } from "@/sanity/lib/client";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Edit, Plus } from "lucide-react";

async function getData(categoryId: string) {
  const category = await client.fetch(`*[_type == "category" && _id == $id][0]{title}`, { id: categoryId });
  
  // CORRECCIÓN AQUÍ: Usamos images[0] para sacar la primera foto del array
  const products = await client.fetch(`*[_type == "product" && references($id)]{ 
    _id, 
    name, 
    price, 
    stock, 
    "imageUrl": images[0].asset->url 
  }`, { id: categoryId });
  
  return { category, products };
}

export default async function ProductListPage({ params }: { params: { categoryId: string } }) {
  const { category, products } = await getData(params.categoryId);

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
         <div className="flex items-center gap-4">
            <Link href="/admin/products" className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft className="w-5 h-5"/></Link>
            <h1 className="text-3xl font-bold text-gray-900">{category?.title || "Productos"}</h1>
         </div>
         <Link href={`/admin/products/nuevo?cat=${params.categoryId}`} className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-800 transition">
            <Plus className="w-4 h-4" /> Agregar en {category?.title}
         </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
         <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold">
               <tr>
                  <th className="px-6 py-4">Producto</th>
                  <th className="px-6 py-4">Precio</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4 text-right">Acción</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
               {products.map((p: any) => (
                  <tr key={p._id} className="hover:bg-gray-50 transition">
                     <td className="px-6 py-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg border border-gray-200 relative overflow-hidden shrink-0">
                           {p.imageUrl && <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />}
                        </div>
                        <span className="font-bold text-gray-900">{p.name}</span>
                     </td>
                     <td className="px-6 py-4 font-mono">${p.price}</td>
                     <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                           {p.stock} un.
                        </span>
                     </td>
                     <td className="px-6 py-4 text-right">
                        <Link href={`/admin/products/editar/${p._id}`} className="text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-sm font-bold inline-flex items-center gap-1 transition">
                           <Edit className="w-4 h-4" /> Editar
                        </Link>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
         {products.length === 0 && <div className="p-10 text-center text-gray-400">No hay productos en esta categoría.</div>}
      </div>
    </div>
  );
}