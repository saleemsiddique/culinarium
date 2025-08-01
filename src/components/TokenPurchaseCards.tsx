"use client";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { useCallback, useRef, useState } from "react";
import { CustomUser } from "@/context/user-context";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

export default function TokenPurchaseCards({ user }: { user: CustomUser | null }) {
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedToken, setSelectedToken] = useState(null);
  const modalRef = useRef<HTMLDialogElement>(null);

  const userId = user?.uid;

  const tokenOptions = [
    {count:10, price:4.99, color:"blue", label:"Ideal para uso regular", priceId: "price_1Rmt5k2LSjDC5txTl2pH8pgb"},
    {count:25, price:9.99, color:"purple", label:"Mejor valor", popular:true, priceId: "price_1Rmt5k2LSjDC5txTl2pH8pgb"},
    {count:50, price:14.99, color:"green", label:"Para usuarios frecuentes", priceId: "price_1Rmt5k2LSjDC5txTl2pH8pgb"}
  ];

  const fetchClientSecret = useCallback(() => {
    if (!selectedToken) return Promise.reject("No token selected");
    
    return fetch("/api/token-checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ priceId: selectedToken.priceId, userId: userId }), 
    })
      .then((res) => res.json())
      .then((data) => data.client_secret);
  }, [selectedToken?.priceId, userId]);

  const options = { fetchClientSecret };

  const handleTokenClick = (tokenOption) => {
    setSelectedToken(tokenOption);
    setShowCheckout(true);
    modalRef.current?.showModal();
  };

  const handleCloseModal = () => {
    setShowCheckout(false);
    setSelectedToken(null);
    modalRef.current?.close();
  };

  return (
    <div>
      <div className="space-y-3 mb-6">
        {tokenOptions.map(({count, price, color, label, popular, priceId}) => (
          <div 
            key={count} 
            onClick={() => handleTokenClick({count, price, color, label, popular, priceId})} 
            className={`border-2 border-${color}-200 rounded-lg p-4 hover:border-${color}-400 cursor-pointer transition-all relative`}
          >
            {popular && (
              <div className="absolute -top-2 -right-2 bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold">POPULAR</div>
            )}
            <div className="flex justify-between items-center">
              <div>
                <span className="font-bold text-lg">{count} Tokens</span>
                <p className="text-sm text-gray-600">{label}</p>
              </div>
              <div className="text-right">
                <span className={`text-2xl font-bold text-${color}-600`}>€{price}</span>
                <p className="text-xs text-gray-500">€{(price/count).toFixed(2)}/token</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de checkout */}
      <dialog ref={modalRef} className="modal">
        <div className="modal-box w-full max-w-6xl">
          <h3 className="font-bold text-lg">
            {selectedToken && `Comprar ${selectedToken.count} Tokens - €${selectedToken.price}`}
          </h3>
          <p className="text-sm text-gray-600 mb-2">Pago seguro con Stripe</p>
          <div className="py-4">
            {showCheckout && selectedToken && (
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