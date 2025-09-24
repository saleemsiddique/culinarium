/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";
// pages/culinarium-form.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoCloseCircleOutline,
  IoAddCircleOutline,
  IoChevronDownCircleOutline,
  IoChevronUpCircleOutline,
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
import { useRouter, useSearchParams } from "next/navigation"; // Importa useRouter

// Import Firebase client-side auth
import { auth } from "@/lib/firebase"; // Ensure this path is correct for your client-side Firebase setup
import {
  onAuthStateChanged,
  User as FirebaseUser,
  signInAnonymously,
} from "firebase/auth";
import { CustomUser, useUser } from "@/context/user-context";
import Onboarding from "@/components/onboarding";
import { FaUserClock, FaSpinner, FaUtensils, FaCoins } from "react-icons/fa";
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

// --- Helpers de imagen (compresión a <1MB en el cliente) ---
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

  // Si ya está por debajo del límite, devolver tal cual
  if (estimateBytesFromDataUrl(inputDataUrl) <= maxBytes) return inputDataUrl;

  const img = await loadImageFromDataUrl(inputDataUrl);

  let currentMaxWidth = maxWidth;
  let currentMaxHeight = maxHeight;
  let quality = initialQuality;

  // Intentos acotados: reduce calidad y, si no basta, reduce dimensiones
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

    // Bucle de calidad descendente en este tamaño
    for (let qStep = 0; qStep < 5; qStep++) {
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      if (estimateBytesFromDataUrl(dataUrl) <= maxBytes) {
        return dataUrl;
      }
      quality = Math.max(minQuality, quality - 0.1);
      if (quality <= minQuality) break;
    }

    // Si no cabemos, reducimos dimensiones y reintentamos
    currentMaxWidth = Math.max(512, Math.floor(currentMaxWidth * 0.85));
    currentMaxHeight = Math.max(512, Math.floor(currentMaxHeight * 0.85));
    quality = Math.max(minQuality, initialQuality - 0.1 * (pass + 1));
  }

  // Último intento a calidad mínima
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

// Componente para las etiquetas (tags)
type TagProps = {
  label: string;
  onRemove: (label: string) => void;
};

const Tag: React.FC<TagProps> = ({ label, onRemove }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    className="flex items-center bg-[var(--primary)]/20 text-[var(--primary)] text-sm font-medium px-3 py-1 rounded-full mr-2 mb-2 shadow-sm"
  >
    <span>{label}</span>
    <button
      type="button"
      onClick={() => onRemove(label)}
      className="ml-2 text-[var(--primary)] hover:text-[var(--foreground)] focus:outline-none"
      aria-label={`Eliminar ${label}`}
    >
      <IoCloseCircleOutline className="w-4 h-4" />
    </button>
  </motion.div>
);

const CulinariumForm: React.FC = () => {
  const router = useRouter(); // Inicializa el router
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement | null>(null);

  // Firebase User State
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null); // State to hold Firebase user object
  const [loadingUser, setLoadingUser] = useState(true); // State to track user loading
  const { user, hasEnoughTokens, deductTokens } = useUser(); // Use the user context for token functionality
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Ingredientes disponibles (Columna 1)
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState<string>("");
  const [ingredientError, setIngredientError] = useState<boolean>(false);

  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const { t } = useTranslation();
  const { ingredientHistory, /*addToHistory,*/ getSuggestions } =
    useIngredientHistory(t);

  // Nuevo estado: tiempo disponible
  const [availableTime, setAvailableTime] = useState<string>("30");

  // Estados para API
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [isLoadingOverlayVisible, setIsLoadingOverlayVisible] =
    useState<boolean>(false); // Loading overlay visibility

  // Ingredientes a evitar (Columna 3)
  const [excludedIngredients, setExcludedIngredients] = useState<string[]>([]);
  const [currentExcluded, setCurrentExcluded] = useState<string>("");

  // Toast state
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

  // Estado para mostrar el modal de tokens
  const [showTokens, setShowTokens] = useState<boolean>(false);
  // dificultad de la receta
  const [difficulty, setDifficulty] = useState<'Principiante' | 'Intermedio' | 'Chef'>('Principiante');

  // Nuevo: modal/slide para utensilios
  const [showUtensilsModal, setShowUtensilsModal] = useState<boolean>(false);

  // lista de utensilios importantes (puedes editar/añadir)
  const utensilsList = [
    { key: "horno", label: t("culinarium.form.sections.utensils.list.oven"), icon: mdiStove },
    { key: "microondas", label: t("culinarium.form.sections.utensils.list.microwave"), icon: mdiMicrowave },
    { key: "airfryer", label: t("culinarium.form.sections.utensils.list.airfryer"), icon: mdiPan },        // fallback visual (no icon MDI específico)
    { key: "sarten", label: t("culinarium.form.sections.utensils.list.pan"), icon: mdiPan },
    { key: "olla", label: t("culinarium.form.sections.utensils.list.pot"), icon: mdiPot },
    { key: "batidora", label: t("culinarium.form.sections.utensils.list.blender"), icon: mdiBlender },
    { key: "licuadora", label: t("culinarium.form.sections.utensils.list.mixer"), icon: mdiBlender },
    { key: "grill", label: t("culinarium.form.sections.utensils.list.grill"), icon: mdiGrill },
    { key: "tabla", label: t("culinarium.form.sections.utensils.list.board"), icon: mdiSilverwareForkKnife }, // uso utensilios genérico
    { key: "pelador", label: t("culinarium.form.sections.utensils.list.peeler"), icon: mdiKnife }
  ];


  // estado: todos activos por defecto
  const [utensils, setUtensils] = useState<Record<string, boolean>>(
    () => utensilsList.reduce((acc, u) => ({ ...acc, [u.key]: true }), {})
  );

  const toggleUtensil = (key: string) => {
    setUtensils(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Función para calcular el costo de tokens basado en las selecciones del formulario
  const calculateTokenCost = (): number => {
    const baseCost = 10; // Costo base fijo por ahora
    return baseCost;
  };

  const mealTimes = [
    { label: t("culinarium.form.sections.mealTime.options.breakfast.label"), value: "breakfast" },
    { label: t("culinarium.form.sections.mealTime.options.lunch.label"), value: "lunch" },
    { label: t("culinarium.form.sections.mealTime.options.dinner.label"), value: "dinner" },
    { label: t("culinarium.form.sections.mealTime.options.snack.label"), value: "snack" },
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
    {
      label: t("culinarium.form.sections.cuisine.styles.japanese.label"),
      value: "japanese",
      icon: <GiSushis className="w-6 h-6" />,
    },
    {
      label: t("culinarium.form.sections.cuisine.styles.mexican.label"),
      value: "mexican",
      icon: <GiTacos className="w-6 h-6" />,
    },
    {
      label: t("culinarium.form.sections.cuisine.styles.italian.label"),
      value: "italian",
      icon: <GiPizzaSlice className="w-6 h-6" />,
    },
    {
      label: t("culinarium.form.sections.cuisine.styles.american.label"),
      value: "american",
      icon: <GiHamburger className="w-6 h-6" />,
    },
    {
      label: t("culinarium.form.sections.cuisine.styles.spanish.label"),
      value: "spanish",
      icon: <GiBowlOfRice className="w-6 h-6" />,
    },
    {
      label: t("culinarium.form.sections.cuisine.styles.jamaican.label"),
      value: "jamaican",
      icon: <GiChopsticks className="w-6 h-6 rotate-45" />,
    },
    {
      label: t("culinarium.form.sections.cuisine.styles.indian.label"),
      value: "indian",
      icon: <MdOutlineFastfood className="w-6 h-6" />,
    },
  ];

  //Handle Exiting onboarding
  const handleFinishOnboarding = () => {
    setShowOnboarding(false);

    // Quitar el parámetro de la URL
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
    [] // no depende de nada: la referencia será estable
  )

  // Onboarding effect
  useEffect(() => {
    const onboardingParam = searchParams.get("onboarding");
    if (onboardingParam === "1") {
      setShowOnboarding(true);
    }
  }, [searchParams]);

  // Listen for Firebase Auth state changes and sign in anonymously if no user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setFirebaseUser(currentUser);
      } else {
        try {
          const anonymousUserCredential = await signInAnonymously(auth);
          setFirebaseUser(anonymousUserCredential.user);
        } catch (anonError) {
          console.error("Error signing in anonymously:", anonError);
          setToastMessage(
            "Error de autenticación. Intenta recargar la página."
          );
        }
      }
      setLoadingUser(false);
    });
    return () => unsubscribe();
  }, []);

  // Show toast temporarily
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Handlers ingredientes disponibles
  const handleAddIngredient = (
    e?:
      | React.KeyboardEvent<HTMLInputElement>
      | React.MouseEvent<HTMLButtonElement>
  ) => {
    // Si es un evento de teclado y no es Enter → no hacer nada
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
      // addToHistory(value);
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
      //addToHistory(suggestion);
      setCurrentIngredient("");
      setShowSuggestions(false);
      setIngredientError(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentIngredient(e.target.value);
    setShowSuggestions(e.target.value.length >= 2);
  };

  // Handlers ingredientes a evitar
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

    // Check if user is loaded and available
    if (loadingUser) {
      setToastMessage("Autenticando usuario, por favor espera.");
      return;
    }
    if (!user || !firebaseUser) {
      // Guarda el estado del formulario para recuperarlo tras el registro
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

    // Check if the user is anonymous (not registered)
    if (firebaseUser.isAnonymous) {
      setToastMessage(
        t("culinarium.form.messages.authError")
      );
      return;
    }

    // Detectar si es una regeneración (5 tokens) o nueva receta (usando función calculateTokenCost)
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

    // Reset errors
    setIngredientError(false);
    setMealTimeError(false);

    let isValid = true;

    // Validate ingredients
    if (ingredients.length === 0) {
      setIngredientError(true);
      isValid = false;
    }

    // Validate meal time
    if (mealTime === null) {
      setMealTimeError(true);
      isValid = false;
    }

    if (!isValid) {
      setStatus("idle"); // Stay idle if validation fails
      return;
    }

    setStatus("loading");
    setIsLoadingOverlayVisible(true); // Show loading overlay for the entire process
    setError(null);

    let recipeDataFromAI: any = null; // To store the recipe generated by OpenAI
    const selectedUtensils = Object.keys(utensils).filter(k => utensils[k]);

    try {
      // STEP 1: Generate recipe text (fast loading)
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
        difficulty, // <-- nuevo campo enviado al backend
      };
      // Guardar último formulario para autogeneración futura
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem("lastFormData", JSON.stringify(formData));
        } catch { }
      }
      // Get authentication token
      const idToken = await firebaseUser.getIdToken();

      const openaiRes = await fetch("/api/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
          "Accept-Language":i18n.language
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

      // NEW: Check if AI actually generated an error recipe based on title prefix
      if (recipeDataFromAI?.receta?.titulo?.startsWith("ERROR:")) {
        // If the AI explicitly returned an error recipe, throw an error to stop the process
        throw new Error(
          recipeDataFromAI.receta.descripcion ||
          "La IA no pudo generar una receta válida con los ingredientes proporcionados."
        );
      }

      // STEP 1.5: Deduct tokens after successful recipe generation
      try {
        await deductTokens(TOKENS_PER_RECIPE);
      } catch (tokenError) {
        console.error("Error al deducir tokens:", tokenError);
        throw new Error(
          "Error al procesar el pago de tokens. Por favor, intenta de nuevo."
        );
      }

      // STEP 2: Save recipe WITHOUT image first (so user can see it immediately)
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

      // STEP 3: Store recipe in sessionStorage and navigate (user sees recipe immediately)
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "generatedRecipe",
          JSON.stringify(recipeDataFromAI.receta)
        );
      }

      // Hide loading overlay and navigate to show recipe
      setIsLoadingOverlayVisible(false);
      router.push("/kitchen/recipes");

      // STEP 4: Generate image in background (non-blocking)
      // This happens after navigation, so user doesn't wait for image
      generateImageInBackground(
        recipeDataFromAI.receta,
        firebaseUser,
        savedRecipeData.id
      );
    } catch (err: any) {
      console.error("❌ Error general en el proceso:", err);
      setError(err.message);
      setStatus("error");
      setToastMessage(`Error: ${err.message}`); // Display error to user
      setIsLoadingOverlayVisible(false); // Hide loading overlay on error
    }
  };

  // Background image generation function
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
        // Compress image
        const compressedDataUrl = await compressDataUrlToJpeg(
          imageData.img_url,
          {
            maxBytes: 1000_000,
            maxWidth: 1024,
            maxHeight: 1024,
          }
        );

        // Update recipe with image using PUT endpoint
        const updatedRecipe = { ...recipe, img_url: compressedDataUrl };
        const saveIdToken = await firebaseUser.getIdToken();
        const updateRecipeRes = await fetch(`/api/recipes/${recipeId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipe: updatedRecipe, idToken: saveIdToken }),
        });

        if (updateRecipeRes.ok) {
          // Update sessionStorage so the image appears when user refreshes
          if (typeof window !== "undefined") {
            sessionStorage.setItem(
              "generatedRecipe",
              JSON.stringify(updatedRecipe)
            );
          }
        } else {
          const errorData = await updateRecipeRes.json().catch(() => ({}));
          console.warn(
            "⚠️ No se pudo actualizar la receta con la imagen:",
            errorData
          );
        }
      } else {
        console.warn("⚠️ No se pudo generar la imagen en segundo plano");
      }
    } catch (imgErr) {
      console.error("❌ Error generando imagen en segundo plano:", imgErr);
      // No mostramos error al usuario ya que la receta ya se generó exitosamente
    }
  };

  // Auto-generar una receta si venimos con ?auto=1 usando el último formulario guardado
  useEffect(() => {
    if (loadingUser) return;
    const auto = searchParams.get("auto");
    const regen = searchParams.get("regenerate");
    if ((auto === "1" || regen === "1") && !autoTriggered) {
      // Intentamos primero lastFormData (más fiable)
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

        // Normalizar mode estrictamente a "pro" | "basic"
        const mode: "basic" | "pro" = m?.mode === "pro" ? "pro" : "basic";

        const basicGoal: string | null =
          m?.basicGoal ?? m?.basic_goal ?? null;

        const calories = Number(m?.calories ?? 500);

        // Percents pueden venir como objeto o como propiedades separadas
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

          // ... (las asignaciones ya existentes)
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

          // Dificultad
          if (data.difficulty && (data.difficulty === 'Principiante' || data.difficulty === 'Intermedio' || data.difficulty === 'Chef')) {
            setDifficulty(data.difficulty);
          } else if (typeof data.difficulty === 'string') {
            const dif = data.difficulty.toLowerCase();
            if (dif.includes('principi')) setDifficulty('Principiante');
            else if (dif.includes('inter')) setDifficulty('Intermedio');
            else if (dif.includes('chef') || dif.includes('avanz')) setDifficulty('Chef');
          }

          // Utensilios
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

          // Macros
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

            // ... (asignaciones desde generatedRecipe)
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

            // Dificultad desde receta
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

            // Utensilios desde receta
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

            // Macros desde receta
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


  return (
    <div className="min-h-screen bg-gradient-to-br pt-[5%] from-[var(--background)] to-[var(--background)] py-10 flex items-center justify-center font-sans">
      {showOnboarding && <Onboarding onClose={handleFinishOnboarding} />}

      <Head>
        <title>{t("culinarium.form.title")}</title>
        <meta
          name="description"
          content={t("culinarium.form.description")}
        />
      </Head>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full px-4 lg:px-8 xl:px-12 bg-white rounded-3xl shadow-xl py-4 md:py-4 max-w-screen-2xl mx-auto"
      >
        {/* Botón para abrir utensilios - fuera del formulario principal */}
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={() => setShowUtensilsModal(true)}
            className="px-4 py-2 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors flex items-center gap-2"
          >
            <GiChopsticks className="w-5 h-5" />
            {t("culinarium.form.buttons.utensils")}
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-10">
          {/* Contenedor principal del formulario con grid para 3 columnas en pantallas grandes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar lg:h-auto lg:overflow-visible">
            {/* COLUMNA 1: Ingredientes (principal) */}
            <div className="lg:col-span-1 flex flex-col">
              <section
                className={`bg-[var(--background)] p-6 rounded-2xl form-custom-shadow flex-grow ${ingredientError ? "border-2 border-[var(--highlight)]" : ""
                  }`}
              >
                <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4 flex items-center">
                  <span className="mr-2 text-[var(--highlight)] text-3xl">
                    🍳
                  </span>{" "}
                  {t("culinarium.form.sections.ingredients.title")}
                </h2>
                 <p 
                  className="text-[var(--foreground)] mb-4 text-sm"
                  dangerouslySetInnerHTML={{ __html: t("culinarium.form.sections.ingredients.instructions") }}
                />
                <div className="relative">
                  <input
                    type="text"
                    value={currentIngredient}
                    onChange={handleInputChange}
                    onKeyDown={handleAddIngredient}
                    onFocus={() =>
                      setShowSuggestions(currentIngredient.length >= 2)
                    }
                    onBlur={() =>
                      setTimeout(() => setShowSuggestions(false), 200)
                    }
                    placeholder={t("culinarium.form.sections.ingredients.placeholder")}
                    className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-[var(--highlight)] focus:border-transparent text-lg ${ingredientError
                      ? "border-[var(--highlight)]"
                      : "border-[var(--primary)]"
                      }`}
                    aria-label={t("culinarium.form.sections.ingredients.title")}
                    autoComplete="off"
                  />

                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-[var(--highlight)] text-white rounded-lg hover:opacity-90 text-sm"
                  >
                    {t("culinarium.form.sections.ingredients.addButton")}
                  </button>

                  {showSuggestions &&
                    getSuggestions(currentIngredient, ingredients).length >
                    0 && (
                      <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-[var(--primary)] rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {getSuggestions(currentIngredient, ingredients).map(
                            (suggestion, index) => (
                              <button
                                key={`${suggestion}-${index}`}
                                onClick={() => handleSelectSuggestion(suggestion)}
                                className="w-full text-left px-4 py-2 hover:bg-[var(--highlight)]/10 focus:bg-[var(--highlight)]/20 focus:outline-none transition-colors first:rounded-t-xl last:rounded-b-xl flex justify-between items-center"
                              >
                                <span className="text-[var(--foreground)]">
                                  {t(suggestion)}   {/* 👈 traducir aquí */}
                                </span>
                              </button>
                            )
                          )}
                      </div>
                    )}
                </div>

                {/* Sugerencias rápidas cuando no hay input */}
                {currentIngredient === "" && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">
                      {t("culinarium.form.sections.ingredients.suggestions")}
                    </p>
                    <div className="flex flex-wrap gap-2">
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
                             className="px-3 py-1 bg-orange-100 text-orange-600 text-sm rounded-full hover:bg-orange-200 transition-colors border border-orange-300"
                           >
                             + {t(ingredient)}   {/* 👈 traducir aquí */}
                           </button>
                         ))}
                    </div>
                  </div>
                )}

                {ingredientError && (
                  <p className="text-[var(--highlight)] text-sm mt-2">
                    {t("culinarium.form.sections.ingredients.error")}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap max-h-[250px] overflow-y-auto custom-scrollbar">
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
                  <p className="text-[var(--muted)] text-sm mt-2">
                    {t("culinarium.form.sections.ingredients.empty")}
                  </p>
                )}
                <p className="md:hidden text-[var(--highlight)] text-sm mt-2 flex items-center">
                  <IoAddCircleOutline className="w-5 h-5 mr-1" /> {t("culinarium.form.sections.ingredients.touchHint")}
                </p>

                {/* NUEVA SECCIÓN: Tiempo disponible */}
                <section className="mt-6">
                  <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                    {t("culinarium.form.sections.time.title")}
                  </h3>
                  <select
                    value={availableTime}
                    onChange={(e) => setAvailableTime(e.target.value)}
                    className="w-full p-3 border border-[var(--primary)] rounded-xl focus:ring-2 focus:ring-[var(--highlight)] focus:border-transparent text-lg"
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
                </section>

                {/* NUEVA SECCIÓN: Dificultad (movida a Columna 1) */}
                <section className="mt-4">
                  <h3 className="text-lg font-bold text-[var(--foreground)] mb-3 flex items-center">
                    <span className="mr-2 text-[var(--highlight)] text-2xl">🎯</span> {t("culinarium.form.sections.difficulty.title")}
                  </h3>
                  <p className="text-sm text-[var(--muted)] mb-3">{t("culinarium.form.sections.difficulty.description")}</p>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setDifficulty('Principiante')}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold w-full ${difficulty === 'Principiante' ? "bg-[var(--highlight)]/20 border-[var(--highlight)]" : "bg-[var(--background)] border border-[var(--primary)]"}`}
                    >
                      {t("culinarium.form.sections.difficulty.levels.beginner")}
                    </button>

                    <button
                      type="button"
                      onClick={() => setDifficulty('Intermedio')}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold w-full ${difficulty === 'Intermedio' ? "bg-[var(--highlight)]/20 border-[var(--highlight)]" : "bg-[var(--background)] border border-[var(--primary)]"}`}
                    >
                      {t("culinarium.form.sections.difficulty.levels.intermediate")}
                    </button>

                    <button
                      type="button"
                      onClick={() => setDifficulty('Chef')}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold w-full ${difficulty === 'Chef' ? "bg-[var(--highlight)]/20 border-[var(--highlight)]" : "bg-[var(--background)] border border-[var(--primary)]"}`}
                    >
                      {t("culinarium.form.sections.difficulty.levels.chef")}
                    </button>
                  </div>
                </section>

              </section>
            </div>

            {/* COLUMNA 2: Momento del Día, Cantidad de Personas */}
            <div className="lg:col-span-1 flex flex-col space-y-6">
              {/* Sección de Momento del Día */}
              <section
                className={`bg-[var(--background)] p-4 rounded-2xl form-custom-shadow flex flex-col justify-between ${mealTimeError ? "border-2 border-[var(--highlight)]" : ""}`}
                style={{ minHeight: "250px", maxHeight: "350px" }}
              >
                <h2 className="text-lg font-bold text-[var(--foreground)] mb-3 flex items-center justify-center">
                  <span className="mr-2 text-[var(--highlight)] text-xl">☀️</span>{" "}
                  {t("culinarium.form.sections.mealTime.title")}
                </h2>
                <div className="grid grid-cols-2 grid-rows-2 gap-2 w-full h-full">
                  {mealTimes.map((time) => (
                    <motion.button
                      key={time.value}
                      type="button"
                      onClick={() => {
                        setMealTime(time.value);
                        setMealTimeError(false);
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all duration-200
            ${mealTime === time.value
                          ? "border-[var(--highlight)] bg-[var(--highlight)]/20 text-[var(--foreground)] shadow-md"
                          : "border-[var(--primary)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--highlight)]"
                        }`}
                    >
                      <span className="text-2xl mb-0.5">
                        {time.value === "breakfast" && "☕"}
                        {time.value === "lunch" && "🍲"}
                        {time.value === "dinner" && "🌙"}
                        {time.value === "snack" && "🍎"}
                      </span>
                      <span className="font-semibold text-center leading-tight">{time.label}</span>
                    </motion.button>
                  ))}
                </div>
                {mealTimeError && (
                  <p className="text-[var(--highlight)] text-sm mt-2 text-center">{t("culinarium.form.sections.mealTime.error")}</p>
                )}
              </section>

              {/* Sección de Número de Personas */}
              <section
                className={`bg-[var(--background)] p-6 rounded-2xl form-custom-shadow flex flex-col justify-center h-full relative ${!user?.isSubscribed ? "opacity-60" : ""}`}
              >
                <h2 className="text-xl font-bold text-[var(--foreground)] mb-4 text-center flex items-center justify-center">
                  <span className="mr-2 text-[var(--primary)] text-2xl">👨‍👩‍👧‍👦</span>{" "}
                  {t("culinarium.form.sections.diners.title")}
                  {!user?.isSubscribed && (
                    <span className="ml-2 px-2 py-1 text-xs font-semibold bg-gradient-to-r from-orange-500 to-yellow-400 text-white rounded-full">PREMIUM</span>
                  )}
                </h2>
                <div className="flex items-center justify-center space-x-4">
                  <motion.button
                    type="button"
                    onClick={() => user?.isSubscribed && setDiners(Math.max(1, diners - 1))}
                    whileHover={{ scale: user?.isSubscribed ? 1.1 : 1 }}
                    whileTap={{ scale: user?.isSubscribed ? 0.9 : 1 }}
                    disabled={!user?.isSubscribed || diners <= 1}
                    className={`p-3 bg-[var(--primary)]/20 rounded-full text-[var(--primary)] transition-colors
          ${!user?.isSubscribed || diners <= 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-[var(--primary)]/30"}`}
                    aria-label="Disminuir número de comensales"
                  >
                    <IoCloseCircleOutline className="w-7 h-7" />
                  </motion.button>

                  <span className="text-5xl font-bold text-[var(--foreground)] w-20 text-center">{diners}</span>

                  <motion.button
                    type="button"
                    onClick={() => user?.isSubscribed && setDiners(Math.min(MAX_DINERS, diners + 1))}
                    whileHover={{ scale: user?.isSubscribed ? 1.1 : 1 }}
                    whileTap={{ scale: user?.isSubscribed ? 0.9 : 1 }}
                    disabled={!user?.isSubscribed || diners >= MAX_DINERS}
                    className={`p-3 bg-[var(--primary)]/20 rounded-full text-[var(--primary)] transition-colors
          ${!user?.isSubscribed || diners >= MAX_DINERS ? "opacity-50 cursor-not-allowed" : "hover:bg-[var(--primary)]/30"}`}
                    aria-label="Aumentar número de comensales"
                  >
                    <IoAddCircleOutline className="w-7 h-7" />
                  </motion.button>
                </div>
              </section>

            </div>


            {/* COLUMNA 3: MAS OPCIONES */}
            <div className="lg:col-span-1 flex flex-col space-y-6 lg:max-h-[70vh] lg:overflow-y-auto custom-scrollbar">
              {/* Sección de Restricciones y Exclusiones (colapsable) */}
              <section className="bg-[var(--background)] p-6 rounded-2xl form-custom-shadow">
                <button
                  type="button"
                  onClick={() =>
                    setShowDietaryRestrictions(!showDietaryRestrictions)
                  }
                  className="w-full flex flex-col items-start text-left font-bold text-[var(--foreground)] mb-4 pb-2 border-b border-[var(--muted)]/50 hover:text-[var(--primary)] transition-colors"
                >
                  <div className="flex justify-between w-full items-center mb-1">
                    {!user?.isSubscribed && (
                      <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-orange-500 to-yellow-400 text-white rounded-md">
                        PREMIUM
                      </span>
                    )}
                    <motion.span
                      animate={{ rotate: showDietaryRestrictions ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {showDietaryRestrictions ? (
                        <IoChevronUpCircleOutline className="w-8 h-8 text-[var(--muted)]" />
                      ) : (
                        <IoChevronDownCircleOutline className="w-8 h-8 text-[var(--muted)]" />
                      )}
                    </motion.span>
                  </div>
                  <div className="flex items-center text-2xl mt-1">
                    <span className="mr-2 text-[var(--primary)] text-3xl">
                      🚫
                    </span>
                    <span>{t("culinarium.form.sections.restrictions.title")}</span>
                  </div>
                </button>
                <AnimatePresence>
                  {showDietaryRestrictions && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="text-[var(--foreground)] mb-4 text-sm">
                        {user?.isSubscribed
                          ? t("culinarium.form.sections.restrictions.description")
                          : t("culinarium.form.sections.restrictions.premiumDescription")}
                      </p>
                      <div className="flex flex-wrap gap-3 mb-6 m-2">
                        {dietaryOptions.map((opt) => (
                          <motion.button
                            key={opt.value}
                            type="button"
                            onClick={() =>
                              user?.isSubscribed &&
                              handleDietaryChange(opt.value)
                            }
                            whileHover={{
                              scale: user?.isSubscribed ? 1.05 : 1,
                            }}
                            whileTap={{ scale: user?.isSubscribed ? 0.95 : 1 }}
                            disabled={!user?.isSubscribed}
                            className={`px-5 py-2 rounded-full border-2 transition-all duration-200 ${!user?.isSubscribed
                              ? "opacity-50 cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400"
                              : dietaryRestrictions.includes(opt.value)
                                ? "border-[var(--primary)] bg-[var(--primary)]/20 text-[var(--foreground)] shadow-md"
                                : "border-[var(--primary)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--primary)]"
                              }`}
                          >
                            {opt.label}
                          </motion.button>
                        ))}
                      </div>
                      <h3 className="text-xl font-bold text-[var(--foreground)] mb-3 flex items-center">
                        <span className="mr-2 text-[var(--highlight)] text-2xl">
                          ⚠️
                        </span>{" "}
                        {t("culinarium.form.sections.restrictions.avoidTitle")}
                      </h3>
                      <p className="text-[var(--foreground)] mb-2 text-sm">
                        {user?.isSubscribed
                          ? t("culinarium.form.sections.restrictions.avoidInstructions")
                          : t("culinarium.form.sections.restrictions.premiumAvoid")}
                      </p>
                      <input
                        type="text"
                        value={currentExcluded}
                        onChange={(e) =>
                          user?.isSubscribed &&
                          setCurrentExcluded(e.target.value)
                        }
                        onKeyDown={
                          user?.isSubscribed ? handleAddExcluded : undefined
                        }
                        placeholder={
                          user?.isSubscribed
                            ? t("culinarium.form.sections.restrictions.avoidPlaceholder")
                          : t("culinarium.form.sections.restrictions.premiumAvoid")
                        }
                        disabled={!user?.isSubscribed}
                        className={`w-full p-3 border rounded-xl text-lg ${!user?.isSubscribed
                          ? "opacity-50 cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400"
                          : "border-[var(--primary)] focus:ring-2 focus:ring-[var(--highlight)] focus:border-transparent"
                          }`}
                        aria-label={t("culinarium.form.sections.restrictions.avoidTitle")}
                      />
                      <div className="mt-4 flex flex-wrap min-h-[60px] max-h-[200px] overflow-y-auto custom-scrollbar">
                        <AnimatePresence>
                          {excludedIngredients.map((ing) => (
                            <Tag
                              key={ing}
                              label={ing}
                              onRemove={handleRemoveExcluded}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                      {excludedIngredients.length === 0 && (
                        <p className="text-[var(--muted)] text-sm mt-2">
                          {t("culinarium.form.sections.restrictions.empty")}
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              {/* Sección de Estilo de Comida (colapsable) */}
              <section className="bg-[var(--background)] p-6 rounded-2xl form-custom-shadow">
                <button
                  type="button"
                  onClick={() => setShowCuisineStyle(!showCuisineStyle)}
                  className="w-full flex flex-col items-start text-left font-bold text-[var(--foreground)] mb-4 pb-2 border-b border-[var(--muted)]/50 hover:text-[var(--highlight)] transition-colors"
                >
                  <div className="flex justify-between w-full items-center mb-1">
                    {!user?.isSubscribed && (
                      <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-orange-500 to-yellow-400 text-white rounded-md">
                        PREMIUM
                      </span>
                    )}
                    <motion.span
                      animate={{ rotate: showCuisineStyle ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {showCuisineStyle ? (
                        <IoChevronUpCircleOutline className="w-8 h-8 text-[var(--muted)]" />
                      ) : (
                        <IoChevronDownCircleOutline className="w-8 h-8 text-[var(--muted)]" />
                      )}
                    </motion.span>
                  </div>
                  <div className="flex items-center text-2xl mt-1">
                    <span className="mr-2 text-[var(--highlight)] text-3xl">
                      🌍
                    </span>
                    <span>{t("culinarium.form.sections.cuisine.title")}</span>
                  </div>
                </button>

                <AnimatePresence>
                  {showCuisineStyle && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      {!user?.isSubscribed && (
                        <p className="text-[var(--foreground)] mb-4 text-sm">
                          {t("culinarium.form.sections.cuisine.premiumDescription")}
                        </p>
                      )}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 m-1">
                        {cuisineStyles.map((style) => (
                          <motion.button
                            key={style.value}
                            type="button"
                            onClick={() =>
                              user?.isSubscribed && setCuisineStyle(style.value)
                            }
                            whileHover={{
                              scale: user?.isSubscribed ? 1.05 : 1,
                            }}
                            whileTap={{ scale: user?.isSubscribed ? 0.95 : 1 }}
                            disabled={!user?.isSubscribed}
                            className={`flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl border-2 transition-all duration-200 text-center
                                    ${!user?.isSubscribed
                                ? "opacity-50 cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400"
                                : cuisineStyle === style.value
                                  ? "border-[var(--highlight)] bg-[var(--highlight)]/20 text-[var(--foreground)] shadow-md"
                                  : "border-[var(--primary)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--highlight)]"
                              }`}
                          >
                            <span className="text-3xl sm:text-4xl mb-1 sm:mb-2">
                              {style.icon}
                            </span>
                            <span className="font-semibold text-xs sm:text-sm leading-tight">
                              {style.label}
                            </span>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              {/* Sección de Macronutrientes (colapsable) */}
              <ControlMacronutrientes
                initialCalories={500}
                initialPercents={{ protein: 30, carbs: 50, fats: 20 }}
                initialBasicGoal={null}
                onChange={handleMacrosChange}
                isSubscribed={user?.isSubscribed}
                onRequestUpgrade={() => setShowTokens(true)}
              />

            </div>
          </div>
          {/* Fin del grid de 3 columnas */}

          {/* Disable button if user is not loaded or form is submitting */}
          <motion.button
            type="submit"
            whileHover={{
              scale: loadingUser || status === "loading" ? 1 : 1.02,
            }}
            whileTap={{ scale: loadingUser || status === "loading" ? 1 : 0.98 }}
            className={`w-full text-[var(--text2)] font-bold py-4 rounded-xl text-2xl shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 flex flex-col items-center gap-1
    ${loadingUser || status === "loading"
                ? "bg-[var(--primary)]/50 cursor-not-allowed"
                : "bg-gradient-to-r from-[var(--highlight)] to-[var(--highlight-dark)] hover:shadow-xl focus:ring-[var(--highlight)]"
              }`}
            disabled={loadingUser || status === "loading"}
          >
            {loadingUser ? (
              <>
                <FaUserClock className="text-2xl mb-1" />
                <span>{t("culinarium.form.buttons.generate.loadingUser")}</span>
              </>
            ) : status === "loading" ? (
              <>
                <FaSpinner className="text-2xl animate-spin mb-1" />
                <span>{t("culinarium.form.buttons.generate.generating")}</span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-2">
                  <FaUtensils className="text-2xl" />
                  {t("culinarium.form.buttons.generate.ready")}
                </span>
                <span className="text-sm font-light mt-1 flex items-center gap-1">
                  <FaCoins className="text-yellow-300" />
                  {t("culinarium.form.buttons.generate.cost", { cost: calculateTokenCost() })}
                </span>
              </>
            )}
          </motion.button>
          {status === "error" && (
            <p className="text-[var(--highlight)] text-center">
              Error: {error}.
            </p>
          )}
        </form>

        {/* Toast notification */}
        {toastMessage && (
          <div className="fixed bottom-4 right-4 bg-[var(--highlight)] text-[var(--text2)] px-4 py-2 rounded-lg shadow-lg">
            {toastMessage}
          </div>
        )}
      </motion.div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoadingOverlayVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-[var(--foreground)]/70 flex items-center justify-center z-50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-[var(--background)] p-8 rounded-3xl shadow-2xl flex flex-col items-center justify-center space-y-4"
            >
              {/* Spinning Circle */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-t-4 border-[var(--highlight)] border-t-transparent rounded-full"
              ></motion.div>
              <p className="text-xl font-semibold text-[var(--foreground)]">
                {t("culinarium.form.loading.title")}
              </p>
              <p className="text-sm text-[var(--muted)]">
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
            className="fixed inset-0 z-60 flex items-end md:items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowUtensilsModal(false)} />
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative w-full md:max-w-xl bg-[var(--background)] rounded-2xl shadow-2xl p-6 z-50"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">{t("culinarium.form.sections.utensils.title")}</h3>
              </div>

              <p className="text-sm text-[var(--muted)] mb-4">{t("culinarium.form.sections.utensils.description")}</p>

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
                      className={`flex flex-col items-center justify-center gap-1 p-3 rounded-full transition-all border 
            ${active ? "border-[var(--highlight)] bg-[var(--highlight)]/20 text-[var(--foreground)]" : "opacity-60 border border-[var(--primary)] bg-[var(--background)] text-[var(--muted)]"}`}
                    >
                      <Icon path={u.icon} size={1.2} className="text-2xl" aria-hidden="true" />
                      <span className="text-[14px] text-center mt-1">{u.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowUtensilsModal(false)}
                  className="px-4 py-2 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)] hover:bg-[var(--primary)]/20"
                >
                  {t("culinarium.form.sections.utensils.done")}
                </button>
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
