"use client";

import { useWishlistStore } from "@/store/wishlistStore";
import { Product } from "@/sanity.types";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Props {
  product: Product;
}

export default function AddToWishlistButton({ product }: Props) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const [isClient, setIsClient] = useState(false); // Para evitar hidratación incorrecta

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <button className="border-2 border-gray-300 text-gray-400 px-3 py-2 rounded-md">
        <Heart className="w-5 h-5" />
      </button>
    );
  }

  const isLiked = isInWishlist(product._id);

  const handleWishlist = () => {
    if (isLiked) {
      removeFromWishlist(product._id);
      toast.success("Eliminado de favoritos");
    } else {
      addToWishlist(product);
      toast.success("Agregado a favoritos");
    }
  };

  return (
    <button 
      onClick={handleWishlist}
      className={`border-2 px-3 py-2 rounded-md transition-all duration-300 ${
        isLiked 
          ? "border-red-500 text-red-500 bg-red-50" 
          : "border-gray-300 text-gray-500 hover:text-black hover:border-black"
      }`}
    >
      <Heart className={`w-6 h-6 ${isLiked ? "fill-current" : ""}`} />
    </button>
  );
}