/* eslint-disable @typescript-eslint/no-explicit-any */

// app/api/payment-methods/route.ts

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db, auth } from "@/lib/firebase-admin";

export async function DELETE(request: Request) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token de autenticación requerido" }, { status: 401 });
    }
    const idToken = authHeader.split("Bearer ")[1];
    let decodedUid: string;
    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      decodedUid = decodedToken.uid;
    } catch {
      return NextResponse.json({ error: "Token de autenticación inválido" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const paymentMethodId = searchParams.get("paymentMethodId");
    const userId = searchParams.get("userId");

    if (!paymentMethodId || !userId) {
      return NextResponse.json({ error: "Payment Method ID and User ID are required" }, { status: 400 });
    }

    // Verificar que el usuario solo puede borrar sus propios métodos de pago
    if (decodedUid !== userId) {
      return NextResponse.json({ error: "Acceso no autorizado" }, { status: 403 });
    }

    const userDoc = await db.collection("user").doc(userId).get();
    const userData = userDoc.data();
    const customerId = userData?.stripeCustomerId;

    if (!customerId) {
      return NextResponse.json({ error: "Stripe customer ID not found" }, { status: 404 });
    }

    // Verificar que el payment method pertenece al customer del usuario
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    if (paymentMethod.customer !== customerId) {
      return NextResponse.json({ error: "El método de pago no pertenece a este usuario" }, { status: 403 });
    }

    await stripe.paymentMethods.detach(paymentMethodId);

    return NextResponse.json({ success: true, message: "Payment method detached successfully" });
  } catch (error) {
    console.error("Stripe API Error:", error);
    if ((error as any).code === "resource_missing") {
      return NextResponse.json({ error: "Payment method not found or already detached" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
