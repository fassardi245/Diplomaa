import { client } from "@/sanity/lib/client";
import ProductForm from "@/components/admin/ProductForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import { obtenerUsuarioSeguridad } from "@/lib/patterns/securityFactory";

// Función para traer datos
async function getData(id: string) {
  // 1. Buscamos el producto específico
  // Usamos '...' para traer todos los campos (name, price, discount, stock, etc.)
  // Y sacamos la URL de la primera imagen para mostrarla en el preview
  const productQuery = `*[_type == "product" && _id == $id][0]{
    ..., 
    "imageUrl": images[0].asset->url
  }`;

  // 2. Buscamos todas las categorías para el desplegable
  const categoriesQuery = `*[_type == "category"] | order(title asc) { _id, title }`;

  // Ejecutamos las dos consultas en paralelo para que sea más rápido
  const [product, categories] = await Promise.all([
    client.fetch(productQuery, { id }, { cache: 'no-store' }), // 'no-store' para que siempre traiga datos frescos
    client.fetch(categoriesQuery)
  ]);

  return { product, categories };
}

export default async function EditProductPage({ params }: { params: { id: string } }) {
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
  const { product, categories } = await getData(params.id);

  // Validación simple por si el ID no existe
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

  // Intentamos volver a la categoría de este producto al dar 'Atrás', o al general si no tiene
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

      {/* FORMULARIO REUTILIZABLE:
          Al pasarle la prop 'product', el componente sabe que es modo Edición.
          Al pasarle 'categories', llena el select.
      */}
      <ProductForm
        categories={categories}
        product={product}
      />
    </div>
  );
}