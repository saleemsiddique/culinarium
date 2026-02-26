"use client";

import React from "react";
import { Sun, UtensilsCrossed, Moon, Apple } from "lucide-react";
import { useTranslation } from "react-i18next";

const MEAL_ICONS = {
  breakfast: Sun,
  lunch: UtensilsCrossed,
  dinner: Moon,
  snack: Apple,
} as const;

interface MealTimeSelectorProps {
  mealTime: string | null;
  mealTimeError: boolean;
  onSelect: (value: string) => void;
}

export default function MealTimeSelector({
  mealTime,
  mealTimeError,
  onSelect,
}: MealTimeSelectorProps) {
  const { t } = useTranslation();

  const mealTimes = [
    { label: t("culinarium.form.sections.mealTime.options.breakfast.label"), value: "breakfast" },
    { label: t("culinarium.form.sections.mealTime.options.lunch.label"), value: "lunch" },
    { label: t("culinarium.form.sections.mealTime.options.dinner.label"), value: "dinner" },
    { label: t("culinarium.form.sections.mealTime.options.snack.label"), value: "snack" },
  ];

  return (
    <section>
      <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">
        {t("culinarium.form.sections.mealTime.title")}
      </h2>
      <div className="flex gap-2">
        {mealTimes.map((time) => {
          const IconComp = MEAL_ICONS[time.value as keyof typeof MEAL_ICONS];
          const isSelected = mealTime === time.value;
          return (
            <button
              key={time.value}
              type="button"
              onClick={() => onSelect(time.value)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all text-sm font-medium ${
                isSelected
                  ? "border-[var(--highlight)] bg-[var(--highlight)] text-white shadow-md"
                  : mealTimeError
                    ? "border-red-300 bg-red-50/30 text-[var(--foreground)] hover:border-[var(--highlight)]"
                    : "border-[var(--primary)]/20 text-[var(--foreground)] hover:border-[var(--highlight)] hover:bg-[var(--highlight)]/5"
              }`}
            >
              <IconComp className="w-5 h-5" />
              <span className="text-xs leading-tight">{time.label}</span>
            </button>
          );
        })}
      </div>
      {mealTimeError && (
        <p className="text-red-500 text-xs mt-1.5">
          {t("culinarium.form.sections.mealTime.error")}
        </p>
      )}
    </section>
  );
}
