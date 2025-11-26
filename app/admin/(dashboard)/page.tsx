import { currentUser } from "@clerk/nextjs/server";
import { obtenerUsuarioSeguridad } from "@/sanity/lib/securityFactory";
import { backendClient } from "@/sanity/lib/backendClient";
import Link from "next/link";
import { redirect } from "next/navigation";

// Definimos las Stats
async function getStats() {
  const productsCount = await backendClient.fetch(`count(*[_type == "product"])`);
  const ordersCount = await backendClient.fetch(`count(*[_type == "order"])`);
  const usersCount = await backendClient.fetch(`count(*[_type == "usuario"])`);
  // Agregamos un conteo de vehículos en mantenimiento para mostrar alerta si hay alguno
  const maintenanceCount = await backendClient.fetch(`count(*[_type == "vehicle" && status == "maintenance"])`);
  
  return { productsCount, ordersCount, usersCount, maintenanceCount };
}

export default async function AdminDashboard() {
  const user = await currentUser();
  if (!user) return redirect("/sign-in");

  const usuarioSeguridad = await obtenerUsuarioSeguridad(
    user.id,
    user.emailAddresses[0]?.emailAddress
  );

  const stats = await getStats();

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel de Control</h1>
          <p className="text-gray-500">Bienvenido, {user.firstName}. Aquí tienes el resumen de tu tienda.</p>
        </div>
        <div className="text-sm text-black bg-white px-3 py-1 rounded-full border border-gray-200">
           Rol actual: <span className="font-semibold text-black">{usuarioSeguridad.nombreRol || "Usuario"}</span>
        </div>
      </div>

      {/* 1. TARJETAS DE ESTADÍSTICAS (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Ventas Totales" value={stats.ordersCount} icon="💰" color="bg-green-100 text-green-700" />
        <StatCard title="Usuarios" value={stats.usersCount} icon="👥" color="bg-blue-100 text-blue-700" />
        <StatCard title="Productos" value={stats.productsCount} icon="📦" color="bg-purple-100 text-purple-700" />
        
        {/* Si hay vehículos en taller, mostramos eso en vez de stock crítico, o ambos si prefieres */}
        <StatCard 
          title="En Taller" 
          value={stats.maintenanceCount} 
          icon="🔧" 
          color={stats.maintenanceCount > 0 ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-700"} 
        />
      </div>

      {/* 2. ACCESOS RÁPIDOS (Interactivos) */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">Gestión Rápida</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Gestión de Usuarios */}
        {usuarioSeguridad.puedo("gestionar_seguridad") && (
          <DashboardLink 
            href="/admin/users" 
            title="Gestión de Usuarios" 
            desc="Asignar roles y permisos a empleados."
            icon="🛡️"
          />
        )}

        {/* Gestión de Flota */}
        {usuarioSeguridad.puedo("ver_flota") && (
          <DashboardLink 
            href="/admin/flota" 
            title="Flota de Vehículos" 
            desc="Control logístico y estados."
            icon="🚛"
          />
        )}

        {/* --- NUEVO: MANTENIMIENTO --- */}
        {usuarioSeguridad.puedo("ver_flota") && (
          <DashboardLink 
            href="/admin/mantenimiento" 
            title="Taller y Servicios" 
            desc="Historial de reparaciones y service."
            icon="🔧"
          />
        )}

        {/* Productos */}
        {usuarioSeguridad.puedo("gestionar_productos") && (
        <DashboardLink 
          href="/admin/studio/structure/product" 
          title="Productos y Stock" 
          desc="Agregar productos o modificar precios."
          icon="🏷️"
          external={true}
        />
        )}
        
        {/* Categorías */}
         {usuarioSeguridad.puedo("gestionar_categorias") && (
          <DashboardLink 
          href="/admin/studio/structure/category" 
          title="Categorías" 
          desc="Organizar catálogo."
          icon="📂"
          external={true}
        />
        )}
      </div>
    </div>
  );
}

// Componentes pequeños
function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
    </div>
  );
}

function DashboardLink({ href, title, desc, icon, external }: any) {
  return (
    <Link 
      href={href} 
      target={external ? "_blank" : "_self"}
      className="group bg-white p-6 rounded-xl border border-gray-200 hover:border-black transition-colors duration-300 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-6xl">
        {typeof icon === 'string' ? icon : ''} 
      </div>
      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-4 text-xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
        {title} {external && "↗"}
      </h3>
      <p className="text-sm text-gray-500 mt-1">{desc}</p>
    </Link>
  );
}