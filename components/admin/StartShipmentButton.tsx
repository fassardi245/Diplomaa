"use client";

import { assignLogistics } from "@/actions/assignLogistics";
import { Truck, Loader2, Play } from "lucide-react";
import { useState } from "react";

export default function StartShipmentButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    // Confirmación simple
    if (!confirm("¿Asignar vehículo y chofer automáticamente a este pedido?")) return;
    
    setLoading(true);
    try {
      await assignLogistics(orderId);
      // La acción redirige o revalida, así que esperamos
    } catch (error: any) {
      alert(error.message || "Error al asignar logística. Verifica si hay vehículos disponibles.");
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleStart}
      disabled={loading}
      className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition shadow-md disabled:opacity-50 whitespace-nowrap"
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
      {loading ? "Procesando..." : "Iniciar Logística"}
    </button>
  );
}