"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { ChefHat, Sparkles, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/test-video.mp4" type="video/mp4" />
      </video>

      {/* Layered overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[var(--foreground)]/90" />
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--foreground)]/30 to-transparent" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8"
        >
          <Sparkles className="w-4 h-4 text-[var(--highlight)]" aria-hidden="true" />
          <span className="text-sm font-medium text-white/90 tracking-wide">
            {t("hero.badge", { defaultValue: "Potenciado por IA" })}
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[0.95] tracking-tight mb-6"
        >
          {t("hero.title", { defaultValue: "Tu cocina," })}
          <br />
          <span className="bg-gradient-to-r from-[var(--highlight)] to-amber-400 bg-clip-text text-transparent">
            {t("hero.titleHighlight", { defaultValue: "reinventada" })}
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          {t("hero.subtitle", { defaultValue: "Dinos qué tienes en la nevera y la IA creará recetas personalizadas para ti. Con foto incluida." })}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.a
            href="/auth/register"
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-lg
                       bg-gradient-to-r from-[var(--highlight)] to-[var(--highlight-dark)] text-white
                       shadow-lg shadow-[var(--highlight)]/25 transition-all duration-300
                       hover:shadow-xl hover:shadow-[var(--highlight)]/30"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <ChefHat className="w-5 h-5" aria-hidden="true" />
            {t("hero.cta", { defaultValue: "Crear mi cuenta gratis" })}
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </motion.a>

          <motion.a
            href="#pricing"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-lg
                       border-2 border-white/30 text-white backdrop-blur-sm
                       hover:bg-white/10 hover:border-white/50 transition-all duration-300"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {t("hero.ctaSecondary", { defaultValue: "Ver Precios" })}
          </motion.a>
        </motion.div>

        {/* Trust line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-8 text-sm text-white/40"
        >
          {t("hero.trust", { defaultValue: "Sin tarjeta de crédito \u00B7 5 recetas gratis al mes" })}
        </motion.p>
      </div>

      {/* Bottom gradient fade into page */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--background)] to-transparent" />
    </section>
  );
}
