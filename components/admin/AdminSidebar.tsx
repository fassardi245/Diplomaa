"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

// Definimos qué forma tienen los items del menú
interface MenuItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  external?: boolean;
}

interface AdminSidebarProps {
  menuItems: MenuItem[];
  user: {
    firstName: string | null;
    roleName: string;
  };
}

export default function AdminSidebar({ menuItems, user }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-full z-20 top-0 left-0">
      {/* LOGO */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-bold mr-3">
          SC
        </div>
        <span className="font-bold text-gray-900 text-lg tracking-tight">
          SmartCloth
        </span>
      </div>

      {/* NAVEGACIÓN */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              target={item.external ? "_blank" : "_self"}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? "bg-black text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100 hover:text-black"
              }`}
            >
              {/* Renderizamos el ícono que pasamos por props */}
              <span className={isActive ? "text-white" : "text-gray-500"}>
                {item.icon}
              </span>
              
              {item.name}
              
              {item.external && (
                <span className="ml-auto text-xs opacity-50">↗</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* FOOTER CON USUARIO */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <UserButton afterSignOutUrl="/" />
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold text-gray-900 truncate">
              {user.firstName || "Admin"}
            </span>
            <span className="text-xs text-gray-500 truncate" title={user.roleName}>
              {user.roleName}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}