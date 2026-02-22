/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db, auth } from "@/lib/firebase-admin";

export async function POST(request: Request) {
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

    const body = await request.json();

    // Verificar que el usuario solo puede crear sesiones para sí mismo
    if (body.userId && decodedUid !== body.userId) {
      return NextResponse.json({ error: "Acceso no autorizado" }, { status: 403 });
    }
    const userId = decodedUid;

    // =============================================
    // OBTENER O CREAR CUSTOMER EN STRIPE
    // =============================================
    let customerId;

    const userDoc = await db.collection("user").doc(userId).get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      customerId = userData?.stripeCustomerId;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: userData?.email,
          metadata: { userId },
        });
        customerId = customer.id;
        await userDoc.ref.update({ stripeCustomerId: customerId });
      }
    } else {
      return NextResponse.json({ message: "Usuario no encontrado en Firebase" }, { status: 404 });
    }

    // Determinar si es suscripción o compra única
    const subscriptionPriceIds = [
      "price_1RwHJCRpBiBhmezm4D1fPQt5",       // legacy Premium €7.99
      process.env.STRIPE_PRICE_PREMIUM,         // Premium €9.99/mes
      process.env.STRIPE_PRICE_PREMIUM_ANNUAL,  // Premium €79.99/año
    ].filter(Boolean);
    const isSubscription = subscriptionPriceIds.includes(body.priceId);

    const session = await stripe.checkout.sessions.create({
      ui_mode: "hosted",
      payment_method_types: isSubscription
        ? ["card", "amazon_pay", "revolut_pay"]
        : ["card", "amazon_pay", "revolut_pay", "paypal"],
      customer: customerId,
      line_items: [{ quantity: 1, price: body.priceId }],
      ...(isSubscription ? {} : { invoice_creation: { enabled: true } }),
      mode: isSubscription ? "subscription" : "payment",
      success_url: `${request.headers.get("origin")}/return?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get("origin")}/kitchen`,
      metadata: { userId },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
