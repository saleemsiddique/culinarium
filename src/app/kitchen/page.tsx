/* eslint-disable @typescript-eslint/no-explicit-any */

"use client"
// pages/culinarium-form.tsx
import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { IoCloseCircleOutline, IoAddCircleOutline, IoChevronDownCircleOutline, IoChevronUpCircleOutline } from 'react-icons/io5';
import { GiChopsticks, GiSushis, GiTacos, GiHamburger, GiPizzaSlice, GiBowlOfRice } from 'react-icons/gi';
import { MdOutlineFastfood } from 'react-icons/md';
import { useRouter, useSearchParams } from 'next/navigation'; // Importa useRouter

// Import Firebase client-side auth
import { auth } from '@/lib/firebase'; // Ensure this path is correct for your client-side Firebase setup
import { onAuthStateChanged, User as FirebaseUser, signInAnonymously } from 'firebase/auth';

// --- Helpers de imagen (compresión a <1MB en el cliente) ---
async function loadImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
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
  return { width: Math.round(srcWidth * scale), height: Math.round(srcHeight * scale) };
}

function estimateBytesFromDataUrl(dataUrl: string): number {
  const base64 = dataUrl.split(',')[1] || '';
  const len = base64.length;
  const padding = (base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0);
  return Math.max(0, Math.floor((len * 3) / 4) - padding);
}

async function compressDataUrlToJpeg(
  inputDataUrl: string,
  options?: { maxBytes?: number; maxWidth?: number; maxHeight?: number; initialQuality?: number; minQuality?: number }
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
    const { width, height } = getScaledDimensions(img.naturalWidth, img.naturalHeight, currentMaxWidth, currentMaxHeight);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No se pudo obtener el contexto de canvas');
    ctx.drawImage(img, 0, 0, width, height);

    // Bucle de calidad descendente en este tamaño
    for (let qStep = 0; qStep < 5; qStep++) {
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
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
  const { width: finalW, height: finalH } = getScaledDimensions(img.naturalWidth, img.naturalHeight, Math.max(512, Math.floor(maxWidth * 0.6)), Math.max(512, Math.floor(maxHeight * 0.6)));
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = finalW;
  finalCanvas.height = finalH;
  const finalCtx = finalCanvas.getContext('2d');
  if (!finalCtx) throw new Error('No se pudo obtener el contexto de canvas');
  finalCtx.drawImage(img, 0, 0, finalW, finalH);
  return finalCanvas.toDataURL('image/jpeg', 0.5);
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
    className="flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full mr-2 mb-2 shadow-sm"
  >
    <span>{label}</span>
    <button
      type="button"
      onClick={() => onRemove(label)}
      className="ml-2 text-blue-500 hover:text-blue-700 focus:outline-none"
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
  const [user, setUser] = useState<FirebaseUser | null>(null); // State to hold Firebase user object
  const [loadingUser, setLoadingUser] = useState(true); // State to track user loading

  // Ingredientes disponibles (Columna 1)
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState<string>('');
  const [ingredientError, setIngredientError] = useState<boolean>(false);

  // Nuevo estado: tiempo disponible
  const [availableTime, setAvailableTime] = useState<string>("30");

  // Estados para API
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isLoadingOverlayVisible, setIsLoadingOverlayVisible] = useState<boolean>(false); // Loading overlay visibility

  // Ingredientes a evitar (Columna 3)
  const [excludedIngredients, setExcludedIngredients] = useState<string[]>([]);
  const [currentExcluded, setCurrentExcluded] = useState<string>('');

  // Toast state
  const [toastMessage, setToastMessage] = useState<string>("");

  const [mealTime, setMealTime] = useState<string | null>(null);
  const [mealTimeError, setMealTimeError] = useState<boolean>(false);

  const [diners, setDiners] = useState<number>(1);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [cuisineStyle, setCuisineStyle] = useState<string | null>(null);
  const [showDietaryRestrictions, setShowDietaryRestrictions] = useState(false);
  const [showCuisineStyle, setShowCuisineStyle] = useState(false);
  const [autoTriggered, setAutoTriggered] = useState<boolean>(false);

  const mealTimes = [
    { label: 'Desayuno', value: 'breakfast' },
    { label: 'Comida', value: 'lunch' },
    { label: 'Cena', value: 'dinner' },
    { label: 'Snack', value: 'snack' },
  ];
  const MAX_DINERS = 8;
  const dietaryOptions = [
    { label: 'Vegetariano', value: 'vegetarian' },
    { label: 'Vegano', value: 'vegan' },
    { label: 'Sin Gluten', value: 'gluten-free' },
    { label: 'Sin Lactosa', value: 'lactose-free' },
    { label: 'Keto', value: 'keto' },
  ];
  const cuisineStyles = [
    { label: 'Japonesa', value: 'japanese', icon: <GiSushis className="w-6 h-6" /> },
    { label: 'Mexicana', value: 'mexican', icon: <GiTacos className="w-6 h-6" /> },
    { label: 'Italiana', value: 'italian', icon: <GiPizzaSlice className="w-6 h-6" /> },
    { label: 'Americana', value: 'american', icon: <GiHamburger className="w-6 h-6" /> },
    { label: 'Española', value: 'spanish', icon: <GiBowlOfRice className="w-6 h-6" /> },
    { label: 'Jamaiquina', value: 'jamaican', icon: <GiChopsticks className="w-6 h-6 rotate-45" /> },
    { label: 'India', value: 'indian', icon: <MdOutlineFastfood className="w-6 h-6" /> },
  ];

  // Listen for Firebase Auth state changes and sign in anonymously if no user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        try {
          const anonymousUserCredential = await signInAnonymously(auth);
          setUser(anonymousUserCredential.user);
        } catch (anonError) {
          console.error("Error signing in anonymously:", anonError);
          setToastMessage("Error de autenticación. Intenta recargar la página.");
        }
      }
      setLoadingUser(false); // User loading is complete
    });
    return () => unsubscribe(); // Cleanup subscription on component unmount
  }, []);

  // Show toast temporarily
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Handlers ingredientes disponibles
  const handleAddIngredient = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = currentIngredient.trim();
      e.preventDefault();
      if (!value) {
        setCurrentIngredient('');
        return;
      }
      if (ingredients.includes(value)) {
        setToastMessage('Ingrediente ya añadido');
      } else {
        setIngredients((prev) => [...prev, value]);
        setIngredientError(false); // Clear error when an ingredient is added
      }
      setCurrentIngredient('');
    }
  };
  const handleRemoveIngredient = (label: string) => {
    setIngredients((prev) => prev.filter((ing) => ing !== label));
  };

  // Handlers ingredientes a evitar
  const handleAddExcluded = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = currentExcluded.trim();
      e.preventDefault();
      if (!value) {
        setCurrentExcluded('');
        return;
      }
      if (excludedIngredients.includes(value)) {
        setToastMessage('Ingrediente a evitar ya añadido');
      } else {
        setExcludedIngredients((prev) => [...prev, value]);
      }
      setCurrentExcluded('');
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

  // Submit handler for the entire process
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is loaded and available
    if (loadingUser) {
      setToastMessage("Autenticando usuario, por favor espera.");
      return;
    }
    if (!user) {
      setToastMessage("Error: No se pudo autenticar al usuario.");
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
      setStatus('idle'); // Stay idle if validation fails
      return;
    }

    setStatus('loading');
    setIsLoadingOverlayVisible(true); // Show loading overlay for the entire process
    setError(null);

    let recipeDataFromAI: any = null; // To store the recipe generated by OpenAI

    try {
      // 1. Call OpenAI API to generate recipe
      const formData = { ingredients, mealTime, diners, dietaryRestrictions, excludedIngredients, cuisineStyle, availableTime };
      // Guardar último formulario para autogeneración futura
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('lastFormData', JSON.stringify(formData));
        } catch {}
      }
      const openaiRes = await fetch('/api/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!openaiRes.ok) {
        const errorData = await openaiRes.json();
        throw new Error(errorData.error || `Error OpenAI: Status ${openaiRes.status}`);
      }
      recipeDataFromAI = await openaiRes.json();
      console.log('✅ Respuesta IA:', recipeDataFromAI);

      // NEW: Check if AI actually generated an error recipe based on title prefix
      if (recipeDataFromAI?.receta?.titulo?.startsWith('ERROR:')) {
        // If the AI explicitly returned an error recipe, throw an error to stop the process
        throw new Error(recipeDataFromAI.receta.descripcion || "La IA no pudo generar una receta válida con los ingredientes proporcionados.");
      }

      // 2. Generar imagen y COMPRIMIR a <1MB antes de guardar
      try {
        const imageRes = await fetch('/api/recipe-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipe: recipeDataFromAI.receta })
        });
        console.log('📸 Solicitud /api/recipe-image status:', imageRes.status);
        const imageData = await imageRes.json().catch(() => ({}));
        console.log('📸 Respuesta /api/recipe-image:', imageData);
        if (imageRes.ok && imageData?.img_url) {
          // Comprimir a JPEG y limitar tamaño
          const compressedDataUrl = await compressDataUrlToJpeg(imageData.img_url, {
            maxBytes: 1000_000,
            maxWidth: 1024,
            maxHeight: 1024,
          });
          recipeDataFromAI.receta.img_url = compressedDataUrl;
        } else {
          console.warn('No se pudo generar la imagen; se guardará la receta sin imagen.');
        }
      } catch (imgErr) {
        console.error('❌ Error generando/comprimiendo imagen:', imgErr);
      }

      // 3. Obtener token y guardar la receta (incluyendo img_url si está)
      const idToken = await user.getIdToken();
      const saveRecipeRes = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipe: recipeDataFromAI.receta, idToken }),
      });

      if (!saveRecipeRes.ok) {
        const errorData = await saveRecipeRes.json();
        throw new Error(errorData.error || `Error al guardar receta: Status ${saveRecipeRes.status}`);
      }

      const savedRecipeData = await saveRecipeRes.json();
      console.log('✅ Receta guardada en Firestore:', savedRecipeData);

      setStatus('success');
      setToastMessage("¡Receta generada y guardada exitosamente!");

      // 4. Persistir en sessionStorage y navegar
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('generatedRecipe', JSON.stringify(recipeDataFromAI.receta));
      }
      router.push('/kitchen/recipes');

    } catch (err: any) {
      console.error('❌ Error general en el proceso:', err);
      setError(err.message);
      setStatus('error');
      setToastMessage(`Error: ${err.message}`); // Display error to user
    } finally {
      setIsLoadingOverlayVisible(false); // Hide loading overlay in all cases (success or error)
    }
  };

  // Auto-generar una receta si venimos con ?auto=1 usando el último formulario guardado
  useEffect(() => {
    if (loadingUser) return;
    const auto = searchParams.get('auto');
    if (auto === '1' && !autoTriggered) {
      const stored = typeof window !== 'undefined' ? sessionStorage.getItem('lastFormData') : null;
      if (stored) {
        try {
          const data = JSON.parse(stored);
          setIngredients(Array.isArray(data.ingredients) ? data.ingredients : []);
          setMealTime(typeof data.mealTime === 'string' || data.mealTime === null ? data.mealTime : null);
          setDiners(typeof data.diners === 'number' ? data.diners : 1);
          setDietaryRestrictions(Array.isArray(data.dietaryRestrictions) ? data.dietaryRestrictions : []);
          setExcludedIngredients(Array.isArray(data.excludedIngredients) ? data.excludedIngredients : []);
          setCuisineStyle(typeof data.cuisineStyle === 'string' || data.cuisineStyle === null ? data.cuisineStyle : null);
          setAvailableTime(typeof data.availableTime === 'string' ? data.availableTime : '30');
        } catch {
          // Si falla el parseo, evitamos bucles
        }
        setAutoTriggered(true);
        // Permite que React aplique los estados antes de enviar
        setTimeout(() => {
          formRef.current?.requestSubmit();
        }, 0);
      } else {
        setAutoTriggered(true);
      }
    }
  }, [loadingUser, searchParams, autoTriggered]);

  return (
    <div className="min-h-screen bg-gradient-to-br pt-[5%] from-green-50 to-blue-100 py-10 flex items-center justify-center font-sans">
      <Head>
        <title>Culinarium - Encuentra tu Receta</title>
        <meta name="description" content="Encuentra tu receta ideal con el formulario interactivo de Culinarium." />
      </Head>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full px-4 lg:px-8 xl:px-12 bg-white rounded-3xl shadow-xl py-4 md:py-8 max-w-screen-2xl mx-auto"
      >
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-10">
          {/* Contenedor principal del formulario con grid para 3 columnas en pantallas grandes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar lg:h-auto lg:overflow-visible">
            {/* COLUMNA 1: Ingredientes (principal) */}
            <div className="lg:col-span-1 flex flex-col">
              <section className={`bg-gray-50 p-6 rounded-2xl shadow-inner flex-grow ${ingredientError ? 'border-2 border-red-500' : ''}`}>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="mr-2 text-blue-500 text-3xl">🍳</span> ¿Qué tienes a mano?
                </h2>
                <p className="text-gray-600 mb-4 text-sm">
                  Escribe un ingrediente y presiona **Enter** para añadirlo. Toca para borrar.
                </p>
                <input
                  type="text"
                  value={currentIngredient}
                  onChange={(e) => setCurrentIngredient(e.target.value)}
                  onKeyDown={handleAddIngredient}
                  placeholder="Ej: Pollo, arroz, tomate..."
                  className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-transparent text-lg ${ingredientError ? 'border-red-500' : 'border-gray-300'}`}
                  aria-label="Añadir ingrediente"
                />
                {ingredientError && (
                  <p className="text-red-500 text-sm mt-2">
                    ¡Por favor, añade al menos un ingrediente!
                  </p>
                )}
                <div className="mt-4 flex flex-wrap max-h-[250px] overflow-y-auto custom-scrollbar">
                  <AnimatePresence>
                    {ingredients.map((ing) => (<Tag key={ing} label={ing} onRemove={handleRemoveIngredient} />))}
                  </AnimatePresence>
                </div>
                {ingredients.length === 0 && !ingredientError && (
                  <p className="text-gray-400 text-sm mt-2">
                    ¡Empieza a añadir tus ingredientes!
                  </p>
                )}
                <p className="md:hidden text-blue-500 text-sm mt-2 flex items-center">
                  <IoAddCircleOutline className="w-5 h-5 mr-1" /> Toca los ingredientes para borrarlos.
                </p>

                {/* NUEVA SECCIÓN: Tiempo disponible */}
                <section className="mt-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">¿Cuánto tiempo tienes?</h3>
                  <select
                    value={availableTime}
                    onChange={(e) => setAvailableTime(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-300 focus:border-transparent text-lg"
                    aria-label="Seleccionar tiempo disponible"
                  >
                    <option value="15">15 minutos</option>
                    <option value="30">30 minutos</option>
                    <option value="45">45 minutos</option>
                    <option value="60">1 hora</option>
                    <option value="90">1 hora 30 minutos</option>
                    <option value="120">2 horas</option>
                  </select>
                </section>
              </section>
            </div>
            {/* COLUMNA 2: Momento del Día y Cantidad de Personas */}
            <div className="lg:col-span-1 flex flex-col space-y-6">
              {/* Sección de Momento del Día */}
              <section
                className={`bg-gray-50 p-4 rounded-2xl shadow-inner flex flex-col justify-between ${mealTimeError ? 'border-2 border-red-500' : ''}`}
                style={{ minHeight: '250px', maxHeight: '350px' }}
              >
                <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center justify-center">
                  <span className="mr-2 text-orange-500 text-xl">☀️</span> ¿Para cuándo es?
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
                      className={`flex flex-col items-center justify-center  p-2 rounded-xl border-2 transition-all duration-200
                        ${mealTime === time.value
                          ? 'border-orange-500 bg-orange-100 text-orange-800 shadow-md'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-orange-300'
                        }`}
                    >
                      <span className="text-2xl mb-0.5">
                        {time.value === 'breakfast' && '☕'}
                        {time.value === 'lunch' && '🍲'}
                        {time.value === 'dinner' && '🌙'}
                        {time.value === 'snack' && '🍎'}
                      </span>
                      <span className="font-semibold text-center leading-tight">
                        {time.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
                {mealTimeError && (
                  <p className="text-red-500 text-sm mt-2 text-center">
                    ¡Por favor, selecciona un momento del día!
                  </p>
                )}
              </section>

              {/* Sección de Número de Personas */}
              <section className="bg-gray-50 p-6 rounded-2xl shadow-inner flex flex-col justify-center h-full">
                <h2 className="text-xl font-bold text-gray-800 mb-4 text-center flex items-center justify-center">
                  <span className="mr-2 text-purple-500 text-2xl">👨‍👩‍👧‍👦</span> ¿Cuántos van a comer?
                </h2>
                <div className="flex items-center justify-center space-x-4">
                  <motion.button
                    type="button"
                    onClick={() => setDiners(Math.max(1, diners - 1))}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={diners <= 1}
                    className={`p-3 bg-purple-100 rounded-full text-purple-700 hover:bg-purple-200 transition-colors
                      ${diners <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-label="Disminuir número de comensales"
                  >
                    <IoCloseCircleOutline className="w-7 h-7" />
                  </motion.button>
                  <span className="text-5xl font-bold text-purple-800 w-20 text-center">{diners}</span>
                  <motion.button
                    type="button"
                    onClick={() => setDiners(Math.min(MAX_DINERS, diners + 1))}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={diners >= MAX_DINERS}
                    className={`p-3 bg-purple-100 rounded-full text-purple-700 hover:bg-purple-200 transition-colors
                      ${diners >= MAX_DINERS ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-label="Aumentar número de comensales"
                  >
                    <IoAddCircleOutline className="w-7 h-7" />
                  </motion.button>
                </div>
              </section>
            </div>

            {/* COLUMNA 3: Secciones Opcionales Colapsables */}
            <div className="lg:col-span-1 flex flex-col space-y-6 lg:max-h-[70vh] lg:overflow-y-auto custom-scrollbar">
              {/* Sección de Restricciones y Exclusiones (colapsable) */}
              <section className="bg-gray-50 p-6 rounded-2xl shadow-inner">
                <button
                  type="button"
                  onClick={() => setShowDietaryRestrictions(!showDietaryRestrictions)}
                  className="w-full flex justify-between items-center text-left text-2xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200 hover:text-teal-600 transition-colors"
                >
                  <span className="flex items-center"><span className="mr-2 text-teal-500 text-3xl">🚫</span> ¿Alguna restricción?</span>
                  <motion.span animate={{ rotate: showDietaryRestrictions ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    {showDietaryRestrictions ? <IoChevronUpCircleOutline className="w-8 h-8 text-gray-500" /> : <IoChevronDownCircleOutline className="w-8 h-8 text-gray-500" />}
                  </motion.span>
                </button>
                <AnimatePresence>
                  {showDietaryRestrictions && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden">
                      <p className="text-gray-600 mb-4 text-sm">Selecciona si hay alguna preferencia dietética.</p>
                      <div className="flex flex-wrap gap-3 mb-6">{dietaryOptions.map(opt => (
                        <motion.button key={opt.value} type="button" onClick={() => handleDietaryChange(opt.value)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`px-5 py-2 rounded-full border-2 transition-all duration-200 ${dietaryRestrictions.includes(opt.value) ? 'border-teal-500 bg-teal-100 text-teal-800 shadow-md' : 'border-gray-300 bg-white text-gray-700 hover:border-teal-300'}`}>{opt.label}</motion.button>))}</div>
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center"><span className="mr-2 text-red-500 text-2xl">⚠️</span> Ingredientes a evitar:</h3>
                      <p className="text-gray-600 mb-2 text-sm">Escribe un ingrediente y presiona **Enter** para añadirlo.</p>
                      <input type="text" value={currentExcluded} onChange={(e) => setCurrentExcluded(e.target.value)} onKeyDown={handleAddExcluded} placeholder="Ej: Cacahuetes, cilantro, champiñones..." className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-300 focus:border-transparent text-lg" aria-label="Añadir ingrediente a evitar" />
                      <div className="mt-4 flex flex-wrap min-h-[60px] max-h-[200px] overflow-y-auto custom-scrollbar">
                        <AnimatePresence>{excludedIngredients.map(ing => (<Tag key={ing} label={ing} onRemove={handleRemoveExcluded} />))}</AnimatePresence>
                      </div>
                      {excludedIngredients.length === 0 && (<p className="text-gray-400 text-sm mt-2">¡Añade ingredientes que quieras evitar!</p>)}
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              {/* Sección de Estilo de Comida (colapsable) */}
              <section className="bg-gray-50 p-6 rounded-2xl shadow-inner">
                <button
                  type="button"
                  onClick={() => setShowCuisineStyle(!showCuisineStyle)}
                  className="w-full flex justify-between items-center text-left text-2xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200 hover:text-indigo-600 transition-colors"
                >
                  <span className="flex items-center">
                    <span className="mr-2 text-indigo-500 text-3xl">🌍</span> ¿Qué estilo te apetece?
                  </span>
                  <motion.span
                    animate={{ rotate: showCuisineStyle ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {showCuisineStyle ? <IoChevronUpCircleOutline className="w-8 h-8 text-gray-500" /> : <IoChevronDownCircleOutline className="w-8 h-8 text-gray-500" />}
                  </motion.span>
                </button>

                <AnimatePresence>
                  {showCuisineStyle && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {cuisineStyles.map((style) => (
                          <motion.button
                            key={style.value}
                            type="button"
                            onClick={() => setCuisineStyle(style.value)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl border-2 transition-all duration-200 text-center
                              ${cuisineStyle === style.value
                                ? 'border-indigo-500 bg-indigo-100 text-indigo-800 shadow-md'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-indigo-300'
                              }`}
                          >
                            <span className="text-3xl sm:text-4xl mb-1 sm:mb-2">{style.icon}</span>
                            <span className="font-semibold text-xs sm:text-sm leading-tight">{style.label}</span>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            </div>
          </div> {/* Fin del grid de 3 columnas */}

          {/* Disable button if user is not loaded or form is submitting */}
          <motion.button
            type="submit"
            whileHover={{ scale: (loadingUser || status === 'loading') ? 1 : 1.02 }}
            whileTap={{ scale: (loadingUser || status === 'loading') ? 1 : 0.98 }}
            className={`w-full text-white font-bold py-4 rounded-xl text-2xl shadow-lg transition-all duration-300 focus:outline-none focus:ring-4
              ${loadingUser || status === 'loading'
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-green-500 hover:shadow-xl focus:ring-blue-300'
              }`}
            disabled={loadingUser || status === 'loading'}
          >
            {loadingUser ? 'Cargando usuario...' : (status === 'loading' ? 'Generando y Guardando...' : '¡Encuentra mi Receta!')}
          </motion.button>
          {status === 'error' && <p className="text-red-500 text-center">Error: {error}. Intenta de nuevo.</p>}
        </form>

        {/* Toast notification */}
        {toastMessage && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
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
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center justify-center space-y-4"
            >
              {/* Spinning Circle */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-t-4 border-blue-500 border-t-transparent rounded-full"
              ></motion.div>
              <p className="text-xl font-semibold text-gray-800">Generando y Guardando tu Receta...</p>
              <p className="text-sm text-gray-600">Esto puede tardar unos segundos.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CulinariumForm;
