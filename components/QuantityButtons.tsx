import React from "react";
import { Button } from "./ui/button";
import { HiMinus, HiPlus } from "react-icons/hi2";
import toast from "react-hot-toast";
import useCartStore from "@/store";
import { Product } from "@/sanity.types";
import { twMerge } from "tailwind-merge";

interface Props {
  product: Product;
  className?: string;
  borderStyle?: string;
}

const QuantityButtons = ({ product, className, borderStyle }: Props) => {
  const { addItem, removeItem, getItemCount } = useCartStore();
  const itemCount = getItemCount(product?._id);
  
  // 1. DEFINIMOS EL STOCK SEGURO Y EL LIMITE
  const stock = product?.stock || 0; 
  const isOutOfStock = stock === 0; 
  const reachedMaxStock = itemCount >= stock; 

  const handleRemoveProduct = () => {
    removeItem(product?._id);
    if (itemCount > 1) {
      toast.success("¡Cantidad reducida correctamente!");
    } else {
      toast.success(`${product?.name} eliminado con éxito!`);
    }
  };

  const handleAddProduct = () => {
    // 2. PROTECCIÓN EXTRA EN LA FUNCIÓN
    if (reachedMaxStock) {
        toast.error(`Solo quedan ${stock} unidades disponibles.`);
        return;
    }
    addItem(product);
    toast.success("¡Cantidad aumentada correctamente!");
  };

  return (
    <div
      className={twMerge(
        "flex items-center gap-1 pb-1 text-base",
        borderStyle,
        className
      )}
    >
      <Button
        variant="outline"
        size="icon"
        className="w-6 h-6 cursor-pointer"
        onClick={handleRemoveProduct}
        disabled={itemCount === 0 || isOutOfStock}
      >
        <HiMinus />
      </Button>
      
      <span className="font-semibold w-8 text-center text-darkColor">
        {itemCount}
      </span>

      <Button
        variant="outline"
        size="icon"
        // 3. CAMBIAMOS EL ESTILO SI ESTÁ AL MÁXIMO
        className={twMerge(
            "w-6 h-6 cursor-pointer",
            reachedMaxStock && "opacity-50 cursor-not-allowed" 
        )}
        onClick={handleAddProduct} // Usamos la nueva función creada arriba
        disabled={isOutOfStock || reachedMaxStock} // <--- BLOQUEO DEL BOTÓN
      >
        <HiPlus />
      </Button>
    </div>
  );
};

export default QuantityButtons;
