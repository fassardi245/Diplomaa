import AddToCartButton from "@/components/AddToCartButton";
import Container from "@/components/Container";
import ImageView from "@/components/new/ImageView";
import PriceView from "@/components/PriceView";
import ProductCharacteristics from "@/components/ProductCharacteristics";
import AddToWishlistButton from "@/components/AddToWishlistButton"; // <--- IMPORTANTE
import { getProductBySlug } from "@/sanity/helpers";
import { notFound } from "next/navigation";
import React from "react";

const ProductPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return notFound();
  }

  const isOutOfStock = product?.stock === undefined || product?.stock <= 0;

  return (
    <div>
      <Container className="flex flex-col md:flex-row gap-10 py-10">
        
        {/* GALERÍA DE FOTOS */}
        {product?.images && <ImageView images={product?.images} />}
        
        {/* INFO DEL PRODUCTO */}
        <div className="w-full md:w-1/2 flex flex-col gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 leading-tight">
                {product?.name}
            </h1>
            <PriceView
              price={product?.price}
              discount={product?.discount}
              className="text-xl font-bold"
            />
          </div>

          {/* ETIQUETA DE STOCK */}
          <div>
            {isOutOfStock ? (
              <span className="bg-red-100 text-red-700 px-4 py-1.5 rounded-full text-sm font-bold inline-block">
                Agotado
              </span>
            ) : (
              <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-bold inline-block">
                En Stock
              </span>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed text-base">
            {product?.description}
          </p>

          {/* BOTONES DE ACCIÓN */}
          <div className="flex items-center gap-4 mt-2">
            {/* 1. Agregar al Carrito */}
            <div className="flex-1">
                {isOutOfStock ? (
                <button
                    disabled
                    className="w-full bg-gray-200 text-gray-400 py-3.5 rounded-xl font-bold cursor-not-allowed"
                >
                    Sin Stock
                </button>
                ) : (
                <AddToCartButton
                    product={product}
                    className="w-full bg-black text-white py-3.5 rounded-xl hover:bg-gray-800 transition-colors font-bold shadow-lg shadow-gray-200"
                />
                )}
            </div>

            {/* 2. Botón de Favoritos (Nuevo) */}
            <AddToWishlistButton product={product} />
          </div>

          {/* CARACTERÍSTICAS (Acordeón) */}
          <div className="mt-4 pt-6 border-t border-gray-100">
             <ProductCharacteristics product={product} />
          </div>

          {/* --- AQUÍ BORRAMOS TODO LO QUE NO QUERÍAS (Comparar, Envíos, etc.) --- */}

        </div>
      </Container>
    </div>
  );
};

export default ProductPage;