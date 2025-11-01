import { backendClient } from "@/sanity/lib/backendClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Analiza el cuerpo de la solicitud
    const { orderId } = await req.json();

    // Validar el ID de la orden
    if (!orderId) {
      return NextResponse.json(
        { error: "Se requiere el ID de la orden" },
        { status: 400 }
      );
    }

    // Eliminar la orden de Sanity
    await backendClient.delete(orderId);

    return NextResponse.json({ message: "Orden eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar la orden:", error);
    return NextResponse.json(
      { error: "No se pudo eliminar la orden" },
      { status: 500 }
    );
  }
}
