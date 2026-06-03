import { client } from "@/sanity/lib/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import PriceFormatter from "@/components/PriceFormatter";
import { CreditCard, MapPin, Store } from "lucide-react";
import OrderActions from "@/components/admin/OrderActions";
import OrderSearch from "@/components/admin/OrderSearch";
import { Suspense } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { obtenerUsuarioSeguridad } from "@/lib/patterns/securityFactory";


interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  totalPrice: number;
  currency: string;
  status: string;
  orderDate: string;
  paymentMethod?: string;
  productsCount: number;
  stripePaymentIntentId?: string;
  shippingMethodName: string | null;
  shippingAddress: {
    line1: string;
    city: string;
  } | null;
  shippingCost: number;
}

// --- FETCH DATA ---
async function getData() {
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
    "productsCount": count(products),
    shippingMethodName,
    shippingAddress,
    shippingCost
  }`;
  
  const orders = await client.fetch<Order[]>(query, {}, { cache: "no-store" });
  return orders;
}


interface Props {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

export default async function OrdersPage({ searchParams }: Props) {
  const user = await currentUser();
  if (!user) return redirect("/sign-in");

  const usuarioSeguridad = await obtenerUsuarioSeguridad(
    user.id,
    user.emailAddresses[0]?.emailAddress
  );


  if (!usuarioSeguridad.puedo("ver_pedidos")) {
     return <div className="p-6 text-red-600 font-medium">⛔ Acceso Denegado</div>;
  }

  const orders = await getData();


  const resolvedSearchParams = await searchParams;
  const query = (resolvedSearchParams?.query as string) || "";
  
  const filteredOrders = query
    ? orders.filter((order) => {
        const searchTerm = query.toLowerCase();
        return (
          order.orderNumber?.toLowerCase().includes(searchTerm) ||
          order.customerName?.toLowerCase().includes(searchTerm) ||
          order.email?.toLowerCase().includes(searchTerm) ||
          order._id?.toLowerCase().includes(searchTerm)
        );
      })
    : orders;

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header MODIFICADO CON FLEXBOX */}
      <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Bloque Izquierdo: Título y Subtítulo */}
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shopping-bag"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900">Pedidos</h1>
            </div>
            <p className="text-gray-500">
                Historial de transacciones y envíos. Total: {filteredOrders.length} órdenes.
            </p>
        </div>

        {/* Bloque Derecho: Buscador */}
        <div className="w-full md:w-auto">
            <Suspense fallback={<div className="w-64 h-10 bg-gray-100 animate-pulse rounded-lg" />}>
                <OrderSearch />
            </Suspense>
        </div>

      </div>

      {/* Tabla */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="w-[300px]">Orden / Cliente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Envío / Destino</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Pago (Stripe)</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                const isPickup = 
                    order.shippingMethodName?.toLowerCase().includes("retiro") || 
                    order.shippingMethodName?.toLowerCase().includes("local") ||
                    order.shippingCost === 0;

                return (
                    <TableRow key={order._id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Columna Cliente */}
                    <TableCell>
                        <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs uppercase">
                            {order.customerName?.slice(0, 2) || "??"}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900">{order.customerName}</span>
                                <span className="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded border border-gray-200">
                                    #{order.orderNumber?.slice(-6)}
                                </span>
                            </div>
                            <p className="text-xs text-gray-400">{order.email}</p>
                        </div>
                        </div>
                    </TableCell>

                    {/* Columna Estado */}
                    <TableCell>
                        <Badge variant="secondary" className={`
                            capitalize font-bold border-0 px-3 py-1
                            ${order.status === 'pagado' ? 'bg-gray-100 text-green-700 hover:bg-gray-200' : ''}
                            ${order.status === 'entregado' ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}
                            ${order.status === 'pendiente' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : ''}
                            ${order.status === 'en camino' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : ''}
                            ${order.status === 'cancelado' || order.status === 'devuelto' ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100' : ''}
                        `}>
                            {order.status === 'en camino' ? 'En Camino' : 
                            order.status === 'entregado' ? 'Entregado' :
                            order.status === 'devuelto' ? 'Devuelto' :
                            order.status === 'cancelado' ? 'Cancelado' : 
                            order.status === 'pagado' ? 'Pagado' : order.status}
                        </Badge>
                    </TableCell>

                    {/* Columna Envío */}
                    <TableCell>
                        {isPickup ? (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 w-fit px-2 py-1 rounded-md">
                                <Store className="w-3.5 h-3.5" />
                                Retiro en Local
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5 text-gray-700 text-xs font-medium">
                                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="truncate max-w-[180px]">
                                    {order.shippingAddress 
                                        ? `${order.shippingAddress.line1}, ${order.shippingAddress.city}`
                                        : "Dirección no disponible"}
                                    </span>
                                </div>
                                <span className="text-[10px] text-gray-400 pl-5">Envío a domicilio</span>
                            </div>
                        )}
                    </TableCell>

                    {/* Columna Fecha */}
                    <TableCell className="text-gray-500 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                            {new Date(order.orderDate).toLocaleDateString()}
                        </div>
                    </TableCell>

                    {/* Columna Total */}
                    <TableCell>
                        <div className="font-bold text-gray-900">
                            {/* Dividimos por 100 */}
                            <PriceFormatter amount={order.totalPrice / 100} className="" />
                        </div>
                        <p className="text-[10px] text-gray-400">{order.productsCount} productos</p>
                    </TableCell>

                    {/* Columna Pago */}
                    <TableCell>
                        {order.stripePaymentIntentId ? (
                            <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-100 w-fit" title={order.stripePaymentIntentId}>
                                <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                                <span className="font-mono max-w-[100px] truncate">{order.stripePaymentIntentId}</span>
                            </div>
                        ) : (
                            <span className="text-xs text-gray-400 italic">Sin procesar</span>
                        )}
                    </TableCell>

                    {/* Columna Acciones */}
                    <TableCell className="text-right">
                        <OrderActions orderId={order._id} />
                    </TableCell>
                    </TableRow>
                );
                })
            ) : (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                        No se encontraron pedidos que coincidan con la búsqueda.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}