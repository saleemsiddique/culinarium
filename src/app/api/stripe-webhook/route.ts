/* eslint-disable @typescript-eslint/no-explicit-any */

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
        price_1RrJVF2LSjDC5txTR6lOQslg: {  
          type: "subscription", 
          tokens: 300,
          name: "Culinarium premium",
          isSubscription: true,
          price: 7.99,
        },
        //Extra Tokens
        price_1RrL5F2LSjDC5txTL3uBh13K: {  
          type: "tokens",
          tokens: 30,
          name: "Pack 30 tokens",
          isSubscription: false,
          price: 0.99,
        },
        price_1RwHL6RpBiBhmezmsEhJyMC1: {
          type: "tokens",
          tokens: 60,
          name: "Pack 60 Tokens",
          isSubscription: false,
          price: 1.99,
        },
        price_1RwHLWRpBiBhmezmY3vPGDxT: {
          type: "tokens",
          tokens: 120,
          name: "Pack 120 Tokens",
          isSubscription: false,
          price: 3.49,
        },
        price_1RwHLrRpBiBhmezmFamEW9Ct: {
          type: "tokens",
          tokens: 250,
          name: "Pack 250 Tokens",
          isSubscription: false,
          price: 6.49,
        },
        price_1RwHMCRpBiBhmezmRzyb4DAm: {
          type: "tokens",
          tokens: 600,
          name: "Pack 600 Tokens",
          isSubscription: false,
          price: 13.99,
        },
        price_1RwHMbRpBiBhmezmgyMbGrJq: {
          type: "tokens",
          tokens: 1200,
          name: "Pack 1200 Tokens",
          isSubscription: false,
          price: 24.99,
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

            const now = new Date();
            const oneMonthLater = new Date(now);
            oneMonthLater.setMonth(now.getMonth() + 1);

            const subscriptionData = {
              subscriptionId: session.subscription,
              status: "active",
              planName: productConfig.name,
              price: productConfig.price,
              tokensIncluded: productConfig.tokens,
              sessionId: session.id,
              updatedAt: new Date(),
              endsAt: oneMonthLater,
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
            console.log(
              "✅ Usuario configurado para suscripción - esperando invoice"
            );
          } else {
            if (productConfig.tokens > 0) {
              const userRef = db.collection("user").doc(userId);
              await userRef.update({
                extra_tokens: FieldValue.increment(productConfig.tokens),
              });
              console.log(
                `✅ ${productConfig.tokens} tokens extra añadidos (acumulativos)`
              );
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
                price: productConfig.price,
                status: "Completed",
                createdAt: new Date(),
              });
            console.log("✅ Compra de tokens extra registrada");
          }
        }
      }
    }

    // =============================================
    // En tu webhook, agregar este nuevo evento
    // =============================================
    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      // Buscar usuario por stripeCustomerId (común para ambos casos)
      const usersQuery = await db
        .collection("user")
        .where("stripeCustomerId", "==", customerId)
        .limit(1)
        .get();

      if (!usersQuery.empty) {
        const userDoc = usersQuery.docs[0];
        const userId = userDoc.id;
        const userData = userDoc.data();

        const subsRef = db
          .collection("user")
          .doc(userId)
          .collection("subscripcion");
        const existingSub = await subsRef.limit(1).get();

        if (subscription.cancel_at_period_end === true) {
          console.log(
            "⏰ Suscripción marcada para cancelar al final del período:",
            customerId
          );

          await userDoc.ref.update({
            subscriptionCanceled: true,
            subscriptionStatus: "cancel_at_period_end",
          });

          if (!existingSub.empty) {
            await existingSub.docs[0].ref.update({
              status: "cancel_at_period_end",
              updatedAt: new Date(),
            });
          }

          console.log(
            "✅ Usuario marcado para cancelación al final del período"
          );
        } else {
          // Esto incluye tanto la reactivación como cambios que mantienen la suscripción activa
          const wasCanceled =
            userData.subscriptionCanceled === true ||
            userData.subscriptionStatus === "cancel_at_period_end";

          if (wasCanceled || userData.subscriptionStatus !== "active") {
            console.log(
              "🔄 Suscripción reactivada o actualizada a activa:",
              customerId
            );

            await userDoc.ref.update({
              subscriptionCanceled: false,
              subscriptionStatus: "active",
            });

            if (!existingSub.empty) {
              await existingSub.docs[0].ref.update({
                status: "active",
                updatedAt: new Date(),
              });
            }

            console.log("✅ Usuario actualizado a suscripción activa");
          }
        }
      } else {
        console.log("❌ Usuario no encontrado para customerId:", customerId);
      }
    }

    // =============================================
    // PAGO DE SUSCRIPCIÓN (PRIMER PAGO Y RENOVACIONES)
    // =============================================
    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object;
      const customerId = invoice.customer;

      const now = new Date();
      const oneMonthLater = new Date(now);
      oneMonthLater.setMonth(now.getMonth() + 1);

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
        console.log("-------------------------");
        console.log("Usuario encontrado:", userId);
        console.log("Estado de suscripción:", userData.subscriptionStatus);

        // Solo procesar si tiene suscripción activa
        if (userData.subscriptionStatus === "active") {
          console.log("✅ Usuario con suscripción activa:", userId);
          console.log("-------------------------");
          // Verificar si es el primer pago o renovación
          const isFirstPayment =
            !userData.monthly_tokens || userData.monthly_tokens === 0;

          // RESETEAR tokens mensuales (no acumular) - funciona para primer pago y renovaciones
          await userDoc.ref.update({
            monthly_tokens: 300, // RESETEAR a 300, no incrementar
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
              endsAt: oneMonthLater,
            });
          }

          if (isFirstPayment) {
            console.log("✅ Primer pago: 300 tokens mensuales asignados");
          } else {
            console.log("✅ Renovación: tokens mensuales reseteados a 300");
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
          subscriptionCanceled: false,
          isSubscribed: false,
          subscriptionStatus: "cancelled",
          monthly_tokens: 50, 
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
            updatedAt: new Date(),
          });
        }

        console.log(
          "✅ Usuario marcado como no suscrito, tokens mensuales eliminados"
        );
      }
    }

    // =============================================
    // PAGO FALLIDO
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
