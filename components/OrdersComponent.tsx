"use client";
import React, { useCallback, useState } from "react";
import { TableBody, TableCell, TableRow } from "./ui/table";
import PriceFormatter from "./PriceFormatter";
import { MY_ORDERS_QUERYResult } from "@/sanity.types";
import OrderDetailsDialog from "./OrderDetailsDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { format } from "date-fns";
import { Trash, Ban } from "lucide-react"; // Importé 'Ban' por si quisieras cambiar el icono, pero mantendré Trash
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { cancelOrder } from "@/actions/cancelOrder"; // <--- CAMBIO: Importamos cancelar

const OrdersComponent = ({ orders }: { orders: MY_ORDERS_QUERYResult }) => {
  const [isCancelling, setIsCancelling] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<
    MY_ORDERS_QUERYResult[number] | null
  >(null);

  const handleOrderClick = (order: MY_ORDERS_QUERYResult[number]) => {
    setSelectedOrder(order);
  };

  const router = useRouter();

  const handleCancelOrder = async (
    orderId: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation(); 

    if (
      !confirm(
        "¿Estás seguro de que deseas CANCELAR este pedido? Se notificará a la administración."
      )
    ) {
      return;
    }

    setIsCancelling(orderId);

    try {
      // Llamamos a la acción de cancelar
      await cancelOrder(orderId);

      toast.success("¡Orden cancelada correctamente!");
      router.refresh();

    } catch (error) {
      console.error("Error al cancelar:", error);
      toast.error("No se pudo cancelar la orden. Intenta nuevamente.");
    } finally {
      setIsCancelling(null);
    }
  };

  return (
    <>
      <TableBody>
        <TooltipProvider>
          {orders.map((order) => {
            // LÓGICA DE VISIBILIDAD:
            // Solo se puede cancelar si está 'pendiente' o 'pagado'.
            // Si ya está en camino, entregado o cancelado, no mostramos el botón.
            const canCancel = order.status === 'pendiente' || order.status === 'pagado';

            return (
            <Tooltip key={order?.orderNumber}>
              <TooltipTrigger asChild>
                <TableRow
                  className="cursor-pointer hover:bg-gray-100 h-12"
                  onClick={() => handleOrderClick(order)}
                >
                  <TableCell className="font-medium">
                    {order.orderNumber?.slice(-10) ?? "N/D"}...
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {order?.orderDate &&
                      format(new Date(order.orderDate), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {order.email}
                  </TableCell>
                  <TableCell>
                    <PriceFormatter
                      amount={order?.totalPrice}
                      className="text-black font-medium"
                    />
                  </TableCell>
                  
                  {/* ESTADO */}
                  <TableCell>
                    {order?.status && (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          order.status === "pagado" ? "bg-green-100 text-green-800" :
                          order.status === "cancelado" ? "bg-red-100 text-red-800" :
                          order.status === "entregado" ? "bg-green-100 text-green-800" :
                          "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="hidden sm:table-cell">
                    {order?.invoice && (
                      <p className="font-medium line-clamp-1">
                        {order?.invoice ? order?.invoice?.number : "----"}
                      </p>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {/* BOTÓN DE CANCELAR (El Tacho) */}
                    {/* Solo se muestra si el pedido es cancelable */}
                    {canCancel && (
                      <button
                        onClick={(e) => handleCancelOrder(order._id, e)}
                        className="ml-2 text-gray-400 hover:text-red-600 cursor-pointer transition-colors"
                        disabled={isCancelling === order._id}
                        aria-label="Cancelar orden"
                        title="Cancelar pedido"
                      >
                        {isCancelling === order._id ? (
                          <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Trash size={18} />
                        )}
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              </TooltipTrigger>
              <TooltipContent className="text-white font-medium">
                <p>Haz clic para ver los detalles de la orden</p>
              </TooltipContent>
            </Tooltip>
          )})}
        </TooltipProvider>
      </TableBody>
      <OrderDetailsDialog
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </>
  );
};

export default OrdersComponent;