import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "UserId requerido" }, { status: 400 });
    }

    // Obtener el stripeCustomerId del usuario desde Firebase
    const userDoc = await db.collection("user").doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    if (!userData || !userData.stripeCustomerId) {
      return NextResponse.json(
        { error: "No hay customer ID asociado" },
        { status: 400 }
      );
    }
    const customerId = userData.stripeCustomerId;

    // Obtener las suscripciones activas del customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "past_due",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json(
        { error: "No hay suscripciones activas" },
        { status: 400 }
      );
    }

    const activeSubscription = subscriptions.data[0];

    // ✅ Cancelar al final del período en lugar de inmediatamente
    const cancelled = await stripe.subscriptions.cancel(
      activeSubscription.id
    );

    return NextResponse.json({
      success: true,
      subscription: cancelled,
    });

  } catch (error) {
    console.error("Error cancelando suscripción:", error);
    return NextResponse.json(
      {
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}
