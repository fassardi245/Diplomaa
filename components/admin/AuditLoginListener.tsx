"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { logAuthAction } from "@/actions/logAuthAction";

interface Props {
  email: string;
}

export default function AuditLoginListener({ email }: Props) {
  const { isSignedIn } = useUser();
  const processedRef = useRef(false);

  // CLAVE ÚNICA PARA ESTA SESIÓN DE NAVEGADOR
  const STORAGE_KEY = `audit_login_registered_${email}`;

  useEffect(() => {
    // 1. LÓGICA DE LOGIN
    // Si el usuario está logueado, tenemos email, y NO hemos procesado esto en este render...
    if (isSignedIn && email && !processedRef.current) {
      
      // Verificamos si ya lo registramos en esta pestaña del navegador
      const yaRegistrado = sessionStorage.getItem(STORAGE_KEY);

      if (!yaRegistrado) {
        logAuthAction(email, "LOGIN")
          .then(() => {
            // Marcamos en el navegador que ya se logueó
            sessionStorage.setItem(STORAGE_KEY, "true");
            console.log("Auditoría: Login registrado correctamente.");
          })
          .catch((err: any) => console.error("Error auditando login:", err));
      } else {
        // Ya estaba registrado, es solo un refresh (F5), lo ignoramos.
        console.log("Auditoría: Login omitido (ya registrado en esta sesión).");
      }

      processedRef.current = true;
    }

    // 2. LÓGICA DE LOGOUT
    // Si isSignedIn cambia a false, significa que el usuario cerró sesión explícitamente
    if (isSignedIn === false) {
       // Solo registramos logout si teníamos una sesión activa previa
       const estabaLogueado = sessionStorage.getItem(STORAGE_KEY);
       
       if (estabaLogueado) {
         logAuthAction(email || "usuario_saliente", "LOGOUT")
            .then(() => console.log("Auditoría: Logout registrado."))
            .catch(err => console.error(err));
         
         // Limpiamos la marca para que el próximo login sí cuente
         sessionStorage.removeItem(STORAGE_KEY);
       }
    }

  }, [isSignedIn, email, STORAGE_KEY]);

  return null;
}