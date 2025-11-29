import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import PriceFormatter from "./PriceFormatter";
import { MY_ORDERS_QUERYResult } from "@/sanity.types";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { Button } from "./ui/button";
import Link from "next/link";

interface OrderDetailsDialogProps {
  order: MY_ORDERS_QUERYResult[number] | null;
  isOpen: boolean;
  onClose: () => void;
}

// Interfaz extendida para evitar errores de TypeScript
interface OrderWithExtras extends Omit<MY_ORDERS_QUERYResult[number], 'shippingAddress' | 'shippingMethodName'> {
    shippingMethodName?: string | null;
    shippingAddress?: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        postal_code?: string;
        country?: string;
    } | null;
}

const OrderDetailsDialog: React.FC<OrderDetailsDialogProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  if (!order) return null;

  // Casting seguro
  const safeOrder = order as unknown as OrderWithExtras;

  const isPickup = 
      safeOrder.shippingMethodName?.toLowerCase().includes("retiro") || 
      safeOrder.shippingMethodName?.toLowerCase().includes("local") ||
      safeOrder.shippingCost === 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-scroll bg-white">
        <DialogHeader>
          <DialogTitle>Detalles del pedido - {safeOrder.orderNumber}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <p>
            <strong>Cliente:</strong> {safeOrder.customerName}
          </p>
          <p>
            <strong>Email:</strong> {safeOrder.email}
          </p>
          <p>
            <strong>Fecha:</strong>{" "}
            {safeOrder.orderDate && new Date(safeOrder.orderDate).toLocaleDateString()}
          </p>
          <p>
            <strong>Estado:</strong>{" "}
            <span className="capitalize text-green-600 font-medium">
              {safeOrder.status}
            </span>
          </p>
          <p>
            <strong>Numero de factura:</strong> {safeOrder?.invoice?.number || "N/A"}
          </p>

          {/* --- Dirección de Envío --- */}
          <div className="mt-1">
            <strong>Dirección: </strong>
            {isPickup ? (
                <span className="text-blue-700 font-medium bg-blue-50 px-2 py-0.5 rounded text-sm">
                    📍 Retiro en el Local
                </span>
            ) : (
                <span>
                    {safeOrder.shippingAddress ? (
                        <>
                            {safeOrder.shippingAddress.line1}
                            {safeOrder.shippingAddress.line1 && safeOrder.shippingAddress.city ? ", " : ""}
                            {safeOrder.shippingAddress.city}
                        </>
                    ) : (
                        <span className="text-gray-400 italic text-sm">No especificada</span>
                    )}
                </span>
            )}
          </div>

          {/* --- BOTONES --- */}
          <div className="flex flex-wrap items-center gap-3 mt-4 mb-4">
            {safeOrder?.invoice?.hosted_invoice_url && (
              <Button 
                variant="outline" 
                asChild
                className="bg-transparent border text-darkColor/80 hover:text-darkColor hover:border-darkColor hover:bg-darkColor/10 hoverEffect"
              >
                <Link href={safeOrder.invoice.hosted_invoice_url} target="_blank">
                  Descargar factura
                </Link>
              </Button>
            )}

            <Button asChild className="bg-transparent border text-darkColor/80 hover:text-darkColor hover:border-darkColor hover:bg-darkColor/10 hoverEffect">
              <Link href={`/orders/${safeOrder.orderNumber}`}>
                Ver Seguimiento
              </Link>
            </Button>
          </div>

        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Calidad</TableHead>
              <TableHead>Precio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeOrder.products?.map((product, index) => (
              <TableRow key={index}>
                <TableCell className="flex items-center gap-2">
                  {product?.product?.images && (
                    <Image
                      src={urlFor(product?.product?.images[0]).url()}
                      alt="productImage"
                      width={50}
                      height={50}
                      className="border rounded-sm"
                    />
                  )}

                  {product?.product && product?.product?.name}
                </TableCell>
                <TableCell>{product?.quantity}</TableCell>
                <TableCell>
                  <PriceFormatter
                    amount={product?.product?.price}
                    className="text-black font-medium"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-4 text-right flex items-center justify-end">
          <div className="w-64 flex flex-col gap-1">
            
            {/* SUBTOTAL */}
            {safeOrder?.amountDiscount !== 0 && (
              <div className="w-full flex items-center justify-between">
                <strong>Subtotal: </strong>
                <PriceFormatter
                  amount={
                    (safeOrder?.totalPrice as number) +
                    (safeOrder?.amountDiscount as number) -
                    (safeOrder?.shippingCost || 0) 
                  }
                  className="text-black font-bold"
                />
              </div>
            )}

            {/* DESCUENTO */}
            {safeOrder?.amountDiscount !== 0 && (
              <div className="w-full flex items-center justify-between text-green-600">
                <strong>Discount: </strong>
                <PriceFormatter
                  amount={safeOrder?.amountDiscount}
                  className="font-bold"
                />
              </div>
            )}

            {/* ENVÍO (CORREGIDO: Menos peso visual) */}
            {safeOrder?.shippingCost !== undefined && (
                <div className="w-full flex items-center justify-between">
                    {/* Cambié 'strong' por un span con font-medium para que no se vea tan grande/negrita */}
                    <span className="font-medium text-black">
                        {safeOrder.shippingMethodName || "Envío"}:
                    </span>
                    
                    {safeOrder.shippingCost === 0 ? (
                        <span className="text-green-600 font-bold">Gratis</span>
                    ) : (
                        <PriceFormatter
                          amount={safeOrder.shippingCost ?? 0}
                          className="text-black font-bold"
                        />
                    )}
                </div>
            )}

            <div className="border-t border-gray-200 my-1"></div>

            {/* TOTAL */}
            <div className="w-full flex items-center justify-between">
              <strong>Total: </strong>
              <PriceFormatter
                amount={safeOrder?.totalPrice}
                className="text-black font-bold text-lg"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;