"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { IoArrowBackCircleOutline, IoTimeOutline, IoPeopleOutline, IoRestaurantOutline, IoWarningOutline, IoReloadOutline } from 'react-icons/io5';
import { GiChopsticks, GiSushis, GiTacos, GiHamburger, GiPizzaSlice, GiBowlOfRice, GiFruitBowl, GiChefToque } from 'react-icons/gi';
import { MdOutlineFastfood, MdOutlineNoFood } from 'react-icons/md';
import { FaCoins } from 'react-icons/fa';
import { useRouter, useSearchParams } from 'next/navigation'; // Importamos useSearchParams
import Image from "next/image";
import { auth } from '@/lib/firebase'; // Necesitamos el auth del cliente para obtener el token
import { ChefHat } from 'lucide-react';
import { useTranslation } from "react-i18next";

// Define el tipo para un ingrediente individual
type Ingredient = {
  nombre: string;
  cantidad: string;
  unidad: string;
};

// Define el tipo de la Receta, incluyendo el ID opcional
type Recipe = {
  id?: string; // Hacemos el ID opcional para cuando se carga de sessionStorage
  titulo: string;
  descripcion: string;
  ingredientes: Ingredient[];
  instrucciones: { paso: number; texto: string; }[];
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

const RecipePage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams(); // Hook para obtener los parámetros de la URL
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loadingRecipe, setLoadingRecipe] = useState(true);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Usar useMemo para que placeholderImageUrl no cambie en cada render
  const placeholderImageUrl = useMemo(() =>
    `https://picsum.photos/600/400?random=${Math.floor(Math.random() * 1000)}`,
    []
  );
  const [imageSrc, setImageSrc] = useState<string>(placeholderImageUrl);
  const { t } = useTranslation();

  // Función para mapear la dificultad a las claves de traducción
const getDifficultyKey = (dificultad: string) => {
  const difficultyMap: { [key: string]: string } = {
    "Principiante": "beginner",
    "Intermedio": "intermediate",
    "Chef": "advanced",
    "Beginner": "beginner",
    "Intermediate": "intermediate",
    };
  return difficultyMap[dificultad] || "beginner";
};

  // Helper to get cuisine style icon
  const getCuisineIcon = (style: string | null) => {
    switch (style) {
      case 'japanese': return <GiSushis className="w-6 h-6 text-[var(--highlight)]" />;
      case 'mexican': return <GiTacos className="w-6 h-6 text-[var(--highlight)]" />;
      case 'italian': return <GiPizzaSlice className="w-6 h-6 text-[var(--highlight)]" />;
      case 'american': return <GiHamburger className="w-6 h-6 text-[var(--highlight)]" />;
      case 'spanish': return <GiBowlOfRice className="w-6 h-6 text-[var(--highlight)]" />;
      case 'jamaican': return <GiChopsticks className="w-6 h-6 text-[var(--highlight)] rotate-45" />;
      case 'indian': return <MdOutlineFastfood className="w-6 h-6 text-[var(--highlight)]" />;
      default: return <IoRestaurantOutline className="w-6 h-6 text-[var(--highlight)]" />;
    }
  };

  // Helper to get dietary restriction label
  const getRestrictionLabel = (restriction: string) => {
    switch (restriction) {
      case 'vegetarian': return 'Vegetariano';
      case 'vegan': return 'Vegano';
      case 'gluten-free': return 'Sin Gluten';
      case 'lactose-free': return 'Sin Lactosa';
      case 'keto': return 'Keto';
      default: return restriction;
    }
  };

  // Función para verificar y esperar a que la imagen esté disponible
const waitForImage = async (url: string, maxRetries = 50): Promise<boolean> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) return true;
    } catch {
      // Continuar reintentando
    }
    await new Promise(resolve => setTimeout(resolve, 2000));  // Esperar 2 segundos
  }
  return false;
};

  useEffect(() => {
    const fetchRecipeById = async (id: string) => {
      try {
        const user = auth.currentUser;
        if (!user) {
          router.push('/login'); // Redirigir si el usuario no está autenticado
          return;
        }
        const idToken = await user.getIdToken();

        const response = await fetch(`/api/recipes/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Error al obtener la receta desde la base de datos.');
        }

        const data = await response.json();
        setRecipe(data.recipe);

        if (data.recipe.img_url) {
          setIsGeneratingImage(true); // Mostrar overlay
          const imageReady = await waitForImage(data.recipe.img_url);
          if (imageReady) {
            setImageSrc(data.recipe.img_url);
          } else {
            setImageSrc(placeholderImageUrl);
          }
          setIsGeneratingImage(false); // Ocultar overlay
        } else {
          setImageSrc(placeholderImageUrl);
        }

      } catch (error) {
        console.error('Error fetching recipe by ID:', error);
        router.push('/kitchen/recipes'); // Redirigir a la lista si falla la búsqueda
      } finally {
        setLoadingRecipe(false);
      }
    };

    if (typeof window !== 'undefined') {
      const id = searchParams.get('id'); // Obtener el 'id' de la URL

      if (id) {
        setLoadingRecipe(true);
        fetchRecipeById(id);
      } else {
        const storedRecipe = sessionStorage.getItem('generatedRecipe');
        if (storedRecipe) {
          const parsedRecipe: Recipe = JSON.parse(storedRecipe);
          setRecipe(parsedRecipe);

          if (parsedRecipe.img_url) {
            setIsGeneratingImage(true);
            waitForImage(parsedRecipe.img_url).then(imageReady => {
              if (imageReady) {
                setImageSrc(parsedRecipe.img_url);
              } else {
                setImageSrc(placeholderImageUrl);
              }
              setIsGeneratingImage(false);
            });
          } else {
            setImageSrc(placeholderImageUrl);
          }
        } else {
          router.push('/kitchen');
        }
        setLoadingRecipe(false);
      }
    }
  }, [router, searchParams, placeholderImageUrl]); // Ahora placeholderImageUrl es estable

  // Watch for image updates from background generation
  useEffect(() => {
    if (!recipe) return;

    // If recipe doesn't have an image and it's not an error recipe
    const isError = recipe.titulo?.startsWith('ERROR:');
    if (!recipe.img_url && !isError) {
      setIsGeneratingImage(true);

      // Check periodically if the image has been generated
      const checkForImage = () => {
        if (typeof window !== 'undefined') {
          const storedRecipe = sessionStorage.getItem('generatedRecipe');
          if (storedRecipe) {
            const parsedRecipe: Recipe = JSON.parse(storedRecipe);
            if (parsedRecipe.img_url && parsedRecipe.img_url !== recipe.img_url) {
              setImageSrc(parsedRecipe.img_url);
              setRecipe(parsedRecipe);
              setIsGeneratingImage(false);
            }
          }
        }
      };

      // Check immediately and then every 2 seconds
      checkForImage();
      const interval = setInterval(checkForImage, 2000);

      // Clean up after 30 seconds (image generation timeout)
      const timeout = setTimeout(() => {
        setIsGeneratingImage(false);
        clearInterval(interval);
      }, 30000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [recipe]);

  const handleGoBack = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('generatedRecipe');
    }
    // Si la receta se cargó por ID, volvemos a la lista.
    // Si no, volvemos al formulario para generar una nueva.
    const id = searchParams.get('id');
    if (id) {
      router.push('/kitchen/recipes/list');
    } else {
      router.push('/kitchen');
    }
  };

  const handleGenerateAnother = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('generatedRecipe');
    }
    // Si la receta se cargó por ID, ir a la cocina sin parámetros
    // Si no, usar regenerate=1 para indicar que es una regeneración (5 tokens)
    const id = searchParams.get('id');
    if (id) {
      router.push('/kitchen');
    } else {
      router.push('/kitchen?auto=1&regenerate=1');
    }
  };

  if (loadingRecipe || !recipe) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center font-sans">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-t-4 border-[var(--primary)] border-t-transparent rounded-full"
        ></motion.div>
        <p className="ml-4 text-xl font-semibold text-[var(--foreground)]">{t("recipeDetail.loadingRecipe")}</p>
      </div>
    );
  }

  // Determine if it's an error recipe
  const isErrorRecipe = recipe.titulo.startsWith('ERROR:');

  return (
    <div className="min-h-screen bg-[var(--background)] py-[5%] flex items-center justify-center font-sans">
      <Head>
        <title>Culinarium - {recipe.titulo}</title>
        <meta name="description" content={t("recipeDetail.description", { title: recipe.titulo })} />
      </Head>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full px-4 lg:px-8 xl:px-12 bg-white rounded-3xl shadow-xl py-4 md:py-8 max-w-screen-xl mx-auto"
      >
        <div className="flex flex-col space-y-8">
          {/* Back Button */}
          <motion.button
            type="button"
            onClick={handleGoBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center self-start px-6 py-3 bg-[var(--primary)] text-[var(--text2)] rounded-full shadow-md hover:bg-[var(--primary)]/80 transition-colors text-lg font-semibold"
            aria-label={t("recipeDetail.backButton.toRecipes")}
          >
            <IoArrowBackCircleOutline className="w-6 h-6 mr-2" />
            {searchParams.get('id') ? t("recipeDetail.backButton.toRecipes") : t("recipeDetail.backButton.toForm")}
          </motion.button>

          {/* Recipe Header */}
          <section className="text-center mb-6">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--foreground)] mb-4 leading-tight">
              {isErrorRecipe ? (
                <span className="text-red-600 flex items-center justify-center">
                  <IoWarningOutline className="w-10 h-10 mr-3" />
                  {recipe.titulo}
                </span>
              ) : (
                recipe.titulo
              )}
            </h1>
            <p className="text-lg md:text-xl text-[var(--foreground)]/80 max-w-3xl mx-auto">
              {recipe.descripcion}
            </p>
          </section>

          {/* Recipe Image (or Placeholder) with Loading State */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-lg mb-8"
          >
            <Image
              src={imageSrc}
              alt={recipe.titulo}
              fill
              className="object-cover"
              unoptimized
            />

            {/* Loading overlay for image generation */}
            <AnimatePresence>
              {isGeneratingImage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm"
                >
                  <div className="bg-white/90 p-4 rounded-2xl flex flex-col items-center space-y-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 border-2 border-t-2 border-[var(--primary)] border-t-transparent rounded-full"
                    ></motion.div>
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
                  <h3 className="text-md font-semibold text-[var(--foreground)]">{t("recipeDetail.metadata.totalTime")}</h3>
                  <p className="text-lg font-bold text-[var(--primary)]">{recipe.tiempo_total_min} min</p>
                </div>
              </div>

              <div className="bg-[var(--highlight)]/10 p-4 rounded-xl shadow-sm flex items-center space-x-3">
                <IoPeopleOutline className="w-8 h-8 text-[var(--highlight)]" />
                <div>
                  <h3 className="text-md font-semibold text-[var(--foreground)]">{t("recipeDetail.metadata.portions")}</h3>
                  <p className="text-lg font-bold text-[var(--highlight)]">{recipe.porciones}</p>
                </div>
              </div>

              {recipe.estilo && (
                <div className="bg-[var(--highlight)]/10 p-4 rounded-xl shadow-sm flex items-center space-x-3">
                  {getCuisineIcon(recipe.estilo)}
                  <div>
                    <h3 className="text-md font-semibold text-[var(--foreground)]">{t("recipeDetail.metadata.style")}</h3>
                    <p className="text-lg font-bold text-[var(--highlight)] capitalize">{recipe.estilo}</p>
                  </div>
                </div>
              )}

              {recipe.restricciones && recipe.restricciones.length > 0 && (
                <div className="bg-[var(--highlight)]/10 p-4 rounded-xl shadow-sm flex items-center space-x-3">
                  <GiFruitBowl className="w-8 h-8 text-[var(--highlight)]" />
                  <div>
                    <h3 className="text-md font-semibold text-[var(--foreground)]">{t("recipeDetail.metadata.restrictions")}</h3>
                    <div className="flex flex-wrap gap-1">
                      {recipe.restricciones.map((r, i) => (
                        <span key={i} className="text-sm font-bold text-[var(--highlight)] bg-[var(--highlight)]/20 px-2 py-0.5 rounded-full">
                          {getRestrictionLabel(r)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Dificultad */} 
              {recipe.dificultad && (
                <div className="p-4 rounded-xl shadow-sm flex items-center space-x-3"
                  // background color depending on difficulty
                  style={{
                    background:
                        recipe.dificultad === t("recipeDetail.difficulty.levels.beginner") ||
                        recipe.dificultad === "Principiante" || 
                        recipe.dificultad === "Beginner"
                          ? "rgba(16,185,129,0.08)" // green-ish
                          : recipe.dificultad === t("recipeDetail.difficulty.levels.intermediate") ||
                            recipe.dificultad === "Intermedio" || 
                            recipe.dificultad === "Intermediate"
                            ? "rgba(250,204,21,0.08)" // yellow-ish
                            : "rgba(139,92,246,0.06)" // purple-ish
                  }}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center
                    ${recipe.dificultad === t("recipeDetail.difficulty.levels.beginner") ||
                      recipe.dificultad === "Principiante" || 
                      recipe.dificultad === "Beginner"
                        ? "bg-green-100 text-green-600"
                        : recipe.dificultad === t("recipeDetail.difficulty.levels.intermediate") ||
                          recipe.dificultad === "Intermedio" || 
                          recipe.dificultad === "Intermediate"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-purple-100 text-purple-600"
                    }`}>
                    <GiChefToque className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-md font-semibold text-[var(--foreground)]">{t("recipeDetail.difficulty.title")}</h3>
                    <p className="text-lg font-bold" style={{
                      color:
                        recipe.dificultad === t("recipeDetail.difficulty.levels.beginner") ||
                        recipe.dificultad === "Principiante" || 
                        recipe.dificultad === "Beginner"
                          ? "var(--success)"
                          : recipe.dificultad === t("recipeDetail.difficulty.levels.intermediate") ||
                            recipe.dificultad === "Intermedio" || 
                            recipe.dificultad === "Intermediate"
                            ? "var(--highlight)"
                            : "var(--primary)"
                    }}>
                      {t(`recipeDetail.difficulty.levels.${getDifficultyKey(recipe.dificultad)}`)}
                    </p>
                    <p className="text-xs text-[var(--muted)] mt-1">
                      {t(`recipeDetail.difficulty.descriptions.${getDifficultyKey(recipe.dificultad)}`)}
                    </p>
                  </div>
                </div>
              )}

              {/* Macronutrientes */}
              {recipe.macronutrientes && (
                <div className="bg-[var(--primary)]/10 p-4 rounded-xl shadow-sm flex flex-col space-y-2">
                  <h3 className="text-md font-semibold text-[var(--foreground)] flex items-center">
                    <MdOutlineFastfood className="w-6 h-6 mr-2 text-[var(--primary)]" />
                    {t("recipeDetail.macronutrients.title")}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-[var(--foreground)]">{t("recipeDetail.macronutrients.calories")}:</span>
                    <span className="font-bold text-[var(--primary)]">
                      {recipe.macronutrientes.calorias ?? '-'} kcal
                    </span>

                    <span className="text-[var(--foreground)]">{t("recipeDetail.macronutrients.protein")}:</span>
                    <span className="font-bold text-[var(--primary)]">
                      {recipe.macronutrientes.proteinas_g ?? '-'} g
                    </span>

                    <span className="text-[var(--foreground)]">{t("recipeDetail.macronutrients.carbs")}:</span>
                    <span className="font-bold text-[var(--primary)]">
                      {recipe.macronutrientes.carbohidratos_g ?? '-'} g
                    </span>

                    <span className="text-[var(--foreground)]">{t("recipeDetail.macronutrients.fats")}:</span>
                    <span className="font-bold text-[var(--primary)]">
                      {recipe.macronutrientes.grasas_g ?? '-'} g
                    </span>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Ingredients and Instructions Sections */}
          {!isErrorRecipe && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Ingredients List */}
              <section className="bg-[var(--background)] p-6 rounded-2xl shadow-inner">
                <h2 className="text-3xl font-bold text-[var(--foreground)] mb-6 flex items-center">
                  <span className="mr-3 text-[var(--highlight)] text-4xl">🥕</span> {t("recipeDetail.sections.ingredients.title")}
                </h2>
                <ul className="list-none space-y-3">
                  {recipe.ingredientes.map((ingredient, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex items-start text-lg text-[var(--foreground)] border-b border-[var(--foreground)]/20 pb-2 last:border-b-0"
                    >
                      <span className="text-[var(--primary)] mr-3 mt-1">●</span>
                      {`${ingredient.cantidad ?? ''}${ingredient.cantidad && ingredient.unidad ? ` ${ingredient.unidad}` : ''}: ${ingredient.nombre}`}
                    </motion.li>
                  ))}
                </ul>
              </section>

              {/* Instructions List */}
              <section className="bg-[var(--background)] p-6 rounded-2xl shadow-inner">
                <h2 className="text-3xl font-bold text-[var(--foreground)] mb-6 flex items-center">
                  <span className="mr-3 text-[var(--highlight)] text-4xl">👨‍🍳</span> {t("recipeDetail.sections.instructions.title")}
                </h2>
                <ol className="list-decimal list-inside space-y-4 list-none">
                  {recipe.instrucciones.map((instruction, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="text-lg text-[var(--foreground)] leading-relaxed"
                    >
                      <span className="font-semibold text-[var(--primary)]">{t("recipeDetail.sections.instructions.step", { number: instruction.paso })}:</span> {instruction.texto}
                    </motion.li>
                  ))}
                </ol>
              </section>
            </div>
          )}

          {/* Excluded Ingredients Section (if any) */}
          {!isErrorRecipe && recipe.excluidos && recipe.excluidos.length > 0 && (
            <section className="bg-red-50 p-6 rounded-2xl shadow-inner mt-8">
              <h2 className="text-2xl font-bold text-red-800 mb-4 flex items-center">
                <MdOutlineNoFood className="w-8 h-8 mr-3" /> {t("recipeDetail.sections.excluded.title")}
              </h2>
              <div className="flex flex-wrap gap-2">
                {recipe.excluidos.map((excluded, index) => (
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

          {/* Footer Generate Another Recipe Button */}
          <motion.button
            type="button"
            onClick={handleGenerateAnother}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full text-[var(--text2)] font-bold py-4 rounded-xl text-2xl shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 flex flex-col items-center gap-1 bg-gradient-to-r from-[var(--highlight)] to-[var(--highlight-dark)] hover:shadow-xl focus:ring-[var(--highlight)]"
            aria-label={searchParams.get('id') ? t("recipeDetail.actions.goToKitchen") 
              : t("recipeDetail.actions.generateAnother")}
          >
            <span className="flex items-center gap-2">
              {searchParams.get('id') ? (
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
            {!searchParams.get('id') && (
              <span className="text-sm font-light mt-1 flex items-center gap-1">
                <FaCoins className="text-yellow-300" />
                {t("recipeDetail.actions.cost", { tokens: 5 })}
              </span>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default RecipePage;