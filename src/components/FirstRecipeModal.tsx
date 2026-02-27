"use client";

import React, { useEffect } from "react";
import { ChefHat, X, ShoppingBag } from "lucide-react";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useTranslation } from "react-i18next";

interface FirstRecipeModalProps {
  onClose: () => void;
  onGetMore: () => void;
}

export default function FirstRecipeModal({ onClose, onGetMore }: FirstRecipeModalProps) {
  useBodyScrollLock(true);
  const { t } = useTranslation();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="first-recipe-modal-title"
    >
      <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Gradient header */}
        <div className="bg-gradient-to-r from-[var(--highlight)] to-[var(--highlight-dark)] p-8 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ChefHat className="w-10 h-10 text-white" />
          </div>
          <h2 id="first-recipe-modal-title" className="text-2xl font-bold text-white mb-2">
            {t("firstRecipeModal.title")}
          </h2>
          <p className="text-white/90 text-sm leading-relaxed">
            {t("firstRecipeModal.subtitle")}
          </p>
        </div>

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          aria-label={t("firstRecipeModal.close")}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Body */}
        <div className="p-6 text-center">
          <p className="text-gray-600 mb-2 text-sm">
            {t("firstRecipeModal.remaining")}
          </p>
          <p className="text-4xl font-bold text-[var(--highlight)] mb-1">4</p>
          <p className="text-xs text-gray-400 mb-6">
            {t("firstRecipeModal.remainingLabel")}
          </p>

          <p className="text-gray-700 mb-6 leading-relaxed">
            {t("firstRecipeModal.cta")}
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={onGetMore}
              className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-gradient-to-r from-[var(--highlight)] to-[var(--highlight-dark)] text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <ShoppingBag className="w-5 h-5" />
              {t("firstRecipeModal.buyMore")}
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 px-6 border-2 border-gray-200 text-gray-600 rounded-full font-semibold hover:bg-gray-50 transition"
            >
              {t("firstRecipeModal.viewRecipe")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
