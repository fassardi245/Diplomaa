import { client } from "@/sanity/lib/client";
import ProductForm from "@/components/admin/ProductForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import { obtenerUsuarioSeguridad } from "@/lib/patterns/securityFactory";

// Traemos las categorías para que el usuario pueda elegir a cuál pertenece el producto
async function getCategories() {
  return await client.fetch(`*[_type == "category"] | order(title asc) { _id, title }`);
}

export default async function NewProductPage({
  searchParams,
}: {
  // 1. CAMBIO AQUÍ: searchParams debe definirse como una Promesa en Next.js 15
  searchParams: Promise<{ cat?: string }>;
}) {
   const user = await currentUser();
  if (!user) return <div>Inicia sesión.</div>;

  const usuarioSeguridad = await obtenerUsuarioSeguridad(
    user.id,
    user.emailAddresses[0]?.emailAddress
  );

  // 🔒 SEGURIDAD (Estilo Flota)
  if (!usuarioSeguridad.puedo("gestionar_productos")) {
     return <div className="p-6 text-red-600 font-medium">⛔ Acceso Denegado</div>;
  }
  const categories = await getCategories();
  
  // 2. CAMBIO AQUÍ: Esperamos la promesa antes de leer la propiedad
  const { cat } = await searchParams;
  const initialCategoryId = cat;

  // Calculamos el link de volver: si vino de una categoría, vuelve ahí. Si no, al dashboard.
  const backLink = initialCategoryId 
    ? `/admin/products/${initialCategoryId}` 
    : "/admin/products";

  return (
    <div className="max-w-5xl mx-auto p-8 pb-20">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href={backLink} 
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Nuevo Producto</h1>
           <p className="text-xs text-gray-500">Completa la ficha para agregar inventario.</p>
        </div>
      </div>

      {/* FORMULARIO DE PRODUCTO */}
      <ProductForm 
        categories={categories} 
        initialCategoryId={initialCategoryId} 
      />
    </div>
  );
}