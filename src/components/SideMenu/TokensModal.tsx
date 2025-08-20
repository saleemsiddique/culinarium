import React, { useEffect } from "react";
import { Zap, X } from "lucide-react";
import { CustomUser } from "@/context/user-context";
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
      {/* Modal container - Aumentado el tamaño máximo y altura */}
      <div 
        className="rounded-3xl p-8 w-full max-w-7xl max-h-[95vh] min-h-[80vh] shadow-2xl relative flex flex-col"
        style={{ backgroundColor: 'var(--background)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center shadow-md"
              style={{ 
                background: 'linear-gradient(135deg, var(--highlight) 0%, var(--highlight-dark) 100%)' 
              }}
            >
              <Zap className="w-8 h-8" style={{ color: 'var(--text2)' }} />
            </div>
            <div>
              <h2 
                className="text-2xl font-bold mb-1"
                style={{ color: 'var(--foreground)' }}
              >
                Comprar Tokens Extra
              </h2>
              <p 
                className="text-sm opacity-80"
                style={{ color: 'var(--foreground)' }}
              >
                Tokens actuales:{" "}
                <span className="font-semibold">{extra} extra</span> +{" "}
                <span className="font-semibold">{monthly} mensuales</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="p-2 rounded-full hover:bg-black/10 transition absolute top-6 right-6"
            style={{ color: 'var(--foreground)' }}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenido - Removido overflow y aumentado padding */}
        <div className="flex-grow">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
            <TokenPurchaseCards 
              user={user} 
              count={30} 
              price={0.99} 
              label="Uso puntual (3 recetas)" 
              priceId="price_1RwHKLRpBiBhmezmK1AybT5C" 
              labelPromo="Oferta" 
              promoType="limited"
            />
            <TokenPurchaseCards 
              user={user} 
              count={60} 
              price={1.99} 
              label="Uso ocasional (6 recetas)" 
              priceId="price_1RwHL6RpBiBhmezmsEhJyMC1" 
            />
            <TokenPurchaseCards 
              user={user} 
              count={120} 
              price={3.49} 
              label="Uso semanal (12 recetas)" 
              priceId="price_1RwHLWRpBiBhmezmY3vPGDxT" 
            />
            <TokenPurchaseCards 
              user={user} 
              count={250} 
              price={6.49} 
              label="Uso frecuente (25 recetas)" 
              priceId="price_1RwHLrRpBiBhmezmFamEW9Ct"
            />
            <TokenPurchaseCards 
              user={user} 
              count={600} 
              price={13.99} 
              label="Uso intensivo (60 recetas)" 
              priceId="price_1RwHMCRpBiBhmezmRzyb4DAm" 
              labelPromo="Más Popular" 
              promoType="popular"
            />
            <TokenPurchaseCards 
              user={user} 
              count={1200} 
              price={24.99} 
              label="Uso profesional (120 recetas)" 
              priceId="price_1RwHMbRpBiBhmezmgyMbGrJq" 
              labelPromo="Mejor Valor" 
              promoType="value"
            />
          </div>
        </div>
      </div>
    </div>
  );
};