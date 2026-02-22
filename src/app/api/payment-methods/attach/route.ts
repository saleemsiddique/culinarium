/* eslint-disable @typescript-eslint/no-explicit-any */

import { stripe } from "@/lib/stripe";
import { auth, db } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    // Verificar autenticación
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Token de autenticación requerido" }), { status: 401 });
    }
    const idToken = authHeader.split("Bearer ")[1];
    let decodedUid: string;
    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      decodedUid = decodedToken.uid;
    } catch {
      return new Response(JSON.stringify({ error: "Token de autenticación inválido" }), { status: 401 });
    }

    const { customerId } = await req.json();
    if (!customerId) {
      return new Response(JSON.stringify({ error: "customerId es requerido" }), { status: 400 });
    }

    // Verificar que el customerId pertenece al usuario autenticado
    const userDoc = await db.collection("user").doc(decodedUid).get();
    const userData = userDoc.data();
    if (userData?.stripeCustomerId !== customerId) {
      return new Response(JSON.stringify({ error: "Acceso no autorizado" }), { status: 403 });
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
