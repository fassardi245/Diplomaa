"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom"; // <--- IMPORTANTE
import { Plus, X, Save, Zap } from "lucide-react";
import { createGroup } from "@/actions/createGroup";

interface ActionItem {
  _id: string;
  nombre: string;
}

export default function CreateGroupModal({ allActions }: { allActions: ActionItem[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false); // <--- Estado para verificar que estamos en el cliente

  // Necesario para evitar errores de hidratación con createPortal
  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleSubmit(formData: FormData) {
    await createGroup(formData);
    setIsOpen(false); 
  }

  // Si no está montado aún, devolvemos null o solo el botón (se maneja abajo)
  
  return (
    <>
      {/* 1. EL BOTÓN SE QUEDA AQUÍ (DENTRO DEL FORM PRINCIPAL) */}
      {/* Es CRUCIAL que tenga type="button" para que no envíe el form de atrás */}
      <button
        onClick={() => setIsOpen(true)}
        type="button" 
        className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold bg-blue-50 px-3 py-1 rounded-md transition-colors"
      >
        <Plus className="w-3 h-3" />
        Nuevo Grupo
      </button>

      {/* 2. EL MODAL SE TELETRANSPORTA FUERA CON CREATEPORTAL */}
      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-800">Crear Nuevo Grupo</h3>
              <button 
                onClick={() => setIsOpen(false)} 
                type="button" 
                className="p-1 hover:bg-gray-200 rounded-full text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario que apunta a la Server Action */}
            {/* Como estamos en un Portal, este form ya no es hijo del otro form visualmente en el DOM */}
            <form action={handleSubmit} className="p-6">
              
              {/* Input Nombre */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Grupo</label>
                <input 
                  name="nombre" 
                  type="text" 
                  required
                  placeholder="Ej: Gerentes de Zona"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              {/* Lista de Acciones para elegir */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-500" />
                  Seleccionar Acciones
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1 bg-gray-50">
                  {allActions.map((accion) => (
                    <label key={accion._id} className="flex items-center gap-3 p-2 hover:bg-white rounded-md cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        name="acciones" 
                        value={accion._id}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{accion.nombre}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Footer Botones */}
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-gray-600 text-sm font-medium hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                >
                  <Save className="w-4 h-4" />
                  Guardar Grupo
                </button>
              </div>

            </form>
          </div>
        </div>,
        document.body // <--- Aquí es donde ocurre la magia: lo enviamos al body
      )}
    </>
  );
}