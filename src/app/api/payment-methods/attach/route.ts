/* eslint-disable @typescript-eslint/no-explicit-any */

import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const { customerId } = await req.json();
    if (!customerId) {
      return new Response(JSON.stringify({ error: "customerId es requerido" }), { status: 400 });
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
      usage: "off_session",
    });

    return new Response(JSON.stringify({ clientSecret: setupIntent.client_secret }), { status: 200 });
  } catch (err: any) {
    console.error("Error creando SetupIntent:", err);
    return new Response(JSON.stringify({ error: err.message || "Error interno" }), { status: 500 });
  }
}
