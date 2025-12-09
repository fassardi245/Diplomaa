import { client } from "@/sanity/lib/client";
import { 
  Truck, 
  MapPin, 
  Package, 
  CalendarClock, 
  AlertCircle,
  User,
  Store
} from "lucide-react";
import StartShipmentButton from "@/components/admin/StartShipmentButton";
import CompleteShipmentButton from "@/components/admin/CompleteShipmentButton";
// IMPORTA EL NUEVO BOTÓN AQUI
import ConfirmPickupButton from "@/components/admin/ConfirmPickupButton"; 
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { obtenerUsuarioSeguridad } from "@/lib/patterns/securityFactory";
import PriceFormatter from "@/components/PriceFormatter"; 

interface Shipment {
  _id: string;
  status: string;
  departureDate: string;
  destinationAddress: {
    line1: string;
    city: string;
    state: string;
  } | null;
  driverName: string;
  orderNumber: string;
  customerName: string;
  vehicleModel: string;
  vehiclePlate: string;
  vehicleImage: string | null;
}

interface PendingOrder {
  _id: string;
  orderNumber: string;
  customerName: string;
  totalPrice: number;
  status: string;
  shippingMethodName?: string;
}

// --- FETCHING ---
async function getData() {
  const shipmentsQuery = `*[_type == "shipment"] | order(departureDate desc) {
    _id,
    status,
    departureDate,
    "destinationAddress": order->shippingAddress, 
    "orderNumber": order->orderNumber,
    "customerName": order->customerName,
    "vehicleModel": vehicle->model,
    "vehiclePlate": vehicle->plate,
    "vehicleImage": vehicle->image.asset->url,
    "driverName": driver->name
  }`;

  // Traemos todos los pagados
  const pendingQuery = `*[_type == "order" && status == "pagado"] {
    _id, orderNumber, customerName, totalPrice, status, shippingMethodName
  }`;

  const [shipments, pendingOrders] = await Promise.all([
    client.fetch<Shipment[]>(shipmentsQuery, {}, { cache: "no-store" }),
    client.fetch<PendingOrder[]>(pendingQuery, {}, { cache: "no-store" })
  ]);

  return { shipments, pendingOrders };
}

export default async function ShipmentsPage() {
  const user = await currentUser();
  if (!user) return redirect("/sign-in");

  const usuarioSeguridad = await obtenerUsuarioSeguridad(
    user.id,
    user.emailAddresses[0]?.emailAddress
  );

  // SEGURIDAD
  if (!usuarioSeguridad.puedo("ver_envios")) {
     return <div className="p-6 text-red-600 font-medium">⛔ Acceso Denegado</div>;
  }

  const { shipments, pendingOrders } = await getData();

  // --- MODIFICACIÓN IMPORTANTE: YA NO FILTRAMOS LOS RETIROS ---
  // Usamos pendingOrders directamente, pero podemos ordenarlos si quieres.
  const ordersToProcess = pendingOrders; 

  return (
    <div className="max-w-7xl mx-auto p-8">
      
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
           <span className="bg-sky-100 p-2 rounded-xl text-sky-600">
              <Truck className="w-8 h-8" />
           </span>
           Centro de Logística
        </h1>
        <p className="text-gray-500 mt-2">Gestiona los despachos y entregas en local.</p>
      </div>

      {/* PEDIDOS PENDIENTES (Envios + Retiros) */}
      {ordersToProcess.length > 0 && (
        <div className="mb-10 animate-in fade-in slide-in-from-top-4">
           <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-bold text-gray-800">Pendientes de Procesar ({ordersToProcess.length})</h2>
           </div>
           
           <div className="bg-white border border-orange-200 rounded-xl shadow-sm overflow-hidden divide-y divide-orange-100">
              {ordersToProcess.map((order) => {
                 // Lógica para detectar si es retiro
                 const method = order.shippingMethodName?.toLowerCase() || "";
                 const isPickup = method.includes("retiro") || method.includes("local");

                 return (
                    <div key={order._id} className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 ${isPickup ? 'bg-green-50/30' : 'bg-orange-50/30'}`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPickup ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                              {isPickup ? <Store className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                          </div>
                          <div>
                              <p className="font-bold text-gray-900">Pedido #{order.orderNumber?.slice(-6) || "???"}</p>
                              <p className="text-xs text-gray-500">{order.customerName} • <span className="font-medium">{order.shippingMethodName || "Envío Estándar"}</span></p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right mr-4 hidden md:block">
                              <PriceFormatter 
                                amount={order.totalPrice / 100} 
                                className="text-sm font-bold text-gray-900 block"
                              />
                              <p className="text-[10px] text-green-600 font-bold bg-green-100 px-2 rounded-full inline-block">PAGADO</p>
                          </div>
                          
                          {/* RENDERIZADO CONDICIONAL DE BOTONES */}
                          {isPickup ? (
                              <ConfirmPickupButton orderId={order._id} />
                          ) : (
                              <StartShipmentButton orderId={order._id} />
                          )}
                        </div>
                    </div>
                 );
              })}
           </div>
        </div>
      )}

      {/* SECCION ENVIOS ACTIVOS */}
      <h2 className="text-lg font-bold text-gray-800 mb-4">Envíos Activos e Historial</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shipments.map((ship) => (
          <div key={ship._id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col">
            
            {/* Estado Badge */}
            <div className="absolute top-4 right-4">
               <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  ship.status === 'in_transit' ? 'bg-blue-100 text-blue-700 animate-pulse' : 
                  ship.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
               }`}>
                  {ship.status === 'in_transit' ? 'En Tránsito' : ship.status === 'preparing' ? 'Preparando' : 'Finalizado'}
               </span>
            </div>

            {/* Info Pedido */}
            <div className="mb-6">
               <p className="text-xs text-gray-400 font-bold uppercase mb-1">Pedido</p>
               <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-indigo-500" />
                  #{ship.orderNumber?.slice(-6) || "N/A"}
               </h3>
               <p className="text-sm text-gray-500">{ship.customerName}</p>
            </div>

            {/* Ruta Visual */}
            <div className="flex items-start justify-between mb-6 relative w-full px-2"> 
               <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-100 -z-0">
                  <div className={`h-full bg-blue-500 transition-all duration-1000 ${ship.status === 'delivered' ? 'w-full' : 'w-1/2'}`}></div>
               </div>

               {/* SALIDA */}
               <div className="z-10 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center mb-2">
                     <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold tracking-wider">SALIDA</p>
               </div>

               {/* DESTINO */}
               <div className="z-10 flex flex-col items-end">
                  <div className="w-8 h-8 rounded-full bg-blue-600 border-4 border-white shadow-sm flex items-center justify-center mb-2">
                     <MapPin className="w-3.5 h-3.5 text-white" />
                  </div>
                  <p className="text-[10px] text-blue-600 font-bold tracking-wider mb-1">DESTINO</p>
                  
                  <div className="text-right">
                      {ship.destinationAddress ? (
                        <div className="flex flex-col items-end">
                           <span className="text-sm font-bold text-gray-900 leading-tight">
                              {ship.destinationAddress.line1}
                           </span>
                           <span className="text-xs text-gray-500 font-medium">
                              {ship.destinationAddress.city}
                           </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic bg-gray-50 px-2 py-1 rounded">
                           Retiro en local
                        </span>
                      )}
                  </div>
               </div>
            </div>

            {/* RECURSOS  */}
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 mb-auto">
               {/* Vehiculo */}
               <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center shadow-sm overflow-hidden relative shrink-0">
                     {ship.vehicleImage ? (
                        <img src={ship.vehicleImage} alt="Vehículo" className="w-full h-full object-contain p-1" />
                     ) : (
                        <span className="text-xl">🚛</span>
                     )}
                  </div>
                  <div className="overflow-hidden">
                     <p className="text-sm font-bold text-gray-900 truncate">{ship.vehicleModel || "Modelo desc."}</p>
                     <p className="text-xs text-gray-500 font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200 w-fit mt-0.5">
                        {ship.vehiclePlate || "S/P"}
                     </p>
                  </div>
               </div>
               {/* Linea divisoria */}
               <div className="h-px bg-gray-200 w-full mb-2"></div>
               {/* Chofer */}
               <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                     <User className="w-3 h-3 text-gray-500"/>
                  </div>
                  <p className="text-xs text-gray-500">
                     Chofer: <span className="font-bold text-gray-900">{ship.driverName || "No asignado"}</span>
                  </p>
               </div>
            </div>

            {/* PIE DE TARJETA */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
               <div className="flex items-center gap-1 text-xs text-gray-500">
                  <CalendarClock className="w-3.5 h-3.5" />
                  {ship.departureDate ? new Date(ship.departureDate).toLocaleDateString() : "Hoy"}
               </div>
               
               {ship.status === 'in_transit' ? (
                  <CompleteShipmentButton shipmentId={ship._id} />
               ) : (
                  <span className="text-xs font-medium text-gray-400 italic">
                     {ship.status === 'delivered' ? 'Completado' : 'Inactivo'}
                  </span>
               )}
            </div>

          </div>
        ))}

        {shipments.length === 0 && ordersToProcess.length === 0 && (
           <div className="col-span-full py-20 text-center text-gray-400">
              No hay actividad logística reciente.
           </div>
        )}
      </div>
    </div>
  );
}