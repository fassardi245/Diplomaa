"use client";

import { deleteProduct } from "@/actions/deleteProduct";
import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";

export default function DeleteProductButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.")) return;

    setLoading(true);
    try {
      await deleteProduct(productId);
      // No necesitamos hacer nada más, la Server Action recargará la página
    } catch (error) {
      alert("Error al eliminar");
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-bold inline-flex items-center gap-1 transition disabled:opacity-50"
      title="Eliminar producto"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      Eliminar
    </button>
  );
}