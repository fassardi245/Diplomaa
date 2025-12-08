"use client";

import { useEffect, useRef } from "react";
import { logAuthAction } from "@/actions/logAuthAction";

interface Props {
  email: string;
}

export default function AuditLoginListener({ email }: Props) {
  const processedRef = useRef(false);

  useEffect(() => {
    if (!email || processedRef.current) return;

    const STORAGE_KEY = `audit_login_registered_${email}`;

    const yaRegistrado = sessionStorage.getItem(STORAGE_KEY);

    if (!yaRegistrado) {
      logAuthAction(email, "LOGIN")
        .then(() => {
          console.log("✅ [AUDIT] Login registrado en BD");
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