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

      if (!userId) {
        console.error("Missing userId in session metadata");
        return NextResponse.json(
          { error: "Missing userId in session metadata" },
          { status: 400 }
        );
      }

      // --- NUEVO: establecer payment method como default SOLO si el customer no tiene uno ---
      try {
        const customerId = session.customer as string | undefined;
        if (customerId) {
          const customer = (await stripe.customers.retrieve(customerId)) as any;
          const existingDefault =
            customer?.invoice_settings?.default_payment_method;

          if (!existingDefault) {
            // intentar obtener el payment method usado en la subscripción o pago
            let pmId: string | undefined;

            if (session.subscription) {
              // Si es suscripción: recuperamos la suscripción para intentar obtener el PM
              const subscription = (await stripe.subscriptions.retrieve(
                session.subscription as string,
                {
                  expand: [
                    "default_payment_method",
                    "latest_invoice.payment_intent",
                  ],
                }
              )) as any;

              pmId =
                (subscription.default_payment_method as any)?.id ||
                (subscription.latest_invoice as any)?.payment_intent
                  ?.payment_method;
            } else {
              // Si no es subscripción (pago único), intentar obtener payment_intent desde la sesión
              const fullSession = (await stripe.checkout.sessions.retrieve(
                session.id,
                {
                  expand: ["payment_intent"],
                }
              )) as any;
              pmId = fullSession?.payment_intent?.payment_method;
            }

            if (pmId) {
              try {
                // attach si hace falta (normalmente ya estará attached)
                await stripe.paymentMethods.attach(pmId, {
                  customer: customerId,
                });
              } catch (attachErr: any) {
                // Si falla por ya estar attached en la misma cuenta u otra, solo lo logueamos
                console.warn(
                  "attach pm warning:",
                  attachErr?.message || attachErr
                );
              }

              // Opcional: permitir redisplay para que se pueda prefilar en futuros Checkouts
              try {
                await stripe.paymentMethods.update(pmId, {
                  allow_redisplay: "always",
                });
              } catch (updErr: any) {
                console.warn(
                  "Could not set allow_redisplay:",
                  updErr?.message || updErr
                );
              }

              // Finalmente: establecer como default en el Customer (solo si aún no tiene default)
              try {
                await stripe.customers.update(customerId, {
                  invoice_settings: { default_payment_method: pmId },
                });

              } catch (custUpdErr: any) {
                console.error(
                  "Error setting customer default payment method:",
                  custUpdErr
                );
              }
            } else {
              console.warn(
                "No payment method found in session/subscription to set as default."
              );
            }
          } else {

          }
        } else {
          console.warn(
            "Session has no customer id; skipping default payment method assignment."
          );
        }
      } catch (err: any) {
        console.error(
          "Error while attempting to set default payment method:",
          err
        );
        // no retornamos error aquí para no interrumpir la lógica principal del webhook
      }
      // --- FIN NUEVO ---

      const lineItems = await stripe.checkout.sessions.listLineItems(
        session.id
      );

      const PRICE_TO_TOKENS = {
        //One Tier Sub
        price_1RwHJCRpBiBhmezm4D1fPQt5: {
          type: "subscription",
          tokens: 300,
          name: "Culinarium premium",
          isSubscription: true,
          price: 7.99,
        },
        //Extra Tokens
        price_1RwHKLRpBiBhmezmK1AybT5C: {
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
            } else {
              await subsRef.add({
                ...subscriptionData,
                createdAt: new Date(),
              });
            }

            const userRef = db.collection("user").doc(userId);
            await userRef.update({
              isSubscribed: true,
              subscriptionStatus: "active",
              subscriptionId: session.subscription,
              stripeCustomerId: session.customer,
            });
          } else {
            if (productConfig.tokens > 0) {
              const userRef = db.collection("user").doc(userId);
              await userRef.update({
                extra_tokens: FieldValue.increment(productConfig.tokens),
              });
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

        } else {
          // Esto incluye tanto la reactivación como cambios que mantienen la suscripción activa
          const wasCanceled =
            userData.subscriptionCanceled === true ||
            userData.subscriptionStatus === "cancel_at_period_end";

          if (wasCanceled || userData.subscriptionStatus !== "active") {

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

          }
        }
      } else {
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

        // Solo procesar si tiene suscripción activa
        if (invoice.parent?.subscription_details?.subscription) {
          // Verificar si es el primer pago o renovación
          const isFirstPayment =
            !userData.monthly_tokens || userData.monthly_tokens === 0;

          // RESETEAR tokens mensuales (no acumular) - funciona para primer pago y renovaciones
          await userDoc.ref.update({
            monthly_tokens: 300, // RESETEAR a 300, no incrementar
            tokens_reset_date: oneMonthLater,
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
          } else {
          }
        }
      } else {
      }
    }

    // =============================================
    // CANCELACIÓN DE SUSCRIPCIÓN
    // =============================================
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const subscriptionId = subscription.id;
      const customerId = subscription.customer;


      // Anular invoices pendientes
      if (customerId) {
        try {
          const openInvoices = await stripe.invoices.list({
            customer: typeof customerId === "string" ? customerId : (customerId?.id ?? undefined),
            status: "open",
          });

          for (const invoice of openInvoices.data) {
            if (invoice.id) {
              // Verificar que invoice.id existe
              await stripe.invoices.voidInvoice(invoice.id);
            }
          }
        } catch (error) {
          console.error("Error anulando invoices:", error);
        }
      }

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

      }
    }

    // =============================================
    // PAGO FALLIDO
    // =============================================
    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object;
      const customerId = invoice.customer;

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
