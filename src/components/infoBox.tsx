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
      gradient: "from-[var(--highlight)] to-[var(--highlight-dark)]",
    },
    {
      name: t("infoBox.features.adaptedRecipes.name"),
      description: t("infoBox.features.adaptedRecipes.description"),
      icon: GiMeal,
      gradient: "from-[var(--primary)] to-[#1A252F]",
    },
    {
      name: t("infoBox.features.enhancedExperience.name"),
      description: t("infoBox.features.enhancedExperience.description"),
      icon: RiSparklingFill,
      gradient: "from-[var(--highlight)] to-[var(--primary)]",
    },
    {
      name: t("infoBox.features.macrosCalculation.name"),
      description: t("infoBox.features.macrosCalculation.description"),
      icon: GiWeightScale,
      gradient: "from-[#1ABC9C] to-[#16A085]",
    }
  ];

  return (
    <div className="bg-[var(--background)] text-[var(--foreground)] w-full py-20 md:py-28">
      <div className="w-full max-w-6xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="inline-block px-4 py-1.5 bg-gradient-to-r from-[var(--highlight)] to-[var(--highlight-dark)] rounded-full text-white text-xs font-bold uppercase tracking-wider mb-5"
          >
            {t("infoBox.badge")}
          </motion.span>

          <h2 className="font-display text-3xl md:text-5xl font-bold text-[var(--primary)] leading-tight mb-4">
            {t("infoBox.title")}{" "}
            <span className="bg-gradient-to-r from-[var(--highlight)] to-[var(--highlight-dark)] bg-clip-text text-transparent">
              {t("infoBox.cooking")}
            </span>
          </h2>

          <p className="text-base md:text-lg text-[var(--foreground)]/70 max-w-xl mx-auto leading-relaxed">
            {t("infoBox.description")}
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map((feature, index) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative bg-white rounded-2xl p-7 md:p-8 border border-[var(--border-subtle)] shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-default"
            >
              {/* Icon */}
              <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-5 shadow-md group-hover:scale-105 transition-transform duration-300`}>
                <feature.icon size={28} color="white" />
              </div>

              {/* Content */}
              <h3 className="font-display text-xl font-bold text-[var(--primary)] mb-2.5 leading-snug">
                {feature.name}
              </h3>

              <p className="text-[var(--foreground)]/60 text-sm leading-relaxed">
                {feature.description}
              </p>

              {/* Decorative line */}
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "48px" }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                className={`h-1 bg-gradient-to-r ${feature.gradient} rounded-full mt-5`}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
