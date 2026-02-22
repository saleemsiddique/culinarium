"use client";

import React, { useEffect } from "react";
import { ShoppingBag, X } from "lucide-react";
import { CustomUser } from "@/context/user-context";
import TokenPurchaseCards from "@/components/TokenPurchaseCards";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useTranslation } from "react-i18next";

interface TokensModalProps {
  onClose: () => void;
  user: CustomUser | null;
}

export const TokensModal: React.FC<TokensModalProps> = ({ onClose, user }) => {
  useBodyScrollLock(true);

  const extra = user?.extra_tokens || 0;
  const monthly = user?.monthly_tokens || 0;
  const totalRecipes = Math.floor((extra + monthly) / 10);
  const { t } = useTranslation();
  const isActiveSubscriber = user?.isSubscribed &&
    (user?.subscriptionStatus === 'active' || user?.subscriptionStatus === 'cancel_at_period_end');

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tokens-modal-title"
    >
      <div
        className="rounded-3xl p-6 md:p-8 w-full max-w-lg max-h-[95vh] shadow-2xl relative flex flex-col"
        style={{ backgroundColor: 'var(--background)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center shadow-md"
              style={{ background: 'linear-gradient(135deg, var(--highlight) 0%, var(--highlight-dark) 100%)' }}
            >
              <ShoppingBag className="w-8 h-8" style={{ color: 'var(--text2)' }} />
            </div>
            <div>
              <h2
                id="tokens-modal-title"
                className="text-2xl font-bold mb-1"
                style={{ color: 'var(--foreground)' }}
              >
                {t("tokens.modal.title")}
              </h2>
              <p className="text-sm opacity-80" style={{ color: 'var(--foreground)' }}>
                {t("tokens.modal.currentTokens")}{" "}
                <span className="font-semibold text-lg" style={{ color: 'var(--highlight)' }}>
                  {isActiveSubscriber ? '∞' : totalRecipes}
                </span>
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

        {/* Single pack */}
        <div className="flex-grow overflow-y-auto">
          <div className="flex justify-center p-4">
            <div className="w-full max-w-sm">
              <TokenPurchaseCards
                user={user}
                count={150}
                price={4.99}
                label={t("tokens.modal.packages.150.label")}
                priceId={process.env.NEXT_PUBLIC_STRIPE_PRICE_PAYG || "price_1RwHMbRpBiBhmezmgyMbGrJq"}
                labelPromo={t("tokens.modal.packages.150.promo")}
                promoType="popular"
              />
            </div>
          </div>
          <p className="text-center text-sm opacity-60 mt-4 px-4" style={{ color: 'var(--foreground)' }}>
            Las recetas no caducan y se acumulan con tu plan actual
          </p>
        </div>
      </div>
    </div>
  );
};
