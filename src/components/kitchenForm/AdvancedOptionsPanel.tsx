"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import Icon from "@mdi/react";
import FormTag from "./FormTag";
import ControlMacronutrientes from "./ControlMacronutrientes";
import type { MacroState } from "@/types/kitchen";
import type { UtensilDef } from "@/hooks/useRecipeForm";

type TabKey = "restrictions" | "cuisine" | "macros" | "utensils";

interface AdvancedOptionsPanelProps {
  // Restrictions
  dietaryRestrictions: string[];
  onDietaryChange: (option: string) => void;
  excludedIngredients: string[];
  currentExcluded: string;
  setCurrentExcluded: (v: string) => void;
  handleAddExcluded: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleRemoveExcluded: (label: string) => void;

  // Cuisine
  cuisineStyle: string | null;
  setCuisineStyle: (v: string | null) => void;

  // Macros
  macros: MacroState;
  handleMacrosChange: (state: MacroState) => void;

  // Utensils
  utensilsList: UtensilDef[];
  utensils: Record<string, boolean>;
  toggleUtensil: (key: string) => void;

  // Premium
  isSubscribed: boolean;
  onRequestUpgrade: () => void;
}

const CUISINE_STYLES = [
  { value: "japanese", labelKey: "culinarium.form.sections.cuisine.styles.japanese.label" },
  { value: "mexican", labelKey: "culinarium.form.sections.cuisine.styles.mexican.label" },
  { value: "italian", labelKey: "culinarium.form.sections.cuisine.styles.italian.label" },
  { value: "american", labelKey: "culinarium.form.sections.cuisine.styles.american.label" },
  { value: "spanish", labelKey: "culinarium.form.sections.cuisine.styles.spanish.label" },
  { value: "jamaican", labelKey: "culinarium.form.sections.cuisine.styles.jamaican.label" },
  { value: "indian", labelKey: "culinarium.form.sections.cuisine.styles.indian.label" },
];

const DIETARY_OPTIONS = [
  { value: "vegetarian", labelKey: "culinarium.form.sections.restrictions.options.vegetarian" },
  { value: "vegan", labelKey: "culinarium.form.sections.restrictions.options.vegan" },
  { value: "gluten-free", labelKey: "culinarium.form.sections.restrictions.options.glutenFree" },
  { value: "lactose-free", labelKey: "culinarium.form.sections.restrictions.options.lactoseFree" },
  { value: "keto", labelKey: "culinarium.form.sections.restrictions.options.keto" },
];

export default function AdvancedOptionsPanel({
  dietaryRestrictions,
  onDietaryChange,
  excludedIngredients,
  currentExcluded,
  setCurrentExcluded,
  handleAddExcluded,
  handleRemoveExcluded,
  cuisineStyle,
  setCuisineStyle,
  macros,
  handleMacrosChange,
  utensilsList,
  utensils,
  toggleUtensil,
  isSubscribed,
  onRequestUpgrade,
}: AdvancedOptionsPanelProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabKey>("restrictions");

  const tabs: { key: TabKey; label: string; premium: boolean }[] = [
    { key: "restrictions", label: t("culinarium.form.advancedTabs.restrictions"), premium: true },
    { key: "cuisine", label: t("culinarium.form.advancedTabs.cuisine"), premium: true },
    { key: "macros", label: t("culinarium.form.advancedTabs.macros"), premium: false },
    { key: "utensils", label: t("culinarium.form.advancedTabs.utensils"), premium: false },
  ];

  return (
    <section className="border border-[var(--primary)]/15 rounded-xl overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-[var(--primary)]/15 bg-[var(--primary)]/3">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 text-xs font-semibold transition-all relative ${
              activeTab === tab.key
                ? "text-[var(--highlight)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <span className="flex items-center justify-center gap-1">
              {tab.label}
              {tab.premium && !isSubscribed && (
                <Lock className="w-3 h-3 text-[var(--highlight)]" />
              )}
            </span>
            {activeTab === tab.key && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--highlight)]"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          {activeTab === "restrictions" && (
            <motion.div
              key="restrictions"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <p className="text-xs text-[var(--muted)] mb-3">
                {isSubscribed
                  ? t("culinarium.form.sections.restrictions.description")
                  : t("culinarium.form.sections.restrictions.premiumDescription")}
              </p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {DIETARY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => isSubscribed && onDietaryChange(opt.value)}
                    disabled={!isSubscribed}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      !isSubscribed
                        ? "opacity-40 cursor-not-allowed border border-gray-300 bg-gray-50 text-gray-400"
                        : dietaryRestrictions.includes(opt.value)
                          ? "bg-[var(--highlight)] text-white shadow-sm"
                          : "border border-[var(--primary)]/20 text-[var(--foreground)] hover:bg-[var(--highlight)]/10"
                    }`}
                  >
                    {t(opt.labelKey)}
                  </button>
                ))}
              </div>

              <div>
                <span className="text-xs font-semibold text-[var(--foreground)] mb-2 block">
                  {t("culinarium.form.sections.restrictions.avoidTitle")}
                </span>
                <input
                  type="text"
                  value={currentExcluded}
                  onChange={(e) => isSubscribed && setCurrentExcluded(e.target.value)}
                  onKeyDown={isSubscribed ? handleAddExcluded : undefined}
                  placeholder={
                    isSubscribed
                      ? t("culinarium.form.sections.restrictions.avoidPlaceholder")
                      : t("culinarium.form.sections.restrictions.premiumAvoid")
                  }
                  disabled={!isSubscribed}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${
                    !isSubscribed
                      ? "opacity-40 cursor-not-allowed border-gray-300 bg-gray-50"
                      : "border-[var(--primary)]/20 focus:ring-2 focus:ring-[var(--highlight)]/40 focus:border-[var(--highlight)]"
                  }`}
                />
                <div className="mt-2 flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto">
                  <AnimatePresence>
                    {excludedIngredients.map((ing) => (
                      <FormTag key={ing} label={ing} onRemove={handleRemoveExcluded} />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "cuisine" && (
            <motion.div
              key="cuisine"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {!isSubscribed && (
                <p className="text-xs text-[var(--muted)] mb-3">
                  {t("culinarium.form.sections.cuisine.premiumDescription")}
                </p>
              )}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {CUISINE_STYLES.map((style) => (
                  <button
                    key={style.value}
                    type="button"
                    onClick={() => {
                      if (!isSubscribed) { onRequestUpgrade(); return; }
                      setCuisineStyle(cuisineStyle === style.value ? null : style.value);
                    }}
                    disabled={!isSubscribed}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border-2 text-xs font-medium transition-all ${
                      !isSubscribed
                        ? "opacity-40 cursor-not-allowed border-gray-200 bg-gray-50"
                        : cuisineStyle === style.value
                          ? "border-[var(--highlight)] bg-[var(--highlight)] text-white shadow-sm"
                          : "border-[var(--primary)]/15 hover:border-[var(--highlight)] hover:bg-[var(--highlight)]/5"
                    }`}
                  >
                    <span className="leading-tight text-center">{t(style.labelKey)}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "macros" && (
            <motion.div
              key="macros"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <ControlMacronutrientes
                initialMode={macros.mode}
                initialCalories={macros.calories}
                initialPercents={macros.percents}
                initialBasicGoal={macros.basicGoal as "gain_muscle" | "more_carbs" | "more_fats" | null}
                onChange={handleMacrosChange}
                isSubscribed={isSubscribed}
                onRequestUpgrade={onRequestUpgrade}
                className="!shadow-none !p-0"
              />
            </motion.div>
          )}

          {activeTab === "utensils" && (
            <motion.div
              key="utensils"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <p className="text-xs text-[var(--muted)] mb-3">
                {t("culinarium.form.sections.utensils.description")}
              </p>
              <div className="grid grid-cols-5 gap-2">
                {utensilsList.map((u) => {
                  const active = utensils[u.key];
                  return (
                    <button
                      key={u.key}
                      type="button"
                      onClick={() => toggleUtensil(u.key)}
                      aria-pressed={active}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all border text-xs ${
                        active
                          ? "border-[var(--highlight)] bg-[var(--highlight)]/10 text-[var(--foreground)]"
                          : "opacity-40 border-[var(--primary)]/20 text-[var(--muted)]"
                      }`}
                    >
                      <Icon path={u.icon} size={0.9} aria-hidden="true" />
                      <span className="text-center leading-tight text-[10px]">{u.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
