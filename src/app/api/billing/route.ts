// app/api/billing/route.ts

import { NextResponse } from 'next/server';
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/firebase-admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const userDoc = await db.collection("user").doc(userId).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ invoices: [] });
    }

    const userData = userDoc.data();
    const customerId = userData?.stripeCustomerId;

    if (!customerId) {
      return NextResponse.json({ invoices: [] });
    }

    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 10, // Puedes ajustar el límite según tus necesidades
    });

    return NextResponse.json({
      invoices: invoices.data,
    });

  } catch (error) {
    console.error('Stripe API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}