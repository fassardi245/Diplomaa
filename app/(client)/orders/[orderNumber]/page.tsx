import { client } from "@/sanity/lib/client";
import Container from "@/components/Container";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, 
  Truck, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  CreditCard,
  User,
  Package
} from "lucide-react";
import ClaimForm from "@/components/ClaimForm";
import { notFound } from "next/navigation";
import PriceFormatter from "@/components/PriceFormatter"; // Asegúrate de importar tu formateador

// Fetch complejo: Trae la orden y el vehículo asignado
async function getData(orderNumber: string) {
  // 1. Datos de la Orden (Agregué shippingCost y estimatedDelivery)
  const order = await client.fetch(
    `*[_type == "order" && orderNumber == $orderNumber][0]{
      _id, orderNumber, status, orderDate, totalPrice, currency, 
      customerName, email, shippingCost, estimatedDelivery,
      assignedVehicle->{ model, plate, status }, // Traemos el vehículo directo de la orden
      products[]{
        quantity,
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
  params: Promise<{ orderNumber: string }>; // Params es una promesa en Next.js nuevo
}) {
  const { orderNumber } = await params;
  const order = await getData(orderNumber);

  if (!order) return notFound();

  // --- LÓGICA DE LA LÍNEA DE TIEMPO ---
  const steps = [
    { id: "pendiente", label: "Procesando", icon: Clock },
    { id: "pagado", label: "Pago Confirmado", icon: CreditCard },
    { id: "en camino", label: "En Camino", icon: Truck }, // Este estado lo cambiamos manualmente o via webhook
    { id: "entregado", label: "Entregado", icon: CheckCircle2 },
  ];

  // Estados especiales
  const isCancelled = order.status === "cancelado";
  const isReturned = order.status === "devuelto";

  // Mapeo de estados de BD a IDs de pasos visuales
  const statusMap: Record<string, string> = {
      "pendiente": "pendiente",
      "pagado": "pagado",
      "en camino": "en camino",
      "in_transit": "en camino", // Por si quedó en inglés
      "entregado": "entregado"
  };

  // Determinar índice actual
  const currentStatusNormalized = statusMap[order.status?.toLowerCase()] || "pendiente";
  let currentStepIndex = steps.findIndex((s) => s.id === currentStatusNormalized);

  // Si tiene vehículo asignado y está pagado, asumimos que está en proceso logístico
  if (currentStepIndex === 1 && order.assignedVehicle) {
      // Visualmente podemos mostrarlo como que va camino a "En Camino"
  }

  // Calculamos subtotal real (Total - Envío)
  const shippingCost = order.shippingCost || 0;
  const subtotal = (order.totalPrice || 0) - shippingCost;

  return (
    <Container className="py-10">
      <div className="mb-8">
        <Link
          href="/orders"
          className="text-sm text-gray-500 hover:text-black flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a mis pedidos
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Seguimiento de Pedido</h1>
                <p className="text-gray-500">Orden #{order.orderNumber}</p>
            </div>
            {order.estimatedDelivery && (
                <div className="bg-gray-100 px-4 py-2 rounded-lg text-sm text-gray-600">
                    Entrega estimada: <span className="font-bold text-gray-900">{new Date(order.estimatedDelivery).toLocaleDateString()}</span>
                </div>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- COLUMNA IZQUIERDA: STATUS Y TRACKING --- */}
        <div className="lg:col-span-2 space-y-6">
          {/* TARJETA DE ESTADO */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            
            {/* CARTEL CANCELADO */}
            {isCancelled && (
              <div className="text-center p-6 bg-red-50 rounded-xl border border-red-100 mb-6">
                <h2 className="text-red-600 font-bold text-xl">Pedido Cancelado</h2>
                <p className="text-red-500 text-sm">Este pedido fue cancelado y no será enviado.</p>
              </div>
            )}

            {/* CARTEL DEVOLUCIÓN */}
            {isReturned && (
              <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-100 mb-6">
                <h2 className="text-purple-700 font-bold text-xl flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-6 h-6" /> Devolución Aprobada
                </h2>
                <p className="text-purple-600 text-sm mt-2">
                  Tu reclamo ha sido aceptado y el proceso de reembolso ha comenzado.
                </p>
              </div>
            )}

            {/* LÍNEA DE TIEMPO */}
            {!isCancelled && !isReturned && (
              <div className="relative mt-8 mb-12">
                {/* Barra Fondo */}
                <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 rounded-full -z-0"></div>
                {/* Barra Activa */}
                <div
                  className="absolute top-5 left-0 h-1 bg-black rounded-full -z-0 transition-all duration-1000"
                  style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                ></div>

                {/* Pasos */}
                <div className="flex justify-between relative z-10">
                  {steps.map((step, index) => {
                    const isActive = index <= currentStepIndex;
                    const Icon = step.icon;
                    return (
                      <div key={step.id} className="flex flex-col items-center group">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10 
                          ${isActive ? "bg-black border-black text-white" : "bg-white border-gray-200 text-gray-300"}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <p className={`text-xs font-bold mt-3 text-center transition-colors ${isActive ? "text-black" : "text-gray-300"}`}>
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* DETALLES DE LOGÍSTICA (VEHÍCULO ASIGNADO) */}
            {!isCancelled && !isReturned && order.assignedVehicle && (
              <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-5 flex flex-col sm:flex-row items-center gap-5 animate-in fade-in slide-in-from-bottom-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                  <Truck className="w-6 h-6" />
                </div>
                <div className="text-center sm:text-left flex-1">
                  <h3 className="font-bold text-gray-900">Logística Asignada</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Tu pedido será entregado por el vehículo 
                    <span className="font-mono font-bold mx-1">{order.assignedVehicle.model}</span>
                    patente <span className="bg-white px-1.5 py-0.5 rounded border border-blue-200 text-xs font-mono">{order.assignedVehicle.plate}</span>.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* DETALLE DE PRODUCTOS */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 font-bold text-gray-700 text-sm flex items-center gap-2">
              <Package className="w-4 h-4"/> Productos ({order.products?.length || 0})
            </div>
            <div className="divide-y divide-gray-100">
              {order.products?.map((item: any, idx: number) => (
                <div key={idx} className="p-4 flex gap-4 hover:bg-gray-50 transition">
                  <div className="w-16 h-16 bg-gray-100 rounded-md relative overflow-hidden shrink-0 border border-gray-200">
                    {item.product?.imageUrl && (
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{item.product?.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} x <PriceFormatter amount={item.product?.price} className="inline font-medium text-gray-700"/>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FORMULARIO DE RECLAMO (SOLO SI ENTREGADO) */}
          {order.status === "entregado" && (
            <ClaimForm orderId={order._id} orderNumber={order.orderNumber} />
          )}
        </div>

        {/* --- COLUMNA DERECHA: RESUMEN --- */}
        <div className="space-y-6">
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
                <div>
                  <p className="font-medium text-gray-900">Dirección de Envío</p>
                  {/* Como Stripe guarda la dirección en otro lado, si no la tenemos en Sanity usamos texto genérico */}
                  <p className="text-gray-500">Dirección provista en checkout</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Resumen de Pago</h3>
            
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-gray-500">Subtotal</span>
              <PriceFormatter amount={subtotal} className="font-medium"/>
            </div>
            
            <div className="flex justify-between mb-4 text-sm">
              <span className="text-gray-500">Envío</span>
              {shippingCost === 0 ? (
                  <span className="text-green-600 font-bold">Gratis</span>
              ) : (
                  <PriceFormatter amount={shippingCost} className="font-medium"/>
              )}
            </div>
            
            <div className="border-t border-gray-100 pt-4 flex justify-between items-end">
              <span className="font-bold text-lg">Total</span>
              <PriceFormatter amount={order.totalPrice} className="text-xl font-bold text-black"/>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}