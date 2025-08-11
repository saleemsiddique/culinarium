/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import NextLink from 'next/link'; // Renamed to avoid conflict with Lucide's Link
import { useUser } from '@/context/user-context'; // Import useUser to get the authenticated user
import { auth } from '@/lib/firebase'; // Import the client-side Firebase auth instance

// Define the Recipe type based on your provided structure
type Recipe = {
  id: string; // Add an ID for key prop in lists
  titulo: string;
  descripcion: string;
  ingredientes: { nombre: string; cantidad: string; unidad: string | null }[];
  instrucciones: { paso: number; texto: string }[];
  tiempo_total_min: number;
  porciones: number;
  estilo: string | null;
  restricciones: string[];
  excluidos: string[];
  momento_del_dia: string | null;
  img_url: string;
  user_id: string;
};

const RecipeListPage: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: userLoading } = useUser(); // Get user and userLoading state from context

  // Define mealTimes directly within this component
  const mealTimes = [
    { label: 'Desayuno', value: 'breakfast' },
    { label: 'Comida', value: 'lunch' },
    { label: 'Cena', value: 'dinner' },
    { label: 'Snack', value: 'snack' },
  ];

  useEffect(() => {
    const fetchRecipes = async () => {
      // Esperar hasta que el estado de autenticación del usuario se resuelva
      if (userLoading) {
        return;
      }

      // Obtener el usuario de Firebase Auth directamente
      const firebaseAuthUser = auth.currentUser;

      if (!firebaseAuthUser) {
        setError("Necesitas iniciar sesión para ver tus recetas.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Obtener el ID Token del usuario de Firebase Auth
        const idToken = await firebaseAuthUser.getIdToken();

        const response = await fetch('/api/recipes', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${idToken}`, // Pasar el ID Token en el encabezado de Autorización
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Error al cargar recetas: Status ${response.status}`);
        }

        const data = await response.json();
        // La API devuelve { recipes: [...] }, así que accedemos a data.recipes
        setRecipes(data.recipes || []);
      } catch (err: any) {
        console.error("Error al obtener las recetas:", err);
        setError(`Error al cargar tus recetas: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [user, userLoading]); // Re-ejecutar cuando el usuario o el estado de carga del usuario cambien

  return (
    <div className="min-h-screen bg-[var(--background)] py-24 px-4 sm:px-6 lg:px-8 font-sans">
      <Head>
        <title>Mis Recetas - Culinarium</title>
        <meta name="description" content="Tus recetas generadas y guardadas en Culinarium." />
      </Head>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--foreground)] text-center mb-12">
          <span className="text-[var(--highlight)]">Mis</span> Recetas
        </h1>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-t-4 border-[var(--highlight)] border-t-transparent rounded-full"
            ></motion.div>
            <p className="ml-4 text-[var(--foreground)] text-lg">Cargando tus deliciosas recetas...</p>
          </div>
        )}

        {error && (
          <div className="text-center text-[var(--highlight)] text-lg mt-8">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && recipes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center text-[var(--muted)] text-xl mt-16 p-8 bg-[var(--background)] rounded-2xl shadow-lg"
          >
            <p className="mb-4">¡Ups! Parece que aún no has generado ninguna receta.</p>
            <p className="mb-6">¡Es el momento perfecto para **crear tu primera obra maestra culinaria**!</p>
            <NextLink href="/kitchen" passHref>
              <motion.button
                className="mt-6 px-8 py-3 rounded-full text-lg font-semibold shadow-lg transition-all duration-300 cursor-pointer
                           bg-gradient-to-r from-[var(--highlight)] to-[var(--highlight-dark)] text-[var(--text2)]
                           hover:from-[var(--highlight-dark)] hover:to-[var(--highlight)] focus:outline-none focus:ring-4 focus:ring-[var(--highlight)]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ¡Empezar a Cocinar Ahora! 🍳
              </motion.button>
            </NextLink>
          </motion.div>
        )}

        {!loading && !error && recipes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.map((recipe) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-102 transition-transform duration-300
                           border border-[var(--primary)]" // Borde sutil para cada tarjeta
              >
                {/* Optional: Recipe Image (if img_url is ever populated) */}
                {recipe.img_url && (
                  <img
                    src={recipe.img_url}
                    alt={recipe.titulo}
                    className="w-full h-48 object-cover"
                    onError={(e: any) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x200/${encodeURIComponent('E67E22')}/${encodeURIComponent('FFFFFF')}?text=Culinarium`; }}
                  />
                )}
                {!recipe.img_url && (
                  <div className="w-full h-48 bg-[var(--highlight)]/20 flex items-center justify-center text-[var(--foreground)] text-xl font-bold rounded-t-2xl">
                    {recipe.momento_del_dia === 'breakfast' && '🍳 Desayuno'}
                    {recipe.momento_del_dia === 'lunch' && '🍲 Comida'}
                    {recipe.momento_del_dia === 'dinner' && '🌙 Cena'}
                    {recipe.momento_del_dia === 'snack' && '🍎 Snack'}
                    {!recipe.momento_del_dia && '🍽️ Tu Receta'}
                  </div>
                )}

                <div className="p-6">
                  <h2 className="text-2xl font-bold text-[var(--foreground)] mb-3 leading-tight">
                    {recipe.titulo}
                  </h2>
                  <p className="text-[var(--muted)] text-sm mb-4 line-clamp-3">
                    {recipe.descripcion}
                  </p>
                  <div className="flex flex-wrap items-center text-sm text-[var(--primary)] mb-4">
                    <span className="mr-4 flex items-center">
                      <span className="text-[var(--highlight)] mr-1">⏱️</span> {recipe.tiempo_total_min} min
                    </span>
                    <span className="mr-4 flex items-center">
                      <span className="text-[var(--highlight)] mr-1">🍽️</span> {recipe.porciones} porciones
                    </span>
                    {recipe.momento_del_dia && (
                      <span className="flex items-center">
                        <span className="text-[var(--highlight)] mr-1">☀️</span> {mealTimes.find(m => m.value === recipe.momento_del_dia)?.label}
                      </span>
                    )}
                  </div>
                  <NextLink
                    href={{
                      pathname: '/kitchen/recipes',
                      query: { id: recipe.id },
                    }}
                    passHref
                  >
                    <motion.button
                      className="w-full py-2 rounded-lg text-[var(--text2)] font-semibold
                                 bg-gradient-to-r from-[var(--primary)] to-[var(--foreground)]
                                 hover:from-[var(--foreground)] hover:to-[var(--primary)] transition-colors duration-300
                                 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Ver Receta
                    </motion.button>
                  </NextLink>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default RecipeListPage;
