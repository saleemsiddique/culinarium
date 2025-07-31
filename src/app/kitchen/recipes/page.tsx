"use client";

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { IoArrowBackCircleOutline, IoTimeOutline, IoPeopleOutline, IoRestaurantOutline, IoWarningOutline } from 'react-icons/io5';
import { GiChopsticks, GiSushis, GiTacos, GiHamburger, GiPizzaSlice, GiBowlOfRice, GiFruitBowl } from 'react-icons/gi';
import { MdOutlineFastfood, MdOutlineNoFood } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import Image from "next/image";

// Define el tipo para un ingrediente individual
type Ingredient = {
  nombre: string;
  cantidad: string; // O number, si siempre es numérico y lo formateas
  unidad: string;
};

// Define el tipo de la Receta, ahora con 'ingredientes' como array de Ingredient
type Recipe = {
  titulo: string;
  descripcion: string;
  ingredientes: Ingredient[]; // <-- CAMBIO AQUÍ: Ahora es un array de objetos Ingredient
  instrucciones: { paso: number; texto: string; }[];
  tiempo_total_min: number;
  porciones: number;
  estilo: string | null;
  restricciones: string[];
  excluidos: string[];
  img_url: string;
};

const RecipePage: React.FC = () => {
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loadingRecipe, setLoadingRecipe] = useState(true);

  // Helper to get cuisine style icon
  const getCuisineIcon = (style: string | null) => {
    switch (style) {
      case 'japanese': return <GiSushis className="w-6 h-6 text-indigo-600" />;
      case 'mexican': return <GiTacos className="w-6 h-6 text-indigo-600" />;
      case 'italian': return <GiPizzaSlice className="w-6 h-6 text-indigo-600" />;
      case 'american': return <GiHamburger className="w-6 h-6 text-indigo-600" />;
      case 'spanish': return <GiBowlOfRice className="w-6 h-6 text-indigo-600" />;
      case 'jamaican': return <GiChopsticks className="w-6 h-6 text-indigo-600 rotate-45" />;
      case 'indian': return <MdOutlineFastfood className="w-6 h-6 text-indigo-600" />;
      default: return <IoRestaurantOutline className="w-6 h-6 text-indigo-600" />;
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

  // Placeholder image URL
  const placeholderImageUrl = `https://placehold.co/600x400/a7f3d0/065f46?text=Culinarium`;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRecipe = sessionStorage.getItem('generatedRecipe');
      if (storedRecipe) {
        setRecipe(JSON.parse(storedRecipe));
      } else {
        // If no recipe found, redirect back to the form
        router.push('/kitchen');
      }
      setLoadingRecipe(false);
    }
  }, [router]);

  const handleGoBack = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('generatedRecipe'); // Limpia la receta al volver
    }
    router.push('/kitchen');
  };

  if (loadingRecipe || !recipe) {
    // Puedes mostrar un spinner de carga o un mensaje mientras se carga/redirige
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center font-sans">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-t-4 border-blue-500 border-t-transparent rounded-full"
        ></motion.div>
        <p className="ml-4 text-xl font-semibold text-gray-800">Cargando receta...</p>
      </div>
    );
  }

  // Determine if it's an error recipe
  const isErrorRecipe = recipe.titulo.startsWith('ERROR:');
  const [imageSrc, setImageSrc] = useState(recipe.img_url || placeholderImageUrl);

  return (
    <div className="min-h-screen bg-gradient-to-br pt-[5%] from-green-50 to-blue-100 py-10 flex items-center justify-center font-sans">
      <Head>
        <title>Culinarium - {recipe.titulo}</title>
        <meta name="description" content={`Receta para ${recipe.titulo} generada por Culinarium.`} />
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
            className="flex items-center self-start px-6 py-3 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 transition-colors text-lg font-semibold"
            aria-label="Volver al formulario"
          >
            <IoArrowBackCircleOutline className="w-6 h-6 mr-2" />
            Volver al Formulario
          </motion.button>

          {/* Recipe Header */}
          <section className="text-center mb-6">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
              {isErrorRecipe ? (
                <span className="text-red-600 flex items-center justify-center">
                  <IoWarningOutline className="w-10 h-10 mr-3" />
                  {recipe.titulo}
                </span>
              ) : (
                recipe.titulo
              )}
            </h1>
            <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
              {recipe.descripcion}
            </p>
          </section>

          {/* Recipe Image (or Placeholder) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-lg mb-8"
          >
            <Image
              src={imageSrc}
              alt={recipe.titulo}
              fill
              className="object-cover"
              onError={() => setImageSrc(placeholderImageUrl)}
            />
          </motion.div>

          {/* Metadata Section */}
          {!isErrorRecipe && (
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-xl shadow-sm flex items-center space-x-3">
                <IoTimeOutline className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="text-md font-semibold text-gray-700">Tiempo Total</h3>
                  <p className="text-lg font-bold text-blue-800">{recipe.tiempo_total_min} min</p>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-xl shadow-sm flex items-center space-x-3">
                <IoPeopleOutline className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="text-md font-semibold text-gray-700">Porciones</h3>
                  <p className="text-lg font-bold text-green-800">{recipe.porciones}</p>
                </div>
              </div>
              {recipe.estilo && (
                <div className="bg-indigo-50 p-4 rounded-xl shadow-sm flex items-center space-x-3">
                  {getCuisineIcon(recipe.estilo)}
                  <div>
                    <h3 className="text-md font-semibold text-gray-700">Estilo</h3>
                    <p className="text-lg font-bold text-indigo-800 capitalize">{recipe.estilo}</p>
                  </div>
                </div>
              )}
              {recipe.restricciones && recipe.restricciones.length > 0 && (
                <div className="bg-teal-50 p-4 rounded-xl shadow-sm flex items-center space-x-3">
                  <GiFruitBowl className="w-8 h-8 text-teal-600" />
                  <div>
                    <h3 className="text-md font-semibold text-gray-700">Restricciones</h3>
                    <div className="flex flex-wrap gap-1">
                      {recipe.restricciones.map((r, i) => (
                        <span key={i} className="text-sm font-bold text-teal-800 bg-teal-200 px-2 py-0.5 rounded-full">
                          {getRestrictionLabel(r)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Ingredients and Instructions Sections */}
          {!isErrorRecipe && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Ingredients List */}
              <section className="bg-gray-50 p-6 rounded-2xl shadow-inner">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                  <span className="mr-3 text-orange-500 text-4xl">🥕</span> Ingredientes
                </h2>
                <ul className="list-none space-y-3">
                  {/* CAMBIO AQUÍ: Accediendo a las propiedades del objeto ingrediente */}
                  {recipe.ingredientes.map((ingredient, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex items-start text-lg text-gray-700 border-b border-gray-200 pb-2 last:border-b-0"
                    >
                      <span className="text-blue-500 mr-3 mt-1">●</span>
                      {`${ingredient.cantidad} ${ingredient.unidad} de ${ingredient.nombre}`}
                    </motion.li>
                  ))}
                </ul>
              </section>

              {/* Instructions List */}
              <section className="bg-gray-50 p-6 rounded-2xl shadow-inner">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                  <span className="mr-3 text-purple-500 text-4xl">👨‍🍳</span> Instrucciones
                </h2>
                <ol className="list-decimal list-inside space-y-4 list-none">
                  {recipe.instrucciones.map((instruction, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="text-lg text-gray-700 leading-relaxed"
                    >
                      <span className="font-semibold text-purple-700">Paso {instruction.paso}:</span> {instruction.texto}
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
                <MdOutlineNoFood className="w-8 h-8 mr-3" /> Ingredientes Evitados
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

          {/* Footer Back Button */}
          <motion.button
            type="button"
            onClick={handleGoBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center mt-10 px-8 py-4 bg-blue-500 text-white rounded-xl shadow-lg hover:bg-blue-600 transition-colors text-xl font-semibold"
            aria-label="Volver al formulario"
          >
            <IoArrowBackCircleOutline className="w-7 h-7 mr-3" />
            ¡Quiero otra Receta!
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default RecipePage;
