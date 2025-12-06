import { backendClient } from "@/sanity/lib/backendClient"

// Definimos la interfaz flexible
interface LogData {
  action: string      // Ej: "CREATE", "UPDATE"
  resource?: string   // Ej: "products"
  entityType?: string // Alias para resource
  entityId?: string   // ID del producto
  userEmail?: string  // <--- El email del usuario real (Clerk)
  details?: any       // El objeto con { before: ..., after: ... }
  changes?: any       // Compatibilidad hacia atrás
  ipAddress?: string
}

/**
 * Función reutilizable para registrar eventos de auditoría en Sanity.
 */
export async function logAction(data: LogData) {
  try {
    // 1. Normalizar Entity Type
    const finalEntityType = data.resource || data.entityType || "Desconocido";
    
    // 2. Normalizar Detalles (Priorizamos details)
    let finalDetails = data.details || data.changes || {};

    // 3. Evitar doble stringify: Si ya viene como string, lo dejamos así. Si es objeto, lo convertimos.
    // Esto es vital para que tu "Before/After" se guarde bien.
    if (typeof finalDetails !== 'string') {
      finalDetails = JSON.stringify(finalDetails, null, 2);
    }

    // 4. Escribir en Sanity
    await backendClient.create({
      _type: 'auditLog', 
      action: data.action,
      entityType: finalEntityType,
      entityId: data.entityId || "N/A",
      
      // Aquí se guarda el usuario real. Si es undefined, pone "Sistema"
      userEmail: data.userEmail || "Sistema", 
      
      timestamp: new Date().toISOString(),
      details: finalDetails, 
      ipAddress: data.ipAddress,
    })

    // Log de consola para desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ [AUDIT] ${data.action} en ${finalEntityType} | User: ${data.userEmail || "Sistema"}`);
    }

  } catch (error) {
    console.error("❌ [AUDIT ERROR] Falló el registro de auditoría:", error)
    // No lanzamos throw para que el flujo principal (ej: actualizar producto) no se rompa
    // solo porque falló el log.
  }
}