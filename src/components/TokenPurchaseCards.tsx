"use client";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { useCallback, useRef, useState } from "react";
import { CustomUser } from "@/context/user-context";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

interface TokenOption {
  count: number;
  price: number;
  color: string;
  label: string;
  priceId: string;
}

export default function TokenPurchaseCards({ 
  user, 
  count, 
  price, 
  color, 
  label, 
  priceId 
}: { 
  user: CustomUser | null;
  count: number;
  price: number;
  color: string;
  label: string;
  priceId: string;
}) {
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedToken, setSelectedToken] = useState<TokenOption | null>(null);
  const modalRef = useRef<HTMLDialogElement>(null);

  const userId = user?.uid;

  const fetchClientSecret = useCallback(() => {
    if (!selectedToken) return Promise.reject("No token selected");
    
    return fetch("/api/embedded-checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ priceId: selectedToken.priceId, userId: userId }), 
    })
      .then((res) => res.json())
      .then((data) => data.client_secret);
  }, [selectedToken, userId]);

  const options = { fetchClientSecret };

  const handleTokenClick = () => {
    const tokenOption: TokenOption = {
      count,
      price,
      color,
      label,
      priceId
    };
    
    setSelectedToken(tokenOption);
    setShowCheckout(true);
    modalRef.current?.showModal();
  };

  const handleCloseModal = () => {
    setShowCheckout(false);
    setSelectedToken(null);
    modalRef.current?.close();
  };

  // Función para obtener las clases de color de forma segura
  const getColorClasses = (colorName: string) => {
    const colorMap: { [key: string]: { border: string; hover: string; text: string } } = {
      blue: {
        border: 'border-blue-200',
        hover: 'hover:border-blue-400',
        text: 'text-blue-600'
      },
      green: {
        border: 'border-green-200',
        hover: 'hover:border-green-400',
        text: 'text-green-600'
      },
      purple: {
        border: 'border-purple-200',
        hover: 'hover:border-purple-400',
        text: 'text-purple-600'
      },
      red: {
        border: 'border-red-200',
        hover: 'hover:border-red-400',
        text: 'text-red-600'
      },
      orange: {
        border: 'border-orange-200',
        hover: 'hover:border-orange-400',
        text: 'text-orange-600'
      }
    };

    return colorMap[colorName] || colorMap.blue; // Fallback a blue si el color no existe
  };

  const colorClasses = getColorClasses(color);

  return (
    <div>
      <div className="space-y-3 mb-6">
        <div 
          onClick={handleTokenClick}
          className={`border-2 ${colorClasses.border} rounded-lg p-4 ${colorClasses.hover} cursor-pointer transition-all relative`}
        >
          <div className="flex justify-between items-center">
            <div>
              <span className="font-bold text-lg">{count} Tokens</span>
              <p className="text-sm text-gray-600">{label}</p>
            </div>
            <div className="text-right">
              <span className={`text-2xl font-bold ${colorClasses.text}`}>€{price}</span>
              <p className="text-xs text-gray-500">€{(price/count).toFixed(2)}/token</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de checkout */}
      <dialog ref={modalRef} className="modal">
        <div className="modal-box w-full max-w-6xl">
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