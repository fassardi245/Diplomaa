"use client";

import { useEffect, useRef } from "react";
// Importamos TU acción existente
import { logAuthAction } from "@/actions/logAuthAction"; 

interface Props {
  email: string;
}

export default function AuditLoginListener({ email }: Props) {
  const loggedRef = useRef(false);

  useEffect(() => {
    // Si no tenemos email o ya logueamos, no hacemos nada
    if (!email || loggedRef.current) return;

    // Llamamos a tu acción existente pasando el email y el tipo
    logAuthAction(email, "LOGIN")
      .catch((err: any) => {
        console.error("Error registrando auditoría de login:", err);
      });

    loggedRef.current = true;
  }, [email]);

  return null;
}