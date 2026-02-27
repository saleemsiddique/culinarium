import React, { useState } from "react";
import { Crown, CheckCircle, X, Star } from "lucide-react";
import { CustomUser } from "@/context/user-context";
import EmbeddedCheckoutButton from "../EmbeddedCheckoutForm";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useTranslation } from "react-i18next";

interface PremiumModalProps {
  onClose: () => void;
  onSubscribe: () => void;
  user: CustomUser | null;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({ onClose, user }) => {
  useBodyScrollLock(true);
  const { t } = useTranslation();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const isSubscribed = user?.isSubscribed || false;
  const features: string[] = t("premium.modal.notSubscribed.features", { returnObjects: true }) as string[];

  const monthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM || "price_1RwHJCRpBiBhmezm4D1fPQt5";
  const annualPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_ANNUAL || monthlyPriceId;
  const selectedPriceId = billingCycle === 'annual' ? annualPriceId : monthlyPriceId;

  const priceLabel = billingCycle === 'annual'
    ? t("premium.modal.notSubscribed.priceAnnual")
    : t("premium.modal.notSubscribed.price");
  const priceSubLabel = billingCycle === 'annual'
    ? t("premium.modal.notSubscribed.priceAnnualPerMonth")
    : null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="premium-modal-title"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white rounded-3xl w-full max-w-lg mx-auto shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Botón de cerrar */}
          <button
            onClick={onClose}
            aria-label={t("premium.modal.close")}
            className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Contenido principal (desplazable) */}
          <div className="flex-grow overflow-y-auto p-6 md:p-8">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <h2 id="premium-modal-title" className="text-3xl font-bold text-gray-800 mb-2">
                {t("premium.modal.title")}
              </h2>
              <p className="text-gray-600 px-4 sm:px-0">
                {isSubscribed
                  ? t("premium.modal.subscribed.thankYou")
                  : (user?.firstName
                      ? t("premium.modal.notSubscribed.greeting", { name: user.firstName })
                      : t("premium.modal.notSubscribed.greetingFallback"))
                }
              </p>
            </div>

            {isSubscribed ? (
              <div className="flex-grow flex flex-col items-center justify-center text-center px-2 -mx-2 pb-2">
                <div className="p-6 md:p-8 bg-gray-50 rounded-2xl border border-gray-200 w-full max-w-md">
                  <div className="w-20 h-20 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                    <Star className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {t("premium.modal.subscribed.title")}
                  </h3>
                  <p className="text-gray-600 mb-4">{t("premium.modal.subscribed.message")}</p>
                  <p className="text-gray-600 text-sm mt-4">
                    <span className="font-semibold">
                      {t("premium.modal.subscribed.renewal", {
                        date: user?.lastRenewal
                          ? formatDate(new Date(user.lastRenewal.toDate().getTime() + 30 * 24 * 60 * 60 * 1000))
                          : 'N/A'
                      })}
                    </span>
                    .
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Toggle mensual / anual */}
                <div className="flex items-center justify-center gap-3 mb-5">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                      billingCycle === 'monthly'
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t("premium.modal.notSubscribed.billingMonthly")}
                  </button>
                  <button
                    onClick={() => setBillingCycle('annual')}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                      billingCycle === 'annual'
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t("premium.modal.notSubscribed.billingAnnual")}
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                      billingCycle === 'annual'
                        ? 'bg-white/30 text-white'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {t("premium.modal.notSubscribed.annualSave")}
                    </span>
                  </button>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 mb-6 border border-amber-100">
                  <div className="text-center mb-4">
                    <span className="text-4xl font-bold text-transparent bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text">
                      {priceLabel}
                    </span>
                    {priceSubLabel && (
                      <p className="text-sm text-gray-500 mt-1">{priceSubLabel}</p>
                    )}
                  </div>
                  <ul className="space-y-3 text-left">
                    {features.map((item, index) => (
                      <li key={index} className="flex items-start text-sm md:text-base">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mr-3" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>

          {/* Botones de acción */}
          <div className="p-6 md:p-8 pt-0 bg-white">
            {isSubscribed ? (
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto py-3 px-6 border-2 border-gray-300 rounded-full font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  {t("premium.modal.subscribed.close")}
                </button>
                <Link
                  href="/profile"
                  className="w-full sm:w-auto flex items-center justify-center py-3 px-6 bg-gradient-to-r from-[var(--highlight)] to-[var(--highlight-dark)] text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {t("premium.modal.subscribed.manage")}
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto py-3 px-6 border-2 border-gray-300 rounded-full font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  {t("premium.modal.notSubscribed.cancel")}
                </button>
                <EmbeddedCheckoutButton priceId={selectedPriceId} user={user} />
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
