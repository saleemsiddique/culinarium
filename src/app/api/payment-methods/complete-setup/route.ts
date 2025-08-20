// src/app/api/stripe/complete-setup/route.ts
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const { paymentMethodId, customerId, userEmail, country, postalCode } = await req.json();
    if (!paymentMethodId || !customerId) {
      return new Response(
        JSON.stringify({ error: "paymentMethodId y customerId requeridos" }),
        { status: 400 }
      );
    }

    // 1) Recupera el payment method
    let pm = await stripe.paymentMethods.retrieve(paymentMethodId);

    // 2) Si no tiene customer, adjúntalo
    if (!pm.customer) {
      try {
        await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
        pm = await stripe.paymentMethods.retrieve(paymentMethodId);
      } catch (attachErr: any) {
        console.warn("attach error (puede ser ignorable):", attachErr?.message || attachErr);
        pm = await stripe.paymentMethods.retrieve(paymentMethodId);
      }
    }

    await stripe.paymentMethods.update(paymentMethodId, {
      billing_details: {
        email: userEmail,
        address: {
          country: country,
          postal_code: postalCode || undefined,
        }
      },
      allow_redisplay: 'always',
    });
    
    // 3) Comprobar si es la primera tarjeta del cliente
    const list = await stripe.paymentMethods.list({ customer: customerId, type: "card" });
    const isFirstCard = list.data.length === 1;

    if (isFirstCard) {
      await stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: paymentMethodId },
      });
    }

    // 4) Devolver info útil al frontend
    return new Response(
      JSON.stringify({ success: true, isDefault: isFirstCard, paymentMethod: pm }),
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
