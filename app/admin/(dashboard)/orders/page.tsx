import { currentUser } from "@clerk/nextjs/server";
import { obtenerUsuarioSeguridad } from "@/sanity/lib/securityFactory";
import { client } from "@/sanity/lib/client";
import OrderActions from "@/components/admin/OrderActions";
import OrderSearch from "@/components/admin/OrderSearch"; // <--- Importamos el componente nuevo
import { 
  ShoppingBag, 
  Calendar, 
  CreditCard, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  BadgeCheck 
} from "lucide-react";

// Interfaces (Igual que antes)
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
    product: { name: string; }
  }[];
}

// 2. Data Fetching con Filtro
async function getOrders(queryText: string) {
  // Si hay texto de búsqueda, filtramos. Si no, traemos todo.
  // El filtro busca coincidencia en el orderNumber (los últimos dígitos sirven)
  // Opcional: También busca por nombre de cliente
  
  const filter = queryText 
    ? `&& (orderNumber match "*${queryText}*" || customerName match "*${queryText}*")` 
    : "";

  const query = `*[_type == "order" ${filter}] | order(orderDate desc) {
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

export default async function OrdersPage({
  searchParams,
}: {
  searchParams?: {
    query?: string;
  };
}) {
  const queryText = searchParams?.query || "";

  // --- SEGURIDAD ---
  const user = await currentUser();
  if (!user) return <div>Inicia sesión.</div>;

  const usuarioSeguridad = await obtenerUsuarioSeguridad(user.id, user.emailAddresses[0].emailAddress);
  if (!usuarioSeguridad.puedo("ver_pedidos")) return <div className="p-6 text-red-600 font-medium">⛔ Acceso Denegado</div>;

  // --- DATOS ---
  const orders: Order[] = await getOrders(queryText);

  // --- HELPERS ---
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: currency.toUpperCase(),
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  const getTotalItems = (products: Order['products']) => {
    if (!products) return 0;
    return products.reduce((acc, item) => acc + (item.quantity || 0), 0);
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || "pendiente";
    switch (s) {
      case 'pagado': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200"><BadgeCheck className="w-3 h-3 mr-1"/>Pagado</span>;
      case 'pendiente': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200"><Clock className="w-3 h-3 mr-1"/>Pendiente</span>;
      case 'en camino': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-700 border border-sky-200"><Truck className="w-3 h-3 mr-1"/>En Camino</span>;
      case 'entregado': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200"><CheckCircle2 className="w-3 h-3 mr-1"/>Entregado</span>;
      case 'cancelado': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200"><XCircle className="w-3 h-3 mr-1"/>Cancelado</span>;
      default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-50 text-gray-500 border border-gray-200">{status}</span>;
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
            Historial de transacciones y envíos. {queryText ? `Resultados para "${queryText}"` : `Total: ${orders.length} órdenes.`}
          </p>
        </div>
        
        {/* Usamos el componente cliente aquí */}
        <OrderSearch />
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
                <tr key={order._id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
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
                  <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600 text-xs">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {order.orderDate ? formatDate(order.orderDate) : "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{formatCurrency(order.totalPrice, order.currency)}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{getTotalItems(order.products)} productos</div>
                  </td>
                  <td className="px-6 py-4">
                    {order.stripePaymentIntentId ? (
                        <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-100 w-fit" title={order.stripePaymentIntentId}>
                            <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="font-mono max-w-[100px] truncate">{order.stripePaymentIntentId}</span>
                        </div>
                    ) : (
                        <span className="text-xs text-gray-400 italic">Sin procesar</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
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
               <p className="text-gray-500 font-medium">
                 {queryText ? `No se encontraron pedidos con "${queryText}"` : "No hay pedidos registrados."}
               </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}