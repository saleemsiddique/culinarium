"use client";
import { motion } from "framer-motion";
import { PiCookingPotFill } from "react-icons/pi";
import { GiMeal, GiWeightScale } from "react-icons/gi";
import { RiSparklingFill } from "react-icons/ri";
import { useTranslation } from "react-i18next";

export default function InfoBox() {
  const { t } = useTranslation();

  const features = [
    {
      name: t("infoBox.features.recipeGeneration.name"),
      description: t("infoBox.features.recipeGeneration.description"),
      icon: PiCookingPotFill,
      stat: "10s",
      statLabel: t("infoBox.statLabels.generation", { defaultValue: "por receta" }),
      gradient: "from-[var(--highlight)] to-[var(--highlight-dark)]",
    },
    {
      name: t("infoBox.features.adaptedRecipes.name"),
      description: t("infoBox.features.adaptedRecipes.description"),
      icon: GiMeal,
      stat: "15+",
      statLabel: t("infoBox.statLabels.cuisines", { defaultValue: "estilos culinarios" }),
      gradient: "from-[var(--primary)] to-[#1A252F]",
    },
    {
      name: t("infoBox.features.enhancedExperience.name"),
      description: t("infoBox.features.enhancedExperience.description"),
      icon: RiSparklingFill,
      stat: "IA",
      statLabel: t("infoBox.statLabels.ai", { defaultValue: "GPT-4 + DALL-E" }),
      gradient: "from-[var(--highlight)] to-[var(--primary)]",
    },
    {
      name: t("infoBox.features.macrosCalculation.name"),
      description: t("infoBox.features.macrosCalculation.description"),
      icon: GiWeightScale,
      stat: "5",
      statLabel: t("infoBox.statLabels.macros", { defaultValue: "niveles de macros" }),
      gradient: "from-emerald-500 to-emerald-700",
    },
  ];

  return (
    <div className="w-full bg-[var(--background)] py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-block px-5 py-2 bg-gradient-to-r from-[var(--highlight)] to-[var(--highlight-dark)] rounded-full text-white text-sm font-semibold uppercase tracking-widest mb-6"
          >
            {t("infoBox.badge")}
          </motion.span>

          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--primary)] leading-tight mb-5">
            {t("infoBox.title")}{" "}
            <span className="bg-gradient-to-r from-[var(--highlight)] to-[var(--highlight-dark)] bg-clip-text text-transparent">
              {t("infoBox.cooking")}
            </span>
          </h2>

          <p className="text-lg text-[var(--foreground)]/70 max-w-2xl mx-auto leading-relaxed">
            {t("infoBox.description")}
          </p>
        </motion.div>

        {/* Features Grid - Bento style */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: index * 0.12 }}
              whileHover={{ y: -4, transition: { duration: 0.25 } }}
              className="group relative bg-white rounded-2xl p-8 border border-[var(--highlight)]/10
                         shadow-sm hover:shadow-xl hover:border-[var(--highlight)]/30 transition-all duration-300 overflow-hidden"
            >
              {/* Subtle background decoration */}
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-500"
                style={{ backgroundImage: `linear-gradient(135deg, var(--highlight), var(--primary))` }}
              />

              <div className="relative flex gap-6">
                {/* Icon */}
                <div className={`flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg`}>
                  <feature.icon size={32} color="white" aria-hidden="true" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-xl font-bold text-[var(--primary)] mb-2 leading-tight">
                    {feature.name}
                  </h3>
                  <p className="text-[var(--foreground)]/70 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>

              {/* Stat pill */}
              <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--background)] border border-[var(--highlight)]/15">
                <span className="text-lg font-bold text-[var(--highlight)]">{feature.stat}</span>
                <span className="text-xs text-[var(--foreground)]/50 font-medium">{feature.statLabel}</span>
              </div>

              {/* Bottom accent line */}
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "48px" }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                className={`h-1 rounded-full bg-gradient-to-r ${feature.gradient} mt-5`}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
