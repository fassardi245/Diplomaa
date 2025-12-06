"use server"

import { logAction } from "@/lib/auditLogger"; // Importa tu archivo existente

export async function logAuthAction(userEmail: string, type: "LOGIN" | "LOGOUT") {
  // Llamamos a tu función potente de lib
  await logAction({
    action: type,
    entityType: "Auth", // O "Sesion", como prefieras que salga en la tabla
    userEmail: userEmail,
    details: { 
        event: type === "LOGIN" ? "Usuario ingresó al sistema" : "Usuario cerró sesión",
        timestamp: new Date().toISOString()
    }
  });
}