"use client";
import { Product } from "@/sanity.types";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PriceFormatter from "./PriceFormatter";
import { Button } from "./ui/button";
import useCartStore from "@/store";
import QuantityButtons from "./QuantityButtons";
import { cn } from "@/lib/utils";

interface Props {
  product: Product;
  className?: string;
}

const AddToCartButton = ({ product, className }: Props) => {
  const { addItem, getItemCount } = useCartStore();
  const [isClient, setIsClient] = useState(false);

  const itemCount = getItemCount(product?._id);
  
  // MEJORA: Verificamos si es undefined o menor/igual a 0
  const isOutOfStock = (product?.stock || 0) <= 0;

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div className="w-full h-12 flex items-center">
      {itemCount ? (
        <div className="text-sm w-full">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Cantidad</span>
            {/* Pasamos el producto completo a QuantityButtons para que él sepa el stock */}
            <QuantityButtons product={product} />
          </div>
          <div className="flex items-center justify-between border-t pt-1">
            <span className="text-xs font-semibold">Subtotal</span>
            <PriceFormatter
              amount={product?.price ? product.price * itemCount : 0}
            />
          </div>
        </div>
      ) : (
        <Button
          onClick={() => {
            addItem(product);
            toast.success(
              `${product?.name?.substring(0, 12)}... añadido con éxito!`
            );
          }}
          disabled={isOutOfStock}
          className={cn(
            "w-full bg-transparent text-darkColor shadow-none border border-darkColor/30 font-semibold tracking-wide hover:text-white cursor-pointer hoverEffect",
            // Añadimos estilo visual si está deshabilitado
            isOutOfStock && "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-darkColor",
            className
          )}
        >
          {isOutOfStock ? "Sin Stock" : "Agregar al carrito"}
        </Button>
      )}
    </div>
  );
};

export default AddToCartButton;