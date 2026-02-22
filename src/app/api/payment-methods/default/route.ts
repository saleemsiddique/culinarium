// app/api/payment-methods/default/route.ts

import { NextResponse } from 'next/server';
import { stripe } from "@/lib/stripe";
import { db, auth } from "@/lib/firebase-admin";

export async function PUT(request: Request) {
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
    const userId = searchParams.get('userId');
    const paymentMethodId = searchParams.get('paymentMethodId');

    if (!userId || !paymentMethodId) {
      return NextResponse.json({ error: 'User ID and Payment Method ID are required' }, { status: 400 });
    }

    // Verificar que el usuario solo puede modificar sus propios datos
    if (decodedUid !== userId) {
      return NextResponse.json({ error: "Acceso no autorizado" }, { status: 403 });
    }

    const userDoc = await db.collection("user").doc(userId).get();
    const userData = userDoc.data();
    const customerId = userData?.stripeCustomerId;

    if (!customerId) {
      return NextResponse.json({ error: 'Stripe customer ID not found for user' }, { status: 404 });
    }

    await stripe.paymentMethods.update(paymentMethodId, { allow_redisplay: 'always' });
    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    return NextResponse.json({ success: true, message: 'Default payment method updated successfully' });
  } catch (error) {
    console.error('Stripe API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
