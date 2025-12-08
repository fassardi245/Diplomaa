"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

export default function AuditLogoutListener() {
  const { user } = useUser();
  const lastEmailRef = useRef<string | null>(null);

  useEffect(() => {
    // 1. Mientras está conectado, recordamos quién es
    if (user?.primaryEmailAddress?.emailAddress) {
      lastEmailRef.current = user.primaryEmailAddress.emailAddress;
    } 
    // 2. Si user pasa a NULL (se fue) pero tenemos referencia (estaba aquí antes)
    else if (!user && lastEmailRef.current) {
      
      const email = lastEmailRef.current;
      const data = { email: email };
      
      // A) Enviamos la señal al servidor (Log de Salida)
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      navigator.sendBeacon('/api/auditoria/log-logout', blob);

      // B) IMPORTANTE: Borramos la marca de Login del navegador
      // Así, si vuelve a entrar, contará como un ingreso nuevo.
      sessionStorage.removeItem(`audit_login_registered_${email}`);

      // Limpiamos referencia
      lastEmailRef.current = null;
    }
  }, [user]);

  return null;
}