"use client";

import { resolveClaim } from "@/actions/resolveClaim";
import { Check, X } from "lucide-react";
import toast from "react-hot-toast";

export default function ResolveClaimButtons({ claimId, orderId }: { claimId: string, orderId: string }) {
  
  const handleResolve = async (resolution: "approved" | "rejected") => {
    if(!confirm(`¿Estás seguro de ${resolution === 'approved' ? 'APROBAR' : 'RECHAZAR'} este reclamo?`)) return;
    
    try {
      await resolveClaim(claimId, orderId, resolution);
      toast.success(`Reclamo ${resolution === 'approved' ? 'aprobado' : 'rechazado'}`);
    } catch (e) {
      toast.error("Error al procesar");
    }
  };

  return (
    <>
      <button onClick={() => handleResolve("approved")} className="flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg font-bold hover:bg-green-700 transition">
        <Check className="w-4 h-4" /> Aprobar Devolución
      </button>
      <button onClick={() => handleResolve("rejected")} className="flex items-center justify-center gap-2 bg-red-100 text-red-600 border border-red-200 py-2 px-4 rounded-lg font-bold hover:bg-red-200 transition">
        <X className="w-4 h-4" /> Rechazar Reclamo
      </button>
    </>
  );
}