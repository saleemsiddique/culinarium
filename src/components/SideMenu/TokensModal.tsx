import React, { useEffect } from "react";
import { Zap, X, Star } from "lucide-react";
import { CustomUser } from "@/context/user-context";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { useCallback, useRef, useState } from "react";
import TokenPurchaseCards from "@/components/TokenPurchaseCards";

interface TokensModalProps {
  onClose: () => void;
  user: CustomUser | null;
}

export const TokensModal: React.FC<TokensModalProps> = ({ onClose, user }) => {
  const extra = user?.extra_tokens || 0;
  const monthly = user?.monthly_tokens || 0;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {/* Modal container: ancho responsivo y altura limitada */}
      <div className="bg-white rounded-3xl p-6 w-full max-w-5xl max-h-[85vh] overflow-hidden shadow-2xl relative flex flex-col">
        {/* Header: icono, título y botón cerrar */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                Comprar Tokens Extra
              </h2>
              <p className="text-gray-600 text-sm">
                Tokens actuales:{" "}
                <span className="font-semibold text-gray-800">{extra} extra</span> +{" "}
                <span className="font-semibold text-gray-800">{monthly} mensuales</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition absolute top-4 right-4"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenido: lista de tarjetas en grid y scrollable */}
        <div
          className="flex-grow overflow-y-auto px-2 -mx-2 pb-2"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            <TokenPurchaseCards user={user} count={30} price={0.99} color="blue" label="Uso puntual (3 recetas)" priceId="price_1RrL5F2LSjDC5txTL3uBh13K" />
            <TokenPurchaseCards user={user} count={60} price={1.99} color="purple" label="Uso ocasional (6 recetas)" priceId="price_1RrL6V2LSjDC5txT4rjhvL16" />
            <TokenPurchaseCards user={user} count={120} price={3.99} color="green" label="Uso semanal (12 recetas)" priceId="price_1RrL7H2LSjDC5txTqcpnGZYE" />
            <TokenPurchaseCards user={user} count={250} price={6.99} color="orange" label="Uso frecuente (25 recetas)" priceId="price_1RrL7b2LSjDC5txTUKbWlDO5" labelPromo="Más Popular" isHighlighted />
            <TokenPurchaseCards user={user} count={600} price={13.99} color="red" label="Uso intensivo (60 recetas)" priceId="price_1RrL7r2LSjDC5txTy0i2I8MY" labelPromo="Mejor Valor" />
            <TokenPurchaseCards user={user} count={1200} price={24.99} color="blue" label="Uso profesional (120 recetas)" priceId="price_1RrL8A2LSjDC5txT9vjD59AH" />
          </div>
        </div>
      </div>
    </div>
  );
};
