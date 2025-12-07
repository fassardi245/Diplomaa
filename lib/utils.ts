import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Función existente para Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --- NUEVA FUNCIÓN AGREGADA ---
export function formatDateTime(dateString: string | Date) {
  if (!dateString) return "N/A";
  
  const date = new Date(dateString);
  
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false, // IMPORTANTE: Esto arregla el problema de las 07:00 vs 19:00
    timeZone: "America/Argentina/Buenos_Aires" // IMPORTANTE: Fuerza hora Argentina
  }).format(date);
}