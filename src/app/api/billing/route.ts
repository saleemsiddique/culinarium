/* eslint-disable @typescript-eslint/no-explicit-any */

// app/api/billing/route.ts

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db, auth } from "@/lib/firebase-admin";

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token de autenticación requerido" }, { status: 401 });
    }
    const idToken = authHeader.split("Bearer ")[1];
    let decodedUid: string;
    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      decodedUid = decodedToken.uid;
    } catch {
      return NextResponse.json({ error: "Token de autenticación inválido" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Prevenir IDOR: el usuario solo puede ver su propia facturación
    if (decodedUid !== userId) {
      return NextResponse.json({ error: "Acceso no autorizado" }, { status: 403 });
    }

    const userDoc = await db.collection("user").doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json({ invoices: [], paymentMethods: [] });
    }

    const userData = userDoc.data();
    const customerId = userData?.stripeCustomerId;

    if (!customerId) {
      return NextResponse.json({ invoices: [], paymentMethods: [] });
    }

    const invoices = await stripe.invoices.list({ customer: customerId, limit: 10 });
    const paymentMethods = await stripe.paymentMethods.list({ customer: customerId, type: "card" });

    const customer = await stripe.customers.retrieve(customerId);
    const defaultPaymentMethodId = (customer as any)?.invoice_settings?.default_payment_method;

    const formattedPaymentMethods = paymentMethods.data.map((pm) => ({
      id: pm.id,
      type: pm.type,
      card: pm.card ? {
        brand: pm.card.brand,
        last4: pm.card.last4,
        exp_month: pm.card.exp_month,
        exp_year: pm.card.exp_year,
      } : undefined,
      is_default: pm.id === defaultPaymentMethodId,
    }));

    const formattedInvoices = invoices.data.map((inv) => ({
      id: inv.id,
      amount_paid: inv.amount_paid,
      currency: inv.currency,
      status: inv.status,
      created: inv.created,
      hosted_invoice_url: inv.hosted_invoice_url,
      invoice_pdf: inv.invoice_pdf,
    }));

    return NextResponse.json({ invoices: formattedInvoices, paymentMethods: formattedPaymentMethods });
  } catch (error) {
    console.error("Stripe API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
