"use client";

import { completeShipment } from "@/actions/completeShipment";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";

export default function CompleteShipmentButton({ shipmentId }: { shipmentId: string }) {
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (!confirm("¿Confirmar que la entrega se realizó con éxito? El vehículo quedará disponible.")) return;
    
    setLoading(true);
    try {
      await completeShipment(shipmentId);
    } catch (error) {
      alert("Error al finalizar envío");
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleComplete}
      disabled={loading}
      className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-100 transition shadow-sm"
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
      {loading ? "Finalizando..." : "Confirmar Entrega"}
    </button>
  );
}