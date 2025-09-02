/* eslint-disable @typescript-eslint/no-explicit-any */

// src/app/api/stripe/complete-setup/route.ts
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const { paymentMethodId, customerId, userEmail, country, postalCode } =
      await req.json();
    if (!paymentMethodId || !customerId) {
      return new Response(
        JSON.stringify({ error: "paymentMethodId y customerId requeridos" }),
        { status: 400 }
      );
    }

    let newPaymentMethod = await stripe.paymentMethods.retrieve(
      paymentMethodId
    );

    if (!newPaymentMethod.customer) {
      try {
        await stripe.paymentMethods.attach(paymentMethodId, {
          customer: customerId,
        });
        newPaymentMethod = await stripe.paymentMethods.retrieve(
          paymentMethodId
        );
      } catch (attachErr: any) {
        console.warn(
          "attach error (puede ser ignorable):",
          attachErr?.message || attachErr
        );
        newPaymentMethod = await stripe.paymentMethods.retrieve(
          paymentMethodId
        );
      }
    }

    const existingPaymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });

    const isDuplicate = existingPaymentMethods.data.some((pm: any) => {
      if (pm.id === paymentMethodId) {
        return false;
      }

      return (
        pm.card?.last4 === newPaymentMethod.card?.last4 &&
        pm.card?.brand === newPaymentMethod.card?.brand &&
        pm.card?.exp_month === newPaymentMethod.card?.exp_month &&
        pm.card?.exp_year === newPaymentMethod.card?.exp_year
      );
    });

    if (isDuplicate) {
      // Opcional: Desasociar el nuevo PaymentMethod para evitar que quede huérfano
      try {
        await stripe.paymentMethods.detach(paymentMethodId);
      } catch (detachErr: any) {
        console.warn(
          "Error al desasociar PaymentMethod duplicado:",
          detachErr.message
        );
      }
      return new Response(
        JSON.stringify({
          error: "Esta tarjeta ya está guardada en su cuenta.",
        }),
        { status: 409 } // 409 Conflict es un buen código para duplicados
      );
    }

    await stripe.paymentMethods.update(paymentMethodId, {
      billing_details: {
        email: userEmail,
        address: {
          country: country,
          postal_code: postalCode || undefined,
        },
      },
      allow_redisplay: "always",
    });

    const list = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });
    const isFirstCard = list.data.length === 1;

    if (isFirstCard) {
      await stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: paymentMethodId },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        isDefault: isFirstCard,
        paymentMethod: newPaymentMethod,
      }),
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error finalizando setup:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Error interno" }),
      { status: 500 }
    );
  }
}
