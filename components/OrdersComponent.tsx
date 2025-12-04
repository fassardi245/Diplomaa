"use client";
import React, { useState } from "react";
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
import { Trash, AlertCircle, Clock, CornerUpLeft } from "lucide-react"; 
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { cancelOrder } from "@/actions/cancelOrder";

const OrdersComponent = ({ orders }: { orders: MY_ORDERS_QUERYResult }) => {
  const [isCancelling, setIsCancelling] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<MY_ORDERS_QUERYResult[number] | null>(null);
  const router = useRouter();

  const handleOrderClick = (order: MY_ORDERS_QUERYResult[number]) => {
    setSelectedOrder(order);
  };

  const handleCancelOrder = async (orderId: string, event: React.MouseEvent) => {
    event.stopPropagation(); 
    if (!confirm("¿Estás seguro de que deseas CANCELAR este pedido?")) return;
    setIsCancelling(orderId);
    try {
      await cancelOrder(orderId);
      toast.success("¡Orden cancelada!");
      router.refresh();
    } catch (error) {
      toast.error("Error al cancelar.");
    } finally {
      setIsCancelling(null);
    }
  };

  return (
    <>
      <TableBody>
        <TooltipProvider>
          {orders.map((orderItem) => {
            const order = orderItem as any;
            const canCancel = order.status === 'pendiente' || order.status === 'pagado';

            return (
            <Tooltip key={order?.orderNumber}>
              <TooltipTrigger asChild>
                <TableRow
                  className="cursor-pointer hover:bg-gray-100 h-12"
                  onClick={() => handleOrderClick(order)}
                >
                  <TableCell className="font-medium">{order.orderNumber?.slice(-10) ?? "N/D"}...</TableCell>
                  <TableCell className="hidden md:table-cell">{order?.orderDate && format(new Date(order.orderDate), "dd/MM/yyyy")}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell className="hidden sm:table-cell">{order.email}</TableCell>
                  
                  {/* CORRECCIÓN: Dividimos el total por 100 para que aparezca bien en la lista (ej: 24.99) */}
                  <TableCell><PriceFormatter amount={(order?.totalPrice || 0) / 100} className="text-black font-medium"/></TableCell>
                  
                  <TableCell>
                    <div className="flex flex-col items-start gap-1">
                        {order.claimStatus !== 'approved' && order?.status && (
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                order.status === "pagado" ? "bg-green-100 text-green-800" :
                                order.status === "cancelado" ? "bg-red-100 text-red-800" :
                                order.status === "entregado" ? "bg-green-100 text-green-800" :
                                "bg-yellow-100 text-yellow-800"
                            }`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                        )}

                        {order.claimStatus === 'rejected' && (
                            <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-red-700 bg-red-50 px-2 py-1 rounded border border-red-100 w-max mt-1">
                                <AlertCircle className="w-3 h-3" /> Reclamo Rechazado
                            </span>
                        )}
                        {order.claimStatus === 'pending' && (
                            <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-yellow-700 bg-yellow-50 px-2 py-1 rounded border border-yellow-100 w-max mt-1">
                                <Clock className="w-3 h-3" /> Reclamo Pendiente
                            </span>
                        )}
                        {order.claimStatus === 'approved' && (
                            <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded border border-purple-100 w-max mt-1">
                                <CornerUpLeft className="w-3 h-3" /> Devuelto
                            </span>
                        )}
                    </div>
                  </TableCell>

                  <TableCell className="hidden sm:table-cell">
                    {order?.invoice && <p className="font-medium line-clamp-1">{order?.invoice?.number}</p>}
                  </TableCell>
                  
                  <TableCell>
                    {canCancel && (
                      <button onClick={(e) => handleCancelOrder(order._id, e)} className="ml-2 text-gray-400 hover:text-red-600 cursor-pointer" disabled={isCancelling === order._id}>
                        {isCancelling === order._id ? <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div> : <Trash size={18} />}
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              </TooltipTrigger>
              <TooltipContent><p>Ver detalles</p></TooltipContent>
            </Tooltip>
          )})}
        </TooltipProvider>
      </TableBody>
      <OrderDetailsDialog order={selectedOrder} isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} />
    </>
  );
};

export default OrdersComponent;