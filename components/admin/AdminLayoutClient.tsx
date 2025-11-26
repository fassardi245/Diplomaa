"use client";

import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./adminHeader";

export default function AdminLayoutClient({ 
    children, 
    menuItems, 
    user 
}: { 
    children: React.ReactNode;
    menuItems: any[];
    user: any;
}) {
  // Estado para controlar si está cerrado (true) o abierto (false)
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex">
      
      {/* --- SIDEBAR --- */}
      <AdminSidebar 
        menuItems={menuItems} 
        user={user}
        isCollapsed={isCollapsed}
        toggleSidebar={() => setIsCollapsed(!isCollapsed)}
      />

      {/* --- CONTENIDO PRINCIPAL --- */}
      {/* Ajustamos el margen izquierdo (ml) dinámicamente */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? "md:ml-20" : "md:ml-64"}`}>
        
        {/* Header recibe el estado para saber ancho si fuera necesario, aunque ya está dentro del flex */}
        <AdminHeader user={user} isCollapsed={isCollapsed} />
        
        <main className="flex-1 p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {children}
          </div>
        </main>
      </div>
    </div>
  );
}