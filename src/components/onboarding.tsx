"use client";
import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

const STEP_ICONS = ["👋", "🍳", "🎁", "🚀"];

export default function Onboarding({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  const steps = Array.isArray(t("onboarding.steps", { returnObjects: true }))
    ? (t("onboarding.steps", { returnObjects: true }) as Array<{ title: string; image: string; text: string }>)
    : [];

  const goNext = () => {
    if (step < steps.length - 1) {
      setDirection(1);
      setStep(step + 1);
    } else {
      localStorage.setItem("hasSeenOnboarding", "true");
      onClose();
    }
  };

  const goPrev = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  const skip = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    onClose();
  };

  const current = steps[step];
  if (!current) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.25 }}
        className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: "90vh" }}
      >
        {/* Top gradient banner */}
        <div className="h-2 w-full" style={{ background: "linear-gradient(to right, var(--highlight), var(--highlight-dark))" }} />

        {/* Skip button */}
        {step < steps.length - 1 && (
          <button
            onClick={skip}
            className="absolute top-5 right-5 text-sm text-gray-400 hover:text-gray-600 transition-colors z-10"
          >
            Saltar
          </button>
        )}

        {/* Step progress */}
        <div className="flex items-center justify-center gap-2 pt-5 pb-2 px-6">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > step ? 1 : -1); setStep(i); }}
              className="transition-all duration-300"
              aria-label={`Paso ${i + 1}`}
            >
              {i === step ? (
                <span
                  className="flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-bold shadow-md"
                  style={{ background: "linear-gradient(135deg, var(--highlight), var(--highlight-dark))" }}
                >
                  {i + 1}
                </span>
              ) : (
                <span className={`block rounded-full transition-all duration-300 ${i < step ? "w-5 h-2" : "w-2 h-2"}`}
                  style={{ background: i < step ? "var(--highlight)" : "#D1D5DB" }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="px-6 pb-4 pt-3 flex flex-col items-center text-center"
            >
              {/* Image or emoji fallback */}
              <div className="w-full rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center"
                style={{ minHeight: 180 }}
              >
                {!imgErrors[step] ? (
                  <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
                    <Image
                      src={current.image}
                      alt={current.title}
                      fill
                      className="object-cover"
                      onError={() => setImgErrors(prev => ({ ...prev, [step]: true }))}
                      unoptimized
                    />
                  </div>
                ) : (
                  <span className="text-7xl py-8">{STEP_ICONS[step] || "🍽️"}</span>
                )}
              </div>

              <h2 className="text-xl font-bold text-gray-800 mb-2 leading-tight">
                {current.title}
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed max-w-sm">
                {current.text}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="px-6 pb-6 pt-2 flex gap-3">
          {step > 0 ? (
            <button
              onClick={goPrev}
              className="flex-none py-3 px-5 rounded-full border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {t("onboarding.buttons.back")}
            </button>
          ) : (
            <div className="flex-none w-0" />
          )}

          <button
            onClick={goNext}
            className="flex-1 py-3 px-5 rounded-full text-sm font-bold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "linear-gradient(to right, var(--highlight), var(--highlight-dark))" }}
          >
            {step < steps.length - 1 ? t("onboarding.buttons.next") : t("onboarding.buttons.finish")}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
