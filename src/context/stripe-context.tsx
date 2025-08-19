// context/stripe-provider.tsx
"use client";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

export const StripeProvider = ({ children }: { children: React.ReactNode }) => (
  <Elements stripe={stripePromise}>{children}</Elements>
);
