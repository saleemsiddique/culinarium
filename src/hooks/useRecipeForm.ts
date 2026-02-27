/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { useUser } from "@/context/user-context";
import { useIngredientHistory } from "@/hooks/useIngredientHistory";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";
import { compressDataUrlToJpeg } from "@/utils/image-compression";
import type { Difficulty, MacroState, FormStatus } from "@/types/kitchen";
import {
  mdiStove,
  mdiMicrowave,
  mdiPan,
  mdiPot,
  mdiBlender,
  mdiGrill,
  mdiSilverwareForkKnife,
  mdiKnife,
} from "@mdi/js";

export interface UtensilDef {
  key: string;
  label: string;
  icon: string;
}

export function useRecipeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement | null>(null);
  const { t } = useTranslation();

  // Firebase User State
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const { user, hasEnoughTokens, deductTokens } = useUser();

  // Onboarding
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Ingredientes
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState("");
  const [ingredientError, setIngredientError] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { ingredientHistory, getSuggestions } = useIngredientHistory(t);

  // Time
  const [availableTime, setAvailableTime] = useState("30");

  // Status
  const [status, setStatus] = useState<FormStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isLoadingOverlayVisible, setIsLoadingOverlayVisible] = useState(false);

  // Excluded ingredients
  const [excludedIngredients, setExcludedIngredients] = useState<string[]>([]);
  const [currentExcluded, setCurrentExcluded] = useState("");

  // Toast
  const [toastMessage, setToastMessage] = useState("");

  // Meal time
  const [mealTime, setMealTime] = useState<string | null>(null);
  const [mealTimeError, setMealTimeError] = useState(false);

  // Diners
  const [diners, setDiners] = useState(1);

  // Dietary restrictions
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);

  // Cuisine style
  const [cuisineStyle, setCuisineStyle] = useState<string | null>(null);

  // Auto-trigger
  const [autoTriggered, setAutoTriggered] = useState(false);

  // Tokens modal
  const [showTokens, setShowTokens] = useState(false);

  // First recipe modal (Bloque 5b)
  const [showFirstRecipeModal, setShowFirstRecipeModal] = useState(false);
  const [pendingNavigate, setPendingNavigate] = useState(false);

  // Difficulty
  const [difficulty, setDifficulty] = useState<Difficulty>("Principiante");

  // Utensils
  const utensilsList: UtensilDef[] = [
    { key: "horno", label: t("culinarium.form.sections.utensils.list.oven"), icon: mdiStove },
    { key: "microondas", label: t("culinarium.form.sections.utensils.list.microwave"), icon: mdiMicrowave },
    { key: "airfryer", label: t("culinarium.form.sections.utensils.list.airfryer"), icon: mdiPan },
    { key: "sarten", label: t("culinarium.form.sections.utensils.list.pan"), icon: mdiPan },
    { key: "olla", label: t("culinarium.form.sections.utensils.list.pot"), icon: mdiPot },
    { key: "batidora", label: t("culinarium.form.sections.utensils.list.blender"), icon: mdiBlender },
    { key: "licuadora", label: t("culinarium.form.sections.utensils.list.mixer"), icon: mdiBlender },
    { key: "grill", label: t("culinarium.form.sections.utensils.list.grill"), icon: mdiGrill },
    { key: "tabla", label: t("culinarium.form.sections.utensils.list.board"), icon: mdiSilverwareForkKnife },
    { key: "pelador", label: t("culinarium.form.sections.utensils.list.peeler"), icon: mdiKnife },
  ];

  const [utensils, setUtensils] = useState<Record<string, boolean>>(
    () => utensilsList.reduce((acc, u) => ({ ...acc, [u.key]: true }), {} as Record<string, boolean>)
  );

  const toggleUtensil = (key: string) => {
    setUtensils((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Macros
  const [macros, setMacros] = useState<MacroState>({
    mode: "basic",
    basicGoal: null,
    calories: 500,
    percents: { protein: 30, carbs: 50, fats: 20 },
  });

  const handleMacrosChange = useCallback(
    (state: MacroState) => {
      setMacros(state);
    },
    []
  );

  // Costo en recetas por generación: 1 receta = 1 crédito
  const calculateTokenCost = (): number => 1;

  // --- Effects ---

  // Onboarding
  useEffect(() => {
    const onboardingParam = searchParams.get("onboarding");
    if (onboardingParam === "1") setShowOnboarding(true);
  }, [searchParams]);

  // Firebase auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) setFirebaseUser(currentUser);
      setLoadingUser(false);
    });
    return () => unsubscribe();
  }, []);

  // Toast auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Navigate to recipes when first recipe modal is closed
  useEffect(() => {
    if (pendingNavigate && !showFirstRecipeModal) {
      setPendingNavigate(false);
      router.push("/kitchen/recipes");
    }
  }, [pendingNavigate, showFirstRecipeModal, router]);

  // --- Handlers ---

  const handleFinishOnboarding = () => {
    setShowOnboarding(false);
    const url = new URL(window.location.href);
    url.searchParams.delete("onboarding");
    router.replace(url.toString());
  };

  const handleAddIngredient = (
    e?: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement>
  ) => {
    if (e && "key" in e && e.key !== "Enter") return;
    const value = currentIngredient.trim();
    e?.preventDefault();

    if (!value) {
      setCurrentIngredient("");
      return;
    }

    const normalizedValue = value.toLowerCase();
    const isDuplicate = ingredients.some((ing) => ing.toLowerCase() === normalizedValue);

    if (isDuplicate) {
      setToastMessage(t("culinarium.form.messages.duplicateIngredient"));
    } else {
      setIngredients((prev) => [...prev, value]);
      setIngredientError(false);
    }

    setCurrentIngredient("");
    setShowSuggestions(false);
  };

  const handleRemoveIngredient = (label: string) => {
    setIngredients((prev) => prev.filter((ing) => ing !== label));
  };

  const handleSelectSuggestion = (suggestion: string) => {
    if (!ingredients.includes(suggestion)) {
      setIngredients((prev) => [...prev, suggestion]);
      setCurrentIngredient("");
      setShowSuggestions(false);
      setIngredientError(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentIngredient(e.target.value);
    setShowSuggestions(e.target.value.length >= 2);
  };

  const handleAddExcluded = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const value = currentExcluded.trim();
      e.preventDefault();
      if (!value) {
        setCurrentExcluded("");
        return;
      }
      if (excludedIngredients.includes(value)) {
        setToastMessage(t("culinarium.form.messages.duplicateExcluded"));
      } else {
        setExcludedIngredients((prev) => [...prev, value]);
      }
      setCurrentExcluded("");
    }
  };

  const handleRemoveExcluded = (label: string) => {
    setExcludedIngredients((prev) => prev.filter((ing) => ing !== label));
  };

  const handleDietaryChange = (option: string) => {
    setDietaryRestrictions((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
    );
  };

  const handleSetMealTime = (value: string) => {
    setMealTime(value);
    setMealTimeError(false);
  };

  const handleCloseFirstRecipeModal = () => {
    setShowFirstRecipeModal(false);
    // El useEffect se encarga de navegar cuando el modal se cierre
  };

  // --- Submit ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loadingUser) {
      setToastMessage("Autenticando usuario, por favor espera.");
      return;
    }
    if (!user || !firebaseUser) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "pendingRecipeForm",
          JSON.stringify({
            ingredients, mealTime, diners, dietaryRestrictions,
            excludedIngredients, cuisineStyle, availableTime,
          })
        );
      }
      router.push("/auth/register");
      return;
    }

    if (firebaseUser.isAnonymous) {
      setToastMessage(t("culinarium.form.messages.authError"));
      return;
    }

    const RECIPES_PER_GENERATION = calculateTokenCost();
    const recipeType = t("culinarium.form.actions.generate");

    if (!hasEnoughTokens(RECIPES_PER_GENERATION)) {
      const currentRecipes = (user.monthly_recipes || 0) + (user.extra_recipes || 0);
      setToastMessage(
        t("culinarium.form.messages.tokenError", {
          tokens: RECIPES_PER_GENERATION, action: recipeType, current: currentRecipes,
        })
      );
      setShowTokens(true);
      return;
    }

    // Detectar si es la primera receta (tenía exactamente 5 y 0 extra = free tier inicio)
    const isFirstRecipe =
      (user.monthly_recipes || 0) === 5 &&
      (user.extra_recipes || 0) === 0 &&
      typeof window !== "undefined" &&
      !localStorage.getItem("culinarium_first_recipe_shown");

    setIngredientError(false);
    setMealTimeError(false);
    let isValid = true;

    if (ingredients.length === 0) { setIngredientError(true); isValid = false; }
    if (mealTime === null) { setMealTimeError(true); isValid = false; }
    if (!isValid) { setStatus("idle"); return; }

    setStatus("loading");
    setIsLoadingOverlayVisible(true);
    setError(null);

    let recipeDataFromAI: any = null;
    const selectedUtensils = Object.keys(utensils).filter((k) => utensils[k]);

    try {
      const formData = {
        ingredients, mealTime, diners, dietaryRestrictions,
        excludedIngredients, cuisineStyle, availableTime,
        macronutrients: macros, utensils: selectedUtensils, difficulty,
      };

      if (typeof window !== "undefined") {
        try { sessionStorage.setItem("lastFormData", JSON.stringify(formData)); } catch { /* noop */ }
      }

      const idToken = await firebaseUser.getIdToken();
      const openaiRes = await fetch("/api/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
          "Accept-Language": i18n.language,
        },
        body: JSON.stringify(formData),
      });

      if (!openaiRes.ok) {
        const errorData = await openaiRes.json();
        throw new Error(errorData.error || `Error IA: Status ${openaiRes.status}`);
      }
      recipeDataFromAI = await openaiRes.json();

      if (recipeDataFromAI?.receta?.titulo?.startsWith("ERROR:")) {
        throw new Error(
          recipeDataFromAI.receta.descripcion ||
          "La IA no pudo generar una receta válida con los ingredientes proporcionados."
        );
      }

      try { await deductTokens(RECIPES_PER_GENERATION); } catch (tokenError) {
        console.error("Error al deducir receta:", tokenError);
        throw new Error("Error al procesar el descuento de receta. Por favor, intenta de nuevo.");
      }

      const saveIdToken = await firebaseUser.getIdToken();
      const saveRecipeRes = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipe: recipeDataFromAI.receta, idToken: saveIdToken }),
      });

      if (!saveRecipeRes.ok) {
        const errorData = await saveRecipeRes.json();
        throw new Error(errorData.error || `Error al guardar receta: Status ${saveRecipeRes.status}`);
      }

      const savedRecipeData = await saveRecipeRes.json();
      setStatus("success");
      setToastMessage(t("culinarium.form.messages.success", { action: "generada", tokens: RECIPES_PER_GENERATION }));

      if (typeof window !== "undefined") {
        sessionStorage.setItem("generatedRecipe", JSON.stringify(recipeDataFromAI.receta));
      }

      setIsLoadingOverlayVisible(false);

      // Mostrar modal de primera receta o navegar directamente
      if (isFirstRecipe) {
        localStorage.setItem("culinarium_first_recipe_shown", "true");
        setShowFirstRecipeModal(true);
        setPendingNavigate(true);
      } else {
        router.push("/kitchen/recipes");
      }

      generateImageInBackground(recipeDataFromAI.receta, firebaseUser, savedRecipeData.id);
    } catch (err: any) {
      console.error("Error general en el proceso:", err);
      setError(err.message);
      setStatus("error");
      setToastMessage(`Error: ${err.message}`);
      setIsLoadingOverlayVisible(false);
    }
  };

  // Background image generation — incluye auth token para tiering correcto
  const generateImageInBackground = async (
    recipe: any, fbUser: FirebaseUser, recipeId: string
  ) => {
    try {
      const idToken = await fbUser.getIdToken();
      const imageRes = await fetch("/api/recipe-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({ recipe }),
      });

      const imageData = await imageRes.json().catch(() => ({}));
      if (imageRes.ok && imageData?.img_url) {
        const compressedDataUrl = await compressDataUrlToJpeg(imageData.img_url, {
          maxBytes: 1000_000, maxWidth: 1024, maxHeight: 1024,
        });

        const updatedRecipe = { ...recipe, img_url: compressedDataUrl };
        const saveIdToken = await fbUser.getIdToken();
        const updateRecipeRes = await fetch(`/api/recipes/${recipeId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipe: updatedRecipe, idToken: saveIdToken }),
        });

        if (updateRecipeRes.ok) {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("generatedRecipe", JSON.stringify(updatedRecipe));
          }
        } else {
          const errorData = await updateRecipeRes.json().catch(() => ({}));
          console.warn("No se pudo actualizar la receta con la imagen:", errorData);
        }
      } else {
        console.warn("No se pudo generar la imagen en segundo plano");
      }
    } catch (imgErr) {
      console.error("Error generando imagen en segundo plano:", imgErr);
    }
  };

  // Auto-generate recipe from ?auto=1
  useEffect(() => {
    if (loadingUser) return;
    const auto = searchParams.get("auto");
    const regen = searchParams.get("regenerate");
    if ((auto === "1" || regen === "1") && !autoTriggered) {
      const storedLastForm = typeof window !== "undefined" ? sessionStorage.getItem("lastFormData") : null;
      let didPopulate = false;

      const normalizeMacros = (raw: any): MacroState | null => {
        if (!raw) return null;
        const m = raw.macronutrients ?? raw.macros ?? raw;
        const mode: "basic" | "pro" = m?.mode === "pro" ? "pro" : "basic";
        const basicGoal: string | null = m?.basicGoal ?? m?.basic_goal ?? null;
        const calories = Number(m?.calories ?? 500);
        const percentsSource =
          m?.percents ??
          (m?.protein != null && m?.carbs != null && m?.fats != null
            ? { protein: m.protein, carbs: m.carbs, fats: m.fats }
            : null);
        const percents = percentsSource
          ? {
              protein: Number(percentsSource.protein ?? 30),
              carbs: Number(percentsSource.carbs ?? 50),
              fats: Number(percentsSource.fats ?? 20),
            }
          : { protein: 30, carbs: 50, fats: 20 };
        return { mode, basicGoal, calories, percents };
      };

      if (storedLastForm) {
        try {
          const data = JSON.parse(storedLastForm);
          setIngredients(Array.isArray(data.ingredients) ? data.ingredients : []);
          setMealTime(typeof data.mealTime === "string" || data.mealTime === null ? data.mealTime : null);
          setDiners(typeof data.diners === "number" ? data.diners : 1);
          setDietaryRestrictions(Array.isArray(data.dietaryRestrictions) ? data.dietaryRestrictions : []);
          setExcludedIngredients(Array.isArray(data.excludedIngredients) ? data.excludedIngredients : []);
          setCuisineStyle(typeof data.cuisineStyle === "string" || data.cuisineStyle === null ? data.cuisineStyle : null);
          setAvailableTime(typeof data.availableTime === "string" ? data.availableTime : "30");

          if (data.difficulty && (data.difficulty === "Principiante" || data.difficulty === "Intermedio" || data.difficulty === "Chef")) {
            setDifficulty(data.difficulty);
          } else if (typeof data.difficulty === "string") {
            const dif = data.difficulty.toLowerCase();
            if (dif.includes("principi")) setDifficulty("Principiante");
            else if (dif.includes("inter")) setDifficulty("Intermedio");
            else if (dif.includes("chef") || dif.includes("avanz")) setDifficulty("Chef");
          }

          if (data.utensils) {
            if (Array.isArray(data.utensils)) {
              const selectedArray: string[] = data.utensils;
              const newUtensils = utensilsList.reduce<Record<string, boolean>>(
                (acc, u) => ({ ...acc, [u.key]: selectedArray.includes(u.key) }), {}
              );
              setUtensils(newUtensils);
            } else if (typeof data.utensils === "object") {
              const newUtensils = utensilsList.reduce<Record<string, boolean>>(
                (acc, u) => ({ ...acc, [u.key]: data.utensils[u.key] ?? true }), {}
              );
              setUtensils(newUtensils);
            }
          }

          const normalized = normalizeMacros(data.macronutrients ?? data.macros ?? data);
          if (normalized) setMacros(normalized);
          didPopulate = true;
        } catch (err) {
          console.warn("Error parseando lastFormData:", err);
        }
      }

      if (!didPopulate) {
        const storedGenerated = typeof window !== "undefined" ? sessionStorage.getItem("generatedRecipe") : null;
        if (storedGenerated) {
          try {
            const recipe = JSON.parse(storedGenerated);
            const maybeIngredients =
              recipe.ingredients || recipe.ingredientes || recipe.ingredientes_list ||
              recipe.ingredients_list || recipe.ingredientesList || null;

            if (Array.isArray(maybeIngredients) && maybeIngredients.length > 0) {
              const normalizedIngs = maybeIngredients.map((it: any) => (typeof it === "string" ? it : String(it)));
              setIngredients(normalizedIngs);
              didPopulate = true;
            }

            if (!mealTime && (recipe.mealTime || recipe.momento || recipe.tipo)) {
              setMealTime(recipe.mealTime || recipe.momento || recipe.tipo);
            }
            if (recipe.diners || recipe.comensales) {
              setDiners(typeof recipe.diners === "number" ? recipe.diners : Number(recipe.comensales) || 1);
            }
            if (recipe.cuisineStyle || recipe.estilo) {
              setCuisineStyle(recipe.cuisineStyle || recipe.estilo);
            }

            if (recipe.difficulty || recipe.dificultad) {
              const d = recipe.difficulty || recipe.dificultad;
              if (d === "Principiante" || d === "Intermedio" || d === "Chef") setDifficulty(d);
              else if (typeof d === "string") {
                const dif = d.toLowerCase();
                if (dif.includes("principi")) setDifficulty("Principiante");
                else if (dif.includes("inter")) setDifficulty("Intermedio");
                else if (dif.includes("chef") || dif.includes("avanz")) setDifficulty("Chef");
              }
            }

            const maybeUtensils = recipe.utensils || recipe.utensilios || null;
            if (maybeUtensils) {
              if (Array.isArray(maybeUtensils)) {
                const newUtensils = utensilsList.reduce<Record<string, boolean>>(
                  (acc, u) => ({ ...acc, [u.key]: maybeUtensils.includes(u.key) }), {}
                );
                setUtensils(newUtensils);
              } else if (typeof maybeUtensils === "object") {
                const newUtensils = utensilsList.reduce<Record<string, boolean>>(
                  (acc, u) => ({ ...acc, [u.key]: maybeUtensils[u.key] ?? true }), {}
                );
                setUtensils(newUtensils);
              }
            }

            const normalizedFromRecipe = normalizeMacros(recipe.macronutrients ?? recipe.macros ?? recipe);
            if (normalizedFromRecipe) setMacros(normalizedFromRecipe);
          } catch (err) {
            console.warn("Error parseando generatedRecipe:", err);
          }
        }
      }

      setAutoTriggered(true);
      if (didPopulate) {
        setTimeout(() => { formRef.current?.requestSubmit(); }, 0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingUser, searchParams, autoTriggered]);

  return {
    // Refs
    formRef,

    // Auth
    firebaseUser,
    loadingUser,
    user,

    // Ingredients
    ingredients,
    currentIngredient,
    setCurrentIngredient,
    ingredientError,
    showSuggestions,
    setShowSuggestions,
    ingredientHistory,
    getSuggestions,
    handleAddIngredient,
    handleRemoveIngredient,
    handleSelectSuggestion,
    handleInputChange,

    // Meal time
    mealTime,
    mealTimeError,
    handleSetMealTime,

    // Diners
    diners,
    setDiners,

    // Time
    availableTime,
    setAvailableTime,

    // Difficulty
    difficulty,
    setDifficulty,

    // Dietary
    dietaryRestrictions,
    handleDietaryChange,

    // Excluded
    excludedIngredients,
    currentExcluded,
    setCurrentExcluded,
    handleAddExcluded,
    handleRemoveExcluded,

    // Cuisine
    cuisineStyle,
    setCuisineStyle,

    // Utensils
    utensilsList,
    utensils,
    toggleUtensil,

    // Macros
    macros,
    handleMacrosChange,

    // Status
    status,
    error,
    isLoadingOverlayVisible,
    toastMessage,

    // Tokens/Recipes
    showTokens,
    setShowTokens,
    calculateTokenCost,

    // First recipe modal
    showFirstRecipeModal,
    handleCloseFirstRecipeModal,

    // Submit
    handleSubmit,

    // Onboarding
    showOnboarding,
    handleFinishOnboarding,
  };
}
