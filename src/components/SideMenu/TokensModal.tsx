"use client";

import React, { useEffect } from "react";
import { Zap, X } from "lucide-react";
import { CustomUser } from "@/context/user-context";
import TokenPurchaseCards from "@/components/TokenPurchaseCards";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useTranslation } from "react-i18next";

interface TokensModalProps {
  onClose: () => void;
  user: CustomUser | null;
}

export const TokensModal: React.FC<TokensModalProps> = ({ onClose, user }) => {
  useBodyScrollLock(true); // Bloquea el scroll mientras el modal esté montado

  const extra = user?.extra_tokens || 0;
  const monthly = user?.monthly_tokens || 0;
  const { t } = useTranslation();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"> {/* Cambiado p-6 a p-4 para mejor ajuste en móvil */}
      {/* Modal container - Aumentado el tamaño máximo y altura */}
      <div
        className="rounded-3xl p-6 md:p-8 w-full max-w-7xl max-h-[95vh] shadow-2xl relative flex flex-col"
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
                {t("tokens.modal.title")}
              </h2>
              <p
                className="text-sm opacity-80"
                style={{ color: 'var(--foreground)' }}
              >
                {t("tokens.modal.currentTokens")}{" "}
                <span className="font-semibold">{extra} {t("tokens.modal.extra")}</span> +{" "}
                <span className="font-semibold">{monthly} {t("tokens.modal.monthly")}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={t("tokens.modal.close")}
            className="p-2 rounded-full hover:bg-black/10 transition absolute top-6 right-6"
            style={{ color: 'var(--foreground)' }}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenido - Añadido overflow-y-auto y flex-grow para desplazamiento */}
        <div className="flex-grow overflow-y-auto p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
            <TokenPurchaseCards
              user={user}
              count={30}
              price={0.99}
              label={t("tokens.modal.packages.30.label")}
              priceId="price_1RwHKLRpBiBhmezmK1AybT5C"
              labelPromo={t("tokens.modal.packages.30.promo")}
              promoType="limited"
            />
            <TokenPurchaseCards
              user={user}
              count={60}
              price={1.99}
              label={t("tokens.modal.packages.60.label")}
              priceId="price_1RwHL6RpBiBhmezmsEhJyMC1"
            />
            <TokenPurchaseCards
              user={user}
              count={120}
              price={3.49}
              label={t("tokens.modal.packages.120.label")}
              priceId="price_1RwHLWRpBiBhmezmY3vPGDxT"
            />
            <TokenPurchaseCards
              user={user}
              count={250}
              price={6.49}
              label={t("tokens.modal.packages.250.label")}
              priceId="price_1RwHLrRpBiBhmezmFamEW9Ct"
            />
            <TokenPurchaseCards
              user={user}
              count={600}
              price={13.99}
              label={t("tokens.modal.packages.600.label")}
              priceId="price_1RwHMCRpBiBhmezmRzyb4DAm"
              labelPromo={t("tokens.modal.packages.600.promo")}
              promoType="popular"
            />
            <TokenPurchaseCards
              user={user}
              count={1200}
              price={24.99}
              label={t("tokens.modal.packages.1200.label")}
              priceId="price_1RwHMbRpBiBhmezmgyMbGrJq"
              labelPromo={t("tokens.modal.packages.1200.promo")}
              promoType="value"
            />
          </div>
        </div>
      </div>
    </div>
  );
};