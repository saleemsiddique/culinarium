"use client";

import { motion } from "framer-motion";
import { ChefHat, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function CTASection() {
  const { t } = useTranslation();

  return (
    <div className="w-full bg-gradient-to-br from-[var(--highlight)] via-[#d4741e] to-[var(--highlight-dark)] py-20 px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
          <ChefHat className="w-8 h-8 text-white" />
        </div>

        <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
          {t("cta.title")}
        </h2>
        <p className="text-white/80 text-lg mb-8 leading-relaxed max-w-lg mx-auto">
          {t("cta.description")}
        </p>

        <Link href="/auth/register">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[var(--highlight-dark)] font-bold text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer"
          >
            {t("cta.button")}
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </Link>

        <p className="mt-5 text-white/60 text-sm">
          {t("cta.subtext")}
        </p>
      </motion.div>
    </div>
  );
}
