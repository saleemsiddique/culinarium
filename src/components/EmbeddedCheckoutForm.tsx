"use client";
import { useCallback } from "react";
import { CustomUser } from "@/context/user-context";

export default function RedirectCheckoutButton({ priceId, user }: { priceId: string, user: CustomUser | null }) {
  const userId = user?.uid;

  const handleCheckoutClick = useCallback(async () => {
    try {
      // Llama a tu endpoint de API para crear la sesión de Checkout.
      const res = await fetch("/api/embedded-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId: priceId, userId: userId }),
      });

      if (!res.ok) {
        throw new Error("Failed to create Stripe Checkout session.");
      }

      const data = await res.json();
      
      // Redirige al usuario a la URL de pago de Stripe.
      window.location.href = data.url;

    } catch (error) {
      console.error("Error during checkout:", error);
      alert("An error occurred during checkout. Please try again.");
    }
  }, [priceId, userId]);

  return (
    <div className="flex flex-col items-center gap-4">
      <button 
        className="cursor-pointer px-5 flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-orange-700 transition-all duration-300 ease-in-out" 
        onClick={handleCheckoutClick}
      >
        Suscribirse
      </button>
    </div>
  );
}