import Container from "@/components/Container";
import OrdersComponent from "@/components/OrdersComponent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { getMyOrders } from "@/sanity/helpers"; <--- NO LO USAMOS PARA ASEGURAR EL PRECIO
import { client } from "@/sanity/lib/client"; 
import { auth } from "@clerk/nextjs/server";
import { FileX } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

const OrdersPage = async () => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/");
  }

  // 1. QUERY EXPLÍCITA (REEMPLAZA A getMyOrders)
  // Esto asegura que el campo 'price' venga dentro de products[]
  // para que el modal de detalles calcule bien los montos.
  const query = `*[_type == "order" && clerkUserId == $userId] | order(orderDate desc) {
      ...,
      products[]{
        ...,
        price, // <--- ESTO ES CRÍTICO PARA QUE NO SALGA $0.30
        product->{
          _id,
          name,
          price,
          images
        }
      }
  }`;

  const orders = await client.fetch(query, { userId });

  // 2. Lógica de Reclamos (Manteniendo tu lógica original)
  let ordersWithClaims = orders;

  if (orders && orders.length > 0) {
    const orderIds = orders.map((order: any) => order._id);
    
    const claims = await client.fetch(
      `*[_type == "claim" && order._ref in $orderIds]{ "orderId": order._ref, status }`,
      { orderIds },
      { cache: "no-store" }
    );

    ordersWithClaims = orders.map((order: any) => {
      const claim = claims.find((c: any) => c.orderId === order._id);
      return {
        ...order,
        claimStatus: claim?.status 
      };
    });
  }

  return (
    <div>
      <Container className="py-10">
        {ordersWithClaims?.length ? (
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl"> Lista de pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px] md:w-auto">
                        Numero de orden
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Fecha
                      </TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Email
                      </TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Numero de Factura
                      </TableHead>
                      <TableHead>Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  {/* Pasamos las órdenes enriquecidas */}
                  <OrdersComponent orders={ordersWithClaims} />
                </Table>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <FileX className="h-24 w-24 text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900">
              No hay pedidos encontrados
            </h2>
            <p className="mt-2 text-sm text-gray-600 text-center max-w-md">
              Parece que aún no has realizado ningún pedido. ¡Empieza a comprar para ver tus pedidos aquí!
            </p>
            <Button asChild className="mt-6">
              <Link href="/">Buscar productos</Link>
            </Button>
          </div>
        )}
      </Container>
    </div>
  );
};

export default OrdersPage;