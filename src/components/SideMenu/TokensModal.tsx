import React from "react";
import { Zap } from "lucide-react";
import { CustomUser } from "@/context/user-context";


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

        <div className="space-y-3 mb-6">
          {[{count:10, price:4.99, color:"blue", label:"Ideal para uso regular"},
            {count:25, price:9.99, color:"purple", label:"Mejor valor", popular:true},
            {count:50, price:14.99, color:"green", label:"Para usuarios frecuentes"}
          ].map(({count, price, color, label, popular}) => (
            <div key={count} onClick={onClose} className={`border-2 border-${color}-200 rounded-lg p-4 hover:border-${color}-400 cursor-pointer transition-all relative`}>
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

        <div className="flex space-x-3">
          <button onClick={onClose} className="flex-1 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};