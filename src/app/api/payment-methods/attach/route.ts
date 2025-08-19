import { NextApiRequest, NextApiResponse } from 'next';
import { stripe } from "@/lib/stripe";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  const { customerId } = req.body;
  if (!customerId) return res.status(400).json({ error: "customerId es requerido" });

  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
      usage: "off_session",
    });

    return res.status(200).json({ clientSecret: setupIntent.client_secret });
  } catch (err: any) {
    console.error("Error creando SetupIntent:", err);
    return res.status(500).json({ error: err.message || "Error interno" });
  }
}