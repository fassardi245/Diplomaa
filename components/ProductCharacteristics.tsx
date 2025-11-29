import { Product } from "@/sanity.types";
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

const ProductCharacteristics = ({ product }: { product: Product }) => {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger className="font-bold">
          {product?.name}: Caracteristicas
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-1">
          <p className="flex items-center justify-between">
            Tipo:{" "}
            <span className="font-semibold tracking-wide capitalize">
              {product?.variant || "N/A"} 
            </span>
          </p>
          <p className="flex items-center justify-between">
            Stock:{" "}
            <span className="font-semibold tracking-wide">
              {product?.stock && product.stock > 0 ? "Disponible" : "Sin stock"}
            </span>
          </p>
          {/* CAMBIO AQUÍ: Ahora mostramos la etiqueta correcta */}
          <p className="flex items-center justify-between">
            Materiales:{" "}
            <span className="font-semibold tracking-wide">
              {product?.intro}
            </span>
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ProductCharacteristics;