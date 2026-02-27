"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoArrowBackCircleOutline,
  IoTimeOutline,
  IoPeopleOutline,
  IoRestaurantOutline,
  IoWarningOutline,
  IoReloadOutline,
} from "react-icons/io5";
import {
  GiChopsticks, GiSushis, GiTacos, GiHamburger, GiPizzaSlice,
  GiBowlOfRice, GiFruitBowl, GiChefToque,
} from "react-icons/gi";
import { MdOutlineFastfood, MdOutlineNoFood } from "react-icons/md";
import { FaCoins } from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Check, ChefHat, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { auth } from "@/lib/firebase";
import { compressDataUrlToJpeg } from "@/utils/image-compression";
import CookingMode from "@/components/CookingMode";
import FirstRecipeModal from "@/components/FirstRecipeModal";

// ─── Types ────────────────────────────────────────────────────────────────────

type Ingredient = { nombre: string; cantidad: string; unidad: string };

type Recipe = {
  id?: string;
  titulo: string;
  descripcion: string;
  ingredientes: Ingredient[];
  instrucciones: { paso: number; texto: string }[];
  tiempo_total_min: number;
  porciones: number;
  estilo: string | null;
  restricciones: string[];
  excluidos: string[];
  img_url: string;
  macronutrientes?: {
    calorias: number | null;
    proteinas_g: number | null;
    carbohidratos_g: number | null;
    grasas_g: number | null;
  };
  dificultad: string;
};

type StreamPhase = "idle" | "connecting" | "streaming" | "saving" | "done" | "error";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function findMatchingBracket(
  text: string, start: number, open: string, close: string
): number {
  if (start === -1 || text[start] !== open) return -1;
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === open) depth++;
    else if (text[i] === close) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function parseStreamingRecipe(text: string): Partial<Recipe> {
  const result: Partial<Recipe> = {};

  const t = text.match(/"titulo"\s*:\s*"((?:[^"\\]|\\.)*)"/)
  if (t) result.titulo = t[1].replace(/\\n/g, " ").replace(/\\"/g, '"');

  const d = text.match(/"descripcion"\s*:\s*"((?:[^"\\]|\\.)*)"/)
  if (d) result.descripcion = d[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');

  // ingredientes: only when array closes
  const ingStart = text.indexOf('"ingredientes"');
  if (ingStart !== -1) {
    const arrStart = text.indexOf("[", ingStart);
    const arrEnd = findMatchingBracket(text, arrStart, "[", "]");
    if (arrEnd !== -1) {
      try { result.ingredientes = JSON.parse(text.slice(arrStart, arrEnd + 1)); } catch { /* partial */ }
    }
  }

  // instrucciones: extract individual closed step objects
  const stepMatches = [
    ...text.matchAll(/\{\s*"paso"\s*:\s*(\d+)\s*,\s*"texto"\s*:\s*"((?:[^"\\]|\\.)*)"\s*\}/g),
  ];
  if (stepMatches.length > 0) {
    result.instrucciones = stepMatches.map((m) => ({
      paso: parseInt(m[1]),
      texto: m[2].replace(/\\n/g, "\n").replace(/\\"/g, '"'),
    }));
  }

  const tiempo = text.match(/"tiempo_total_min"\s*:\s*(\d+)/);
  if (tiempo) result.tiempo_total_min = parseInt(tiempo[1]);

  const porciones = text.match(/"porciones"\s*:\s*(\d+)/);
  if (porciones) result.porciones = parseInt(porciones[1]);

  return result;
}

// ─── Component ────────────────────────────────────────────────────────────────

const RecipesContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const isGenerating = searchParams.get("generating") === "true";
  const recipeIdParam = searchParams.get("id");

  // ── Recipe state ──
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageKey, setImageKey] = useState(0);

  // ── Streaming state ──
  const [streamPhase, setStreamPhase] = useState<StreamPhase>("idle");
  const [partialRecipe, setPartialRecipe] = useState<Partial<Recipe> | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [pendingFormData, setPendingFormData] = useState<Record<string, any> | null>(null);

  // ── Image generation state ──
  const [imageGenerating, setImageGenerating] = useState(false);
  const [imageDone, setImageDone] = useState(false);

  // ── UI state ──
  const [showCookingMode, setShowCookingMode] = useState(false);
  const [showFirstRecipeModal, setShowFirstRecipeModal] = useState(false);

  // Ref to skip API refetch for a recipe we just streamed
  const justStreamedIdRef = useRef<string | null>(null);

  // ─── Background image generation ──────────────────────────────────────────

  const generateImageInBackground = async (
    recipeData: Recipe,
    recipeId: string,
    onDone: () => void
  ) => {
    try {
      const fbUser = auth.currentUser;
      if (!fbUser) return;

      const idToken = await fbUser.getIdToken();
      const imageRes = await fetch("/api/recipe-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ recipe: recipeData }),
      });

      const imageData = await imageRes.json().catch(() => ({}));
      if (imageRes.ok && imageData?.img_url) {
        const compressed = await compressDataUrlToJpeg(imageData.img_url, {
          maxBytes: 1_000_000, maxWidth: 1024, maxHeight: 1024,
        });

        const updatedRecipe = { ...recipeData, img_url: compressed };
        const saveIdToken = await fbUser.getIdToken();
        const updateRes = await fetch(`/api/recipes/${recipeId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipe: updatedRecipe, idToken: saveIdToken }),
        });

        if (updateRes.ok) {
          sessionStorage.setItem("generatedRecipe", JSON.stringify(updatedRecipe));
          setImageSrc(compressed);
          setRecipe(updatedRecipe);
        }
      }
    } catch (err) {
      console.error("Error generando imagen en segundo plano:", err);
    } finally {
      onDone();
    }
  };

  // ─── Save & finalize after stream ─────────────────────────────────────────

  const saveAndFinalize = async (
    accumulated: string,
    formData: Record<string, any>,
    idToken: string
  ) => {
    setStreamPhase("saving");

    const clean = accumulated
      .replace(/^```json\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let fullRecipe: Recipe;
    try {
      const parsed = JSON.parse(clean);
      fullRecipe = parsed.receta ?? parsed;
    } catch {
      setStreamError("El JSON generado no es válido. Por favor intenta de nuevo.");
      setStreamPhase("error");
      return;
    }

    sessionStorage.setItem("generatedRecipe", JSON.stringify(fullRecipe));

    try {
      const saveRes = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipe: fullRecipe, idToken }),
      });

      if (!saveRes.ok) {
        const errData = await saveRes.json().catch(() => ({}));
        throw new Error(errData.error || `Error ${saveRes.status}`);
      }

      const { id: recipeId } = await saveRes.json();

      // Set recipe directly to avoid refetch flash
      justStreamedIdRef.current = recipeId;
      setRecipe(fullRecipe);
      setStreamPhase("done");

      // Launch image generation
      setImageGenerating(true);
      generateImageInBackground(fullRecipe, recipeId, () => {
        setImageDone(true);
        setImageGenerating(false);
      });

      // Update URL
      router.replace(`/kitchen/recipes?id=${recipeId}`);

      // First recipe modal
      if (typeof window !== "undefined" && sessionStorage.getItem("isFirstRecipe")) {
        sessionStorage.removeItem("isFirstRecipe");
        setShowFirstRecipeModal(true);
      }
    } catch (err: any) {
      console.error("Error guardando receta:", err);
      setStreamError(err.message || "Error al guardar la receta.");
      setStreamPhase("error");
    }
  };

  // ─── Streaming start ──────────────────────────────────────────────────────

  const startStreaming = async (formData: Record<string, any>) => {
    setStreamPhase("connecting");
    setStreamError(null);
    setPartialRecipe(null);

    const fbUser = auth.currentUser;
    if (!fbUser) {
      setStreamError("No hay sesión activa. Por favor inicia sesión.");
      setStreamPhase("error");
      return;
    }

    let idToken: string;
    try {
      idToken = await fbUser.getIdToken();
    } catch {
      setStreamError("Error de autenticación.");
      setStreamPhase("error");
      return;
    }

    let response: Response;
    try {
      response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
          "Accept-Language": navigator.language || "es",
        },
        body: JSON.stringify(formData),
      });
    } catch {
      setStreamError("Error de conexión. Comprueba tu red e intenta de nuevo.");
      setStreamPhase("error");
      return;
    }

    if (!response.ok || !response.body) {
      setStreamError("Error al iniciar la generación.");
      setStreamPhase("error");
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulated = "";
    let buffer = "";
    setStreamPhase("streaming");

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          let event: any;
          try { event = JSON.parse(line.slice(6)); } catch { continue; }

          if (event.type === "deducted") {
            // Refresh user context via the existing token_update event
            window.dispatchEvent(new Event("token_update"));
          }

          if (event.type === "chunk") {
            accumulated += event.text;
            setPartialRecipe(parseStreamingRecipe(accumulated));
          }

          if (event.type === "error") {
            setStreamError(event.message || "Error durante la generación.");
            setStreamPhase("error");
            return;
          }

          if (event.type === "done") {
            await saveAndFinalize(accumulated, formData, idToken);
            return;
          }
        }
      }
    } catch (err: any) {
      console.error("Error leyendo stream:", err);
      setStreamError("Error leyendo la respuesta. Por favor intenta de nuevo.");
      setStreamPhase("error");
    }
  };

  // ─── Effects ──────────────────────────────────────────────────────────────

  // Start streaming when ?generating=true
  useEffect(() => {
    if (!isGenerating) return;

    const raw = typeof window !== "undefined"
      ? sessionStorage.getItem("pendingGenerationData")
      : null;

    if (!raw) {
      router.push("/kitchen");
      return;
    }

    let formData: Record<string, any>;
    try { formData = JSON.parse(raw); } catch {
      router.push("/kitchen");
      return;
    }

    setPendingFormData(formData);
    startStreaming(formData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGenerating]);

  // Fetch recipe by ID (or load from sessionStorage)
  useEffect(() => {
    if (isGenerating) return; // handled by streaming effect

    if (recipeIdParam) {
      // Skip fetch if we just streamed this recipe
      if (justStreamedIdRef.current === recipeIdParam) {
        justStreamedIdRef.current = null;
        return;
      }
      fetchRecipeById(recipeIdParam);
    } else {
      // Fall back to sessionStorage
      const stored =
        typeof window !== "undefined" ? sessionStorage.getItem("generatedRecipe") : null;
      if (stored) {
        const parsed: Recipe = JSON.parse(stored);
        setRecipe(parsed);
        if (parsed.img_url) setImageSrc(parsed.img_url);
      } else {
        router.push("/kitchen");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipeIdParam, isGenerating]);

  // Poll for image updates from background generation (legacy fallback)
  useEffect(() => {
    if (!recipe || imageSrc) return;
    if (recipe.titulo?.startsWith("ERROR:")) return;

    let retryCount = 0;
    const maxRetries = 20;

    const checkForImage = () => {
      retryCount++;
      const stored =
        typeof window !== "undefined" ? sessionStorage.getItem("generatedRecipe") : null;
      if (stored) {
        const parsed: Recipe = JSON.parse(stored);
        if (parsed.img_url) {
          setImageSrc(parsed.img_url);
          setRecipe(parsed);
          return true;
        }
      }
      if (retryCount >= maxRetries) return false;
      return false;
    };

    checkForImage();
    const interval = setInterval(() => {
      if (checkForImage()) clearInterval(interval);
    }, 2000);

    return () => clearInterval(interval);
  }, [recipe, imageSrc]);

  // ─── Fetch by ID ──────────────────────────────────────────────────────────

  const fetchRecipeById = async (id: string) => {
    setLoadingRecipe(true);
    try {
      const fbUser = auth.currentUser;
      if (!fbUser) { router.push("/login"); return; }
      const idToken = await fbUser.getIdToken();

      const res = await fetch(`/api/recipes/${id}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Error al obtener la receta.");

      const data = await res.json();
      setRecipe(data.recipe);
      if (data.recipe.img_url) setImageSrc(data.recipe.img_url);
    } catch (err) {
      console.error("Error fetching recipe:", err);
      router.push("/kitchen/recipes/list");
    } finally {
      setLoadingRecipe(false);
    }
  };

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleGoBack = () => {
    if (typeof window !== "undefined") sessionStorage.removeItem("generatedRecipe");
    if (recipeIdParam) router.push("/kitchen/recipes/list");
    else router.push("/kitchen");
  };

  const handleGenerateAnother = () => {
    if (typeof window !== "undefined") sessionStorage.removeItem("generatedRecipe");
    if (recipeIdParam) router.push("/kitchen");
    else router.push("/kitchen?auto=1&regenerate=1");
  };

  const handleImageError = () => {
    if (imageSrc) {
      setImageKey((k) => k + 1);
      setImageSrc(`${imageSrc.split("?")[0]}?retry=${Date.now()}`);
    }
  };

  const handleRetryStream = () => {
    if (pendingFormData) startStreaming(pendingFormData);
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const getDifficultyKey = (dificultad: string) => {
    const map: Record<string, string> = {
      Principiante: "beginner", Intermedio: "intermediate", Chef: "advanced",
      Beginner: "beginner", Intermediate: "intermediate",
    };
    return map[dificultad] || "beginner";
  };

  const getCuisineIcon = (style: string | null) => {
    switch (style) {
      case "japanese": return <GiSushis className="w-6 h-6 text-[var(--highlight)]" />;
      case "mexican": return <GiTacos className="w-6 h-6 text-[var(--highlight)]" />;
      case "italian": return <GiPizzaSlice className="w-6 h-6 text-[var(--highlight)]" />;
      case "american": return <GiHamburger className="w-6 h-6 text-[var(--highlight)]" />;
      case "spanish": return <GiBowlOfRice className="w-6 h-6 text-[var(--highlight)]" />;
      case "jamaican": return <GiChopsticks className="w-6 h-6 text-[var(--highlight)] rotate-45" />;
      case "indian": return <MdOutlineFastfood className="w-6 h-6 text-[var(--highlight)]" />;
      default: return <IoRestaurantOutline className="w-6 h-6 text-[var(--highlight)]" />;
    }
  };

  const getRestrictionLabel = (r: string) => {
    const map: Record<string, string> = {
      vegetarian: "Vegetariano", vegan: "Vegano",
      "gluten-free": "Sin Gluten", "lactose-free": "Sin Lactosa", keto: "Keto",
    };
    return map[r] || r;
  };

  // ─── Render helpers ───────────────────────────────────────────────────────

  const Skeleton = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 rounded-lg ${className ?? ""}`} />
  );

  // ─── Stream: connecting / early streaming ─────────────────────────────────

  if (streamPhase === "connecting" || (streamPhase === "streaming" && !partialRecipe?.titulo)) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center gap-6 px-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <ChefHat className="w-16 h-16 text-[var(--highlight)]" />
        </motion.div>
        <h2 className="text-2xl font-bold text-[var(--foreground)] text-center">
          Creando tu receta...
        </h2>
        <div className="w-64 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[var(--highlight)] to-[var(--highlight-dark)] rounded-full"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <p className="text-sm text-[var(--foreground)]/50">Analizando ingredientes y generando pasos...</p>
      </div>
    );
  }

  // ─── Stream: error ────────────────────────────────────────────────────────

  if (streamPhase === "error") {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <IoWarningOutline className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">
            Error al generar la receta
          </h2>
          <p className="text-[var(--foreground)]/70 mb-6 text-sm">{streamError}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleRetryStream}
              className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-gradient-to-r from-[var(--highlight)] to-[var(--highlight-dark)] text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Reintentar
            </button>
            <button
              onClick={() => router.push("/kitchen")}
              className="w-full py-3 px-6 border-2 border-gray-200 text-gray-600 rounded-full font-semibold hover:bg-gray-50 transition"
            >
              Volver al formulario
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Normal loading (no stream) ───────────────────────────────────────────

  if (loadingRecipe || (!recipe && !partialRecipe && streamPhase === "idle")) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-t-4 border-[var(--primary)] border-t-transparent rounded-full"
        />
        <p className="ml-4 text-xl font-semibold text-[var(--foreground)]">
          {t("recipeDetail.loadingRecipe")}
        </p>
      </div>
    );
  }

  // ─── Decide which recipe data to display ──────────────────────────────────

  // During saving phase, show partialRecipe (full accumulated). After done, show recipe.
  const displayRecipe: Partial<Recipe> | null =
    streamPhase === "streaming" || streamPhase === "saving"
      ? partialRecipe
      : recipe;

  const isErrorRecipe = displayRecipe?.titulo?.startsWith("ERROR:") ?? false;
  const isStreaming = streamPhase === "streaming" || streamPhase === "saving";

  // ─── Main recipe view ─────────────────────────────────────────────────────

  return (
    <>
      <div className="min-h-screen bg-[var(--background)] py-[5%] flex items-center justify-center font-sans">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full px-4 lg:px-8 xl:px-12 bg-white rounded-3xl shadow-xl py-4 md:py-8 max-w-screen-xl mx-auto"
        >
          <div className="flex flex-col space-y-8">
            {/* Back Button — hidden during active streaming */}
            {!isStreaming && (
              <motion.button
                type="button"
                onClick={handleGoBack}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center self-start px-6 py-3 bg-[var(--primary)] text-[var(--text2)] rounded-full shadow-md hover:bg-[var(--primary)]/80 transition-colors text-lg font-semibold"
              >
                <IoArrowBackCircleOutline className="w-6 h-6 mr-2" />
                {recipeIdParam
                  ? t("recipeDetail.backButton.toRecipes")
                  : t("recipeDetail.backButton.toForm")}
              </motion.button>
            )}

            {/* Recipe Header */}
            <section className="text-center mb-6">
              {isStreaming && !displayRecipe?.titulo ? (
                <Skeleton className="h-10 w-3/4 mx-auto mb-4" />
              ) : (
                <AnimatePresence>
                  <motion.h1
                    key={displayRecipe?.titulo ?? "loading"}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-extrabold text-[var(--foreground)] mb-4 leading-tight font-[Fraunces]"
                  >
                    {isErrorRecipe ? (
                      <span className="text-red-600 flex items-center justify-center">
                        <IoWarningOutline className="w-10 h-10 mr-3" />
                        {displayRecipe?.titulo}
                      </span>
                    ) : (
                      displayRecipe?.titulo ?? ""
                    )}
                  </motion.h1>
                </AnimatePresence>
              )}

              {isStreaming && !displayRecipe?.descripcion ? (
                <div className="space-y-2 max-w-2xl mx-auto">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6 mx-auto" />
                </div>
              ) : (
                <AnimatePresence>
                  <motion.p
                    key={displayRecipe?.descripcion ?? "desc-loading"}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-lg md:text-xl text-[var(--foreground)]/80 max-w-3xl mx-auto italic"
                  >
                    {displayRecipe?.descripcion ?? ""}
                  </motion.p>
                </AnimatePresence>
              )}
            </section>

            {/* Hero Image with live badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-lg mb-8"
            >
              {imageSrc ? (
                <Image
                  key={imageKey}
                  src={imageSrc}
                  alt={displayRecipe?.titulo ?? "Receta"}
                  fill
                  className="object-cover"
                  unoptimized
                  onError={handleImageError}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
              )}

              {/* Live image generation badge */}
              <AnimatePresence>
                {imageGenerating && !imageDone && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute bottom-3 right-3 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium shadow-lg"
                  >
                    <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                    Generando imagen...
                  </motion.div>
                )}
                {imageDone && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute bottom-3 right-3 flex items-center gap-2 bg-green-500/90 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg"
                  >
                    <Check className="w-4 h-4" /> Imagen lista
                  </motion.div>
                )}
                {/* Fallback badge when no streaming image but no src yet */}
                {!isStreaming && !imageSrc && !imageGenerating && !imageDone && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center"
                  >
                    <div className="bg-white/90 p-4 rounded-2xl flex flex-col items-center space-y-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 border-2 border-t-2 border-[var(--primary)] border-t-transparent rounded-full"
                      />
                      <p className="text-sm font-medium text-[var(--foreground)] text-center">
                        {t("recipeDetail.loading.generatingImage")}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Metadata Section */}
            {!isErrorRecipe && (
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-[var(--primary)]/10 p-4 rounded-xl shadow-sm flex items-center space-x-3">
                  <IoTimeOutline className="w-8 h-8 text-[var(--primary)]" />
                  <div>
                    <h3 className="text-md font-semibold text-[var(--foreground)]">
                      {t("recipeDetail.metadata.totalTime")}
                    </h3>
                    {isStreaming && !displayRecipe?.tiempo_total_min ? (
                      <Skeleton className="h-6 w-16 mt-1" />
                    ) : (
                      <p className="text-lg font-bold text-[var(--primary)]">
                        {displayRecipe?.tiempo_total_min ?? "—"} min
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-[var(--highlight)]/10 p-4 rounded-xl shadow-sm flex items-center space-x-3">
                  <IoPeopleOutline className="w-8 h-8 text-[var(--highlight)]" />
                  <div>
                    <h3 className="text-md font-semibold text-[var(--foreground)]">
                      {t("recipeDetail.metadata.portions")}
                    </h3>
                    {isStreaming && !displayRecipe?.porciones ? (
                      <Skeleton className="h-6 w-8 mt-1" />
                    ) : (
                      <p className="text-lg font-bold text-[var(--highlight)]">
                        {displayRecipe?.porciones ?? "—"}
                      </p>
                    )}
                  </div>
                </div>

                {(recipe as Recipe)?.estilo && (
                  <div className="bg-[var(--highlight)]/10 p-4 rounded-xl shadow-sm flex items-center space-x-3">
                    {getCuisineIcon((recipe as Recipe).estilo)}
                    <div>
                      <h3 className="text-md font-semibold text-[var(--foreground)]">
                        {t("recipeDetail.metadata.style")}
                      </h3>
                      <p className="text-lg font-bold text-[var(--highlight)] capitalize">
                        {(recipe as Recipe).estilo}
                      </p>
                    </div>
                  </div>
                )}

                {(recipe as Recipe)?.restricciones?.length > 0 && (
                  <div className="bg-[var(--highlight)]/10 p-4 rounded-xl shadow-sm flex items-center space-x-3">
                    <GiFruitBowl className="w-8 h-8 text-[var(--highlight)]" />
                    <div>
                      <h3 className="text-md font-semibold text-[var(--foreground)]">
                        {t("recipeDetail.metadata.restrictions")}
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        {(recipe as Recipe).restricciones.map((r, i) => (
                          <span
                            key={i}
                            className="text-sm font-bold text-[var(--highlight)] bg-[var(--highlight)]/20 px-2 py-0.5 rounded-full"
                          >
                            {getRestrictionLabel(r)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Dificultad */}
                {(recipe as Recipe)?.dificultad && (
                  <div
                    className="p-4 rounded-xl shadow-sm flex items-center space-x-3"
                    style={{
                      background:
                        (recipe as Recipe).dificultad === "Principiante" ||
                        (recipe as Recipe).dificultad === "Beginner"
                          ? "rgba(16,185,129,0.08)"
                          : (recipe as Recipe).dificultad === "Intermedio" ||
                            (recipe as Recipe).dificultad === "Intermediate"
                          ? "rgba(250,204,21,0.08)"
                          : "rgba(139,92,246,0.06)",
                    }}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        (recipe as Recipe).dificultad === "Principiante" ||
                        (recipe as Recipe).dificultad === "Beginner"
                          ? "bg-green-100 text-green-600"
                          : (recipe as Recipe).dificultad === "Intermedio" ||
                            (recipe as Recipe).dificultad === "Intermediate"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-purple-100 text-purple-600"
                      }`}
                    >
                      <GiChefToque className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-md font-semibold text-[var(--foreground)]">
                        {t("recipeDetail.difficulty.title")}
                      </h3>
                      <p
                        className="text-lg font-bold"
                        style={{
                          color:
                            (recipe as Recipe).dificultad === "Principiante" ||
                            (recipe as Recipe).dificultad === "Beginner"
                              ? "var(--success)"
                              : (recipe as Recipe).dificultad === "Intermedio" ||
                                (recipe as Recipe).dificultad === "Intermediate"
                              ? "var(--highlight)"
                              : "var(--primary)",
                        }}
                      >
                        {t(
                          `recipeDetail.difficulty.levels.${getDifficultyKey(
                            (recipe as Recipe).dificultad
                          )}`
                        )}
                      </p>
                      <p className="text-xs text-[var(--muted)] mt-1">
                        {t(
                          `recipeDetail.difficulty.descriptions.${getDifficultyKey(
                            (recipe as Recipe).dificultad
                          )}`
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {/* Macronutrientes */}
                {(recipe as Recipe)?.macronutrientes && (
                  <div className="bg-[var(--primary)]/10 p-4 rounded-xl shadow-sm flex flex-col space-y-2">
                    <h3 className="text-md font-semibold text-[var(--foreground)] flex items-center">
                      <MdOutlineFastfood className="w-6 h-6 mr-2 text-[var(--primary)]" />
                      {t("recipeDetail.macronutrients.title")}
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-[var(--foreground)]">{t("recipeDetail.macronutrients.calories")}:</span>
                      <span className="font-bold text-[var(--primary)]">
                        {(recipe as Recipe).macronutrientes!.calorias ?? "-"} kcal
                      </span>
                      <span className="text-[var(--foreground)]">{t("recipeDetail.macronutrients.protein")}:</span>
                      <span className="font-bold text-[var(--primary)]">
                        {(recipe as Recipe).macronutrientes!.proteinas_g ?? "-"} g
                      </span>
                      <span className="text-[var(--foreground)]">{t("recipeDetail.macronutrients.carbs")}:</span>
                      <span className="font-bold text-[var(--primary)]">
                        {(recipe as Recipe).macronutrientes!.carbohidratos_g ?? "-"} g
                      </span>
                      <span className="text-[var(--foreground)]">{t("recipeDetail.macronutrients.fats")}:</span>
                      <span className="font-bold text-[var(--primary)]">
                        {(recipe as Recipe).macronutrientes!.grasas_g ?? "-"} g
                      </span>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Ingredients & Instructions */}
            {!isErrorRecipe && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Ingredients */}
                <section className="bg-[var(--background)] p-6 rounded-2xl shadow-inner">
                  <h2 className="text-3xl font-bold text-[var(--foreground)] mb-6 flex items-center">
                    <span className="mr-3 text-[var(--highlight)] text-4xl">🥕</span>
                    {t("recipeDetail.sections.ingredients.title")}
                  </h2>
                  {isStreaming && !displayRecipe?.ingredientes?.length ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-6 w-full" />
                      ))}
                    </div>
                  ) : (
                    <ul className="list-none space-y-3">
                      {(displayRecipe?.ingredientes ?? []).map((ingredient, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="flex items-start text-lg text-[var(--foreground)] border-b border-[var(--foreground)]/20 pb-2 last:border-b-0"
                        >
                          <span className="text-[var(--primary)] mr-3 mt-1">●</span>
                          {`${ingredient.cantidad ?? ""}${
                            ingredient.cantidad && ingredient.unidad
                              ? ` ${ingredient.unidad}`
                              : ""
                          }: ${ingredient.nombre}`}
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </section>

                {/* Instructions */}
                <section className="bg-[var(--background)] p-6 rounded-2xl shadow-inner">
                  <h2 className="text-3xl font-bold text-[var(--foreground)] mb-6 flex items-center">
                    <span className="mr-3 text-[var(--highlight)] text-4xl">👨‍🍳</span>
                    {t("recipeDetail.sections.instructions.title")}
                  </h2>
                  {isStreaming && !displayRecipe?.instrucciones?.length ? (
                    <div className="space-y-4">
                      {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : (
                    <ol className="list-none space-y-4">
                      {(displayRecipe?.instrucciones ?? []).map((instruction, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.06 }}
                          className="text-lg text-[var(--foreground)] leading-relaxed"
                        >
                          <span className="font-semibold text-[var(--primary)]">
                            {t("recipeDetail.sections.instructions.step", {
                              number: instruction.paso,
                            })}
                            :
                          </span>{" "}
                          {instruction.texto}
                        </motion.li>
                      ))}
                    </ol>
                  )}
                </section>
              </div>
            )}

            {/* Excluded Ingredients */}
            {!isErrorRecipe && (recipe as Recipe)?.excluidos?.length > 0 && (
              <section className="bg-red-50 p-6 rounded-2xl shadow-inner mt-8">
                <h2 className="text-2xl font-bold text-red-800 mb-4 flex items-center">
                  <MdOutlineNoFood className="w-8 h-8 mr-3" />
                  {t("recipeDetail.sections.excluded.title")}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {(recipe as Recipe).excluidos.map((excluded, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className="bg-red-200 text-red-900 text-sm font-medium px-3 py-1 rounded-full shadow-sm"
                    >
                      {excluded}
                    </motion.span>
                  ))}
                </div>
              </section>
            )}

            {/* Cooking Mode button — only after streaming is done */}
            {streamPhase === "done" && recipe && (recipe as Recipe).instrucciones?.length > 0 && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                type="button"
                onClick={() => setShowCookingMode(true)}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-xl text-xl font-bold text-white bg-[var(--highlight)] hover:bg-[var(--highlight-dark)] shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[var(--highlight)]/50"
              >
                <ChefHat className="w-6 h-6" />
                Modo Cocina — paso a paso
              </motion.button>
            )}

            {/* Generate Another / Go to Kitchen button */}
            <motion.button
              type="button"
              onClick={handleGenerateAnother}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full text-[var(--text2)] font-bold py-4 rounded-xl text-2xl shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 flex flex-col items-center gap-1 bg-gradient-to-r from-[var(--highlight)] to-[var(--highlight-dark)] hover:shadow-xl focus:ring-[var(--highlight)]"
              disabled={isStreaming}
            >
              <span className="flex items-center gap-2">
                {recipeIdParam ? (
                  <>
                    <ChefHat className="text-2xl" />
                    {t("recipeDetail.actions.goToKitchen")}
                  </>
                ) : (
                  <>
                    <IoReloadOutline className="text-2xl" />
                    {t("recipeDetail.actions.generateAnother")}
                  </>
                )}
              </span>
              {!recipeIdParam && (
                <span className="text-sm font-light mt-1 flex items-center gap-1">
                  <FaCoins className="text-yellow-300" />
                  {t("recipeDetail.actions.cost", { tokens: 5 })}
                </span>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Cooking Mode overlay */}
      <AnimatePresence>
        {showCookingMode && recipe && (recipe as Recipe).instrucciones?.length > 0 && (
          <CookingMode
            instructions={(recipe as Recipe).instrucciones}
            title={(recipe as Recipe).titulo}
            onClose={() => setShowCookingMode(false)}
          />
        )}
      </AnimatePresence>

      {/* First Recipe Modal */}
      {showFirstRecipeModal && (
        <FirstRecipeModal
          onClose={() => setShowFirstRecipeModal(false)}
          onGetMore={() => {
            setShowFirstRecipeModal(false);
            router.push("/kitchen/pricing");
          }}
        />
      )}
    </>
  );
};

export default RecipesContent;
