import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { obtenerUsuarioSeguridad } from "@/sanity/lib/securityFactory";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient"; 
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Database, 
  Package,
  Wrench,
  Map // <--- Importamos Map para la sección de Envíos
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

  if (!usuarioSeguridad.puedo("acceso_panel_admin")) {
    return redirect("/"); 
  }

  const menuItems = [
    { 
      name: "Dashboard", 
      href: "/admin", 
      icon: <LayoutDashboard className="w-5 h-5" />, 
      permission: "acceso_panel_admin" 
    },
    { 
      name: "Flota de Vehículos", 
      href: "/admin/flota", 
      icon: <Truck className="w-5 h-5" />, 
      permission: "ver_flota" 
    },
    { 
      name: "Envíos y Logística", 
      href: "/admin/envios", 
      icon: <Map className="w-5 h-5" />, 
      permission: "ver_flota" 
    },
    { 
      name: "Mantenimiento", 
      href: "/admin/mantenimiento", 
      icon: <Wrench className="w-5 h-5" />, 
      permission: "ver_flota" 
    },
    { 
      name: "Gestión Usuarios", 
      href: "/admin/users", 
      icon: <Users className="w-5 h-5" />, 
      permission: "gestionar_seguridad" 
    },
    { 
      name: "Pedidos", 
      href: "/admin/orders", 
      icon: <Package className="w-5 h-5" />, 
      permission: "ver_pedidos" 
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

  return (
    <AdminLayoutClient 
        menuItems={authorizedMenuItems}
        user={{
            firstName: user.firstName,
            roleName: usuarioSeguridad.nombreRol
        }}
    >
        {children}
    </AdminLayoutClient>
  );
}