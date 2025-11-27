import { client } from "@/sanity/lib/client";
import ProductForm from "@/components/admin/ProductForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Traemos las categorías para que el usuario pueda elegir a cuál pertenece el producto
async function getCategories() {
  return await client.fetch(`*[_type == "category"] | order(title asc) { _id, title }`);
}

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: { cat?: string };
}) {
  const categories = await getCategories();
  
  // Si en la URL dice ?cat=123, lo guardamos para pre-seleccionar esa categoría
  const initialCategoryId = searchParams.cat;

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