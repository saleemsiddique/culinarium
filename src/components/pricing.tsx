"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Check, Shield } from "lucide-react";

export default function Pricing() {
  const { t } = useTranslation();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const premiumPrice = billingCycle === 'annual'
    ? t("pricing.annual.priceAnnual")
    : t("pricing.plans.premium.price");
  const premiumPriceNote = billingCycle === 'annual'
    ? t("pricing.annual.perYear")
    : t("pricing.common.perMonth");
  const premiumSubNote = billingCycle === 'annual'
    ? t("pricing.annual.perMonthEquiv")
    : null;

  const pricingData = [
    {
      key: "free",
      title: t("pricing.plans.free.title"),
      description: t("pricing.plans.free.description"),
      price: t("pricing.plans.free.price"),
      priceNote: null,
      subNote: null,
      features: t("pricing.plans.free.features", { returnObjects: true }) as string[],
      isHighlighted: false,
      ctaLabel: t("pricing.common.getStarted"),
      ctaHref: "/auth/register",
    },
    {
      key: "premium",
      title: t("pricing.plans.premium.title"),
      description: t("pricing.plans.premium.description"),
      price: premiumPrice,
      priceNote: premiumPriceNote,
      subNote: premiumSubNote,
      features: t("pricing.plans.premium.features", { returnObjects: true }) as string[],
      isHighlighted: true,
      ctaLabel: t("pricing.common.subscribe"),
      ctaHref: "/auth/register",
    },
    {
      key: "payg",
      title: t("pricing.plans.payg.title"),
      description: t("pricing.plans.payg.description"),
      price: t("pricing.plans.payg.price"),
      priceNote: t("pricing.plans.payg.priceNote"),
      subNote: null,
      features: t("pricing.plans.payg.features", { returnObjects: true }) as string[],
      isHighlighted: false,
      ctaLabel: t("pricing.common.buyNow"),
      ctaHref: "/auth/register",
    },
  ];

  return (
    <div className="w-full bg-[#3D3228] py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="text-sm font-bold uppercase tracking-wider text-orange-300">
            {t("pricing.section.label")}
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white mt-3 mb-4 leading-tight">
            {t("pricing.section.title")}
          </h2>
          <p className="mt-2 text-base text-orange-100/70 max-w-xl mx-auto leading-relaxed">
            {t("pricing.section.subtitle")}
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center bg-white/10 rounded-full p-1 mt-8">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                billingCycle === 'monthly'
                  ? 'bg-white text-[var(--foreground)] shadow-sm'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              {t("pricing.annual.toggleMonthly")}
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                billingCycle === 'annual'
                  ? 'bg-white text-[var(--foreground)] shadow-sm'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              {t("pricing.annual.toggleAnnual")}
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-400 text-green-900">
                {t("pricing.annual.save")}
              </span>
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col items-center gap-6 mt-14 md:flex-row md:justify-center md:items-stretch"
        >
          {pricingData.map((plan) => (
            <div
              key={plan.key}
              className={`w-full max-w-sm ${plan.isHighlighted ? 'md:scale-[1.05] md:z-10' : ''}`}
            >
              <motion.div
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className={`flex flex-col h-full rounded-3xl p-7 md:p-8 transition-all duration-300 relative ${
                  plan.isHighlighted
                    ? 'bg-gradient-to-br from-[var(--highlight)] to-[var(--highlight-dark)] text-white shadow-2xl shadow-orange-900/30'
                    : 'bg-white text-[var(--foreground)] shadow-xl border border-white/10'
                }`}
              >
                {/* Recommended badge */}
                {plan.isHighlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 bg-white text-[var(--highlight-dark)] text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
                      {t("pricing.common.recommended") || "Recomendado"}
                    </span>
                  </div>
                )}

                <h3 className="font-display text-xl font-bold mb-2 mt-1">{plan.title}</h3>
                <p className={`text-sm mb-6 leading-relaxed ${plan.isHighlighted ? 'text-white/80' : 'text-[var(--foreground)]/60'}`}>
                  {plan.description}
                </p>

                <div className="flex items-baseline justify-center mb-1">
                  <span className="font-display text-4xl font-bold tracking-tight">{plan.price}</span>
                  {plan.priceNote && (
                    <span className={`text-sm font-medium ml-1.5 ${plan.isHighlighted ? 'text-white/70' : 'text-[var(--foreground)]/50'}`}>
                      {plan.priceNote}
                    </span>
                  )}
                </div>
                {plan.subNote && (
                  <p className={`text-center text-xs mb-2 ${plan.isHighlighted ? 'text-white/60' : 'text-[var(--foreground)]/50'}`}>
                    {plan.subNote}
                  </p>
                )}

                <ul className="space-y-3 text-sm leading-relaxed mb-8 mt-6 flex-grow">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <Check className={`h-4 w-4 flex-shrink-0 mt-0.5 ${plan.isHighlighted ? 'text-white' : 'text-[var(--highlight)]'}`} />
                      <span className={plan.isHighlighted ? 'text-white/90' : 'text-[var(--foreground)]/70'}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={plan.ctaHref}
                  className={`block w-full rounded-full py-3.5 px-6 text-center font-semibold shadow-md transition-all duration-300 hover:shadow-lg ${
                    plan.isHighlighted
                      ? 'bg-white text-[var(--highlight-dark)] hover:bg-orange-50'
                      : 'bg-gradient-to-r from-[var(--highlight)] to-[var(--highlight-dark)] text-white'
                  }`}
                >
                  {plan.ctaLabel}
                </a>

                {plan.isHighlighted && (
                  <p className="text-center text-xs text-white/50 mt-3">
                    {t("pricing.common.cancelAnytime") || "Cancela cuando quieras"}
                  </p>
                )}
              </motion.div>
            </div>
          ))}
        </motion.div>

        {/* Trust indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2 mt-10 text-white/40 text-sm"
        >
          <Shield className="w-4 h-4" />
          <span>{t("pricing.common.securePayment") || "Pago seguro con Stripe"}</span>
        </motion.div>
      </div>
    </div>
  );
}
