"use client"

import { useClerk, useUser } from "@clerk/nextjs";
import { logAuthAction } from "@/actions/logAuthAction";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    if (user) {
        // 1. Limpiamos la marca de sesión del navegador (para que si vuelve a entrar, cuente como Login)
        sessionStorage.removeItem(`audit_login_recorded_${user.id}`);

        // 2. Registramos el LOGOUT en Sanity
        // No usamos 'await' estricto para no bloquear al usuario si Sanity tarda
        logAuthAction(
            user.primaryEmailAddress?.emailAddress || "no-email", 
            "LOGOUT"
        );
    }

    // 3. Cerramos sesión en Clerk y redirigimos
    await signOut(() => router.push("/"));
  };

  return (
    <button 
      onClick={handleLogout} 
      className="text-red-600 hover:text-red-800 font-medium"
    >
      Cerrar Sesión
    </button>
  );
}