"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MenuItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  external?: boolean;
}

interface AdminSidebarProps {
  menuItems: MenuItem[];
  user: { firstName: string | null; roleName: string };
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export default function AdminSidebar({ menuItems, user, isCollapsed, toggleSidebar }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside 
      className={`bg-white border-r border-gray-200 fixed h-full z-50 transition-all duration-300 ease-in-out flex flex-col
      ${isCollapsed ? "w-20" : "w-64"} shadow-xl`}
    >
      {/* --- BOTÓN PARA ABRIR/CERRAR (FLOTANTE EN EL BORDE) --- */}
      <button 
        onClick={toggleSidebar}
        className="absolute -right-3 top-9 bg-black text-white p-1 rounded-full shadow-md hover:scale-110 transition-transform z-50"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* --- LOGO --- */}
      <div className={`h-20 flex items-center border-b border-gray-100 transition-all ${isCollapsed ? "justify-center px-0" : "px-8"}`}>
        <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center font-bold text-xl shrink-0">
          SC
        </div>
        {!isCollapsed && (
          <div className="flex flex-col ml-3 overflow-hidden whitespace-nowrap fade-in">
            <span className="font-bold text-gray-900 text-lg leading-tight">SmartCloth</span>
            <span className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">Panel de control</span>
          </div>
        )}
      </div>

      {/* --- NAVEGACIÓN --- */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
        {!isCollapsed && (
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 whitespace-nowrap">
            Menu Principal
          </p>
        )}
        
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.name : ""}
              target={item.external ? "_blank" : "_self"}
              className={`flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative
                ${isActive ? "bg-black text-white shadow-md" : "text-gray-500 hover:bg-gray-50 hover:text-black"}
                ${isCollapsed ? "justify-center" : ""}
              `}
            >
              <span className={`shrink-0 transition-transform duration-200 ${!isActive && "group-hover:scale-110"}`}>
                {item.icon}
              </span>
              
              {!isCollapsed && (
                <span className="whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</span>
              )}

              {!isCollapsed && item.external && (
                <span className="ml-auto text-[10px] opacity-60 border border-current px-1 rounded">EXT</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* --- FOOTER DEL USUARIO (CON MARGEN EXTRA PARA NO SER TAPADO) --- */}
      {/* Agregamos 'pb-6 mb-10' para empujarlo hacia arriba y evitar el badge de Clerk/Next */}
<div className="p-3 border-t border-gray-50 pb-6 mb-10">
        <div className={`bg-gray-50 rounded-2xl p-2.5 flex items-center gap-3 border border-gray-100 transition-all ${isCollapsed ? "justify-center" : ""}`}>
          
          {/* 1. CONTENEDOR DEL AVATAR: Forzamos medidas exactas y centrado flex */}
          <div className="w-9 h-9 flex items-center justify-center border-2 border-white rounded-full shadow-sm shrink-0 overflow-hidden bg-white">
             <UserButton 
                afterSignOutUrl="/" 
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-full h-full" // Esto fuerza a la imagen a llenar nuestro círculo perfecto
                  }
                }}
             />
          </div>

          {!isCollapsed && (
            <div className="flex flex-col justify-center"> {/* 2. justify-center asegura que el texto quede al medio verticalmente */}
              
              <span className="text-sm font-bold text-gray-900 leading-none mb-1"> {/* leading-none quita espacio extra arriba/abajo */}
                {user.firstName || "Admin"}
              </span>
              
              <span className="text-[10px] text-blue-700 font-bold bg-blue-100 px-2 py-0.5 rounded-md w-fit leading-tight">
                {user.roleName}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}