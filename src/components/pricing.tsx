"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

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
      ctaStyle: "outline",
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
      ctaStyle: "outline",
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
      ctaStyle: "solid",
    },
  ];

  return (
    <div className="w-full bg-[#4B3F2F] py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="font-bold text-base md:text-xl text-orange-200 mb-4">
            {t("pricing.section.label")}
          </div>
          <div className="font-bold text-3xl md:text-5xl text-white mb-4 leading-tight">
            {t("pricing.section.title")}
          </div>
          <p className="mt-4 text-lg text-orange-100 max-w-2xl mx-auto leading-relaxed">
            {t("pricing.section.subtitle")}
          </p>

          {/* Toggle mensual / anual */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                billingCycle === 'monthly'
                  ? 'bg-white text-orange-700 shadow-md'
                  : 'bg-white/10 text-orange-100 hover:bg-white/20'
              }`}
            >
              {t("pricing.annual.toggleMonthly")}
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                billingCycle === 'annual'
                  ? 'bg-white text-orange-700 shadow-md'
                  : 'bg-white/10 text-orange-100 hover:bg-white/20'
              }`}
            >
              {t("pricing.annual.toggleAnnual")}
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                billingCycle === 'annual'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-amber-400/80 text-amber-900'
              }`}>
                {t("pricing.annual.save")}
              </span>
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col items-center gap-8 mt-16 md:flex-row md:justify-center md:items-stretch lg:gap-6"
        >
          {pricingData.map((plan) => (
            <div
              key={plan.key}
              className={`w-full max-w-sm ${plan.isHighlighted ? 'md:scale-105 md:z-10' : ''}`}
            >
              <motion.div
                whileHover={{
                  y: -8,
                  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)'
                }}
                transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
                className={`flex flex-col h-full rounded-3xl p-8 transition-all duration-300 ease-out ${
                  plan.isHighlighted
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-2xl'
                    : 'bg-white text-slate-800 shadow-xl border-2 border-orange-200 hover:border-orange-300'
                }`}
              >
                <h3 className="text-xl font-bold mb-3">{plan.title}</h3>
                <p className={`text-sm mb-6 leading-6 ${plan.isHighlighted ? 'text-orange-50' : 'text-slate-600'}`}>
                  {plan.description}
                </p>

                <div className="flex items-baseline justify-center mb-1">
                  <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                  {plan.priceNote && (
                    <span className={`text-base font-semibold ml-1 ${plan.isHighlighted ? 'text-orange-100' : 'text-slate-500'}`}>
                      {plan.priceNote}
                    </span>
                  )}
                </div>
                {plan.subNote && (
                  <p className={`text-center text-sm mb-2 ${plan.isHighlighted ? 'text-orange-100' : 'text-slate-500'}`}>
                    {plan.subNote}
                  </p>
                )}

                <ul className="space-y-3 text-sm leading-6 mb-8 mt-6 flex-grow">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <svg
                        className={`h-5 w-5 flex-shrink-0 mr-3 mt-0.5 ${plan.isHighlighted ? 'text-white' : 'text-orange-600'}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className={plan.isHighlighted ? 'text-white' : 'text-slate-600'}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={plan.ctaHref}
                  className={`block w-full rounded-full py-3.5 px-6 text-center font-semibold shadow-lg transition-all duration-300 hover:shadow-xl ${
                    plan.isHighlighted
                      ? 'bg-white text-orange-700 hover:bg-orange-50'
                      : 'bg-gradient-to-r from-orange-600 to-orange-700 text-white hover:from-orange-700 hover:to-orange-800'
                  }`}
                >
                  {plan.ctaLabel}
                </a>
              </motion.div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
