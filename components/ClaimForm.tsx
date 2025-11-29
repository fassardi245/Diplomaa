"use client";

import { createClaim } from "@/actions/createClaim";
import { useState } from "react";
import { AlertTriangle, Send, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function ClaimForm({ orderId, orderNumber }: { orderId: string, orderNumber: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    try {
      await createClaim(formData);
      setSent(true);
      toast.success("Reclamo enviado. Nos pondremos en contacto.");
    } catch (error) {
      toast.error("Error al enviar el reclamo.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center animate-in fade-in">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <h3 className="font-bold text-green-800 text-lg">¡Reclamo Recibido!</h3>
        <p className="text-green-600 text-sm mt-1">
          Nuestro equipo revisará tu caso
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 pt-8 border-t border-gray-100">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="text-red-500 font-medium text-sm flex items-center gap-2 hover:underline hover:text-red-700 transition-colors"
        >
          <AlertTriangle className="w-4 h-4" />
          Tuve un problema con el pedido / Quiero devolverlo
        </button>
      ) : (
        <form action={handleSubmit} className="bg-gray-50 p-6 rounded-xl border border-gray-200 animate-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-gray-800 flex items-center gap-2">
               <AlertTriangle className="w-5 h-5 text-red-500" />
               Iniciar Reclamo o Devolución
             </h3>
             <button type="button" onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 text-sm">Cancelar</button>
          </div>

          <input type="hidden" name="orderId" value={orderId} />
          <input type="hidden" name="orderNumber" value={orderNumber} />

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Motivo</label>
              <select name="reason" required className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-black outline-none">
                <option value="">Selecciona una opción...</option>
                <option value="damaged">Producto llegó dañado</option>
                <option value="wrong_item">Producto incorrecto</option>
                <option value="regret">Me arrepentí de la compra</option>
                <option value="other">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción del problema</label>
              <textarea 
                name="description" 
                rows={3} 
                required
                placeholder="Cuéntanos más detalles para ayudarte mejor..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-black outline-none"
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? "Enviando..." : <><Send className="w-4 h-4" /> Enviar Reclamo</>}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}