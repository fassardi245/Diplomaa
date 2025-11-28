import { client } from "@/sanity/lib/client";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, 
  Package, 
  User, 
  CreditCard, 
  Calendar, 
  Mail, 
  ShieldCheck,
  Truck
} from "lucide-react";

// 1. Fetch de datos detallados
async function getOrder(id: string) {
  const query = `*[_type == "order" && _id == $id][0] {
    _id,
    orderNumber,
    customerName,
    email,
    clerkUserId,
    totalPrice,
    currency,
    amountDiscount,
    status,
    orderDate,
    stripePaymentIntentId,
    products[]{
      quantity,
      product->{
        name,
        price,
        currency,
        // ⚠️ CORRECCIÓN: Usamos 'images' (plural) y tomamos la primera [0]
        "imageUrl": images[0].asset->url
      }
    }
  }`;
  
  return await client.fetch(query, { id }, { cache: 'no-store' });
}

// 2. Componente de Página
export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = await getOrder(params.id);

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h1 className="text-2xl font-bold text-gray-800">Pedido no encontrado 😕</h1>
        <Link href="/admin/orders" className="text-indigo-600 hover:underline mt-4">Volver al listado</Link>
      </div>
    );
  }

  // Helpers
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: order.currency?.toUpperCase() || 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  // Colores de estado
  const statusColors: Record<string, string> = {
    pagado: "bg-green-100 text-green-700 border-green-200",
    pendiente: "bg-yellow-50 text-yellow-700 border-yellow-200",
    "en camino": "bg-blue-100 text-blue-700 border-blue-200",
    entregado: "bg-gray-100 text-gray-700 border-gray-200",
    cancelado: "bg-red-50 text-red-700 border-red-200",
  };

  const statusColor = statusColors[order.status?.toLowerCase()] || "bg-gray-100 text-gray-600";

  return (
    <div className="max-w-5xl mx-auto p-8 pb-20">
      
      {/* --- HEADER NAVEGACIÓN --- */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/admin/orders" 
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
           <div className="flex items-center gap-3">
             <h1 className="text-2xl font-bold text-gray-900">Pedido #{order.orderNumber}</h1>
             <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${statusColor}`}>
                {order.status}
             </span>
           </div>
           <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(order.orderDate)}
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- COLUMNA IZQUIERDA (Productos y Pago) --- */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. TABLA DE PRODUCTOS */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
               <h3 className="font-bold text-gray-800 flex items-center gap-2">
                 <Package className="w-4 h-4 text-indigo-500" />
                 Productos
               </h3>
               <span className="text-xs font-medium text-gray-500">{order.products?.length || 0} items</span>
            </div>
            
            <div className="divide-y divide-gray-100">
              {order.products?.map((item: any, index: number) => (
                <div key={index} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition">
                  {/* Imagen Producto */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 relative overflow-hidden shrink-0">
                    {item.product?.imageUrl ? (
                      <Image src={item.product.imageUrl} alt={item.product.name} fill className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-300">📷</div>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-sm">{item.product?.name || "Producto eliminado"}</p>
                    <p className="text-xs text-gray-500">Cantidad: <strong className="text-gray-800">{item.quantity}</strong></p>
                  </div>

                  {/* Precio */}
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(item.product?.price * item.quantity)}</p>
                    <p className="text-[10px] text-gray-400">
                      {formatCurrency(item.product?.price)} c/u
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* TOTALES */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 space-y-2">
               {order.amountDiscount > 0 && (
                 <div className="flex justify-between text-sm text-green-600">
                    <span>Descuento aplicado</span>
                    <span>- {formatCurrency(order.amountDiscount)}</span>
                 </div>
               )}
               <div className="flex justify-between text-lg font-extrabold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total Pagado</span>
                  <span>{formatCurrency(order.totalPrice)}</span>
               </div>
            </div>
          </div>

          {/* 2. DETALLE DE PAGO */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
             <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-500" />
                Información de Pago
             </h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                   <span className="block text-xs text-gray-400 uppercase font-bold mb-1">Pasarela</span>
                   <span className="font-medium text-gray-900 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-purple-500" /> Stripe
                   </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 overflow-hidden">
                   <span className="block text-xs text-gray-400 uppercase font-bold mb-1">ID Transacción</span>
                   <span className="font-mono text-gray-700 truncate block" title={order.stripePaymentIntentId}>
                      {order.stripePaymentIntentId || "N/A"}
                   </span>
                </div>
             </div>
          </div>

        </div>

        {/* --- COLUMNA DERECHA (Cliente y Logística) --- */}
        <div className="space-y-6">
          
          {/* 3. DATOS DEL CLIENTE */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
             <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-500" />
                Cliente
             </h3>
             
             <div className="flex flex-col items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 flex items-center justify-center text-xl font-bold text-gray-500 mb-3">
                   {order.customerName?.slice(0,2).toUpperCase()}
                </div>
                <h4 className="font-bold text-gray-900 text-lg text-center">{order.customerName}</h4>
                
                {/* ID CLERK (Click para copiar o ver) */}
                <div className="mt-1 bg-gray-100 px-2 py-1 rounded text-[10px] text-gray-500 font-mono">
                   ID: {order.clerkUserId}
                </div>
             </div>

             <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition">
                   <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <Mail className="w-4 h-4" />
                   </div>
                   <div className="overflow-hidden">
                      <p className="text-xs text-gray-400 font-bold uppercase">Email</p>
                      <p className="text-sm text-gray-900 truncate" title={order.email}>{order.email}</p>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}