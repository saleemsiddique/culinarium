"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/context/user-context';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const pathname = usePathname();
  const { user } = useUser(); // Ya no necesitamos la función de logout aquí
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
              className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--foreground)] cursor-pointer"
              whileHover={{ scale: 1.05, color: 'var(--highlight)' }}
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
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {label}
                      </motion.span>
                    </Link>
                  </li>
                );
              })}

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

            {/* Botón "Empezar" (si NO está logueado) */}
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

            {/* Visualización de Tokens para Usuarios Logueados */}
            {isLoggedIn && (
              <motion.div
                className="relative flex items-center bg-[var(--background)] p-2 rounded-full shadow-inner cursor-pointer border border-[var(--highlight)]"
                onMouseEnter={() => setShowTokenDetails(true)}
                onMouseLeave={() => setShowTokenDetails(false)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.1 }}
              >
                <span className="text-[var(--foreground)] font-semibold text-sm md:text-base mr-2">
                  Tokens: <span className="text-[var(--highlight)] font-bold text-lg">{totalTokens}</span>
                </span>
                <span className="text-[var(--highlight)] text-xl">✨</span>

                <AnimatePresence>
                  {showTokenDetails && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full mt-4 left-1/2 -translate-x-1/2 p-6 rounded-2xl shadow-2xl z-50
                                 bg-white backdrop-blur-2xl border border-white/80 text-[var(--foreground)]
                                 w-64 max-w-sm"
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-lg">Tus Tokens</p>
                          <span className="text-2xl">✨</span>
                        </div>
                        <div className="flex flex-col gap-2 border-t pt-2 border-white/50">
                          <div className="flex justify-between items-center text-sm text-[var(--foreground)]">
                            <span>Mensuales</span>
                            <span className="font-bold text-base text-[var(--highlight)]">{user?.monthly_tokens || 0}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm text-[var(--foreground)]">
                            <span>Extras</span>
                            <span className="font-bold text-base text-[var(--highlight)]">{user?.extra_tokens || 0}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center font-bold text-lg border-t pt-3 mt-3 border-white/50">
                          <span>Total</span>
                          <span className="text-[var(--highlight)]">{totalTokens}</span>
                        </div>
                      </div>
                      
                      <Link href="/buy-tokens" passHref>
                        <motion.button
                          className="w-full mt-4 py-3 text-sm rounded-xl font-bold transition-all duration-300
                                     bg-[var(--highlight)] text-[var(--text2)] shadow-md
                                     hover:bg-[var(--highlight-dark)] hover:shadow-lg"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          ¡Comprar más tokens!
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
