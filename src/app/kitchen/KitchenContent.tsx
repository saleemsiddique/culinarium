"use client";

import React from "react";
import { motion } from "framer-motion";
import Head from "next/head";
import { useTranslation } from "react-i18next";
import { CustomUser, useUser } from "@/context/user-context";

import { useRecipeForm } from "@/hooks/useRecipeForm";
import Onboarding from "@/components/onboarding";
import { TokensModal } from "@/components/SideMenu/TokensModal";

import IngredientSection from "@/components/kitchenForm/IngredientSection";
import MealTimeSelector from "@/components/kitchenForm/MealTimeSelector";
import QuickOptions from "@/components/kitchenForm/QuickOptions";
import AdvancedOptionsPanel from "@/components/kitchenForm/AdvancedOptionsPanel";
import GenerateButton from "@/components/kitchenForm/GenerateButton";
import LoadingOverlay from "@/components/kitchenForm/LoadingOverlay";

const CulinariumForm: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useUser();
  const form = useRecipeForm();

  const hasRecipes = form.user
    ? ((form.user.monthly_tokens || 0) + (form.user.extra_tokens || 0)) >= 10
    : false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] to-[var(--background)] pt-[5%] py-10 flex items-start justify-center font-sans">
      {form.showOnboarding && <Onboarding onClose={form.handleFinishOnboarding} />}

      <Head>
        <title>{t("culinarium.form.title")}</title>
        <meta name="description" content={t("culinarium.form.description")} />
      </Head>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-2xl mx-auto px-4"
      >
        {/* Compact card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <form ref={form.formRef} onSubmit={form.handleSubmit} className="p-5 sm:p-6 space-y-6">
            {/* 1. Ingredients — the protagonist */}
            <IngredientSection
              ingredients={form.ingredients}
              currentIngredient={form.currentIngredient}
              ingredientError={form.ingredientError}
              showSuggestions={form.showSuggestions}
              setShowSuggestions={form.setShowSuggestions}
              ingredientHistory={form.ingredientHistory}
              getSuggestions={form.getSuggestions}
              handleAddIngredient={form.handleAddIngredient}
              handleRemoveIngredient={form.handleRemoveIngredient}
              handleSelectSuggestion={form.handleSelectSuggestion}
              handleInputChange={form.handleInputChange}
            />

            {/* Divider */}
            <div className="border-t border-[var(--primary)]/10" />

            {/* 2. Meal time — 4 horizontal buttons */}
            <MealTimeSelector
              mealTime={form.mealTime}
              mealTimeError={form.mealTimeError}
              onSelect={form.handleSetMealTime}
            />

            {/* Divider */}
            <div className="border-t border-[var(--primary)]/10" />

            {/* 3. Quick options: Time + Difficulty + Diners */}
            <QuickOptions
              availableTime={form.availableTime}
              setAvailableTime={form.setAvailableTime}
              difficulty={form.difficulty}
              setDifficulty={form.setDifficulty}
              diners={form.diners}
              setDiners={form.setDiners}
              isSubscribed={!!user?.isSubscribed}
              onRequestUpgrade={() => form.setShowTokens(true)}
            />

            {/* Divider */}
            <div className="border-t border-[var(--primary)]/10" />

            {/* 4. Advanced options tabs */}
            <AdvancedOptionsPanel
              dietaryRestrictions={form.dietaryRestrictions}
              onDietaryChange={form.handleDietaryChange}
              excludedIngredients={form.excludedIngredients}
              currentExcluded={form.currentExcluded}
              setCurrentExcluded={form.setCurrentExcluded}
              handleAddExcluded={form.handleAddExcluded}
              handleRemoveExcluded={form.handleRemoveExcluded}
              cuisineStyle={form.cuisineStyle}
              setCuisineStyle={form.setCuisineStyle}
              macros={form.macros}
              handleMacrosChange={form.handleMacrosChange}
              utensilsList={form.utensilsList}
              utensils={form.utensils}
              toggleUtensil={form.toggleUtensil}
              isSubscribed={!!user?.isSubscribed}
              onRequestUpgrade={() => form.setShowTokens(true)}
            />

            {/* 5. Generate button */}
            <GenerateButton
              status={form.status}
              loadingUser={form.loadingUser}
              hasRecipes={hasRecipes}
              tokenCost={form.calculateTokenCost()}
              onGetMoreRecipes={() => form.setShowTokens(true)}
            />

            {form.status === "error" && form.error && (
              <p className="text-red-500 text-sm text-center">{form.error}</p>
            )}
          </form>
        </div>
      </motion.div>

      {/* Toast */}
      {form.toastMessage && (
        <div className="fixed bottom-4 right-4 bg-[var(--highlight)] text-white px-4 py-2.5 rounded-xl shadow-lg text-sm z-40 max-w-sm">
          {form.toastMessage}
        </div>
      )}

      {/* Loading overlay */}
      <LoadingOverlay visible={form.isLoadingOverlayVisible} />

      {/* Tokens modal */}
      {form.showTokens && (
        <TokensModal
          user={user as CustomUser | null}
          onClose={() => form.setShowTokens(false)}
        />
      )}
    </div>
  );
};

export default CulinariumForm;
