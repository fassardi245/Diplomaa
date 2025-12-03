"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { resolveClaimAction } from "../../actions/reclamos"; 

interface Props {
  claimId: string;
  orderId: string; // Recibimos el ID de la orden
}

export default function ResolveClaimButtons({ claimId, orderId }: Props) {
  const [modalAction, setModalAction] = useState<"approve" | "reject" | null>(null);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!modalAction) return;
    setIsLoading(true);

    // Pasamos claimId Y orderId a la acción
    const result = await resolveClaimAction(
      claimId,
      orderId, 
      modalAction === "approve" ? "approved" : "rejected",
      comment
    );

    if (result.success) {
      setModalAction(null);
      setComment("");
    } else {
      alert("Error al guardar cambios");
    }
    setIsLoading(false);
  };

  return (
    <>
      <button 
        onClick={() => setModalAction("reject")} 
        className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
      >
        <XCircle className="w-4 h-4" /> Rechazar Reclamo
      </button>
      <button 
        onClick={() => setModalAction("approve")}
        className="px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition shadow-sm flex items-center justify-center gap-2"
      >
        <CheckCircle className="w-4 h-4" /> Aprobar Devolución
      </button>

      {modalAction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl transform transition-all scale-100">
            <h3 className={`text-lg font-bold mb-2 ${modalAction === 'approve' ? 'text-green-700' : 'text-red-700'}`}>
              {modalAction === 'approve' ? 'Aprobar Devolución' : 'Rechazar Reclamo'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Escribe un mensaje para el cliente.
            </p>
            
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-black outline-none mb-4 min-h-[100px]"
              placeholder={modalAction === 'approve' ? "Ej: Devolución aprobada..." : "Ej: Rechazado por..."}
              autoFocus
            />

            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => { setModalAction(null); setComment(""); }}
                className="px-4 py-2 text-gray-600 font-medium text-sm hover:bg-gray-100 rounded-lg"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirm}
                disabled={isLoading || !comment.trim()}
                className={`px-6 py-2 rounded-lg text-white text-sm font-bold flex items-center gap-2 ${
                  modalAction === 'approve' ? 'bg-green-600' : 'bg-red-600'
                } ${(!comment.trim() || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin"/>}
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}