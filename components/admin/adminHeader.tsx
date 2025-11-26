import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";

export default function AdminHeader() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10 ml-0 md:ml-64">
      {/* Izquierda: Título */}
      <div className="text-sm text-gray-500 flex items-center gap-2">
        <span className="hidden sm:inline">Panel de Administración</span> 
        <span className="hidden sm:inline">/</span> 
        <span className="text-gray-900 font-medium">Vista General</span>
      </div>

      {/* Derecha: Acciones */}
      <div className="flex items-center gap-4">
        <Link 
          href="/" 
          className="text-xs font-semibold text-gray-600 hover:text-black border border-gray-200 px-4 py-2 rounded-full transition-colors hover:bg-gray-50"
        >
          Ir a la Tienda ↗
        </Link>
        
        {/* En celular mostramos el botón de usuario aquí porque no hay sidebar */}
        <div className="md:hidden">
            <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}