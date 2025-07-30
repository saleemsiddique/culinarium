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

    // =============================================
    // NUEVA SUSCRIPCIÓN O COMPRA DE TOKENS
    // =============================================
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.userId;

      console.log("🔥 Checkout completado:", session.id);

      if (!userId) {
        console.error("Missing userId in session metadata");
        return NextResponse.json(
          { error: "Missing userId in session metadata" },
          { status: 400 }
        );
      }

      const lineItems = await stripe.checkout.sessions.listLineItems(
        session.id
      );

      const PRICE_TO_TOKENS = {
        //One Tier Sub
        price_1Rl9zm2LSjDC5txTe2rXn5LE: {
          type: "subscription",
          tokens: 1000,
          name: "Subscripcion Mensual",
          isSubscription: true,
        },
        //Extra Tokens
        price_1Rmt5k2LSjDC5txTl2pH8pgb: {
          type: "tokens",
          tokens: 2500,
          name: "Pack 2500 tokens",
          isSubscription: false,
        },
        price_1Rmt692LSjDC5txTxvuaRW7M: {
          type: "tokens",
          tokens: 5000,
          name: "Pack 5000 Tokens",
          isSubscription: false,
        },
      };

      //Actualizar Tokens
      if (lineItems.data.length > 0) {
        const priceId = lineItems.data[0].price?.id;
        console.log("Precio Id: " + priceId);
        const productConfig =
          PRICE_TO_TOKENS[priceId as keyof typeof PRICE_TO_TOKENS];

        if (productConfig) {
          if (productConfig.isSubscription) {
            // NUEVA SUSCRIPCIÓN - Solo configurar, NO dar tokens aún
            const subsRef = db
              .collection("user")
              .doc(userId)
              .collection("subscripcion");
            const existingSub = await subsRef.limit(1).get();

            const subscriptionData = {
              subscriptionId: session.subscription,
              status: "active",
              planName: productConfig.name,
              tokensIncluded: productConfig.tokens,
              sessionId: session.id,
              updatedAt: new Date(),
            };

            if (!existingSub.empty) {
              await existingSub.docs[0].ref.update(subscriptionData);
              console.log("✅ Suscripción actualizada");
            } else {
              await subsRef.add({
                ...subscriptionData,
                createdAt: new Date(),
              });
              console.log("✅ Nueva suscripción creada");
            }

            const userRef = db.collection("user").doc(userId);
            await userRef.update({
              isSubscribed: true,
              subscriptionStatus: "active",
              subscriptionId: session.subscription,
              stripeCustomerId: session.customer, 
            });
            console.log("✅ Usuario configurado para suscripción - esperando invoice");
          } else {
            if (productConfig.tokens > 0) {
              const userRef = db.collection("user").doc(userId);
              await userRef.update({
                extra_tokens: FieldValue.increment(productConfig.tokens), 
              });
              console.log(`✅ ${productConfig.tokens} tokens extra añadidos (acumulativos)`);
            }

            // Registrar la transacción de tokens extra
            await db
              .collection("user")
              .doc(userId)
              .collection("token_purchases")
              .add({
                productName: productConfig.name,
                tokensAmount: productConfig.tokens,
                sessionId: session.id,
                priceId: priceId,
                createdAt: new Date(),
              });
            console.log("✅ Compra de tokens extra registrada");
          }
        }
      }
    }

    // =============================================
    // PAGO DE SUSCRIPCIÓN (PRIMER PAGO Y RENOVACIONES)
    // =============================================
    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object;
      const customerId = invoice.customer;
      
      console.log("🔄 Pago exitoso para customer:", customerId);

      // Buscar usuario por customerId (Stripe customer ID)
      const usersQuery = await db
        .collection("user")
        .where("stripeCustomerId", "==", customerId)
        .limit(1)
        .get();

      if (!usersQuery.empty) {
        const userDoc = usersQuery.docs[0];
        const userId = userDoc.id;
        const userData = userDoc.data();

        console.log("Usuario encontrado:", userId);

        // Solo procesar si tiene suscripción activa
        if (userData.subscriptionStatus === "active") {
          // Verificar si es el primer pago o renovación
          const isFirstPayment = !userData.monthly_tokens || userData.monthly_tokens === 0;
          
          // RESETEAR tokens mensuales (no acumular) - funciona para primer pago y renovaciones
          await userDoc.ref.update({
            monthly_tokens: 1000, // RESETEAR a 1000, no incrementar
            tokens_reset_date: new Date(),
            lastRenewal: new Date(),
          });

          // Actualizar estado de suscripción
          const subsRef = db
            .collection("user")
            .doc(userId)
            .collection("subscripcion");
          const existingSub = await subsRef.limit(1).get();

          if (!existingSub.empty) {
            await existingSub.docs[0].ref.update({
              status: "active",
              lastRenewal: new Date(),
              updatedAt: new Date(),
            });
          }

          if (isFirstPayment) {
            console.log("✅ Primer pago: 1000 tokens mensuales asignados");
          } else {
            console.log("✅ Renovación: tokens mensuales reseteados a 1000");
          }
        }
      } else {
        console.log("⚠️ Usuario no encontrado con customerId:", customerId);
      }
    }

    // =============================================
    // CANCELACIÓN DE SUSCRIPCIÓN
    // =============================================
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const subscriptionId = subscription.id;

      console.log("❌ Suscripción cancelada:", subscriptionId);

      // Buscar usuario por subscriptionId
      const usersQuery = await db
        .collection("user")
        .where("subscriptionId", "==", subscriptionId)
        .limit(1)
        .get();

      if (!usersQuery.empty) {
        const userDoc = usersQuery.docs[0];
        const userId = userDoc.id;

        // Actualizar estado del usuario
        await userDoc.ref.update({
          isSubscribed: false,
          subscriptionStatus: "cancelled",
          monthly_tokens: 0, // Al cancelar, eliminar tokens mensuales
          cancelledAt: new Date(),
        });

        // Actualizar estado en subcolección
        const subsRef = db
          .collection("user")
          .doc(userId)
          .collection("subscripcion");
        const existingSub = await subsRef.limit(1).get();

        if (!existingSub.empty) {
          await existingSub.docs[0].ref.update({
            status: "cancelled",
            cancelledAt: new Date(),
            updatedAt: new Date(),
          });
        }

        console.log("✅ Usuario marcado como no suscrito, tokens mensuales eliminados");
      }
    }

    // =============================================
    // PAGO FALLIDO (OPCIONAL)
    // =============================================
    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object;
      const customerId = invoice.customer;

      console.log("⚠️ Pago fallido para customer:", customerId);

      // Buscar usuario por customerId
      const usersQuery = await db
        .collection("user")
        .where("stripeCustomerId", "==", customerId)
        .limit(1)
        .get();

      if (!usersQuery.empty) {
        const userDoc = usersQuery.docs[0];

        await userDoc.ref.update({
          subscriptionStatus: "payment_failed",
          lastPaymentFailed: new Date(),
        });

        console.log("⚠️ Usuario marcado con pago fallido");
      }
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