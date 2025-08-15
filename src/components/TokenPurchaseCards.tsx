"use client";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { useCallback, useRef, useState } from "react";
import { CustomUser } from "@/context/user-context";
import { Zap } from "lucide-react";

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
  priceId,
  labelPromo,
  isHighlighted = false,
}: {
  user: CustomUser | null;
  count: number;
  price: number;
  color: string;
  label: string;
  priceId: string;
  labelPromo?: string;
  isHighlighted?: boolean;
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
      priceId,
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
    const colorMap: { [key: string]: { border: string; hoverBorder: string; text: string; bg: string; ribbonBg?: string; } } = {
      blue: {
        border: 'border-blue-200',
        hoverBorder: 'hover:border-blue-400',
        text: 'text-blue-600',
        bg: 'bg-blue-50',
      },
      green: {
        border: 'border-green-200',
        hoverBorder: 'hover:border-green-400',
        text: 'text-green-600',
        bg: 'bg-green-50',
      },
      purple: {
        border: 'border-purple-200',
        hoverBorder: 'hover:border-purple-400',
        text: 'text-purple-600',
        bg: 'bg-purple-50',
      },
      red: {
        border: 'border-red-200',
        hoverBorder: 'hover:border-red-400',
        text: 'text-red-600',
        bg: 'bg-red-50',
      },
      orange: {
        border: 'border-orange-200',
        hoverBorder: 'hover:border-orange-400',
        text: 'text-orange-600',
        bg: 'bg-orange-50',
        ribbonBg: 'bg-yellow-400', // Color del ribbon para "Más Popular"
      },
    };

    return colorMap[colorName] || colorMap.blue;
  };

  const colorClasses = getColorClasses(color);

  return (
    <div
      onClick={handleTokenClick}
      className={`relative rounded-[var(--radius)] p-6 shadow-md transition-all duration-300 transform hover:scale-105 cursor-pointer
        ${isHighlighted ? 'border-2 border-orange-500 bg-orange-100 ring-4 ring-orange-200 shadow-xl' : 'border-2 border-gray-200 bg-white hover:border-gray-400'}`}
    >
      {/* Cinta promocional */}
      {labelPromo && (
        <div className={`absolute top-8 -right-6 transform rotate-45 px-6 py-1 text-center text-xs font-bold text-white uppercase shadow-md
          ${isHighlighted ? 'bg-orange-500' : 'bg-red-500'}`}>
          {labelPromo}
        </div>
      )}

      {/* Contenido de la tarjeta */}
      <div className="flex flex-col h-full justify-between">
        <div className="flex items-center mb-4">
          <Zap className={`w-8 h-8 ${colorClasses.text}`} />
          <h3 className="text-2xl font-bold ml-2 text-gray-800">{count} Tokens</h3>
        </div>
        <p className="text-gray-600 mb-4">{label}</p>
        <div className="mt-auto">
          <span className={`text-4xl font-extrabold ${colorClasses.text}`}>€{price.toFixed(2)}</span>
          <p className="text-sm text-gray-500">€{(price / count).toFixed(2)} por token</p>
        </div>
      </div>

      {/* Modal de checkout */}
      <dialog ref={modalRef} className="modal bg-black/50">
        <div className="modal-box w-full max-h-[90vh] max-w-lg p-6 rounded-2xl bg-white shadow-2xl text-center">
          <p className="text-xl font-bold text-gray-800 mb-4">Finalizar compra</p>
          <p className="text-sm text-gray-600 mb-2">Pago seguro con Stripe</p>
          <div className="py-4">
            {showCheckout && selectedToken && (
              <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            )}
          </div>
          <div className="mt-4">
            <form method="dialog">
              <button
                className="py-2 px-4 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300 transition-all text-gray-800 w-full"
                onClick={handleCloseModal}
              >
                Cerrar
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
}
