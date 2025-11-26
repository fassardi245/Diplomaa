import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";
import { ChevronRight, Store } from "lucide-react"; // Cambié el ícono a 'Store' para que tenga más sentido

interface AdminHeaderProps {
    user?: { firstName: string | null; };
    isCollapsed: boolean; 
}

export default function AdminHeader({ user, isCollapsed }: AdminHeaderProps) {
  return (
    <header className={`h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-40 transition-all duration-300 ease-in-out`}>
      
      {/* Izquierda */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <span>Admin</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-600 font-medium">Dashboard</span>
        </div>
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">
            Hola, {user?.firstName || "Bienvenido"} 👋
        </h2>
      </div>

      {/* Derecha */}
      <div className="flex items-center gap-6">
        <Link 
          href="/" 
          // ⚠️ CAMBIO: Eliminé target="_blank" para que abra en la misma pestaña
          className="group flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-black border border-gray-200 bg-white px-5 py-3 rounded-full transition-all hover:bg-gray-50 hover:shadow-md hover:border-gray-300"
        >
          Ir a la Tienda
          {/* Cambié el ícono de ExternalLink a Store, queda mejor si es navegación interna */}
          <Store className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
        </Link>
        
        <div className="md:hidden">
            <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}