"use client";

import { deleteUser } from "@/actions/deleteUser";
import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  userId: string;     // ID de Sanity (_id)
  clerkId: string;    // ID de Clerk
  userEmail: string;
}

export default function DeleteUserButton({ userId, clerkId, userEmail }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `⛔ ATENCIÓN: BORRADO DEFINITIVO\n\n¿Estás seguro de que quieres eliminar a ${userEmail}?\n\n`
    );

    if (!confirmed) return;

    setIsDeleting(true);
    
    try {
      // Pasamos ambos IDs a la server action
      const result = await deleteUser(userId, clerkId);

      if (result.success) {
        // Opcional: Mostrar toast de éxito
        console.log(result.message);
      } else {
        alert("Hubo un error al eliminar. Revisa la consola para más detalles.");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión al intentar eliminar.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="inline-flex items-center justify-center p-2 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors border border-transparent hover:border-red-100 disabled:opacity-50"
      title="Eliminar usuario definitivamente"
    >
      {isDeleting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </button>
  );
}