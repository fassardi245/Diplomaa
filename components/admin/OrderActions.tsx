"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MoreHorizontal, Eye, Trash2, FileText, Loader2 } from "lucide-react";
import { deleteOrder } from "@/actions/deleteOrder";
import { getOrderInvoiceUrl } from "@/actions/getOrderInvoice"; // <--- Importamos la acción

export default function OrderActions({ orderId }: { orderId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async () => {
    if (confirm("¿Estás seguro de que quieres eliminar este pedido?")) {
      await deleteOrder(orderId);
      setIsOpen(false);
    }
  };

  // --- AQUÍ ESTÁ LA LÓGICA NUEVA ---
  const handlePrint = async () => {
    setLoadingInvoice(true);
    try {
      const url = await getOrderInvoiceUrl(orderId);

      if (url) {
        window.open(url, '_blank'); // Abre el PDF en otra pestaña
      } else {
        alert("Este pedido no tiene una factura de Stripe asociada (puede ser un pedido antiguo o de prueba).");
      }
    } catch (error) {
      alert("Error al intentar obtener la factura.");
    } finally {
      setLoadingInvoice(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-full transition-colors duration-200 ${isOpen ? 'bg-gray-200 text-gray-800' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
          
          <div className="py-1">
            {/* VER DETALLE */}
            <Link 
              href={`/admin/orders/${orderId}`} 
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Ver Detalle
            </Link>

            {/* IMPRIMIR RECIBO (BOTÓN REAL) */}
            <button 
              onClick={handlePrint}
              disabled={loadingInvoice}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors text-left disabled:opacity-50"
            >
              {loadingInvoice ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              {loadingInvoice ? "Buscando..." : "Imprimir Recibo"}
            </button>
          </div>

          <div className="border-t border-gray-100 py-1">
            <button 
              onClick={handleDelete}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar Pedido
            </button>
          </div>

        </div>
      )}
    </div>
  );
}