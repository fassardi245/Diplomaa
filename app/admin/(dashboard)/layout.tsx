import React from "react";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { obtenerUsuarioSeguridad } from "@/lib/patterns/securityFactory";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient"; 
import AuditLoginListener from "@/components/admin/AuditLoginListener";

import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Database, 
  Package,
  Wrench,
  Map,
  Tag,
  UserSquare2, 
  MessageSquareWarning,
  ClipboardList
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const user = await currentUser();
  if (!user) return redirect("/sign-in");

  const usuarioSeguridad = await obtenerUsuarioSeguridad(
    user.id,
    user.emailAddresses[0]?.emailAddress
  );

  // Verificación básica de entrada
  if (!usuarioSeguridad.puedo("acceso_panel_admin")) {
    return redirect("/"); 
  }

  const menuItems = [
    // --- GENERAL ---
    { 
      name: "Dashboard", 
      href: "/admin", 
      icon: <LayoutDashboard className="w-5 h-5" />, 
      permission: "acceso_panel_admin" 
    },
    // --- LOGÍSTICA Y FLOTA ---
    { 
      name: "Flota de Vehículos", 
      href: "/admin/flota", 
      icon: <Truck className="w-5 h-5" />, 
      permission: "ver_flota" 
    },
    { 
      name: "Choferes", 
      href: "/admin/choferes", 
      icon: <UserSquare2 className="w-5 h-5" />, 
      permission: "ver_choferes"
    },
    { 
      name: "Envíos y Logística", 
      href: "/admin/envios", 
      icon: <Map className="w-5 h-5" />, 
      permission: "ver_envios"
    },
    { 
      name: "Mantenimiento", 
      href: "/admin/mantenimiento", 
      icon: <Wrench className="w-5 h-5" />, 
      permission: "ver_mantenimiento"
    },
    // --- GESTIÓN COMERCIAL ---
    { 
      name: "Pedidos", 
      href: "/admin/orders", 
      icon: <Package className="w-5 h-5" />, 
      permission: "ver_pedidos" 
    },
    { 
      name: "Reclamos", 
      href: "/admin/reclamos", 
      icon: <MessageSquareWarning className="w-5 h-5" />, 
      permission: "ver_reclamos"
    },
    // --- ADMINISTRACIÓN ---
    { 
      name: "Productos", 
      href: "/admin/products", 
      icon: <Tag className="w-5 h-5" />, 
      permission: "gestionar_productos" 
    },
    { 
      name: "Gestión Usuarios", 
      href: "/admin/users", 
      icon: <Users className="w-5 h-5" />, 
      permission: "gestionar_seguridad" 
    },
    { 
      name: "Auditoría", 
      href: "/admin/auditoria", 
      icon: <ClipboardList className="w-5 h-5" />, 
      permission: "ver_auditoria" 
    },
    { 
      name: "Base de Datos", 
      href: "/admin/studio", 
      icon: <Database className="w-5 h-5" />, 
      permission: "acceso_studio", 
      external: true 
    },
  ];

  const authorizedMenuItems = menuItems.filter(item => 
    usuarioSeguridad.puedo(item.permission)
  );

  // Obtenemos el email seguro para pasarlo al componente
  const userEmail = user.emailAddresses[0]?.emailAddress || "unknown";

  return (
    <>
      {/* ▼ AQUÍ SE INYECTA EL LISTENER DE AUDITORÍA ▼ */}
      <AuditLoginListener email={userEmail} />

      <AdminLayoutClient 
          menuItems={authorizedMenuItems}
          user={{
              firstName: user.firstName,
              roleName: usuarioSeguridad.nombreRol
          }}
      >
          {children}
      </AdminLayoutClient>
    </>
  );
}