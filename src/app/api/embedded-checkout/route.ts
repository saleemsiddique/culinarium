/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Recibido:", body);

    // =============================================
    // OBTENER O CREAR CUSTOMER EN STRIPE
    // =============================================
    let customerId;

    // 1. Buscar si ya existe un customerId en Firebase
    const userDoc = await db.collection("user").doc(body.userId).get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      customerId = userData?.stripeCustomerId;

      // 2. Si no existe customerId, crear customer en Stripe
      if (!customerId) {
        console.log("🆕 Creando nuevo customer en Stripe para userId:", body.userId);
        
        const customer = await stripe.customers.create({
          metadata: {
            userId: body.userId,
          },
        });

        customerId = customer.id;

        // 3. Guardar el customerId en Firebase
        await userDoc.ref.update({
          stripeCustomerId: customerId,
        });

        console.log("✅ Customer creado y guardado:", customerId);
      } else {
        console.log("✅ Customer existente encontrado:", customerId);
      }
    } else {
      return NextResponse.json(
        { message: "Usuario no encontrado en Firebase" }, 
        { status: 404 }
      );
    }

    // Determinar si es suscripción o compra única
    const isSubscription = body.priceId === "price_1RwHJCRpBiBhmezm4D1fPQt5";

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      payment_method_types: ["card"],
      customer: customerId, // ¡ESTA ES LA LÍNEA CLAVE!
      line_items: [
        {
          quantity: 1,
          price: body.priceId,
        },
      ],
      mode: isSubscription ? "subscription" : "payment",
      return_url: `${request.headers.get(
        "origin"
      )}/return?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        userId: body.userId,
      },
    });

    return NextResponse.json({
      id: session.id,
      client_secret: session.client_secret,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}