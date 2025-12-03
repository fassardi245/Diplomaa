"use client";

import { useWishlistStore } from "@/store/wishlistStore";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

const WishlistIcon = () => {
  const { wishlist } = useWishlistStore();
  const [isClient, setIsClient] = useState(false);

  // Evitamos errores de hidratación asegurándonos de renderizar solo en el cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Link href="/wishlist" className="group relative">
      <Heart className="w-6 h-6 group-hover:text-darkColor hoverEffect text-gray-600" />
      <span className="absolute -top-1 -right-1 bg-darkColor text-white h-3.5 w-3.5 rounded-full text-xs font-semibold flex items-center justify-center">
        {/* Si no ha cargado el cliente, mostramos 0 para evitar saltos visuales */}
        {isClient ? wishlist.length : 0}
      </span>
    </Link>
  );
};

export default WishlistIcon;