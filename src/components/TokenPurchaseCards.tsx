"use client";

import React from "react";
import { Zap } from "lucide-react";
import { CustomUser } from "@/context/user-context";

interface TokenPurchaseCardsProps {
  user: CustomUser | null;
  count: number;
  price: number;
  color: string;
  label: string;
  priceId: string;
  labelPromo?: string;
  isHighlighted?: boolean;
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
}: TokenPurchaseCardsProps) {
  const userId = user?.uid ?? null;

  const handlePurchase = async () => {
    try {
      // 1. Llamar a tu API para crear la sesión de redirección
      const res = await fetch("/api/embedded-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, userId }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "Error del servidor.");
        throw new Error(`Error en el servidor: ${res.status} ${text}`);
      }

      const data = await res.json();
      
      // 2. Redirigir al usuario a la URL de Stripe
      window.location.href = data.url;

    } catch (error) {
      console.error("Error al iniciar el pago:", error);
      alert("No se pudo iniciar el proceso de pago. Por favor, inténtelo de nuevo.");
    }
  };

  const getColorClasses = (colorName: string) => {
    // ... (Tu función getColorClasses se mantiene igual)
    const colorMap: { [key: string]: { border: string; hoverBorder: string; text: string; bg: string; ribbonBg?: string } } = {
      blue: { border: "border-blue-200", hoverBorder: "hover:border-blue-400", text: "text-blue-600", bg: "bg-blue-50" },
      green: { border: "border-green-200", hoverBorder: "hover:border-green-400", text: "text-green-600", bg: "bg-green-50" },
      purple: { border: "border-purple-200", hoverBorder: "hover:border-purple-400", text: "text-purple-600", bg: "bg-purple-50" },
      red: { border: "border-red-200", hoverBorder: "hover:border-red-400", text: "text-red-600", bg: "bg-red-50" },
      orange: { border: "border-orange-200", hoverBorder: "hover:border-orange-400", text: "text-orange-600", bg: "bg-orange-50", ribbonBg: "bg-yellow-400" },
    };
    return colorMap[colorName] || colorMap.blue;
  };
  
  const colorClasses = getColorClasses(color);

  return (
    <button
      type="button"
      onClick={handlePurchase}
      className={`relative w-full text-left rounded-[var(--radius)] p-6 shadow-md transition-all duration-300 transform hover:scale-105 cursor-pointer
        ${isHighlighted ? "border-2 border-orange-500 bg-orange-100 ring-4 ring-orange-200 shadow-xl" : "border-2 border-gray-200 bg-white hover:border-gray-400"}`}
      aria-label={`Comprar ${count} tokens por ${price.toFixed(2)}€`}
    >
      {labelPromo && (
        <div
          className={`absolute top-8 -right-6 transform rotate-45 px-6 py-1 text-center text-xs font-bold text-white uppercase shadow-md
          ${isHighlighted ? "bg-orange-500" : "bg-red-500"}`}
        >
          {labelPromo}
        </div>
      )}
      <div className="flex flex-col h-full justify-between">
        <div className="flex items-center mb-4">
          <Zap className={`w-8 h-8 ${colorClasses.text}`} />
          <h3 className="text-2xl font-bold ml-2 text-gray-800">
            {count} Tokens
          </h3>
        </div>
        <p className="text-gray-600 mb-4">{label}</p>
        <div className="mt-auto text-left">
          <span className={`text-4xl font-extrabold ${colorClasses.text}`}>
            €{price.toFixed(2)}
          </span>
          <p className="text-sm text-gray-500">
            €{(price / count).toFixed(2)} por token
          </p>
        </div>
      </div>
    </button>
  );
}