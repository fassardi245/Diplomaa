import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/adminHeader";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { obtenerUsuarioSeguridad } from "@/sanity/lib/securityFactory";
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Database, 
  Package 
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

  // Si no tiene permiso general, afuera.
  if (!usuarioSeguridad.puedo("acceso_panel_admin")) {
    return redirect("/"); 
  }

  const menuItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="w-5 h-5" />,
      permission: "acceso_admin_panel",
    },
    {
      name: "Flota de Vehículos",
      href: "/admin/flota",
      icon: <Truck className="w-5 h-5" />,
      permission: "ver_flota",
    },
    {
      name: "Gestión Usuarios",
      href: "/admin/users",
      icon: <Users className="w-5 h-5" />,
      permission: "gestionar_seguridad",
    },
    {
      name: "Pedidos",
      href: "/admin/orders",
      icon: <Package className="w-5 h-5" />,
      permission: "ver_pedidos",
    },
    {
      name: "Base de Datos",
      href: "/admin/studio",
      icon: <Database className="w-5 h-5" />,
      permission: "acceso_studio",
      external: true,
    },
  ];

  const authorizedMenuItems = menuItems.filter(item => 
    usuarioSeguridad.puedo(item.permission)
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* Sidebar (Componente Cliente) */}
      <AdminSidebar 
        menuItems={authorizedMenuItems} 
        user={{
            firstName: user.firstName,
            roleName: usuarioSeguridad.nombreRol
        }}
      />

      {/* Contenedor Principal */}
      <div className="flex-1 flex flex-col">
        {/* Header (Componente Cliente) */}
        <AdminHeader />
        
        {/* Área de contenido (con margen izquierdo en PC) */}
        <main className="flex-1 p-6 md:ml-64 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}