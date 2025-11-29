import { client } from "@/sanity/lib/client";
import Container from "@/components/Container";
import Link from "next/link";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  CreditCard,
  User,
  Package,
  Truck,
  CheckCircle2
} from "lucide-react";
import ClaimForm from "@/components/ClaimForm";
import { notFound } from "next/navigation";
import PriceFormatter from "@/components/PriceFormatter"; 

async function getData(orderNumber: string) {
  const order = await client.fetch(
    `*[_type == "order" && orderNumber == $orderNumber][0]{
      _id, orderNumber, status, orderDate, totalPrice, currency, 
      customerName, email, shippingCost, estimatedDelivery,
      shippingAddress, 
      shippingMethodName, 
      assignedVehicle->{ model, plate, status }, 
      products[]{
        quantity,
        name,    
        price,   
        image,   
        product->{ name, price, "imageUrl": image.asset->url } 
      }
    }`,
    { orderNumber },
    { cache: "no-store" }
  );

  return order;
}

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>; 
}) {
  const { orderNumber } = await params;
  const order = await getData(orderNumber);

  if (!order) return notFound();

  // --- CONFIGURACIÓN DE ESTADOS ---
  const steps = [
    { id: "pendiente", label: "Procesando", icon: Clock },
    { id: "pagado", label: "Pago Confirmado", icon: CreditCard },
    { id: "en camino", label: "En Camino", icon: Truck }, 
    { id: "entregado", label: "Entregado", icon: CheckCircle2 },
  ];

  const statusMap: Record<string, string> = {
      "pendiente": "pendiente", "pagado": "pagado",
      "en camino": "en camino", "entregado": "entregado"
  };
  const currentStatusNormalized = statusMap[order.status?.toLowerCase()] || "pendiente";
  const currentStepIndex = steps.findIndex((s) => s.id === currentStatusNormalized);

  // --- LÓGICA: ¿Es Retiro o Envío? ---
  const isPickup = 
      order.shippingMethodName?.toLowerCase().includes("retiro") || 
      order.shippingMethodName?.toLowerCase().includes("local") ||
      order.shippingCost === 0;

  return (
    <Container className="py-10">
      <div className="mb-8">
        <Link href="/orders" className="text-sm text-gray-500 hover:text-black flex items-center gap-1 mb-4">
          <ArrowLeft className="w-4 h-4" /> Volver a mis pedidos
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Seguimiento de Pedido</h1>
        <p className="text-gray-500">Orden #{order.orderNumber}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: Timeline y Productos */}
        <div className="lg:col-span-2 space-y-6">
           
           {/* TIMELINE */}
           <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <div className="relative mt-8 mb-12">
                <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 rounded-full"></div>
                <div className="absolute top-5 left-0 h-1 bg-black rounded-full transition-all duration-1000" style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}></div>
                <div className="flex justify-between relative z-10">
                  {steps.map((step, index) => {
                    const isActive = index <= currentStepIndex;
                    const Icon = step.icon;
                    return (
                      <div key={step.id} className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${isActive ? "bg-black border-black text-white" : "bg-white border-gray-200 text-gray-300"}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <p className={`text-xs font-bold mt-3 ${isActive ? "text-black" : "text-gray-300"}`}>{step.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
           </div>

           {/* LISTA DE PRODUCTOS */}
           <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 font-bold text-gray-700 text-sm flex items-center gap-2">
              <Package className="w-4 h-4"/> Productos
            </div>
            <div className="divide-y divide-gray-100">
              {order.products?.map((item: any, idx: number) => (
                  <div key={idx} className="p-4 flex gap-4 hover:bg-gray-50 transition">
                    <div className="w-16 h-16 bg-gray-100 rounded-md relative overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center">
                      {(item.image || item.product?.imageUrl) ? (
                        <img src={item.image || item.product?.imageUrl} alt={item.name} className="w-full h-full object-cover"/>
                      ) : <span className="text-xs text-gray-400">Sin foto</span>}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{item.name || item.product?.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} x <PriceFormatter amount={item.price || item.product?.price} className="inline font-medium text-gray-700"/>
                      </p>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Dirección y Resumen */}
        <div className="space-y-6">
          
          {/* TARJETA 1: DETALLES DE ENTREGA */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Detalles de Entrega</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">{order.customerName}</p>
                  <p className="text-gray-500 break-all">{order.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="w-full">
                  <p className="font-medium text-gray-900">Dirección de Envío</p>
                  <div className="mt-1">
                      
                      {isPickup ? (
                        <div className="p-2 bg-blue-50 text-blue-700 rounded-md border border-blue-100 inline-block">
                           <p className="font-bold text-xs">📍 Retiro en el Local</p>
                        </div>
                      ) : (
                        <div className="text-gray-500">
                           {order.shippingAddress ? (
                            <div className="flex flex-col">
                              
                              {/* --- FORMATO SOLICITADO: Calle, Ciudad --- */}
                              <p className="font-medium text-gray-900">
                                {order.shippingAddress.line1}
                                {order.shippingAddress.line1 && order.shippingAddress.city ? ", " : ""}
                                {order.shippingAddress.city}
                              </p>
                              
                              {/* Detalles adicionales abajo (Provincia, CP) */}
                              <p className="text-sm text-gray-500">
                                {order.shippingAddress.state} {order.shippingAddress.postal_code ? `(${order.shippingAddress.postal_code})` : ''}
                                {order.shippingAddress.country ? `, ${order.shippingAddress.country}` : ''}
                              </p>
                            </div>
                          ) : (
                            <p className="text-gray-400 italic">No especificada</p>
                          )}
                        </div>
                      )}

                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TARJETA 2: RESUMEN DE PAGO */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Resumen de Pago</h3>
            
            <div className="space-y-2 mb-4">
               {/* Lista de productos */}
               {order.products?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm text-gray-600">
                       <span className="truncate pr-4">{item.name || "Producto"} <span className="text-xs text-gray-400">x{item.quantity}</span></span>
                       <PriceFormatter amount={(item.price || 0) * item.quantity} className="font-medium shrink-0"/>
                  </div>
               ))}

               {/* NOMBRE DEL ENVÍO + PRECIO */}
               <div className="flex justify-between text-sm text-gray-600">
                  <span>{order.shippingMethodName || "Envío"}</span>
                  
                  {order.shippingCost === 0 ? (
                      <span className="text-green-600 font-bold">Gratis</span>
                  ) : (
                      <PriceFormatter amount={order.shippingCost} className="font-medium"/>
                  )}
               </div>
            </div>
            
            <hr className="border-gray-100 my-4" />
            
            <div className="flex justify-between items-end">
              <span className="font-bold text-lg text-gray-900">Total</span>
              <div className="text-right">
                 <PriceFormatter amount={order.totalPrice} className="text-xl font-bold text-black block"/>
                 {/* Moneda eliminada como pediste */}
              </div>
            </div>
          </div>

        </div>
      </div>
    </Container>
  );
}