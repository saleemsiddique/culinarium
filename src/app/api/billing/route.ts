// app/api/billing/route.ts

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/firebase-admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const userDoc = await db.collection("user").doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json({
        invoices: [],
        paymentMethods: [],
      });
    }

    const userData = userDoc.data();
    const customerId = userData?.stripeCustomerId;

    if (!customerId) {
      return NextResponse.json({
        invoices: [],
        paymentMethods: [],
      });
    }

    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 10,
    });

    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });

    const customer = await stripe.customers.retrieve(customerId);
    const defaultPaymentMethodId = (customer as any)?.invoice_settings
      ?.default_payment_method;

    const formattedPaymentMethods = paymentMethods.data.map((pm) => ({
      ...pm,
      is_default: pm.id === defaultPaymentMethodId,
    }));

    return NextResponse.json({
      invoices: invoices.data,
      paymentMethods: formattedPaymentMethods,
    });
  } catch (error) {
    console.error("Stripe API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
