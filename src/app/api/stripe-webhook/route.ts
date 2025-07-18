import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const sig = request.headers.get("stripe-signature");

    if (!sig) {
      return NextResponse.json(
        { error: "Missing stripe signature" },
        { status: 400 }
      );
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.log("Webhook Error:", err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const customerId = session.customer;
      const userId = session.metadata?.userId;

      console.log("🔥 Webhook recibido:");
      console.log("👉 customerId:", customerId);
      console.log("👉 userId (desde metadata):", userId);
      console.log("👉 sessionId:", session.id);
      console.log("👉 status:", session.status);

      if (!userId) {
        console.error("Missing userId in session metadata");
        return NextResponse.json(
          { error: "Missing userId in session metadata" },
          { status: 400 }
        );
      }

      const subsRef = db
        .collection("user")
        .doc(userId)
        .collection("subscripcion");
      const existCliId = await subsRef.limit(1).get();

      if (!existCliId.empty) {
        // Actualizar la suscripción existente del usuario
        const docRef = existCliId.docs[0].ref;
        await docRef.update({
          sessionId: session.id,
          status: session.status,
          updatedAt: new Date(),
        });
        console.log("✅ Suscripción actualizada para userId:", userId);
      } else {
        await subsRef.add({
          customerId,
          sessionId: session.id,
          status: session.status,
          createdAt: new Date(),
        });
        console.log("✅ Datos guardados en Firebase correctamente");
      }

      const lineItems = await stripe.checkout.sessions.listLineItems(
        session.id
      );
      let tokensAdd = 0;

      const PRICE_TO_TOKENS = {
        price_1Rl9zm2LSjDC5txTe2rXn5LE: 1000,
        price_1RlA0F2LSjDC5txTJFx3ulMv: 2500,
        price_1RlA0R2LSjDC5txTmkLRnvkH: 5000,
      };

      if (lineItems.data.length > 0) {
        const priceId = lineItems.data[0].price?.id;
        tokensAdd =
          PRICE_TO_TOKENS[priceId as keyof typeof PRICE_TO_TOKENS] || 0;
      }

      //Actualizar Tokens
      if (tokensAdd > 0) {
        const userRef = db.collection("user").doc(userId);
        await userRef.update({
          tokens_available: FieldValue.increment(tokensAdd),
        });
        console.log(`✅ ${tokensAdd} tokens añadidos al usuario`);
      }
      console.log("✅ Proceso completado correctamente");
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Error procesando webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
