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

const OrderDetailsDialog: React.FC<OrderDetailsDialogProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-scroll bg-white">
        <DialogHeader>
          <DialogTitle>Detalles del pedido - {order.orderNumber}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <p>
            <strong>Cliente:</strong> {order.customerName}
          </p>
          <p>
            <strong>Email:</strong> {order.email}
          </p>
          <p>
            <strong>Fecha:</strong>{" "}
            {order.orderDate && new Date(order.orderDate).toLocaleDateString()}
          </p>
          <p>
            <strong>Estado:</strong>{" "}
            <span className="capitalize text-green-600 font-medium">
              {order.status}
            </span>
          </p>
          <p>
            <strong>Numero de factura:</strong> {order?.invoice?.number || "N/A"}
          </p>

          {/* --- ZONA DE BOTONES (Factura y Seguimiento) --- */}
          <div className="flex flex-wrap items-center gap-3 mt-4 mb-4">
            {/* Botón Descargar Factura (Existente) */}
            {order?.invoice?.hosted_invoice_url && (
              <Button 
                variant="outline" 
                asChild
                className="bg-transparent border text-darkColor/80 hover:text-darkColor hover:border-darkColor hover:bg-darkColor/10 hoverEffect"
              >
                <Link href={order.invoice.hosted_invoice_url} target="_blank">
                  Descargar factura
                </Link>
              </Button>
            )}

            {/* Botón Ver Seguimiento (NUEVO) */}
            <Button asChild className="bg-transparent border text-darkColor/80 hover:text-darkColor hover:border-darkColor hover:bg-darkColor/10 hoverEffect">
              <Link href={`/orders/${order.orderNumber}`}>
                Ver Seguimiento
              </Link>
            </Button>
          </div>
          {/* ----------------------------------------------- */}

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
            {order.products?.map((product, index) => (
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
          <div className="w-44 flex flex-col gap-1">
            {/* SUBTOTAL */}
            {order?.amountDiscount !== 0 && (
              <div className="w-full flex items-center justify-between">
                <strong>Subtotal: </strong>
                <PriceFormatter
                  amount={
                    (order?.totalPrice as number) +
                    (order?.amountDiscount as number) -
                    (order?.shippingCost || 0) 
                  }
                  className="text-black font-bold"
                />
              </div>
            )}

            {/* DESCUENTO */}
            {order?.amountDiscount !== 0 && (
              <div className="w-full flex items-center justify-between text-green-600">
                <strong>Discount: </strong>
                <PriceFormatter
                  amount={order?.amountDiscount}
                  className="font-bold"
                />
              </div>
            )}

            {/* ENVÍO */}
            {order?.shippingCost !== undefined && (
                <div className="w-full flex items-center justify-between">
                    <strong>Envío: </strong>
                    {order.shippingCost === 0 ? (
                        <span className="text-green-600 font-bold">Gratis</span>
                    ) : (
                        <PriceFormatter
                          amount={order.shippingCost ?? 0}
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
                amount={order?.totalPrice}
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