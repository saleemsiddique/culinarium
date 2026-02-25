/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoCloseCircleOutline,
  IoAddCircleOutline,
} from "react-icons/io5";
import {
  GiChopsticks,
  GiSushis,
  GiTacos,
  GiHamburger,
  GiPizzaSlice,
  GiBowlOfRice,
} from "react-icons/gi";
import { MdOutlineFastfood } from "react-icons/md";
import { useRouter, useSearchParams } from "next/navigation";

import { auth } from "@/lib/firebase";
import {
  onAuthStateChanged,
  User as FirebaseUser,
  signInAnonymously,
} from "firebase/auth";
import { CustomUser, useUser } from "@/context/user-context";
import Onboarding from "@/components/onboarding";
import { useIngredientHistory } from "@/hooks/useIngredientHistory";
import { TokensModal } from "@/components/SideMenu/TokensModal";
import ControlMacronutrientes from "@/components/kitchenForm/ControlMacronutrientes";
import Icon from "@mdi/react";
import {
  mdiStove,
  mdiMicrowave,
  mdiPan,
  mdiPot,
  mdiBlender,
  mdiGrill,
  mdiSilverwareForkKnife,
  mdiKnife
} from "@mdi/js";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";
import {
  ChefHat, Sun, Users, ShieldOff, Globe, Target,
  Coffee, UtensilsCrossed, Moon, Apple, AlertTriangle,
  Star, Zap, X, Plus, Clock, ChevronDown, Minus, Loader2, Sparkles
} from "lucide-react";

// --- Image compression helpers (compress to <1MB on client) ---
async function loadImageFromDataUrl(
  dataUrl: string
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = dataUrl;
  });
}

function getScaledDimensions(
  srcWidth: number,
  srcHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const widthRatio = maxWidth / srcWidth;
  const heightRatio = maxHeight / srcHeight;
  const scale = Math.min(1, widthRatio, heightRatio);
  return {
    width: Math.round(srcWidth * scale),
    height: Math.round(srcHeight * scale),
  };
}

function estimateBytesFromDataUrl(dataUrl: string): number {
  const base64 = dataUrl.split(",")[1] || "";
  const len = base64.length;
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor((len * 3) / 4) - padding);
}

async function compressDataUrlToJpeg(
  inputDataUrl: string,
  options?: {
    maxBytes?: number;
    maxWidth?: number;
    maxHeight?: number;
    initialQuality?: number;
    minQuality?: number;
  }
): Promise<string> {
  const {
    maxBytes = 1000_000,
    maxWidth = 1024,
    maxHeight = 1024,
    initialQuality = 0.88,
    minQuality = 0.5,
  } = options || {};

  if (estimateBytesFromDataUrl(inputDataUrl) <= maxBytes) return inputDataUrl;

  const img = await loadImageFromDataUrl(inputDataUrl);

  let currentMaxWidth = maxWidth;
  let currentMaxHeight = maxHeight;
  let quality = initialQuality;

  for (let pass = 0; pass < 8; pass++) {
    const { width, height } = getScaledDimensions(
      img.naturalWidth,
      img.naturalHeight,
      currentMaxWidth,
      currentMaxHeight
    );
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No se pudo obtener el contexto de canvas");
    ctx.drawImage(img, 0, 0, width, height);

    for (let qStep = 0; qStep < 5; qStep++) {
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      if (estimateBytesFromDataUrl(dataUrl) <= maxBytes) {
        return dataUrl;
      }
      quality = Math.max(minQuality, quality - 0.1);
      if (quality <= minQuality) break;
    }

    currentMaxWidth = Math.max(512, Math.floor(currentMaxWidth * 0.85));
    currentMaxHeight = Math.max(512, Math.floor(currentMaxHeight * 0.85));
    quality = Math.max(minQuality, initialQuality - 0.1 * (pass + 1));
  }

  const { width: finalW, height: finalH } = getScaledDimensions(
    img.naturalWidth,
    img.naturalHeight,
    Math.max(512, Math.floor(maxWidth * 0.6)),
    Math.max(512, Math.floor(maxHeight * 0.6))
  );
  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = finalW;
  finalCanvas.height = finalH;
  const finalCtx = finalCanvas.getContext("2d");
  if (!finalCtx) throw new Error("No se pudo obtener el contexto de canvas");
  finalCtx.drawImage(img, 0, 0, finalW, finalH);
  return finalCanvas.toDataURL("image/jpeg", 0.5);
}

// Modern ingredient tag chip
type TagProps = {
  label: string;
  onRemove: (label: string) => void;
};

const Tag: React.FC<TagProps> = ({ label, onRemove }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    className="flex items-center gap-1.5 bg-[var(--highlight)]/10 text-[var(--highlight-dark)] text-sm font-medium pl-3 pr-2 py-1.5 rounded-full border border-[var(--highlight)]/25 mr-2 mb-2"
  >
    <span>{label}</span>
    <button
      type="button"
      onClick={() => onRemove(label)}
      className="p-0.5 rounded-full hover:bg-[var(--highlight)]/20 transition-colors"
      aria-label={`Eliminar ${label}`}
    >
      <X className="w-3.5 h-3.5" />
    </button>
  </motion.div>
);

// Section card wrapper
const FormSection: React.FC<{
  children: React.ReactNode;
  className?: string;
  error?: boolean;
}> = ({ children, className = "", error = false }) => (
  <section
    className={`bg-white p-5 md:p-6 rounded-2xl border transition-all duration-200
      ${error ? "border-[var(--highlight)] shadow-[0_0_0_1px_var(--highlight)]" : "border-[var(--border-subtle)] shadow-sm hover:shadow-md"}
      ${className}`}
  >
    {children}
  </section>
);

// Section title component
const SectionTitle: React.FC<{
  icon: React.ReactNode;
  title: string;
  badge?: string;
}> = ({ icon, title, badge }) => (
  <div className="flex items-center gap-2.5 mb-4">
    <div className="p-2 rounded-xl bg-[var(--highlight)]/10 text-[var(--highlight)]">
      {icon}
    </div>
    <h2 className="font-display text-lg md:text-xl font-bold text-[var(--foreground)]">
      {title}
    </h2>
    {badge && (
      <span className="ml-auto px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full">
        {badge}
      </span>
    )}
  </div>
);

const CulinariumForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement | null>(null);

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const { user, hasEnoughTokens, deductTokens } = useUser();
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState<string>("");
  const [ingredientError, setIngredientError] = useState<boolean>(false);

  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const { t } = useTranslation();
  const { ingredientHistory, getSuggestions } = useIngredientHistory(t);

  const [availableTime, setAvailableTime] = useState<string>("30");

  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [isLoadingOverlayVisible, setIsLoadingOverlayVisible] =
    useState<boolean>(false);

  const [excludedIngredients, setExcludedIngredients] = useState<string[]>([]);
  const [currentExcluded, setCurrentExcluded] = useState<string>("");

  const [toastMessage, setToastMessage] = useState<string>("");

  const [mealTime, setMealTime] = useState<string | null>(null);
  const [mealTimeError, setMealTimeError] = useState<boolean>(false);

  const [diners, setDiners] = useState<number>(1);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [cuisineStyle, setCuisineStyle] = useState<string | null>(null);
  const [showDietaryRestrictions, setShowDietaryRestrictions] = useState(false);
  const [showCuisineStyle, setShowCuisineStyle] = useState(false);
  const [showMacronutrients, setShowMacronutrients] = useState(false);
  const [autoTriggered, setAutoTriggered] = useState<boolean>(false);

  const [showTokens, setShowTokens] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<'Principiante' | 'Intermedio' | 'Chef'>('Principiante');

  const [showUtensilsModal, setShowUtensilsModal] = useState<boolean>(false);

  const utensilsList = [
    { key: "horno", label: t("culinarium.form.sections.utensils.list.oven"), icon: mdiStove },
    { key: "microondas", label: t("culinarium.form.sections.utensils.list.microwave"), icon: mdiMicrowave },
    { key: "airfryer", label: t("culinarium.form.sections.utensils.list.airfryer"), icon: mdiPan },
    { key: "sarten", label: t("culinarium.form.sections.utensils.list.pan"), icon: mdiPan },
    { key: "olla", label: t("culinarium.form.sections.utensils.list.pot"), icon: mdiPot },
    { key: "batidora", label: t("culinarium.form.sections.utensils.list.blender"), icon: mdiBlender },
    { key: "licuadora", label: t("culinarium.form.sections.utensils.list.mixer"), icon: mdiBlender },
    { key: "grill", label: t("culinarium.form.sections.utensils.list.grill"), icon: mdiGrill },
    { key: "tabla", label: t("culinarium.form.sections.utensils.list.board"), icon: mdiSilverwareForkKnife },
    { key: "pelador", label: t("culinarium.form.sections.utensils.list.peeler"), icon: mdiKnife }
  ];

  const [utensils, setUtensils] = useState<Record<string, boolean>>(
    () => utensilsList.reduce((acc, u) => ({ ...acc, [u.key]: true }), {})
  );

  const toggleUtensil = (key: string) => {
    setUtensils(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const calculateTokenCost = (): number => {
    const baseCost = 10;
    return baseCost;
  };

  const mealTimeData = [
    { label: t("culinarium.form.sections.mealTime.options.breakfast.label"), value: "breakfast", icon: <Coffee className="w-6 h-6" /> },
    { label: t("culinarium.form.sections.mealTime.options.lunch.label"), value: "lunch", icon: <UtensilsCrossed className="w-6 h-6" /> },
    { label: t("culinarium.form.sections.mealTime.options.dinner.label"), value: "dinner", icon: <Moon className="w-6 h-6" /> },
    { label: t("culinarium.form.sections.mealTime.options.snack.label"), value: "snack", icon: <Apple className="w-6 h-6" /> },
  ];
  const MAX_DINERS = 8;
  const dietaryOptions = [
    { label: t("culinarium.form.sections.restrictions.options.vegetarian"), value: "vegetarian" },
    { label: t("culinarium.form.sections.restrictions.options.vegan"), value: "vegan" },
    { label: t("culinarium.form.sections.restrictions.options.glutenFree"), value: "gluten-free" },
    { label: t("culinarium.form.sections.restrictions.options.lactoseFree"), value: "lactose-free" },
    { label: t("culinarium.form.sections.restrictions.options.keto"), value: "keto" },
  ];
  const cuisineStyles = [
    { label: t("culinarium.form.sections.cuisine.styles.japanese.label"), value: "japanese", icon: <GiSushis className="w-6 h-6" /> },
    { label: t("culinarium.form.sections.cuisine.styles.mexican.label"), value: "mexican", icon: <GiTacos className="w-6 h-6" /> },
    { label: t("culinarium.form.sections.cuisine.styles.italian.label"), value: "italian", icon: <GiPizzaSlice className="w-6 h-6" /> },
    { label: t("culinarium.form.sections.cuisine.styles.american.label"), value: "american", icon: <GiHamburger className="w-6 h-6" /> },
    { label: t("culinarium.form.sections.cuisine.styles.spanish.label"), value: "spanish", icon: <GiBowlOfRice className="w-6 h-6" /> },
    { label: t("culinarium.form.sections.cuisine.styles.jamaican.label"), value: "jamaican", icon: <GiChopsticks className="w-6 h-6 rotate-45" /> },
    { label: t("culinarium.form.sections.cuisine.styles.indian.label"), value: "indian", icon: <MdOutlineFastfood className="w-6 h-6" /> },
  ];

  const difficultyLevels = [
    { key: 'Principiante' as const, label: t("culinarium.form.sections.difficulty.levels.beginner"), icon: <Star className="w-4 h-4" /> },
    { key: 'Intermedio' as const, label: t("culinarium.form.sections.difficulty.levels.intermediate"), icon: <Zap className="w-4 h-4" /> },
    { key: 'Chef' as const, label: t("culinarium.form.sections.difficulty.levels.chef"), icon: <ChefHat className="w-4 h-4" /> },
  ];

  const handleFinishOnboarding = () => {
    setShowOnboarding(false);
    const url = new URL(window.location.href);
    url.searchParams.delete("onboarding");
    router.replace(url.toString());
  };

  const [macros, setMacros] = useState({
    mode: "basic" as "basic" | "pro",
    basicGoal: null as string | null,
    calories: 500,
    percents: { protein: 30, carbs: 50, fats: 20 },
  });

  const handleMacrosChange = useCallback(
    (state: { mode: "basic" | "pro"; basicGoal: string | null; calories: number; percents: { protein: number; carbs: number; fats: number } }) => {
      setMacros(state);
    },
    []
  );

  useEffect(() => {
    const onboardingParam = searchParams.get("onboarding");
    if (onboardingParam === "1") {
      setShowOnboarding(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setFirebaseUser(currentUser);
      }
      setLoadingUser(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleAddIngredient = (
    e?:
      | React.KeyboardEvent<HTMLInputElement>
      | React.MouseEvent<HTMLButtonElement>
  ) => {
    if (e && "key" in e && e.key !== "Enter") return;

    const value = currentIngredient.trim();
    e?.preventDefault();

    if (!value) {
      setCurrentIngredient("");
      return;
    }

    const normalizedValue = value.toLowerCase();
    const isDuplicate = ingredients.some(
      (ing) => ing.toLowerCase() === normalizedValue
    );

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
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  // Submit handler with progressive loading (recipe first, then image)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loadingUser) {
      setToastMessage("Autenticando usuario, por favor espera.");
      return;
    }
    if (!user || !firebaseUser) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("pendingRecipeForm", JSON.stringify({
          ingredients,
          mealTime,
          diners,
          dietaryRestrictions,
          excludedIngredients,
          cuisineStyle,
          availableTime,
        }));
      }
      router.push("/auth/register");
      return;
    }

    if (firebaseUser.isAnonymous) {
      setToastMessage(
        t("culinarium.form.messages.authError")
      );
      return;
    }

    const isRegeneration = searchParams.get("regenerate") === "1";
    const TOKENS_PER_RECIPE = isRegeneration ? 5 : calculateTokenCost();
    const recipeType = isRegeneration
      ? t("culinarium.form.actions.regenerate")
      : t("culinarium.form.actions.generate");

    if (!hasEnoughTokens(TOKENS_PER_RECIPE)) {
      const currentTokens =
        (user.monthly_tokens || 0) + (user.extra_tokens || 0);
      setToastMessage(
        t("culinarium.form.messages.tokenError", {
          tokens: TOKENS_PER_RECIPE,
          action: recipeType,
          current: currentTokens
        })
      );
      setShowTokens(true);
      return;
    }

    setIngredientError(false);
    setMealTimeError(false);

    let isValid = true;

    if (ingredients.length === 0) {
      setIngredientError(true);
      isValid = false;
    }

    if (mealTime === null) {
      setMealTimeError(true);
      isValid = false;
    }

    if (!isValid) {
      setStatus("idle");
      return;
    }

    setStatus("loading");
    setIsLoadingOverlayVisible(true);
    setError(null);

    let recipeDataFromAI: any = null;
    const selectedUtensils = Object.keys(utensils).filter(k => utensils[k]);

    try {
      const formData = {
        ingredients,
        mealTime,
        diners,
        dietaryRestrictions,
        excludedIngredients,
        cuisineStyle,
        availableTime,
        macronutrients: macros,
        utensils: selectedUtensils,
        difficulty,
      };
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem("lastFormData", JSON.stringify(formData));
        } catch { }
      }
      const idToken = await firebaseUser.getIdToken();

      const openaiRes = await fetch("/api/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
          "Accept-Language": i18n.language
        },
        body: JSON.stringify(formData),
      });

      if (!openaiRes.ok) {
        const errorData = await openaiRes.json();
        throw new Error(
          errorData.error || `Error OpenAI: Status ${openaiRes.status}`
        );
      }
      recipeDataFromAI = await openaiRes.json();

      if (recipeDataFromAI?.receta?.titulo?.startsWith("ERROR:")) {
        throw new Error(
          recipeDataFromAI.receta.descripcion ||
          "La IA no pudo generar una receta valida con los ingredientes proporcionados."
        );
      }

      try {
        await deductTokens(TOKENS_PER_RECIPE);
      } catch (tokenError) {
        console.error("Error al deducir tokens:", tokenError);
        throw new Error(
          "Error al procesar el pago de tokens. Por favor, intenta de nuevo."
        );
      }

      const saveIdToken = await firebaseUser.getIdToken();
      const saveRecipeRes = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipe: recipeDataFromAI.receta,
          idToken: saveIdToken,
        }),
      });

      if (!saveRecipeRes.ok) {
        const errorData = await saveRecipeRes.json();
        throw new Error(
          errorData.error ||
          `Error al guardar receta: Status ${saveRecipeRes.status}`
        );
      }

      const savedRecipeData = await saveRecipeRes.json();

      setStatus("success");
      const actionMessage = isRegeneration ? "regenerada" : "generada";
      setToastMessage(
        t("culinarium.form.messages.success", {
          action: actionMessage,
          tokens: TOKENS_PER_RECIPE
        })
      );

      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "generatedRecipe",
          JSON.stringify(recipeDataFromAI.receta)
        );
      }

      setIsLoadingOverlayVisible(false);
      router.push("/kitchen/recipes");

      generateImageInBackground(
        recipeDataFromAI.receta,
        firebaseUser,
        savedRecipeData.id
      );
    } catch (err: any) {
      console.error("Error general en el proceso:", err);
      setError(err.message);
      setStatus("error");
      setToastMessage(`Error: ${err.message}`);
      setIsLoadingOverlayVisible(false);
    }
  };

  const generateImageInBackground = async (
    recipe: any,
    firebaseUser: any,
    recipeId: string
  ) => {
    try {
      const imageRes = await fetch("/api/recipe-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipe }),
      });

      const imageData = await imageRes.json().catch(() => ({}));

      if (imageRes.ok && imageData?.img_url) {
        const compressedDataUrl = await compressDataUrlToJpeg(
          imageData.img_url,
          {
            maxBytes: 1000_000,
            maxWidth: 1024,
            maxHeight: 1024,
          }
        );

        const updatedRecipe = { ...recipe, img_url: compressedDataUrl };
        const saveIdToken = await firebaseUser.getIdToken();
        const updateRecipeRes = await fetch(`/api/recipes/${recipeId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipe: updatedRecipe, idToken: saveIdToken }),
        });

        if (updateRecipeRes.ok) {
          if (typeof window !== "undefined") {
            sessionStorage.setItem(
              "generatedRecipe",
              JSON.stringify(updatedRecipe)
            );
          }
        } else {
          const errorData = await updateRecipeRes.json().catch(() => ({}));
          console.warn(
            "No se pudo actualizar la receta con la imagen:",
            errorData
          );
        }
      } else {
        console.warn("No se pudo generar la imagen en segundo plano");
      }
    } catch (imgErr) {
      console.error("Error generando imagen en segundo plano:", imgErr);
    }
  };

  // Auto-generate recipe from ?auto=1 using last saved form
  useEffect(() => {
    if (loadingUser) return;
    const auto = searchParams.get("auto");
    const regen = searchParams.get("regenerate");
    if ((auto === "1" || regen === "1") && !autoTriggered) {
      const storedLastForm =
        typeof window !== "undefined"
          ? sessionStorage.getItem("lastFormData")
          : null;

      let didPopulate = false;

      type MacrosState = {
        mode: "basic" | "pro";
        basicGoal: string | null;
        calories: number;
        percents: { protein: number; carbs: number; fats: number };
      };

      const normalizeMacros = (raw: any): MacrosState | null => {
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
          setMealTime(
            typeof data.mealTime === "string" || data.mealTime === null
              ? data.mealTime
              : null
          );
          setDiners(typeof data.diners === "number" ? data.diners : 1);
          setDietaryRestrictions(
            Array.isArray(data.dietaryRestrictions)
              ? data.dietaryRestrictions
              : []
          );
          setExcludedIngredients(
            Array.isArray(data.excludedIngredients)
              ? data.excludedIngredients
              : []
          );
          setCuisineStyle(
            typeof data.cuisineStyle === "string" || data.cuisineStyle === null
              ? data.cuisineStyle
              : null
          );
          setAvailableTime(
            typeof data.availableTime === "string" ? data.availableTime : "30"
          );
          if (data.difficulty && (data.difficulty === 'Principiante' || data.difficulty === 'Intermedio' || data.difficulty === 'Chef')) {
            setDifficulty(data.difficulty);
          } else if (typeof data.difficulty === 'string') {
            const dif = data.difficulty.toLowerCase();
            if (dif.includes('principi')) setDifficulty('Principiante');
            else if (dif.includes('inter')) setDifficulty('Intermedio');
            else if (dif.includes('chef') || dif.includes('avanz')) setDifficulty('Chef');
          }
          if (data.utensils) {
            if (Array.isArray(data.utensils)) {
              const selectedArray: string[] = data.utensils;
              const newUtensils = utensilsList.reduce<Record<string, boolean>>(
                (acc, u) => ({ ...acc, [u.key]: selectedArray.includes(u.key) }),
                {}
              );
              setUtensils(newUtensils);
            } else if (typeof data.utensils === "object") {
              const newUtensils = utensilsList.reduce<Record<string, boolean>>(
                (acc, u) => ({ ...acc, [u.key]: data.utensils[u.key] ?? true }),
                {}
              );
              setUtensils(newUtensils);
            }
          }
          const normalized = normalizeMacros(data.macronutrients ?? data.macros ?? data);
          if (normalized) {
            setMacros(normalized);
          }
          didPopulate = true;
        } catch (err) {
          console.warn("Error parseando lastFormData:", err);
        }
      }

      if (!didPopulate) {
        const storedGenerated =
          typeof window !== "undefined"
            ? sessionStorage.getItem("generatedRecipe")
            : null;
        if (storedGenerated) {
          try {
            const recipe = JSON.parse(storedGenerated);
            const maybeIngredients =
              recipe.ingredients ||
              recipe.ingredientes ||
              recipe.ingredientes_list ||
              recipe.ingredients_list ||
              recipe.ingredientesList ||
              null;
            if (Array.isArray(maybeIngredients) && maybeIngredients.length > 0) {
              const normalized = maybeIngredients.map((it: any) =>
                typeof it === "string" ? it : String(it)
              );
              setIngredients(normalized);
              didPopulate = true;
            }
            if (!mealTime && (recipe.mealTime || recipe.momento || recipe.tipo)) {
              setMealTime(recipe.mealTime || recipe.momento || recipe.tipo);
            }
            if (recipe.diners || recipe.comensales) {
              setDiners(
                typeof recipe.diners === "number"
                  ? recipe.diners
                  : Number(recipe.comensales) || 1
              );
            }
            if (recipe.cuisineStyle || recipe.estilo) {
              setCuisineStyle(recipe.cuisineStyle || recipe.estilo);
            }
            if (recipe.difficulty || recipe.dificultad) {
              const d = recipe.difficulty || recipe.dificultad;
              if (d === 'Principiante' || d === 'Intermedio' || d === 'Chef') setDifficulty(d);
              else if (typeof d === 'string') {
                const dif = d.toLowerCase();
                if (dif.includes('principi')) setDifficulty('Principiante');
                else if (dif.includes('inter')) setDifficulty('Intermedio');
                else if (dif.includes('chef') || dif.includes('avanz')) setDifficulty('Chef');
              }
            }
            const maybeUtensils = recipe.utensils || recipe.utensilios || null;
            if (maybeUtensils) {
              if (Array.isArray(maybeUtensils)) {
                const newUtensils = utensilsList.reduce<Record<string, boolean>>(
                  (acc, u) => ({ ...acc, [u.key]: maybeUtensils.includes(u.key) }),
                  {}
                );
                setUtensils(newUtensils);
              } else if (typeof maybeUtensils === "object") {
                const newUtensils = utensilsList.reduce<Record<string, boolean>>(
                  (acc, u) => ({ ...acc, [u.key]: maybeUtensils[u.key] ?? true }),
                  {}
                );
                setUtensils(newUtensils);
              }
            }
            const normalizedFromRecipe = normalizeMacros(recipe.macronutrients ?? recipe.macros ?? recipe);
            if (normalizedFromRecipe) {
              setMacros(normalizedFromRecipe);
            }
          } catch (err) {
            console.warn("Error parseando generatedRecipe:", err);
          }
        }
      }

      setAutoTriggered(true);
      if (didPopulate) {
        setTimeout(() => {
          formRef.current?.requestSubmit();
        }, 0);
      }
    }
  }, [loadingUser, searchParams, autoTriggered]);

  const activeUtensilCount = Object.values(utensils).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[var(--background)] pt-20 md:pt-24 pb-10 flex items-start justify-center">
      {showOnboarding && <Onboarding onClose={handleFinishOnboarding} />}

      <Head>
        <title>{t("culinarium.form.title")}</title>
        <meta name="description" content={t("culinarium.form.description")} />
      </Head>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full px-4 lg:px-8 xl:px-12 max-w-screen-2xl mx-auto"
      >
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          {/* 3-column grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 lg:h-auto lg:overflow-visible">

            {/* COLUMN 1: Ingredients + Time + Difficulty */}
            <div className="lg:col-span-1 flex flex-col gap-5">
              <FormSection error={ingredientError}>
                <SectionTitle
                  icon={<ChefHat className="w-5 h-5" />}
                  title={t("culinarium.form.sections.ingredients.title")}
                />
                <p
                  className="text-[var(--foreground)]/60 mb-4 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: t("culinarium.form.sections.ingredients.instructions") }}
                />

                {/* Input with add button */}
                <div className="relative">
                  <input
                    type="text"
                    value={currentIngredient}
                    onChange={handleInputChange}
                    onKeyDown={handleAddIngredient}
                    onFocus={() => setShowSuggestions(currentIngredient.length >= 2)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder={t("culinarium.form.sections.ingredients.placeholder")}
                    className={`w-full px-4 py-3 bg-[var(--background)] border rounded-xl text-base transition-all duration-200
                      focus:ring-2 focus:ring-[var(--highlight)]/30 focus:border-[var(--highlight)] outline-none
                      ${ingredientError ? "border-[var(--highlight)]" : "border-[var(--border-medium)]"}`}
                    aria-label={t("culinarium.form.sections.ingredients.title")}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[var(--highlight)] text-white rounded-lg hover:bg-[var(--highlight-dark)] transition-colors"
                    aria-label={t("culinarium.form.sections.ingredients.addButton")}
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                  {/* Autocomplete suggestions */}
                  {showSuggestions &&
                    getSuggestions(currentIngredient, ingredients).length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-[var(--border-medium)] rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {getSuggestions(currentIngredient, ingredients).map(
                          (suggestion, index) => (
                            <button
                              key={`${suggestion}-${index}`}
                              onClick={() => handleSelectSuggestion(suggestion)}
                              className="w-full text-left px-4 py-2.5 hover:bg-[var(--highlight)]/5 focus:bg-[var(--highlight)]/10 focus:outline-none transition-colors first:rounded-t-xl last:rounded-b-xl text-sm"
                            >
                              <span className="text-[var(--foreground)]">{t(suggestion)}</span>
                            </button>
                          )
                        )}
                      </div>
                    )}
                </div>

                {/* Quick suggestions */}
                {currentIngredient === "" && (
                  <div className="mt-3">
                    <p className="text-xs text-[var(--foreground)]/40 mb-2">
                      {t("culinarium.form.sections.ingredients.suggestions")}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {ingredientHistory
                        .filter(
                          (ing) =>
                            !ingredients.map((i) => i.toLowerCase()).includes(ing.toLowerCase())
                        )
                        .slice(0, 6)
                        .map((ingredient) => (
                          <button
                            key={ingredient}
                            onClick={() => handleSelectSuggestion(ingredient)}
                            type="button"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[var(--highlight)]/5 text-[var(--highlight-dark)] text-xs font-medium rounded-full hover:bg-[var(--highlight)]/15 transition-colors border border-[var(--highlight)]/15"
                          >
                            <Plus className="w-3 h-3" />
                            {t(ingredient)}
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {ingredientError && (
                  <p className="text-[var(--highlight)] text-sm mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {t("culinarium.form.sections.ingredients.error")}
                  </p>
                )}

                {/* Ingredient tags */}
                <div className="mt-4 flex flex-wrap max-h-[200px] overflow-y-auto custom-scrollbar">
                  <AnimatePresence>
                    {ingredients.map((ing) => (
                      <Tag
                        key={ing}
                        label={t(ing)}
                        onRemove={() => handleRemoveIngredient(ing)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
                {ingredients.length === 0 && !ingredientError && (
                  <p className="text-[var(--foreground)]/30 text-sm mt-2">
                    {t("culinarium.form.sections.ingredients.empty")}
                  </p>
                )}
                <p className="md:hidden text-[var(--highlight)] text-xs mt-2 flex items-center gap-1">
                  <IoAddCircleOutline className="w-4 h-4" /> {t("culinarium.form.sections.ingredients.touchHint")}
                </p>
              </FormSection>

              {/* Time available */}
              <FormSection>
                <SectionTitle
                  icon={<Clock className="w-5 h-5" />}
                  title={t("culinarium.form.sections.time.title")}
                />
                <select
                  value={availableTime}
                  onChange={(e) => setAvailableTime(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border-medium)] rounded-xl text-base
                    focus:ring-2 focus:ring-[var(--highlight)]/30 focus:border-[var(--highlight)] outline-none transition-all cursor-pointer"
                  aria-label={t("culinarium.form.sections.time.title")}
                >
                  <option value="no_limit">{t("culinarium.form.sections.time.noLimit")}</option>
                  <option value="15">{t("culinarium.form.sections.time.options.15")}</option>
                  <option value="30">{t("culinarium.form.sections.time.options.30")}</option>
                  <option value="45">{t("culinarium.form.sections.time.options.45")}</option>
                  <option value="60">{t("culinarium.form.sections.time.options.60")}</option>
                  <option value="90">{t("culinarium.form.sections.time.options.90")}</option>
                  <option value="120">{t("culinarium.form.sections.time.options.120")}</option>
                </select>
              </FormSection>

              {/* Difficulty */}
              <FormSection>
                <SectionTitle
                  icon={<Target className="w-5 h-5" />}
                  title={t("culinarium.form.sections.difficulty.title")}
                />
                <p className="text-sm text-[var(--foreground)]/50 mb-3">{t("culinarium.form.sections.difficulty.description")}</p>
                <div className="grid grid-cols-3 gap-2">
                  {difficultyLevels.map((level) => (
                    <motion.button
                      key={level.key}
                      type="button"
                      onClick={() => setDifficulty(level.key)}
                      whileTap={{ scale: 0.97 }}
                      className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border
                        ${difficulty === level.key
                          ? "bg-[var(--highlight)] text-white border-[var(--highlight)] shadow-md shadow-[var(--highlight)]/20"
                          : "bg-[var(--background)] text-[var(--foreground)]/70 border-[var(--border-medium)] hover:border-[var(--highlight)]/40"
                        }`}
                    >
                      {level.icon}
                      {level.label}
                    </motion.button>
                  ))}
                </div>
              </FormSection>

              {/* Utensils trigger */}
              <FormSection>
                <button
                  type="button"
                  onClick={() => setShowUtensilsModal(true)}
                  className="w-full flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                      <GiChopsticks className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <span className="font-display text-base font-bold text-[var(--foreground)] block">
                        {t("culinarium.form.buttons.utensils")}
                      </span>
                      <span className="text-xs text-[var(--foreground)]/50">
                        {activeUtensilCount}/{utensilsList.length} activos
                      </span>
                    </div>
                  </div>
                  <ChevronDown className="w-5 h-5 text-[var(--foreground)]/30 group-hover:text-[var(--highlight)] transition-colors" />
                </button>
              </FormSection>
            </div>

            {/* COLUMN 2: Meal Time + Diners */}
            <div className="lg:col-span-1 flex flex-col gap-5">
              {/* Meal Time */}
              <FormSection error={mealTimeError} className="flex-1">
                <SectionTitle
                  icon={<Sun className="w-5 h-5" />}
                  title={t("culinarium.form.sections.mealTime.title")}
                />
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {mealTimeData.map((time) => (
                    <motion.button
                      key={time.value}
                      type="button"
                      onClick={() => {
                        setMealTime(time.value);
                        setMealTimeError(false);
                      }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className={`flex flex-col items-center justify-center p-4 md:p-5 rounded-2xl border-2 transition-all duration-200 gap-2
                        ${mealTime === time.value
                          ? "border-[var(--highlight)] bg-[var(--highlight)] text-white shadow-lg shadow-[var(--highlight)]/20"
                          : "border-[var(--border-medium)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--highlight)]/40 hover:shadow-sm"
                        }`}
                    >
                      <span className={mealTime === time.value ? "text-white" : "text-[var(--highlight)]"}>
                        {time.icon}
                      </span>
                      <span className="font-semibold text-sm text-center leading-tight">{time.label}</span>
                    </motion.button>
                  ))}
                </div>
                {mealTimeError && (
                  <p className="text-[var(--highlight)] text-sm mt-3 text-center flex items-center justify-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {t("culinarium.form.sections.mealTime.error")}
                  </p>
                )}
              </FormSection>

              {/* Diners */}
              <FormSection className={`flex-1 ${!user?.isSubscribed ? "opacity-70" : ""}`}>
                <SectionTitle
                  icon={<Users className="w-5 h-5" />}
                  title={t("culinarium.form.sections.diners.title")}
                  badge={!user?.isSubscribed ? "PREMIUM" : undefined}
                />
                <div className="flex items-center justify-center gap-6 py-4">
                  <motion.button
                    type="button"
                    onClick={() => user?.isSubscribed && setDiners(Math.max(1, diners - 1))}
                    whileHover={{ scale: user?.isSubscribed ? 1.1 : 1 }}
                    whileTap={{ scale: user?.isSubscribed ? 0.9 : 1 }}
                    disabled={!user?.isSubscribed || diners <= 1}
                    className={`w-12 h-12 flex items-center justify-center rounded-xl border-2 transition-all
                      ${!user?.isSubscribed || diners <= 1
                        ? "opacity-40 cursor-not-allowed border-[var(--border-subtle)] bg-[var(--background)]"
                        : "border-[var(--border-medium)] bg-[var(--background)] hover:border-[var(--highlight)]/40 hover:bg-[var(--highlight)]/5 cursor-pointer"
                      }`}
                    aria-label="Disminuir"
                  >
                    <Minus className="w-5 h-5" />
                  </motion.button>

                  <motion.span
                    key={diners}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="font-display text-5xl font-bold text-[var(--foreground)] w-16 text-center tabular-nums"
                  >
                    {diners}
                  </motion.span>

                  <motion.button
                    type="button"
                    onClick={() => user?.isSubscribed && setDiners(Math.min(MAX_DINERS, diners + 1))}
                    whileHover={{ scale: user?.isSubscribed ? 1.1 : 1 }}
                    whileTap={{ scale: user?.isSubscribed ? 0.9 : 1 }}
                    disabled={!user?.isSubscribed || diners >= MAX_DINERS}
                    className={`w-12 h-12 flex items-center justify-center rounded-xl border-2 transition-all
                      ${!user?.isSubscribed || diners >= MAX_DINERS
                        ? "opacity-40 cursor-not-allowed border-[var(--border-subtle)] bg-[var(--background)]"
                        : "border-[var(--border-medium)] bg-[var(--background)] hover:border-[var(--highlight)]/40 hover:bg-[var(--highlight)]/5 cursor-pointer"
                      }`}
                    aria-label="Aumentar"
                  >
                    <Plus className="w-5 h-5" />
                  </motion.button>
                </div>
              </FormSection>
            </div>

            {/* COLUMN 3: Advanced options */}
            <div className="lg:col-span-1 flex flex-col gap-5 lg:max-h-[75vh] lg:overflow-y-auto custom-scrollbar">
              {/* Dietary Restrictions (collapsible) */}
              <FormSection>
                <button
                  type="button"
                  onClick={() => setShowDietaryRestrictions(!showDietaryRestrictions)}
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                      <ShieldOff className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <span className="font-display text-base font-bold text-[var(--foreground)] block">
                        {t("culinarium.form.sections.restrictions.title")}
                      </span>
                      {!showDietaryRestrictions && dietaryRestrictions.length > 0 && (
                        <span className="text-xs text-[var(--highlight)]">
                          {dietaryRestrictions.length} seleccionados
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!user?.isSubscribed && (
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full">
                        PREMIUM
                      </span>
                    )}
                    <motion.div
                      animate={{ rotate: showDietaryRestrictions ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-5 h-5 text-[var(--foreground)]/30" />
                    </motion.div>
                  </div>
                </button>
                <AnimatePresence>
                  {showDietaryRestrictions && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4">
                        <p className="text-[var(--foreground)]/50 mb-4 text-sm">
                          {user?.isSubscribed
                            ? t("culinarium.form.sections.restrictions.description")
                            : t("culinarium.form.sections.restrictions.premiumDescription")}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-5">
                          {dietaryOptions.map((opt) => (
                            <motion.button
                              key={opt.value}
                              type="button"
                              onClick={() => user?.isSubscribed && handleDietaryChange(opt.value)}
                              whileTap={{ scale: user?.isSubscribed ? 0.95 : 1 }}
                              disabled={!user?.isSubscribed}
                              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border
                                ${!user?.isSubscribed
                                  ? "opacity-40 cursor-not-allowed border-[var(--border-subtle)] bg-[var(--background)] text-[var(--foreground)]/40"
                                  : dietaryRestrictions.includes(opt.value)
                                    ? "border-[var(--highlight)] bg-[var(--highlight)] text-white shadow-sm"
                                    : "border-[var(--border-medium)] bg-[var(--background)] text-[var(--foreground)]/70 hover:border-[var(--highlight)]/40"
                                }`}
                            >
                              {opt.label}
                            </motion.button>
                          ))}
                        </div>

                        {/* Excluded ingredients */}
                        <div className="flex items-center gap-2 mb-3">
                          <AlertTriangle className="w-4 h-4 text-[var(--highlight)]" />
                          <h3 className="text-sm font-bold text-[var(--foreground)]">
                            {t("culinarium.form.sections.restrictions.avoidTitle")}
                          </h3>
                        </div>
                        <p className="text-[var(--foreground)]/50 mb-3 text-xs">
                          {user?.isSubscribed
                            ? t("culinarium.form.sections.restrictions.avoidInstructions")
                            : t("culinarium.form.sections.restrictions.premiumAvoid")}
                        </p>
                        <input
                          type="text"
                          value={currentExcluded}
                          onChange={(e) => user?.isSubscribed && setCurrentExcluded(e.target.value)}
                          onKeyDown={user?.isSubscribed ? handleAddExcluded : undefined}
                          placeholder={
                            user?.isSubscribed
                              ? t("culinarium.form.sections.restrictions.avoidPlaceholder")
                              : t("culinarium.form.sections.restrictions.premiumAvoid")
                          }
                          disabled={!user?.isSubscribed}
                          className={`w-full px-4 py-2.5 border rounded-xl text-sm transition-all duration-200 outline-none
                            ${!user?.isSubscribed
                              ? "opacity-40 cursor-not-allowed border-[var(--border-subtle)] bg-[var(--background)]"
                              : "border-[var(--border-medium)] bg-[var(--background)] focus:ring-2 focus:ring-[var(--highlight)]/30 focus:border-[var(--highlight)]"
                            }`}
                          aria-label={t("culinarium.form.sections.restrictions.avoidTitle")}
                        />
                        <div className="mt-3 flex flex-wrap min-h-[40px] max-h-[150px] overflow-y-auto custom-scrollbar">
                          <AnimatePresence>
                            {excludedIngredients.map((ing) => (
                              <Tag key={ing} label={ing} onRemove={handleRemoveExcluded} />
                            ))}
                          </AnimatePresence>
                        </div>
                        {excludedIngredients.length === 0 && (
                          <p className="text-[var(--foreground)]/30 text-xs mt-1">
                            {t("culinarium.form.sections.restrictions.empty")}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </FormSection>

              {/* Cuisine Style (collapsible) */}
              <FormSection>
                <button
                  type="button"
                  onClick={() => setShowCuisineStyle(!showCuisineStyle)}
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-[var(--highlight)]/10 text-[var(--highlight)]">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <span className="font-display text-base font-bold text-[var(--foreground)] block">
                        {t("culinarium.form.sections.cuisine.title")}
                      </span>
                      {!showCuisineStyle && cuisineStyle && (
                        <span className="text-xs text-[var(--highlight)]">
                          {cuisineStyles.find(s => s.value === cuisineStyle)?.label}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!user?.isSubscribed && (
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full">
                        PREMIUM
                      </span>
                    )}
                    <motion.div
                      animate={{ rotate: showCuisineStyle ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-5 h-5 text-[var(--foreground)]/30" />
                    </motion.div>
                  </div>
                </button>

                <AnimatePresence>
                  {showCuisineStyle && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4">
                        {!user?.isSubscribed && (
                          <p className="text-[var(--foreground)]/50 mb-4 text-sm">
                            {t("culinarium.form.sections.cuisine.premiumDescription")}
                          </p>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {cuisineStyles.map((style) => (
                            <motion.button
                              key={style.value}
                              type="button"
                              onClick={() => user?.isSubscribed && setCuisineStyle(style.value)}
                              whileTap={{ scale: user?.isSubscribed ? 0.95 : 1 }}
                              disabled={!user?.isSubscribed}
                              className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 text-center gap-1.5
                                ${!user?.isSubscribed
                                  ? "opacity-40 cursor-not-allowed border-[var(--border-subtle)] bg-[var(--background)]"
                                  : cuisineStyle === style.value
                                    ? "border-[var(--highlight)] bg-[var(--highlight)] text-white shadow-md shadow-[var(--highlight)]/20"
                                    : "border-[var(--border-medium)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--highlight)]/40"
                                }`}
                            >
                              <span className={`text-2xl ${cuisineStyle === style.value ? "text-white" : ""}`}>
                                {style.icon}
                              </span>
                              <span className="font-medium text-xs leading-tight">{style.label}</span>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </FormSection>

              {/* Macronutrients */}
              <ControlMacronutrientes
                initialCalories={500}
                initialPercents={{ protein: 30, carbs: 50, fats: 20 }}
                initialBasicGoal={null}
                onChange={handleMacrosChange}
                isSubscribed={user?.isSubscribed}
                onRequestUpgrade={() => user ? setShowTokens(true) : {}}
              />
            </div>
          </div>

          {/* Submit button */}
          <motion.button
            type="submit"
            whileHover={{
              scale: loadingUser || status === "loading" ? 1 : 1.01,
            }}
            whileTap={{ scale: loadingUser || status === "loading" ? 1 : 0.99 }}
            className={`w-full text-white font-bold py-4 rounded-2xl text-lg shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 flex items-center justify-center gap-3
              ${loadingUser || status === "loading"
                ? "bg-[var(--primary)]/40 cursor-not-allowed"
                : "btn-shimmer hover:shadow-xl focus:ring-[var(--highlight)]/30"
              }`}
            disabled={loadingUser || status === "loading"}
          >
            {loadingUser ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t("culinarium.form.buttons.generate.loadingUser")}</span>
              </>
            ) : status === "loading" ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t("culinarium.form.buttons.generate.generating")}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>{t("culinarium.form.buttons.generate.ready")}</span>
                <span className="text-white/70 text-sm font-normal ml-1">
                  {t("culinarium.form.buttons.generate.cost", { cost: calculateTokenCost() })}
                </span>
              </>
            )}
          </motion.button>

          {status === "error" && (
            <p className="text-[var(--highlight)] text-center text-sm">
              Error: {error}.
            </p>
          )}
        </form>

        {/* Toast notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-6 right-6 bg-[var(--foreground)] text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium max-w-sm z-50"
            >
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoadingOverlayVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-[var(--foreground)]/60 flex items-center justify-center z-50 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-10 rounded-3xl shadow-2xl flex flex-col items-center justify-center space-y-5 max-w-sm mx-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-14 h-14 border-[3px] border-[var(--highlight)] border-t-transparent rounded-full"
              />
              <p className="font-display text-xl font-bold text-[var(--foreground)] text-center">
                {t("culinarium.form.loading.title")}
              </p>
              <p className="text-sm text-[var(--foreground)]/50 text-center">
                {t("culinarium.form.messages.generatingImage")}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Utensils Modal */}
      <AnimatePresence>
        {showUtensilsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowUtensilsModal(false)} />
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative w-full md:max-w-lg bg-white rounded-2xl shadow-2xl p-6 z-50"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-bold">{t("culinarium.form.sections.utensils.title")}</h3>
                <button onClick={() => setShowUtensilsModal(false)} className="p-1.5 rounded-lg hover:bg-black/5 transition">
                  <X className="w-5 h-5 text-[var(--foreground)]/50" />
                </button>
              </div>

              <p className="text-sm text-[var(--foreground)]/50 mb-5">{t("culinarium.form.sections.utensils.description")}</p>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {utensilsList.map((u) => {
                  const active = utensils[u.key];
                  return (
                    <button
                      key={u.key}
                      type="button"
                      onClick={() => toggleUtensil(u.key)}
                      aria-pressed={active}
                      title={active ? `${t("common.youHave")}: ${u.label}` : `${t("common.youDontHave")}: ${u.label}`}
                      className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl transition-all duration-200 border
                        ${active
                          ? "border-[var(--highlight)] bg-[var(--highlight)]/10 text-[var(--foreground)]"
                          : "opacity-40 border-[var(--border-medium)] bg-[var(--background)] text-[var(--foreground)]/50"
                        }`}
                    >
                      <Icon path={u.icon} size={1} aria-hidden="true" />
                      <span className="text-[11px] text-center leading-tight font-medium">{u.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-end">
                <motion.button
                  type="button"
                  onClick={() => setShowUtensilsModal(false)}
                  whileTap={{ scale: 0.97 }}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[var(--highlight)] text-white hover:bg-[var(--highlight-dark)] transition-colors"
                >
                  {t("culinarium.form.sections.utensils.done")}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showTokens && (
        <TokensModal
          user={user as CustomUser | null}
          onClose={() => setShowTokens(false)}
        />
      )}
    </div>
  );
};

export default CulinariumForm;
