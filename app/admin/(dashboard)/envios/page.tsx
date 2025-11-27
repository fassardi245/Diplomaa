import { client } from "@/sanity/lib/client";
import { 
  Truck, 
  MapPin, 
  Package, 
  CalendarClock, 
  AlertCircle
} from "lucide-react";
import StartShipmentButton from "@/components/admin/StartShipmentButton";
import CompleteShipmentButton from "@/components/admin/CompleteShipmentButton"; // <--- IMPORTANTE

// --- INTERFACES ---
interface Shipment {
  _id: string;
  status: string;
  departureDate: string;
  destinationAddress: string;
  driverName: string;
  orderNumber: string;
  customerName: string;
  vehicleModel: string;
  vehiclePlate: string;
  vehicleImage: string;
}

interface PendingOrder {
  _id: string;
  orderNumber: string;
  customerName: string;
  totalPrice: number;
  status: string;
}

// --- FETCHING ---
async function getData() {
  // 1. Envíos (Historial y Activos)
  const shipmentsQuery = `*[_type == "shipment"] | order(departureDate desc) {
    _id,
    status,
    departureDate,
    destinationAddress,
    driverName,
    "orderNumber": order->orderNumber,
    "customerName": order->customerName,
    "vehicleModel": vehicle->model,
    "vehiclePlate": vehicle->plate,
    "vehicleImage": vehicle->image.asset->url
  }`;

  // 2. Pedidos Pendientes de Asignación (Pagados)
  const pendingQuery = `*[_type == "order" && status == "pagado"] {
    _id, orderNumber, customerName, totalPrice, status
  }`;

  const [shipments, pendingOrders] = await Promise.all([
    client.fetch<Shipment[]>(shipmentsQuery, {}, { cache: "no-store" }),
    client.fetch<PendingOrder[]>(pendingQuery, {}, { cache: "no-store" })
  ]);

  return { shipments, pendingOrders };
}

export default async function ShipmentsPage() {
  const { shipments, pendingOrders } = await getData();

  return (
    <div className="max-w-7xl mx-auto p-8">
      
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
           <span className="bg-sky-100 p-2 rounded-xl text-sky-600">
              <Truck className="w-8 h-8" />
           </span>
           Centro de Logística
        </h1>
        <p className="text-gray-500 mt-2">Gestiona los despachos y asignaciones automáticas.</p>
      </div>

      {/* --- SECCIÓN 1: PEDIDOS PENDIENTES (PARA INICIAR) --- */}
      {pendingOrders.length > 0 && (
        <div className="mb-10 animate-in fade-in slide-in-from-top-4">
           <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-bold text-gray-800">Pendientes de Asignación ({pendingOrders.length})</h2>
           </div>
           
           <div className="bg-white border border-orange-200 rounded-xl shadow-sm overflow-hidden divide-y divide-orange-100">
              {pendingOrders.map((order) => (
                 <div key={order._id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-orange-50/30">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                          <Package className="w-5 h-5" />
                       </div>
                       <div>
                          <p className="font-bold text-gray-900">Pedido #{order.orderNumber?.slice(-6) || "???"}</p>
                          <p className="text-xs text-gray-500">{order.customerName} • Pago Confirmado</p>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                       <div className="text-right mr-4 hidden md:block">
                          <p className="text-sm font-bold text-gray-900">${order.totalPrice}</p>
                          <p className="text-[10px] text-green-600 font-bold bg-green-100 px-2 rounded-full">PAGADO</p>
                       </div>
                       <StartShipmentButton orderId={order._id} />
                    </div>
                 </div>
              ))}
           </div>
        </div>
      )}

      {/* --- SECCIÓN 2: ENVÍOS (EN TRÁNSITO E HISTORIAL) --- */}
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
            <div className="flex items-center justify-between mb-6 relative">
               <div className="z-10 bg-white">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                     <MapPin className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-[10px] text-center mt-1 text-gray-400 font-bold">SALIDA</p>
               </div>
               
               <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-100 -z-0">
                  <div className={`h-full bg-blue-500 transition-all duration-1000 ${ship.status === 'delivered' ? 'w-full' : 'w-1/2'}`}></div>
               </div>

               <div className="z-10 bg-white text-right">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 ml-auto">
                     <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-[10px] text-center mt-1 text-blue-600 font-bold">DESTINO</p>
               </div>
            </div>

            {/* Info Vehículo */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center gap-4 mb-auto">
               <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-2xl shadow-sm overflow-hidden relative shrink-0">
                  {ship.vehicleImage ? (
                    // Si usas <Image>, asegúrate de importar Image de next/image y configurar el dominio
                    <img src={ship.vehicleImage} alt="Vehículo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl">🚛</span>
                  )}
               </div>
               <div>
                  <p className="text-sm font-bold text-gray-900">{ship.vehicleModel}</p>
                  <p className="text-xs text-gray-500 font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200 w-fit mt-0.5">
                     {ship.vehiclePlate}
                  </p>
               </div>
            </div>

            {/* PIE DE TARJETA (ACCIONES) */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
               <div className="flex items-center gap-1 text-xs text-gray-500">
                  <CalendarClock className="w-3.5 h-3.5" />
                  {ship.departureDate ? new Date(ship.departureDate).toLocaleDateString() : "Hoy"}
               </div>
               
               {/* BOTÓN DE FINALIZAR ENTREGA (Solo si está en tránsito) */}
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

        {shipments.length === 0 && pendingOrders.length === 0 && (
           <div className="col-span-full py-20 text-center text-gray-400">
              No hay actividad logística reciente.
           </div>
        )}
      </div>
    </div>
  );
}