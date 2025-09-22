"use client";
import { useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";

export default function Onboarding({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);

  const steps = Array.isArray(t("onboarding.steps", { returnObjects: true }))
    ? (t("onboarding.steps", { returnObjects: true }) as Array<{ title: string; image: string; text: string }>)
    : [];

  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem("hasSeenOnboarding", "true");
      onClose();
    }
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-xl p-6 shadow-lg w-[800px] text-center">
        
        <h2 className="text-2xl font-bold">{steps[step].title}</h2>
        <Image
          src={steps[step].image}
          alt={steps[step].title}
          width={800}
          height={400}
          className="mx-auto mt-4 border-black border-2 rounded-lg"
        />
        <p className="mt-2 text-gray-700 font-bold">{steps[step].text}</p>

        {/* Controles de navegación */}
        <div className="flex justify-between mt-6">
          {step > 0 ? (
            <button
              onClick={prevStep}
              className="bg-gray-300 px-4 py-2 rounded-lg"
            >
              {t("onboarding.buttons.back")}
            </button>
          ) : (
            <div></div>
          )}

          <button
            onClick={nextStep}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            {step < steps.length - 1 ? t("onboarding.buttons.next") 
              : t("onboarding.buttons.finish")}
          </button>
        </div>

        {/* Indicadores de progreso */}
        <div className="flex justify-center mt-4 space-x-2">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full ${
                i === step ? "bg-blue-600" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
