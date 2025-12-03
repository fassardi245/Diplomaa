import { client } from "@/sanity/lib/client";
import Container from "@/components/Container";
import Link from "next/link";
import Image from "next/image"; 
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  CreditCard,
  User,
  Package,
  Truck,
  CheckCircle2,
  Phone,
  CarFront,
  AlertTriangle,
  XCircle,
  CornerUpLeft,
  Store 
} from "lucide-react";
import ClaimForm from "@/components/ClaimForm";
import { notFound } from "next/navigation";
import PriceFormatter from "@/components/PriceFormatter"; 

async function getData(orderNumber: string) {
  const query = `*[_type == "order" && orderNumber == $orderNumber][0]{
      _id, orderNumber, status, orderDate, totalPrice, currency, 
      customerName, email, shippingCost, estimatedDelivery,
      shippingAddress, 
      shippingMethodName, 
      
      "driverDirect": coalesce(assignedDriver->, chofer->) { 
        "name": coalesce(name, nombre + " " + apellido), 
        "phone": coalesce(phone, telefono), 
        "avatar": coalesce(image.asset->url, foto.asset->url, photo.asset->url, profile.asset->url, avatar.asset->url) 
      },
      "vehicleDirect": coalesce(assignedVehicle->, vehiculo->) { 
        "model": coalesce(model, marca + " " + modelo), 
        "plate": coalesce(plate, patente), 
        "image": coalesce(image.asset->url, foto.asset->url) 
      },
      
      "envioSeparado": *[(_type == "envio" || _type == "shipment") && (orden._ref == ^._id || order._ref == ^._id || pedido._ref == ^._id || reference._ref == ^._id)][0] {
        "chofer": coalesce(chofer->, driver->) {
          "name": coalesce(name, nombre + " " + apellido),
          "phone": coalesce(phone, telefono),
          "avatar": coalesce(foto.asset->url, image.asset->url, photo.asset->url, profile.asset->url, avatar.asset->url)
        },
        "vehiculo": coalesce(vehiculo->, vehicle->) {
          "model": coalesce(model, marca + " " + modelo),
          "plate": coalesce(patente, plate),
          "image": coalesce(foto.asset->url, image.asset->url)
        }
      },

      "existingClaim": *[_type == "claim" && order._ref == ^._id][0] {
         _id, status, date, reason, adminResponse
      },
      
      products[]{
        quantity, name, price, image, 
        product->{ name, price, "imageUrl": image.asset->url } 
      }
    }`;

  return await client.fetch(query, { orderNumber }, { cache: "no-store" });
}

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>; 
}) {
  const { orderNumber } = await params;
  const order = await getData(orderNumber);

  if (!order) return notFound();

  // --- DETECCIÓN DE RETIRO ---
  const isPickup = 
      order.shippingMethodName?.toLowerCase().includes("retiro") || 
      order.shippingMethodName?.toLowerCase().includes("local") ||
      order.shippingCost === 0;

  const driver = order.envioSeparado?.chofer || order.driverDirect;
  const vehicle = order.envioSeparado?.vehiculo || order.vehicleDirect;

  // --- TIMELINE ---
  const steps = [
    { id: "pendiente", label: "Procesando", icon: Clock },
    { id: "pagado", label: "Pago Confirmado", icon: CreditCard },
    { id: "en camino", label: "En Camino", icon: Truck }, 
    { id: "entregado", label: "Entregado", icon: CheckCircle2 },
  ];

  // Si está devuelto, agregamos el paso final
  const isReturned = order.existingClaim?.status === 'approved';
  if (isReturned) {
    steps.push({ id: "devuelto", label: "Devuelto", icon: CornerUpLeft });
  }

  const statusRaw = order.status?.toLowerCase() || "";
  let currentStatusId = "pendiente";
  if (statusRaw.includes("pagado") || statusRaw.includes("paid")) currentStatusId = "pagado";
  if (statusRaw.includes("camino") || statusRaw.includes("shipped")) currentStatusId = "en camino";
  if (statusRaw.includes("entregado") || statusRaw.includes("delivered")) currentStatusId = "entregado";
  
  // Forzamos el último paso si está devuelto
  if (isReturned) currentStatusId = "devuelto";

  const currentStepIndex = steps.findIndex((s) => s.id === currentStatusId);
  const showDriverInfo = currentStatusId === "en camino" && !isReturned;

  // --- NUEVA LÓGICA PARA HABILITAR RECLAMO ---
  const canFileClaim = !order.existingClaim && (
    currentStatusId === "entregado" || 
    (isPickup && currentStatusId === "pagado")
  );

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
        <div className="lg:col-span-2 space-y-6">
           
           {/* --- SECCIÓN PRINCIPAL: CAMBIA SEGÚN SI ES RETIRO O ENVÍO --- */}
           {isPickup ? (
             <div className="bg-sky-50 border border-sky-200 rounded-2xl p-8 shadow-sm flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="w-16 h-16 bg-white border border-sky-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
                   <Store className="w-8 h-8 text-sky-600" />
                </div>
                <h2 className="text-xl font-bold text-sky-900">Retiro en Local</h2>
                <div className="mt-4 px-4 py-1 bg-white rounded-full text-xs font-bold text-sky-600 border border-sky-100 uppercase tracking-wide">
                   Estado: {order.status}
                </div>
             </div>
           ) : (
             <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <div className="relative mt-8 mb-12">
                <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 rounded-full"></div>
                <div 
                   className="absolute top-5 left-0 h-1 bg-black rounded-full transition-all duration-1000" 
                   style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                ></div>
                <div className="flex justify-between relative z-10">
                  {steps.map((step, index) => {
                    const isActive = index <= currentStepIndex;
                    const Icon = step.icon;
                    const isReturnedStep = step.id === 'devuelto';
                    const activeColor = isReturnedStep ? "bg-purple-600 border-purple-600 text-white" : "bg-black border-black text-white";

                    return (
                      <div key={step.id} className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${isActive ? activeColor : "bg-white border-gray-200 text-gray-300"}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <p className={`text-xs font-bold mt-3 ${isActive ? (isReturnedStep ? "text-purple-700" : "text-black") : "text-gray-300"}`}>{step.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
             </div>
           )}

           {/* INFO DEL CHOFER (Solo si NO es retiro y corresponde) */}
           {!isPickup && showDriverInfo && (driver || vehicle) ? (
             <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-3">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                    <Truck className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-blue-900">Tu pedido está en camino</h3>
                </div>
                <div className="flex flex-col md:flex-row gap-6">
                  {driver && (
                    <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-blue-100 flex-1">
                      <div className="w-12 h-12 bg-gray-100 rounded-full overflow-hidden relative border border-gray-200 shrink-0">
                          {driver.avatar ? (
                            <Image src={driver.avatar} alt="Chofer" fill className="object-cover" sizes="48px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-400"><User className="w-6 h-6"/></div>
                          )}
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Conductor</p>
                        <p className="font-bold text-gray-900 text-lg leading-tight">{driver.name}</p>
                        {driver.phone && (
                           <a href={`tel:${driver.phone}`} className="flex items-center gap-1 text-xs text-blue-600 mt-1 hover:underline font-medium"><Phone className="w-3 h-3" /> {driver.phone}</a>
                        )}
                      </div>
                    </div>
                  )}
                  {vehicle && (
                    <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-blue-100 flex-1">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 border border-gray-200 overflow-hidden relative shrink-0">
                          {vehicle.image ? (
                            <Image src={vehicle.image} alt="Vehiculo" fill className="object-cover" sizes="48px" />
                          ) : (<CarFront className="w-6 h-6" />)}
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Vehículo</p>
                        <p className="font-bold text-gray-900 text-lg leading-tight">{vehicle.model}</p>
                        {vehicle.plate && (
                          <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 border border-gray-200 mt-1 inline-block">{vehicle.plate}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
             </div>
           ) : null}

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
                        <Image src={item.image || item.product?.imageUrl} alt={item.name || "Producto"} fill className="object-cover" sizes="64px" />
                      ) : <span className="text-xs text-gray-400">Sin foto</span>}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{item.name || item.product?.name}</p>
                      <p className="text-sm text-gray-500">{item.quantity} x <PriceFormatter amount={item.price || item.product?.price} className="inline font-medium text-gray-700"/></p>
                    </div>
                  </div>
              ))}
            </div>
          </div>

          {/* ESTADO DEL RECLAMO (VISUALIZACIÓN) */}
          {order.existingClaim && (
            <div className="mt-6 animate-in fade-in slide-in-from-bottom-2">
               {order.existingClaim.status === 'rejected' && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                     <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                     <div className="w-full">
                        <h4 className="font-bold text-red-800">Solicitud de devolución rechazada</h4>
                        <p className="text-sm text-red-700 mt-1">Tu solicitud ha sido revisada y no pudimos aprobarla.</p>
                        {/* Muestra respuesta del admin si existe */}
                        {order.existingClaim.adminResponse && (
                          <div className="mt-3 text-sm bg-white/60 p-3 rounded border-l-4 border-red-400 italic text-red-900">
                             <span className="font-bold not-italic">Respuesta: </span>
                             "{order.existingClaim.adminResponse}"
                          </div>
                        )}
                     </div>
                  </div>
               )}
               {order.existingClaim.status === 'pending' && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
                     <AlertTriangle className="w-6 h-6 text-yellow-600 shrink-0 mt-0.5" />
                     <div>
                        <h4 className="font-bold text-yellow-800">Solicitud de devolución en revisión</h4>
                        <p className="text-sm text-yellow-700 mt-1">Ya hemos recibido tu solicitud.</p>
                     </div>
                  </div>
               )}
               {order.existingClaim.status === 'approved' && (
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl flex items-start gap-3">
                     <CornerUpLeft className="w-6 h-6 text-purple-600 shrink-0 mt-0.5" />
                     <div className="w-full">
                        <h4 className="font-bold text-purple-800">Devolución Aprobada</h4>
                        <p className="text-sm text-purple-700 mt-1">Tu solicitud ha sido aceptada.</p>
                        {/* Muestra respuesta del admin si existe */}
                        {order.existingClaim.adminResponse && (
                          <div className="mt-3 text-sm bg-white/60 p-3 rounded border-l-4 border-purple-400 italic text-purple-900">
                             <span className="font-bold not-italic">Respuesta: </span>
                             "{order.existingClaim.adminResponse}"
                          </div>
                        )}
                     </div>
                  </div>
               )}
            </div>
          )}

          {/* FORMULARIO DE RECLAMO */}
          {canFileClaim && (
            <div className="mt-6 animate-in fade-in slide-in-from-bottom-4">
               <ClaimForm orderId={order._id} orderNumber={order.orderNumber} />
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Detalles de Entrega</h3>
            <div className="space-y-4 text-sm">
               <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-gray-400 mt-0.5" />
                <div><p className="font-medium text-gray-900">{order.customerName}</p><p className="text-gray-500 break-all">{order.email}</p></div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="w-full">
                  <p className="font-medium text-gray-900">Dirección de Envío</p>
                  <div className="mt-1">
                      {isPickup ? (
                        <div className="p-2 bg-blue-50 text-blue-700 rounded-md border border-blue-100 inline-block"><p className="font-bold text-xs">📍 Retiro en el Local</p></div>
                      ) : (
                        <div className="text-gray-500">
                           {order.shippingAddress ? (
                            <div className="flex flex-col">
                              <p className="font-medium text-gray-900">{order.shippingAddress.line1}, {order.shippingAddress.city}</p>
                              <p className="text-sm text-gray-500">{order.shippingAddress.state} {order.shippingAddress.country}</p>
                            </div>
                          ) : <p className="text-gray-400 italic">No especificada</p>}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Resumen de Pago</h3>
            <div className="space-y-2 mb-4">
               {order.products?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm text-gray-600">
                        <span className="truncate pr-4">{item.name || "Producto"} <span className="text-xs text-gray-400">x{item.quantity}</span></span>
                        <PriceFormatter amount={(item.price || 0) * item.quantity} className="font-medium shrink-0"/>
                  </div>
               ))}
               <div className="flex justify-between text-sm text-gray-600">
                  <span>{order.shippingMethodName || "Envío"}</span>
                  {order.shippingCost === 0 ? <span className="text-green-600 font-bold">Gratis</span> : <PriceFormatter amount={order.shippingCost} className="font-medium"/>}
               </div>
            </div>
            <hr className="border-gray-100 my-4" />
            <div className="flex justify-between items-end">
              <span className="font-bold text-lg text-gray-900">Total</span>
              <div className="text-right"><PriceFormatter amount={order.totalPrice} className="text-xl font-bold text-black block"/></div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}