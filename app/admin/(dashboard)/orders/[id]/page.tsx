import { client } from "@/sanity/lib/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  CreditCard, 
  Calendar, 
  Package,
  MapPin, 
  Store,  
  Navigation,
  ShieldCheck
} from "lucide-react";
import PriceFormatter from "@/components/PriceFormatter";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { currentUser } from "@clerk/nextjs/server";
import { obtenerUsuarioSeguridad } from "@/lib/patterns/securityFactory";
import { redirect } from "next/navigation";


// --- INTERFACE ---
interface OrderDetail {
  _id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  totalPrice: number;
  currency: string;
  status: string;
  orderDate: string;
  amountDiscount: number;
  shippingCost: number;
  shippingMethodName: string | null;
  shippingAddress: {
    line1: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  } | null;
  clerkUserId: string;
  products: {
    name: string;
    quantity: number;
    price: number;
    image: string | null; 
    product?: {
        name: string;
        imageRef: string | null; 
    };
  }[];
  stripePaymentIntentId: string;
}

// --- FETCH DATA ---
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
    shippingCost,
    shippingMethodName,
    shippingAddress,
    products[]{
      name,
      quantity,
      price,
      image, 
      product->{
         name, 
         "imageRef": images[0].asset->url 
      }
    }
  }`;
  
  const order = await client.fetch<OrderDetail>(query, { id }, { cache: 'no-store' });
  return order;
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const user = await currentUser();
    if (!user) return redirect("/sign-in");
  
    const usuarioSeguridad = await obtenerUsuarioSeguridad(
      user.id,
      user.emailAddresses[0]?.emailAddress
    );
  
    // 🔒 SEGURIDAD (Estilo Flota)
    if (!usuarioSeguridad.puedo("ver_pedidos")) {
       return <div className="p-6 text-red-600 font-medium">⛔ Acceso Denegado</div>;
    }
  
  const { id } = await params;
  const order = await getOrder(id);

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

  // Lógica Retiro
  const isPickup = 
      order.shippingMethodName?.toLowerCase().includes("retiro") || 
      order.shippingMethodName?.toLowerCase().includes("local") ||
      order.shippingCost === 0;

  // Colores de estado
  const statusColors: Record<string, string> = {
    pagado: "bg-green-100 text-green-700 border-green-200",
    pendiente: "bg-yellow-50 text-yellow-700 border-yellow-200",
    "en camino": "bg-blue-100 text-blue-700 border-blue-200",
    entregado: "bg-gray-100 text-gray-700 border-gray-200",
    cancelado: "bg-red-50 text-red-700 border-red-200",
  };

  const statusColor = statusColors[order.status?.toLowerCase()] || "bg-gray-100 text-gray-600";

  // Cálculo del Subtotal Matemático (Total - Envío + Descuento)
  const subtotal = order.totalPrice - (order.shippingCost || 0) + (order.amountDiscount || 0);

  return (
    <div className="max-w-5xl mx-auto p-8 pb-20">
      
      {/* --- HEADER --- */}
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
        
        {/* --- COLUMNA IZQUIERDA --- */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. TABLA DE PRODUCTOS Y TOTALES */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
               <h3 className="font-bold text-gray-800 flex items-center gap-2">
                 <Package className="w-4 h-4 text-indigo-500" />
                 Productos
               </h3>
               <span className="text-xs font-medium text-gray-500">{order.products?.length || 0} items</span>
            </div>
            
            <div className="divide-y divide-gray-100">
              {order.products?.map((item, index) => {
                const productConfirmImage = item.image || item.product?.imageRef;
                const productName = item.name || item.product?.name || "Producto eliminado";

                return (
                  <div key={index} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 relative overflow-hidden shrink-0 flex items-center justify-center">
                      {productConfirmImage ? (
                        <img src={productConfirmImage} alt={productName} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-6 h-6 text-gray-300" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-sm">{productName}</p>
                      <p className="text-xs text-gray-500">Cantidad: <strong className="text-gray-800">{item.quantity}</strong></p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                      <p className="text-[10px] text-gray-400">
                        {formatCurrency(item.price)} c/u
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* --- SECCIÓN DE TOTALES ACTUALIZADA --- */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 space-y-2">
               
               {/* Subtotal */}
               <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
               </div>

               {/* Descuento (Si existe) */}
               {order.amountDiscount > 0 && (
                 <div className="flex justify-between text-sm text-green-600">
                   <span>Descuento aplicado</span>
                   <span>- {formatCurrency(order.amountDiscount)}</span>
                 </div>
               )}

               {/* Envío (Nombre + Costo) */}
               <div className="flex justify-between text-sm text-gray-600">
                  <span>{order.shippingMethodName || "Envío"}</span>
                  {order.shippingCost === 0 ? (
                      <span className="text-green-600 font-bold">Gratis</span>
                  ) : (
                      <span className="font-medium">{formatCurrency(order.shippingCost)}</span>
                  )}
               </div>

               {/* Línea divisoria */}
               <div className="border-t border-gray-200 my-2"></div>

               {/* Total Final */}
               <div className="flex justify-between text-lg font-extrabold text-gray-900">
                  <span>Total Pagado</span>
                  <span>{formatCurrency(order.totalPrice)}</span>
               </div>
            </div>
          </div>

          {/* 2. INFO PAGO */}
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

        {/* --- COLUMNA DERECHA --- */}
        <div className="space-y-6">
          
          {/* 3. CLIENTE Y ENVÍO */}
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

             {/* DATOS DE ENTREGA */}
             <div className="mt-8 pt-6 border-t border-gray-100">
                 <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-indigo-500" /> Datos de Entrega
                 </h4>

                 {isPickup ? (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-3">
                       <Store className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                       <div>
                          <p className="text-sm font-bold text-blue-800">Retiro en Local</p>
                          <p className="text-xs text-blue-600 mt-0.5">El cliente buscará el pedido.</p>
                       </div>
                    </div>
                 ) : (
                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 flex items-start gap-3">
                       <MapPin className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />
                       <div>
                          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Dirección de Envío</p>
                          {order.shippingAddress ? (
                             <>
                                <p className="text-sm font-bold text-gray-900 leading-tight">
                                   {order.shippingAddress.line1}
                                </p>
                                <p className="text-xs text-gray-600 mt-0.5">
                                   {order.shippingAddress.city}, {order.shippingAddress.postal_code}
                                </p>
                                <p className="text-xs text-gray-500">
                                   {order.shippingAddress.state}, {order.shippingAddress.country}
                                </p>
                             </>
                          ) : (
                             <p className="text-sm text-red-400 italic">Dirección no disponible</p>
                          )}
                       </div>
                    </div>
                 )}
              </div>

          </div>

        </div>
      </div>
    </div>
  );
}