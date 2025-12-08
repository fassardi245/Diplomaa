"use client";

import { useState } from "react";
import { formatDateTime } from "@/lib/utils";

export interface AuditLog {
  _id: string;
  action: string;
  entityType: string;
  entityId: string;
  userEmail: string;
  timestamp: string;
  changes: any;
}

export default function AuditList({ logs }: { logs: AuditLog[] }) {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showRawJson, setShowRawJson] = useState(false); 

  //FUNCION PARA LIMPIAR JSON 
  const safeParse = (data: any) => {
    if (typeof data === "string") {
      try {
        return JSON.parse(data);
      } catch (e) {
        return {};
      }
    }
    return data || {};
  };

  //FUNCION PARA SACAR EL NOMBRE
  const getLogTitle = (log: AuditLog) => {
    const data = safeParse(log.changes);
    if (data.after?.name) return data.after.name;
    if (data.before?.name) return data.before.name;
    if (data.name) return data.name;
    return log.entityId.substring(0, 8) + "...";
  };

  //COMPONENTE FILA
  const ChangeRow = ({ label, oldVal, newVal }: { label: string, oldVal: any, newVal: any }) => {
    const strOld = JSON.stringify(oldVal);
    const strNew = JSON.stringify(newVal);

    if (strOld === strNew) return null;

    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
        <span className="text-xs font-bold uppercase text-gray-500 w-1/3 mb-1 sm:mb-0">{label}</span>
        <div className="flex items-center gap-3 flex-1 text-sm font-mono overflow-hidden">
          {oldVal !== undefined && (
            <span className="text-red-500 line-through opacity-70 truncate max-w-[120px]" title={String(oldVal)}>
              {String(oldVal)}
            </span>
          )}
          {oldVal !== undefined && newVal !== undefined && (
            <span className="text-gray-300">➜</span>
          )}
          <span className="text-green-600 font-bold truncate">
            {String(newVal)}
          </span>
        </div>
      </div>
    );
  };

  // Helper para abrir el modal y resetear la vista a visual por defecto
  const openModal = (log: AuditLog) => {
    setSelectedLog(log);
    setShowRawJson(false);
  };

  const parsedChanges = selectedLog ? safeParse(selectedLog.changes) : {};
  const before = parsedChanges.before || {};
  const after = parsedChanges.after || {};
  const allKeys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]));

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 font-medium text-gray-900">
              <tr>
                <th className="p-4">Fecha / Hora</th>
                <th className="p-4">Usuario</th>
                <th className="p-4">Acción</th>
                <th className="p-4">Entidad (Producto)</th>
                <th className="p-4 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.length > 0 ? (
                logs.map((log) => {
                  const title = getLogTitle(log);
                  
                  return (
                    <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          {/* ▼ 2. USAMOS LA FUNCIÓN DE FORMATO AQUÍ */}
                          <span className="font-medium text-gray-900">
                              {formatDateTime(log.timestamp)}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-gray-700 text-sm block">
                          {log.userEmail || "Sistema"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-bold border ${
                            log.action === "CREATE" ? "bg-green-50 text-green-700 border-green-200" :
                            log.action === "UPDATE" ? "bg-blue-50 text-blue-700 border-blue-200" :
                            "bg-red-50 text-red-700 border-red-200"
                          }`}>
                          {log.action}
                        </span>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 text-sm">{title}</span>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <span className="capitalize bg-gray-100 px-1.5 rounded">{log.entityType}</span>
                            <span className="text-gray-300">•</span>
                            <span className="font-mono text-gray-400" title={log.entityId}>
                                {log.entityId.slice(0, 15)}...
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => openModal(log)}
                          className="text-xs bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-50 hover:border-gray-300 font-medium transition-all shadow-sm"
                        >
                          Ver Cambios
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={5} className="p-12 text-center text-gray-400">Sin registros de auditoría</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL --- */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-100">
            
            {/* Header Modal */}
            <div className="p-5 border-b flex justify-between items-center bg-gray-50/80 backdrop-blur">
              <div>
                <h3 className="font-bold text-gray-800 text-xl">
                    {getLogTitle(selectedLog)}
                </h3>
                <p className="text-xs text-gray-500 mt-1 flex gap-2">
                    <span>ID: {selectedLog._id.slice(0,8)}...</span>
                    <span>•</span>
                    {/* ▼ 3. USAMOS LA FUNCIÓN DE FORMATO AQUÍ TAMBIÉN */}
                    <span>{formatDateTime(selectedLog.timestamp)}</span>
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {/* --- BOTÓN TOGGLE --- */}
                <button 
                  onClick={() => setShowRawJson(!showRawJson)}
                  className="px-3 py-1 text-xs font-bold border rounded bg-white hover:bg-gray-50 text-gray-600 transition-colors flex items-center gap-2"
                >
                  {showRawJson ? (
                    <>👁️ Ver Visual</>
                  ) : (
                    <><span className="font-mono">{`{ }`}</span> Ver JSON</>
                  )}
                </button>

                <button onClick={() => setSelectedLog(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 transition-colors">
                  &times;
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-0 overflow-y-auto flex-1 bg-white">
              
              {/* Resumen Superior */}
              <div className="grid grid-cols-2 gap-px bg-gray-100 border-b">
                 <div className="bg-white p-4">
                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Acción</span>
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${
                      selectedLog.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' : 
                      selectedLog.action === 'CREATE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>{selectedLog.action}</span>
                 </div>
                 <div className="bg-white p-4">
                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Responsable</span>
                    <span className="text-sm font-medium text-gray-900 truncate block" title={selectedLog.userEmail}>
                        {selectedLog.userEmail || "Sistema"}
                    </span>
                 </div>
              </div>

              {/* CONTENIDO PRINCIPAL: CONDICIONAL */}
              <div className="p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  {showRawJson ? <span>💻 Datos Crudos (JSON)</span> : <span>📝 Detalle de modificaciones</span>}
                </h4>
                
                {showRawJson ? (
                  // --- VISTA JSON CRUDO ---
                  <div className="bg-slate-900 rounded-lg shadow-inner border border-slate-700 p-4 overflow-auto max-h-[400px]">
                    <pre className="text-xs font-mono text-green-400 whitespace-pre-wrap break-all">
                      {JSON.stringify(parsedChanges, null, 2)}
                    </pre>
                  </div>
                ) : (
                  // --- VISTA VISUAL (BONITA) ---
                  <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                    {allKeys.length > 0 && (parsedChanges.before || parsedChanges.after) ? (
                      allKeys.map((key) => {
                        if (["_type", "_key", "categories", "imageUpdated", "_ref", "_updatedAt", "_createdAt", "_rev", "slug"].includes(key)) return null;
                        return <ChangeRow key={key} label={key} oldVal={before[key]} newVal={after[key]} />;
                      })
                    ) : (
                      // Fallback si no tiene formato before/after
                      <div className="p-8 text-center text-gray-400 italic text-sm">
                        Este registro no tiene formato de comparación visual.
                        <br/>
                        <button onClick={() => setShowRawJson(true)} className="text-indigo-600 underline mt-2 hover:text-indigo-800">
                            Ver JSON crudo
                        </button>
                      </div>
                    )}
                    
                    {after.imageUpdated && (
                      <div className="p-3 bg-indigo-50 border-t border-indigo-100 flex items-center gap-2 text-indigo-700 text-sm">
                        📷 <b>Imagen:</b> Fue actualizada en esta operación.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t flex justify-end">
              <button onClick={() => setSelectedLog(null)} className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium shadow-lg shadow-gray-200 transition-all">
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}