import { client } from "@/sanity/lib/client";
import AuditList, { AuditLog } from "./AuditList"; 
import { currentUser } from "@clerk/nextjs/server";
import { obtenerUsuarioSeguridad } from "@/lib/patterns/securityFactory";

// Función para traer los datos de Sanity (Server Side)
async function getAuditLogs() {
  const query = `*[_type == "auditLog"] | order(timestamp desc) {
    _id,
    timestamp,
    userEmail,
    action,
    entityType,
    entityId, 
    "changes": details
  }`;
  
  // Cache: no-store para datos en tiempo real
  const data = await client.fetch(query, {}, { cache: 'no-store' });
  return data;
}

export default async function AuditoriaPage() {
    const user = await currentUser();
  if (!user) return <div>Inicia sesión.</div>;

  const usuarioSeguridad = await obtenerUsuarioSeguridad(
    user.id,
    user.emailAddresses[0]?.emailAddress
  );

  //SEGURIDAD
  if (!usuarioSeguridad.puedo("ver_auditoria")) {
     return <div className="p-6 text-red-600 font-medium">⛔ Acceso Denegado</div>;
  }
  const logs: AuditLog[] = await getAuditLogs();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">🔎 Auditoría y Trazabilidad</h1>
        <p className="text-gray-500">Registro histórico de eventos y seguridad del sistema.</p>
      </div>

      {/* Renderizamos el componente cliente pasándole los datos */}
      <AuditList logs={logs} />
    </div>
  );
}