"use client";

import { useEffect, useRef } from "react";
import { logAuthAction } from "@/actions/logAuthAction";

interface Props {
  email: string;
}

export default function AuditLoginListener({ email }: Props) {
  // Usamos un ref para que React no dispare el efecto dos veces en modo desarrollo
  const processedRef = useRef(false);

  useEffect(() => {
    // Si no hay email o ya procesamos este componente en esta carga, paramos.
    if (!email || processedRef.current) return;

    // CLAVE ÚNICA PARA ESTA SESIÓN DE NAVEGADOR
    // Usamos el email en la clave para que si cambias de usuario, detecte el nuevo.
    const STORAGE_KEY = `audit_login_registered_${email}`;

    // Verificamos si ya lo registramos en esta pestaña del navegador
    const yaRegistrado = sessionStorage.getItem(STORAGE_KEY);

    if (!yaRegistrado) {
      // ▼ EJECUTAMOS LA ACCIÓN
      logAuthAction(email, "LOGIN")
        .then(() => {
          console.log("✅ [AUDIT] Login registrado en BD");
          // Marcamos en el navegador que ya se auditó esta sesión
          sessionStorage.setItem(STORAGE_KEY, "true");
        })
        .catch((err: any) => console.error("❌ Error auditando login:", err));
    } else {
      console.log("ℹ️ [AUDIT] Login ya registrado previamente en esta sesión (F5 omitido).");
    }

    processedRef.current = true;
  }, [email]);

  return null;
}