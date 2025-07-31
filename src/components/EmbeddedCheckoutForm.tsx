"use client";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { useCallback, useRef, useState } from "react";
import { CustomUser } from "@/context/user-context";
import { getAuth } from "firebase/auth";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

export default function EmbeddedCheckoutButton({ priceId, user }: { priceId: string, user: CustomUser | null }) {
  const [showCheckout, setShowCheckout] = useState(false);
  const modalRef = useRef<HTMLDialogElement>(null);

  const auth = getAuth();
  const userId = auth.currentUser?.uid;//No es correcto

  const fetchClientSecret = useCallback(() => {
    return fetch("/api/embedded-checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ priceId: priceId, userId: userId }), 
    })
      .then((res) => res.json())
      .then((data) => data.client_secret);
  }, [priceId]);

  const options = { fetchClientSecret };

  const handleCheckoutClick = () => {
    setShowCheckout(true);
    modalRef.current?.showModal();
  };

  const handleCloseModal = () => {
    setShowCheckout(false);
    modalRef.current?.close();
  };

  return (
    <div  className="flex flex-col items-center gap-4">
      <button className="p-5 flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-orange-700 transition-all" onClick={handleCheckoutClick}>
        Suscribirse
      </button>
      <dialog ref={modalRef} className="modal ">
        <div className="modal-box w-full max-w-6xl">
          <h3 className="font-bold text-lg">Pago seguro con Stripe</h3>
          <div className="py-4">
            {showCheckout && (
              <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            )}
          </div>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn" onClick={handleCloseModal}>
                Cerrar
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
}
