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
  // Conteo de vehículos en mantenimiento
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
        <StatCard title="Productos" value={stats.productsCount} icon="🛍️" color="bg-purple-100 text-purple-700" />
      </div>

      {/* 2. ACCESOS RÁPIDOS (GRILLA COMPLETA) */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">Accesos Rápidos</h2>
      
      {/* Usamos grid-cols-4 para que entren todos ordenados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* --- GRUPO 1: LOGÍSTICA (Separados individualmente) --- */}
        
        {usuarioSeguridad.puedo("ver_flota") && (
            <DashboardLink 
                href="/admin/flota" 
                title="Flota" 
                desc="Vehículos y estados." 
                icon="🚛" 
            />
        )}

        {usuarioSeguridad.puedo("ver_choferes") && (
            <DashboardLink 
                href="/admin/choferes" 
                title="Choferes" 
                desc="Conductores asignados." 
                icon="👤" 
            />
        )}

        {usuarioSeguridad.puedo("ver_envios") && (
             <DashboardLink 
                href="/admin/envios" 
                title="Envíos y Logística" 
                desc="Logística y despachos." 
                icon="🗺️" 
            />
        )}

        {usuarioSeguridad.puedo("ver_mantenimiento") && (
             <DashboardLink 
                href="/admin/mantenimiento" 
                title="Mantenimiento" 
                desc="Taller y reparaciones." 
                icon="🔧" 
            />
        )}

        {/* --- GRUPO 2: COMERCIO --- */}
        
        {usuarioSeguridad.puedo("ver_pedidos") && (
            <DashboardLink 
                href="/admin/orders" 
                title="Pedidos" 
                desc="Órdenes de compra." 
                icon="📦" 
            />
        )}
        
        {usuarioSeguridad.puedo("ver_reclamos") && (
            <DashboardLink 
                href="/admin/reclamos" 
                title="Reclamos" 
                desc="Atención al cliente." 
                icon="🚨" 
            />
        )}

        {/* --- GRUPO 3: PRODUCTOS --- */}
        
        {usuarioSeguridad.puedo("gestionar_productos") && (
            <DashboardLink 
                href="/admin/products" 
                title="Productos" 
                desc="Gestión de catálogo." 
                icon="🏷️" 
            />
        )}

        {/* --- GRUPO 4: ADMINISTRACIÓN --- */}
        
        {usuarioSeguridad.puedo("gestionar_seguridad") && (
            <DashboardLink 
                href="/admin/users" 
                title="Usuarios" 
                desc="Roles y permisos." 
                icon="🪪" 
            />
        )}

      </div>
    </div>
  );
}

// --- Componentes Pequeños (UI) ---

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
      className="group bg-white p-6 rounded-xl border border-gray-200 hover:border-black transition-all duration-300 relative overflow-hidden hover:shadow-lg"
    >
      {/* Icono de fondo decorativo */}
      <div className="absolute -top-2 -right-2 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-8xl pointer-events-none select-none">
        {typeof icon === 'string' ? icon : ''} 
      </div>
      
      {/* Icono principal */}
      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4 text-2xl group-hover:scale-110 group-hover:bg-gray-100 transition-all">
        {icon}
      </div>
      
      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
        {title} {external && "↗"}
      </h3>
      <p className="text-sm text-gray-500 mt-2">{desc}</p>
    </Link>
  );
}