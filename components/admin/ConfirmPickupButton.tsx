"use client";

import { useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { confirmPickupAction } from "@/actions/confirmPickupAction";

export default function ConfirmPickupButton({ orderId }: { orderId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    const confirmed = window.confirm("¿Estás seguro que el cliente ya retiró el pedido?");
    
    if (!confirmed) return;
    
    startTransition(async () => {
      await confirmPickupAction(orderId);
    });
  };

  return (
    <button
      onClick={handleConfirm}
      disabled={isPending}
      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-700 transition shadow-md disabled:opacity-50 whitespace-nowrap"
    >
      {isPending ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <CheckCircle2 className="w-3 h-3" />
      )}
      Confirmar Entrega
    </button>
  );
}