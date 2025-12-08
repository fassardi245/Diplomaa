"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { ChevronRight, Store } from "lucide-react";
import { usePathname } from "next/navigation";

interface AdminHeaderProps {
    user?: { firstName: string | null; };
    isCollapsed?: boolean; 
}

// Diccionario de traducciones
const pathTranslations: Record<string, string> = {
  "/admin": "Panel",
  "/admin/orders": "Pedidos",
  "/admin/flota": "Flota",
  "/admin/users": "Usuarios",
  "/admin/mantenimiento": "Mantenimiento",
  "/admin/envios": "Envíos",
  "/admin/products": "Productos",
  "/admin/studio": "Base de Datos",
};

// Función auxiliar para obtener nombre bonito de una URL
const getPageName = (path: string) => {
  // 1. Buscamos coincidencia exacta en el diccionario
  if (pathTranslations[path]) return pathTranslations[path];

  const segments = path.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];

  if (lastSegment === "nuevo") return "Nuevo";
  // Si el segmento es largo (un ID), devolvemos "Detalle"
  if (lastSegment.length > 20) return "Detalle";
  
  return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
};

export default function AdminHeader({ user, isCollapsed }: AdminHeaderProps) {
  const pathname = usePathname();

  // Estado para guardar el historial inmediato: [Anterior, Actual]
  const [navHistory, setNavHistory] = useState<{ prev: string | null; current: string }>({
    prev: null,
    current: pathname
  });

  // Efecto para actualizar el historial de navegación
  useEffect(() => {
    if (pathname !== navHistory.current) {
      setNavHistory({
        prev: navHistory.current, // La que era actual, ahora es la anterior
        current: pathname         // La nueva ruta es la actual
      });
    }
  }, [pathname, navHistory.current]);

  return (
    <header className={`h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-40 transition-all duration-300 ease-in-out`}>
      
      {/* IZQUIERDA: HISTORIAL DE NAVEGACIÓN */}
      <div className="flex flex-col justify-center">
        
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-1">
          
          {/* 1. Si existe una página anterior, la mostramos como Link */}
          {navHistory.prev && (
            <>
              <Link 
                href={navHistory.prev} 
                className="hover:text-indigo-600 hover:underline transition-colors font-medium text-gray-400"
              >
                {getPageName(navHistory.prev)}
              </Link>
              <ChevronRight className="w-3 h-3 text-gray-300" />
            </>
          )}

          {/* 2. Página Actual (Siempre visible) */}
          <span className="font-bold text-gray-800 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
            {getPageName(navHistory.current)}
          </span>

        </nav>

        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Hola, {user?.firstName || "ADMIN"} 👋
        </h2>
      </div>

      {/* --- DERECHA --- */}
      <div className="flex items-center gap-6">
        <Link 
          href="/" 
          className="group flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-black border border-gray-200 bg-white px-5 py-3 rounded-full transition-all hover:bg-gray-50 hover:shadow-md hover:border-gray-300"
        >
          Ir a la Tienda
          <Store className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
        </Link>
        
        <div className="md:hidden">
            <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}