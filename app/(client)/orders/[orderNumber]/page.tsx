import { client } from "@/sanity/lib/client";
import Container from "@/components/Container";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  CreditCard,
  User
} from "lucide-react";
import ClaimForm from "@/components/ClaimForm";
import { notFound } from "next/navigation";

// Fetch complejo: Trae la orden y busca si tiene un envío (shipment) asociado
async function getData(orderNumber: string) {
  // 1. Datos de la Orden
  const order = await client.fetch(
    `*[_type == "order" && orderNumber == $orderNumber][0]{
      _id, orderNumber, status, orderDate, totalPrice, currency, 
      customerName, email,
      products[]{
        quantity,
        product->{ name, price, "imageUrl": image.asset->url }
      }
    }`,
    { orderNumber },
    { cache: "no-store" }
  );

  if (!order) return null;

  // 2. Datos del Envío (Logística)
  const shipment = await client.fetch(
    `*[_type == "shipment" && order._ref == $id][0]{
      status, driverName, vehicle->{ model, plate }, departureDate, deliveryDate
    }`,
    { id: order._id },
    { cache: "no-store" }
  );

  return { order, shipment };
}

export default async function OrderTrackingPage({
  params,
}: {
  params: { orderNumber: string };
}) {
  const { orderNumber } = params;
  const data = await getData(orderNumber);

  if (!data) return notFound();

  const { order, shipment } = data;

  // --- LÓGICA DE LA LÍNEA DE TIEMPO ---
  const steps = [
    { id: "pendiente", label: "Procesando", icon: Clock },
    { id: "pagado", label: "Pago Confirmado", icon: CreditCard },
    { id: "en camino", label: "En Camino", icon: Truck },
    { id: "entregado", label: "Entregado", icon: CheckCircle2 },
  ];

  // Estados especiales
  const isCancelled = order.status === "cancelado";
  const isReturned = order.status === "devuelto";

  // Determinar índice actual para pintar la barra
  let currentStepIndex = steps.findIndex(
    (s) => s.id === order.status?.toLowerCase()
  );

  // Si no encuentra el estado exacto (ej: "En preparación"), asumimos lógica
  if (currentStepIndex === -1 && order.status === "pagado") currentStepIndex = 1;
  if (currentStepIndex === -1 && shipment?.status === "in_transit")
    currentStepIndex = 2;

  return (
    <Container className="py-10">
      <div className="mb-8">
        <Link
          href="/orders"
          className="text-sm text-gray-500 hover:text-black flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a mis pedidos
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          Seguimiento de Pedido
        </h1>
        <p className="text-gray-500">Orden #{order.orderNumber}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- COLUMNA IZQUIERDA: STATUS Y TRACKING --- */}
        <div className="lg:col-span-2 space-y-6">
          {/* TARJETA DE ESTADO */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            {/* CARTEL CANCELADO */}
            {isCancelled && (
              <div className="text-center p-6 bg-red-50 rounded-xl border border-red-100 mb-6">
                <h2 className="text-red-600 font-bold text-xl">
                  Pedido Cancelado
                </h2>
                <p className="text-red-500 text-sm">
                  Este pedido fue cancelado y no será enviado.
                </p>
              </div>
            )}

            {/* NUEVO CARTEL PARA DEVOLUCIÓN */}
            {isReturned && (
              <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-100 mb-6">
                <h2 className="text-purple-700 font-bold text-xl flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-6 h-6" /> Devolución Aprobada
                </h2>
                <p className="text-purple-600 text-sm mt-2">
                  Tu reclamo ha sido aceptado y el proceso de reembolso ha
                  comenzado.
                </p>
              </div>
            )}

            {/* LÍNEA DE TIEMPO SOLO SI NO ESTÁ CANCELADO NI DEVUELTO */}
            {!isCancelled && !isReturned && (
              <div className="relative">
                {/* Barra de progreso (Línea gris fondo) */}
                <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 rounded-full -z-0"></div>

                {/* Barra de progreso (Línea negra activa) */}
                <div
                  className="absolute top-5 left-0 h-1 bg-black rounded-full -z-0 transition-all duration-1000"
                  style={{
                    width: `${
                      (currentStepIndex / (steps.length - 1)) * 100
                    }%`,
                  }}
                ></div>

                {/* Pasos */}
                <div className="flex justify-between relative z-10">
                  {steps.map((step, index) => {
                    const isActive = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const Icon = step.icon;

                    return (
                      <div key={step.id} className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                            isActive
                              ? "bg-black border-black text-white"
                              : "bg-white border-gray-200 text-gray-300"
                          } ${isCurrent ? "ring-4 ring-gray-100" : ""}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <p
                          className={`text-xs font-bold mt-3 ${
                            isActive ? "text-black" : "text-gray-300"
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* DETALLES DE LOGÍSTICA (RF2 CONECTADO) */}
            {!isCancelled && !isReturned && shipment && (
              <div className="mt-10 bg-blue-50 border border-blue-100 rounded-xl p-5 flex flex-col sm:flex-row items-center gap-5 animate-in fade-in">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                  <Truck className="w-6 h-6" />
                </div>
                <div className="text-center sm:text-left flex-1">
                  <h3 className="font-bold text-gray-900">
                    Tu pedido está en camino
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Transportado por{" "}
                    <span className="font-semibold">
                      {shipment.driverName || "Logística SmartCloth"}
                    </span>{" "}
                    en el vehículo{" "}
                    <span className="font-mono bg-white px-1 rounded border border-blue-200 text-xs">
                      {shipment.vehicle?.model} ({shipment.vehicle?.plate})
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* DETALLE DE PRODUCTOS */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 font-bold text-gray-700 text-sm">
              Productos ({order.products?.length})
            </div>
            <div className="divide-y divide-gray-100">
              {order.products?.map((item: any, idx: number) => (
                <div key={idx} className="p-4 flex gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-md relative overflow-hidden shrink-0">
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
                    <p className="font-bold text-gray-900">
                      {item.product?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Cant: {item.quantity} x ${item.product?.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FORMULARIO DE RECLAMO (SOLO SI FUE ENTREGADO) - RF4 */}
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
                  <p className="font-medium text-gray-900">
                    {order.customerName}
                  </p>
                  <p className="text-gray-500">{order.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">
                    Dirección de Envío
                  </p>
                  {/* Si tienes dirección en el pedido, úsala. Si no, texto simulado */}
                  <p className="text-gray-500">
                    Calle Falsa 123, Rosario, Argentina
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Resumen de Pago</h3>
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium">${order.totalPrice}</span>
            </div>
            <div className="flex justify-between mb-4 text-sm text-green-600">
              <span>Envío</span>
              <span className="font-medium">Gratis</span>
            </div>
            <div className="border-t border-gray-100 pt-4 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${order.totalPrice}</span>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
