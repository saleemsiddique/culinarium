// pages/api/stripe/complete-setup.ts
import { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "@/lib/stripe";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  const { paymentMethodId, customerId } = req.body;
  if (!paymentMethodId || !customerId) return res.status(400).json({ error: "paymentMethodId y customerId requeridos" });

  try {
    // 1) Recupera el payment method (SetupIntent normalmente ya lo asocia al customer si lo creaste con customer)
    let pm = await stripe.paymentMethods.retrieve(paymentMethodId);

    // 2) Si no tiene customer (raro), adjúntalo
    if (!pm.customer) {
      try {
        await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
        pm = await stripe.paymentMethods.retrieve(paymentMethodId);
      } catch (attachErr: any) {
        // Si falla por "already attached" o similar, simplemente intentamos continuar
        console.warn("attach error (puede ser ignorable):", attachErr?.message || attachErr);
        pm = await stripe.paymentMethods.retrieve(paymentMethodId);
      }
    }

    // 3) Comprobar si es la primera tarjeta del cliente para marcarla por defecto
    const list = await stripe.paymentMethods.list({ customer: customerId, type: "card" });
    const isFirstCard = list.data.length === 1;

    if (isFirstCard) {
      await stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: paymentMethodId },
      });
    }

    // 4) Devolver la info útil al frontend
    return res.status(200).json({
      success: true,
      isDefault: isFirstCard,
      paymentMethod: pm,
    });
  } catch (err: any) {
    console.error("Error finalizando setup:", err);
    return res.status(500).json({ error: err.message || "Error interno" });
  }
}
