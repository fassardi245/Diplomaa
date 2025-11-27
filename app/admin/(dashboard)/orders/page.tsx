import { currentUser } from "@clerk/nextjs/server";
import { obtenerUsuarioSeguridad } from "@/sanity/lib/securityFactory";
import { client } from "@/sanity/lib/client";
import OrderActions from "@/components/admin/OrderActions";
import { 
  ShoppingBag, 
  Calendar, 
  CreditCard, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Package, 
  MoreHorizontal,
  Search,
  BadgeCheck // Importé este icono extra para "Pagado"
} from "lucide-react";

// 1. Interfaces
interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  totalPrice: number;
  currency: string;
  status: string; 
  orderDate: string;
  stripePaymentIntentId?: string;
  products: {
    quantity: number;
    product: {
        name: string;
    }
  }[];
}

// 2. Data Fetching
async function getOrders() {
  const query = `*[_type == "order"] | order(orderDate desc) {
    _id,
    orderNumber,
    customerName,
    email,
    totalPrice,
    currency,
    status,
    orderDate,
    stripePaymentIntentId,
    products[]{
      quantity,
      product->{ name }
    }
  }`;
  
  return await client.fetch(query, {}, { cache: 'no-store' });
}

export default async function OrdersPage() {
  // --- SEGURIDAD ---
  const user = await currentUser();
  if (!user) return <div>Inicia sesión.</div>;

  const usuarioSeguridad = await obtenerUsuarioSeguridad(user.id, user.emailAddresses[0].emailAddress);
  if (!usuarioSeguridad.puedo("ver_pedidos")) return <div className="p-6 text-red-600 font-medium">⛔ Acceso Denegado</div>;

  // --- DATOS ---
  const orders: Order[] = await getOrders();

  // --- HELPERS VISUALES ---
  
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  const getTotalItems = (products: Order['products']) => {
    if (!products) return 0;
    return products.reduce((acc, item) => acc + (item.quantity || 0), 0);
  };

  // --- BADGES DE ESTADO (COLORES PERSONALIZADOS) ---
  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || "pendiente";
    switch (s) {
      case 'pagado': 
        // GRIS: Confirmado pero aún no procesado logísticamente
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200"><BadgeCheck className="w-3 h-3 mr-1"/>Pagado</span>;
      
      case 'pendiente':
        // GRIS: Estado inicial neutro
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200"><Clock className="w-3 h-3 mr-1"/>Pendiente</span>;

      case 'en camino': 
        // CELESTE (Sky): Acción de transporte
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-700 border border-sky-200"><Truck className="w-3 h-3 mr-1"/>En Camino</span>;
      
      case 'entregado': 
        // VERDE: Éxito final
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200"><CheckCircle2 className="w-3 h-3 mr-1"/>Entregado</span>;
      
      case 'cancelado': 
        // ROJO: Error o cancelación
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200"><XCircle className="w-3 h-3 mr-1"/>Cancelado</span>;
      
      default: 
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-50 text-gray-500 border border-gray-200">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
             <span className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
                <ShoppingBag className="w-8 h-8" />
             </span>
             Pedidos
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Historial de transacciones y envíos. Total: <strong>{orders.length}</strong> órdenes.
          </p>
        </div>
        
        {/* Buscador visual */}
        <div className="relative hidden md:block">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
                type="text" 
                placeholder="Buscar por N° Orden..." 
                disabled
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 w-64 shadow-sm cursor-not-allowed opacity-70" 
            />
        </div>
      </div>

      {/* TABLA DE PEDIDOS */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/50 border-b border-gray-200 text-gray-500 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Orden / Cliente</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Pago (Stripe)</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50/50 transition-colors group">
                  
                  {/* 1. ORDEN Y CLIENTE */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        {/* Avatar con iniciales */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs shrink-0">
                            {order.customerName ? order.customerName.slice(0,2).toUpperCase() : "??"}
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 flex items-center gap-2">
                                {order.customerName || "Cliente Desconocido"}
                                <span className="font-mono font-normal text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                    #{order.orderNumber ? order.orderNumber.slice(-6) : "ERR"}
                                </span>
                            </div>
                            <div className="text-xs text-gray-500">{order.email}</div>
                        </div>
                    </div>
                  </td>

                  {/* 2. ESTADO (COLORES NUEVOS) */}
                  <td className="px-6 py-4">
                    {getStatusBadge(order.status)}
                  </td>

                  {/* 3. FECHA */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600 text-xs">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {order.orderDate ? formatDate(order.orderDate) : "-"}
                    </div>
                  </td>

                  {/* 4. TOTAL Y PRODUCTOS */}
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">
                        {formatCurrency(order.totalPrice, order.currency)}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">
                        {getTotalItems(order.products)} productos
                    </div>
                  </td>

                  {/* 5. STRIPE INFO */}
                  <td className="px-6 py-4">
                    {order.stripePaymentIntentId ? (
                        <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-100 w-fit" title={order.stripePaymentIntentId}>
                            <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="font-mono max-w-[100px] truncate">
                                {order.stripePaymentIntentId}
                            </span>
                        </div>
                    ) : (
                        <span className="text-xs text-gray-400 italic">Sin procesar</span>
                    )}
                  </td>

                 {/* 6. ACCIONES (Ahora usando el componente interactivo) */}
                <td className="px-6 py-4 text-right">
                {/* Le pasamos el ID para que sepa qué borrar o ver */}
                <OrderActions orderId={order._id} />
                </td>

                </tr>
              ))}
            </tbody>
          </table>

          {orders.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center justify-center">
               <div className="bg-gray-50 p-4 rounded-full mb-3">
                  <ShoppingBag className="w-8 h-8 text-gray-300" />
               </div>
               <p className="text-gray-500 font-medium">No hay pedidos registrados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}