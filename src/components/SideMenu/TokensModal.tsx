import React from "react";
import { Zap } from "lucide-react";
import { CustomUser } from "@/context/user-context";
import  TokenPurchaseCards from "@/components/TokenPurchaseCards";

interface TokensModalProps {
  onClose: () => void;
  user: CustomUser | null;
}

export const TokensModal: React.FC<TokensModalProps> = ({ onClose, user }) => {
  const extra = user?.extra_tokens || 0;
  const monthly = user?.monthly_tokens || 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Comprar Tokens Extra</h2>
          <p className="text-gray-600">Tokens actuales: {extra} extra + {monthly} mensuales</p>
        </div>

        <TokenPurchaseCards user={user} count={30} price={0.99} color="blue" label="Uso puntual (3 recetas)" priceId="price_1RrL5F2LSjDC5txTL3uBh13K" />
        <TokenPurchaseCards user={user} count={60} price={1.99} color="purple" label="Uso ocasional (6 recetas)" priceId="price_1RrL6V2LSjDC5txT4rjhvL16" />
        <TokenPurchaseCards user={user} count={120} price={3.99} color="green" label="Uso semanal (12 recetas)" priceId="price_1RrL7H2LSjDC5txTqcpnGZYE" />
        <TokenPurchaseCards user={user} count={250} price={6.99} color="orange" label="Uso frecuente (25 recetas)" priceId="price_1RrL7b2LSjDC5txTUKbWlDO5" />
        <TokenPurchaseCards user={user} count={600} price={13.99} color="red" label="Uso intensivo (60 recetas)" priceId="price_1RrL7r2LSjDC5txTy0i2I8MY" />
        <TokenPurchaseCards user={user} count={1200} price={24.99} color="blue" label="Uso profesional (120 recetas)" priceId="price_1RrL8A2LSjDC5txT9vjD59AH" />

        

        <div className="flex space-x-3">
          <button onClick={onClose} className="flex-1 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};