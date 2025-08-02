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
        },
        //Extra Tokens
        price_1RrL5F2LSjDC5txTL3uBh13K: {
          type: "tokens",
          tokens: 30,
          name: "Pack 30 tokens",
          isSubscription: false,
        },
        price_1RrL6V2LSjDC5txT4rjhvL16: {
          type: "tokens",
          tokens: 60,
          name: "Pack 60 Tokens",
          isSubscription: false,
        },
        price_1RrL7H2LSjDC5txTqcpnGZYE: {
          type: "tokens",
          tokens: 120,
          name: "Pack 120 Tokens",
          isSubscription: false,
        },
        price_1RrL7b2LSjDC5txTUKbWlDO5: {
          type: "tokens",
          tokens: 250,
          name: "Pack 250 Tokens",
          isSubscription: false,
        },
        price_1RrL7r2LSjDC5txTy0i2I8MY: {
          type: "tokens",
          tokens: 600,
          name: "Pack 600 Tokens",
          isSubscription: false,
        },
        price_1RrL8A2LSjDC5txT9vjD59AH: {
          type: "tokens",
          tokens: 1200,
          name: "Pack 1200 Tokens",
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

            const now = new Date();
            const oneMonthLater = new Date(now);
            oneMonthLater.setMonth(now.getMonth() + 1);

            const subscriptionData = {
              subscriptionId: session.subscription,
              status: "active",
              planName: productConfig.name,
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

      // Solo procesar si se marcó para cancelar al final del período
      if (subscription.cancel_at_period_end === true) {
        const customerId = subscription.customer;

        console.log(
          "⏰ Suscripción marcada para cancelar al final del período:",
          customerId
        );

        // Buscar usuario por stripeCustomerId
        const usersQuery = await db
          .collection("user")
          .where("stripeCustomerId", "==", customerId)
          .limit(1)
          .get();

        if (!usersQuery.empty) {
          const userDoc = usersQuery.docs[0];
          const userId = userDoc.id;

          // ✅ Marcar como cancelada pero mantener acceso hasta el final
          await userDoc.ref.update({
            subscriptionCanceled: true, // Marcar que está cancelada
            subscriptionStatus: "cancel_at_period_end",
            // NO cambiar isSubscribed hasta que realmente se cancele
          });

          // Actualizar subcolección
          const subsRef = db
            .collection("user")
            .doc(userId)
            .collection("subscripcion");
          const existingSub = await subsRef.limit(1).get();

          if (!existingSub.empty) {
            await existingSub.docs[0].ref.update({
              status: "cancel_at_period_end",
              updatedAt: new Date(),
              endsAt: subscription.ended_at
                ? new Date(subscription.ended_at * 1000)
                : null,
            });
          }

          console.log(
            "✅ Usuario marcado para cancelación al final del período"
          );
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
          monthly_tokens: 30, // Al cancelar, eliminar tokens mensuales
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
