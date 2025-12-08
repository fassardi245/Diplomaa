import { NextResponse } from "next/server";
import { logAuthAction } from "@/actions/logAuthAction"; // Importamos tu acción

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (email) {
      // Usamos tu función existente tal cual la definiste
      await logAuthAction(email, "LOGOUT");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en puente de logout:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}