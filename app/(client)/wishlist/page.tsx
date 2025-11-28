"use client";

import Container from "@/components/Container";
import { useWishlistStore } from "@/store/wishlistStore";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import AddToCartButton from "@/components/AddToCartButton";
import { Trash2, HeartOff } from "lucide-react";
import PriceView from "@/components/PriceView";
import { useEffect, useState } from "react";
import Loading from "@/components/Loading";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlistStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return <Loading />;

  return (
    <Container className="py-10">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <span className="text-red-500"></span> Mis Favoritos
      </h1>

      {wishlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {wishlist.map((product) => (
            <div key={product._id} className="group border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all relative bg-white">
              
              {/* Botón Eliminar */}
              <button 
                onClick={() => removeFromWishlist(product._id)}
                className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Eliminar de favoritos"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Imagen */}
              <Link href={`/product/${product.slug?.current}`} className="block h-64 overflow-hidden bg-gray-100 relative">
                {product.images && (
                  <Image
                    src={urlFor(product.images[0]).url()}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
              </Link>

              {/* Info */}
              <div className="p-4">
                <Link href={`/product/${product.slug?.current}`}>
                  <h2 className="font-bold text-gray-800 line-clamp-1 hover:text-black transition-colors">{product.name}</h2>
                </Link>
                
                <div className="mt-2 mb-4">
                   <PriceView price={product.price} discount={product.discount} />
                </div>

                <AddToCartButton 
                    product={product} 
                    className="w-full bg-black text-white py-2 rounded-lg font-bold hover:bg-gray-800 transition shadow-sm" 
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center flex flex-col items-center justify-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <HeartOff className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-800">Tu lista de deseos está vacía</h2>
          <p className="text-gray-500 mt-2 mb-6">Guarda los productos que te gustan para comprarlos después.</p>
          <Link href="/" className="bg-black text-white px-6 py-3 rounded-full font-bold hover:bg-gray-800 transition shadow-lg">
            Explorar Tienda
          </Link>
        </div>
      )}
    </Container>
  );
}