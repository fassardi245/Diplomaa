import { client } from "@/sanity/lib/client";
import ProductForm from "@/components/admin/ProductForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import { obtenerUsuarioSeguridad } from "@/lib/patterns/securityFactory";


async function getData(id: string) {
  //Buscamos el producto específico
  const productQuery = `*[_type == "product" && _id == $id][0]{
    ..., 
    "imageUrl": images[0].asset->url
  }`;

  //buscamos todas las categorías para el desplegable
  const categoriesQuery = `*[_type == "category"] | order(title asc) { _id, title }`;

  const [product, categories] = await Promise.all([
    client.fetch(productQuery, { id }, { cache: 'no-store' }),
    client.fetch(categoriesQuery)
  ]);

  return { product, categories };
}

export default async function EditProductPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
   const user = await currentUser();
  if (!user) return <div>Inicia sesión.</div>;

  const usuarioSeguridad = await obtenerUsuarioSeguridad(
    user.id,
    user.emailAddresses[0]?.emailAddress
  );

  //  SEGURIDAD 
  if (!usuarioSeguridad.puedo("gestionar_productos")) {
     return <div className="p-6 text-red-600 font-medium">⛔ Acceso Denegado</div>;
  }

  // Esperamos la promesa para obtener el ID
  const { id } = await params;

  // Ahora usamos la variable 'id' ya resuelta
  const { product, categories } = await getData(id);

  // Validación por si el ID no existe
  if (!product) {
    return (
        <div className="flex flex-col items-center justify-center h-96 text-gray-500">
            <p className="text-lg font-medium">Producto no encontrado 😕</p>
            <Link href="/admin/products" className="text-indigo-600 hover:underline mt-2">
                Volver al catálogo
            </Link>
        </div>
    );
  }

  const backLink = product.categories?.[0]?._ref 
    ? `/admin/products/${product.categories[0]._ref}` 
    : "/admin/products";

  return (
    <div className="max-w-5xl mx-auto p-8 pb-20">
      
      {/* HEADER DE NAVEGACIÓN */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
            href={backLink} 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Editar Producto</h1>
           <p className="text-xs text-gray-500">
              Modificando: <span className="font-bold text-gray-800">{product.name}</span>
           </p>
        </div>
      </div>

      {/* FORMULARIO REUTILIZABL*/}
      <ProductForm
        categories={categories}
        product={product}
      />
    </div>
  );
}