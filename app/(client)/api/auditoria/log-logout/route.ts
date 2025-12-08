import { NextResponse } from "next/server";
import { logAuthAction } from "@/actions/logAuthAction"; 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (email) {
      await logAuthAction(email, "LOGOUT");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en puente de logout:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}