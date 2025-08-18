// app/api/payment-methods/default/route.ts

import { NextResponse } from 'next/server';
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/firebase-admin";

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const paymentMethodId = searchParams.get('paymentMethodId');

    if (!userId || !paymentMethodId) {
      return NextResponse.json({ error: 'User ID and Payment Method ID are required' }, { status: 400 });
    }

    const userDoc = await db.collection("user").doc(userId).get();
    const userData = userDoc.data();
    const customerId = userData?.stripeCustomerId;

    if (!customerId) {
      return NextResponse.json({ error: 'Stripe customer ID not found for user' }, { status: 404 });
    }

    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    return NextResponse.json({ success: true, message: 'Default payment method updated successfully' });

  } catch (error) {
    console.error('Stripe API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}