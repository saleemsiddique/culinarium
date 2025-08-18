// app/api/payment-methods/route.ts

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/firebase-admin";

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentMethodId = searchParams.get("paymentMethodId");
    const userId = searchParams.get("userId"); 
    
    if (!paymentMethodId || !userId) {
      return NextResponse.json(
        { error: "Payment Method ID and User ID are required" },
        { status: 400 }
      );
    }

    const userDoc = await db.collection("user").doc(userId).get();
    const userData = userDoc.data();
    const customerId = userData?.stripeCustomerId;

    if (!customerId) {
      return NextResponse.json(
        { error: "Stripe customer ID not found" },
        { status: 404 }
      );
    }

    await stripe.paymentMethods.detach(paymentMethodId);

    return NextResponse.json({
      success: true,
      message: "Payment method detached successfully",
    });
  } catch (error) {
    console.error("Stripe API Error:", error);
    if ((error as any).code === "resource_missing") {
      return NextResponse.json(
        { error: "Payment method not found or already detached" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
