import { currentUser } from "@clerk/nextjs/server";
import { obtenerUsuarioSeguridad } from "@/lib/patterns/securityFactory";
import { backendClient } from "@/sanity/lib/backendClient";
import Link from "next/link";
import { redirect } from "next/navigation";
import { InteractiveSalesChart } from "@/components/admin/interactiveSalesChart";
import { getRevenueData } from "@/actions/getRevenueData"; 
import { ChartPieDonutText } from "@/components/admin/ChartPieDonutText";
import { getSalesByCategory } from "@/actions/getSalesByCategory";


// Definimos las Stats
async function getStats() {
  const productsCount = await backendClient.fetch(`count(*[_type == "product"])`);
  const ordersCount = await backendClient.fetch(`count(*[_type == "order"])`);
  const usersCount = await backendClient.fetch(`count(*[_type == "usuario"])`);
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

  // 2. OBTENER LOS DATOS (Usamos Promise.all para que sea más rápido)
const [stats, revenueData, salesByCategoryData] = await Promise.all([
    getStats(),
    getRevenueData(),
    getSalesByCategory() 
  ]);

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

      {/* ZONA DE REPORTES */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">Reportes y Estadísticas</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        
        {/* Gráfico de Ingresos (Stripe) - Ocupa 2 espacios */}
        <div className="lg:col-span-2">
          <InteractiveSalesChart data={revenueData} />
        </div>

        {/* Gráfico de Categorías Vendidas (Sanity) - Ocupa 1 espacio */}
        <div className="lg:col-span-1">
          <ChartPieDonutText data={salesByCategoryData} />
        </div>

      </div>

      {/* 3. ACCESOS RÁPIDOS... (El resto sigue igual) */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">Accesos Rápidos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* ... Tus botones de acceso rápido ... */}
        {usuarioSeguridad.puedo("ver_flota") && (
            <DashboardLink href="/admin/flota" title="Flota" desc="Vehículos y estados." icon="🚛" />
        )}
        {usuarioSeguridad.puedo("ver_choferes") && (
            <DashboardLink href="/admin/choferes" title="Choferes" desc="Conductores asignados." icon="👤" />
        )}
        {usuarioSeguridad.puedo("ver_envios") && (
             <DashboardLink href="/admin/envios" title="Envíos y Logística" desc="Logística y despachos." icon="🗺️" />
        )}
        {usuarioSeguridad.puedo("ver_mantenimiento") && (
             <DashboardLink href="/admin/mantenimiento" title="Mantenimiento" desc="Taller y reparaciones." icon="🔧" />
        )}
        {usuarioSeguridad.puedo("ver_pedidos") && (
            <DashboardLink href="/admin/orders" title="Pedidos" desc="Órdenes de compra." icon="📦" />
        )}
        {usuarioSeguridad.puedo("ver_reclamos") && (
            <DashboardLink href="/admin/reclamos" title="Reclamos" desc="Atención al cliente." icon="🚨" />
        )}
        {usuarioSeguridad.puedo("gestionar_productos") && (
            <DashboardLink href="/admin/products" title="Productos" desc="Gestión de catálogo." icon="🏷️" />
        )}
        {usuarioSeguridad.puedo("gestionar_seguridad") && (
            <DashboardLink href="/admin/users" title="Usuarios" desc="Roles y permisos." icon="🪪" />
        )}

      </div>
    </div>
  );
}

// ... (El resto de componentes StatCard y DashboardLink siguen igual)
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
      <div className="absolute -top-2 -right-2 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-8xl pointer-events-none select-none">
        {typeof icon === 'string' ? icon : ''} 
      </div>
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