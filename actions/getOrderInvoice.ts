"use server";

import { backendClient } from "@/sanity/lib/backendClient";

export async function getOrderInvoiceUrl(orderId: string) {
  try {
    // Buscamos la URL dentro del objeto 'invoice'
    const query = `*[_type == "order" && _id == $orderId][0].invoice.hosted_invoice_url`;
    const url = await backendClient.fetch(query, { orderId });
    
    return url;
  } catch (error) {
    console.error("Error al obtener factura:", error);
    return null;
  }
}