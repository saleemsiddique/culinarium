// /app/api/create-stripe-customer/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { email, userId } = await req.json();

    if (!email || !userId) {
      return NextResponse.json(
        { error: "Email y userId son requeridos" },
        { status: 400 }
      );
    }

    const customer = await stripe.customers.create({
      email: email,
      metadata: {
        userId: userId,
      },
    });

    return NextResponse.json({
      customerId: customer.id,
      message: "Customer creado exitosamente",
    });
  } catch (error) {
    console.error("Error creando Stripe customer:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}