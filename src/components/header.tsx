"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/context/user-context';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const pathname = usePathname();
  const { user } = useUser();
  const isLoggedIn = !!user;
  const isMobileHidden = pathname !== '/';

  // Estado para mostrar los detalles de los tokens al pasar el ratón
  const [showTokenDetails, setShowTokenDetails] = useState(false);

  // Calcular el total de tokens
  const totalTokens = (user?.monthly_tokens || 0) + (user?.extra_tokens || 0);

  // Clases mejoradas para el botón especial (Empezar)
  const specialButtonClasses =
    "px-6 py-2 rounded-full text-lg font-semibold shadow-lg transition-all duration-300 cursor-pointer " +
    "bg-gradient-to-r from-[var(--highlight)] to-[var(--highlight-dark)] text-[var(--text2)] " +
    "hover:from-[var(--highlight-dark)] hover:to-[var(--highlight)] focus:outline-none focus:ring-4 focus:ring-[var(--highlight)]";

  // Enlaces de navegación de escritorio (ahora solo "Inicio")
  const desktopLinks: { label: string; path: string }[] = [
    { label: 'Inicio', path: isLoggedIn ? '/kitchen' : '/' },
  ];

  return (
    <header
      className={`w-full backdrop-blur-md bg-white/80 shadow-xl fixed top-0 left-0 z-50 transition-all duration-300
        ${isMobileHidden ? 'hidden md:block' : ''}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Título */}
          <Link href={isLoggedIn ? '/kitchen' : '/'}>
            <motion.h1
              className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--foreground)] cursor-pointer" // Usa el color principal
              whileHover={{ scale: 1.05, color: 'var(--highlight)' }} // Usa el color de resaltado al pasar el ratón
              transition={{ duration: 0.2 }}
            >
              Culinarium
            </motion.h1>
          </Link>

          {/* Navegación y Tokens */}
          <nav className="flex items-center gap-6">
            {/* Enlaces de Escritorio */}
            <ul className="hidden md:flex items-center gap-6">
              {desktopLinks.map(({ label, path }) => {
                const isActive = pathname === path;
                return (
                  <li key={label}>
                    <Link href={path} passHref>
                      <motion.span
                        className={`text-[var(--foreground)] hover:text-[var(--highlight)] font-medium transition-colors duration-200 cursor-pointer
                          ${isActive ? 'underline decoration-[var(--highlight)] underline-offset-4' : ''
                        }`} // Usa los colores de primer plano y resaltado
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {label}
                      </motion.span>
                    </Link>
                  </li>
                );
              })}

              {/* Enlace "Mi Perfil" (si está logueado, ahora es un enlace normal) */}
              {isLoggedIn && (
                <li>
                  <Link href="/profile" passHref>
                    <motion.span
                      className={`text-[var(--foreground)] hover:text-[var(--highlight)] font-medium transition-colors duration-200 cursor-pointer
                        ${pathname === '/profile' ? 'underline decoration-[var(--highlight)] underline-offset-4' : ''
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Mi Perfil
                    </motion.span>
                  </Link>
                </li>
              )}
            </ul>

            {/* Botón "Empezar" (solo si NO está logueado, es el único botón especial) */}
            {!isLoggedIn && (
              <Link href="/auth/login" passHref>
                <motion.button
                  className={specialButtonClasses}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Empezar
                </motion.button>
              </Link>
            )}

            {/* Visualización de Tokens para Usuarios Logueados (al final) */}
            {isLoggedIn && (
              <motion.div
                className="relative flex items-center bg-[var(--background)] p-2 rounded-full shadow-inner cursor-pointer
                           border border-[var(--highlight)]" // Añadido borde para destacar
                onMouseEnter={() => setShowTokenDetails(true)}
                onMouseLeave={() => setShowTokenDetails(false)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.1 }}
              >
                <span className="text-[var(--foreground)] font-semibold text-sm md:text-base mr-2">
                  Tokens: <span className="text-[var(--highlight)] font-bold text-lg">{totalTokens}</span>
                </span>
                <span className="text-[var(--highlight)] text-xl">✨</span> {/* Icono más prominente */}

                <AnimatePresence>
                  {showTokenDetails && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full mt-3 left-1/2 -translate-x-1/2
                                 bg-gradient-to-br from-[var(--primary)] to-[var(--foreground)] text-[var(--text2)] p-5 rounded-xl shadow-2xl
                                 whitespace-nowrap z-50 flex flex-col items-center border-2 border-[var(--highlight)]
                                 transform origin-top-left" // Fondo con gradiente, más padding, borde más grueso, origen de transformación
                    >
                      <div className="flex flex-col items-start w-full px-2">
                        <p className="text-base mb-1 flex items-center">
                          <span className="mr-2 text-yellow-300">🗓️</span> Mensuales: <span className="font-bold ml-1 text-lg">{user?.monthly_tokens || 0}</span>
                        </p>
                        <p className="text-base mb-3 flex items-center">
                          <span className="mr-2 text-green-300">🎁</span> Extras: <span className="font-bold ml-1 text-lg">{user?.extra_tokens || 0}</span>
                        </p>
                      </div>
                      <Link href="/buy-tokens" passHref>
                        <motion.button
                          className="mt-2 px-5 py-2 text-base rounded-full
                                     bg-gradient-to-r from-[var(--highlight)] to-[var(--highlight-dark)] text-[var(--text2)]
                                     font-bold shadow-lg transition-all duration-300 transform
                                     hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]" // Botón más pequeño y elegante
                          whileHover={{ scale: 1.1 }} // Efecto de escala al pasar el ratón
                          whileTap={{ scale: 0.9 }} // Efecto de escala al tocar
                        >
                          ¡Comprar más!
                        </motion.button>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
