"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, CustomUser } from '@/context/user-context';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BookOpen, Menu, X, User, Crown, Zap } from 'lucide-react';
import { TokensModal } from "./SideMenu/TokensModal";
import { PremiumModal } from "./SideMenu/PremiumModal";

// Definición de las props para los iconos de Lucide-React
interface LucideIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
  absoluteStrokeWidth?: boolean;
}

// Componente para los elementos del menú móvil
const MobileMenuItem: React.FC<{ href: string; icon: React.ReactNode; label: string; onClick: () => void }> = ({ href, icon, label, onClick }) => {
  const pathname = usePathname();
  const isActive = pathname === href || (href === '/kitchen/recipes/list' && pathname.startsWith('/kitchen/recipes/list'));

  return (
    <Link href={href} passHref>
      <motion.div
        onClick={onClick}
        className={`flex items-center gap-4 py-3 px-4 rounded-lg transition-colors duration-200 cursor-pointer w-full justify-start
          ${isActive
            ? 'bg-gradient-to-r from-[var(--highlight)] to-[var(--highlight-dark)] text-[var(--text2)] shadow-md'
            : 'bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--primary)]/10'
          }
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {React.cloneElement(icon as React.ReactElement<LucideIconProps>, { className: `w-8 h-8 ${isActive ? 'text-[var(--text2)]' : 'text-[var(--foreground)]'}` })}
        <span className="text-xl font-semibold">{label}</span>
      </motion.div>
    </Link>
  );
};

export default function Header() {
  const pathname = usePathname();
  const { user } = useUser() || {};
  const isLoggedIn = !!user;

  // Estados para el menú móvil y la responsividad
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Estados para los modales a pantalla completa
  const [showTokens, setShowTokens] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  // Estado para el popup de tokens en escritorio
  const [showTokensPopup, setShowTokensPopup] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Hook para detectar el tamaño de la ventana y actualizar el estado dinámicamente
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lógica para determinar si estamos en una página de perfil en móvil
  const isMobileProfilePage = isMobile && pathname.startsWith('/profile');

  // Lógica para determinar si mostrar la cabecera en general
  const shouldHideHeader = isMobile && !isMobileProfilePage && pathname !== '/';

  // Calcular el total de tokens
  const totalTokens = (user?.monthly_tokens || 0) + (user?.extra_tokens || 0);

  // Clases mejoradas para el botón especial (Empezar)
  const specialButtonClasses =
    "px-6 py-2 rounded-full text-lg font-semibold shadow-lg transition-all duration-300 cursor-pointer " +
    "bg-gradient-to-r from-[var(--highlight)] to-[var(--highlight-dark)] text-[var(--text2)] " +
    "hover:from-[var(--highlight-dark)] hover:to-[var(--highlight)] focus:outline-none focus:ring-4 focus:ring-[var(--highlight)]";

  return (
    <>
      {/* Modales a pantalla completa */}
      {showTokens && <TokensModal user={user as CustomUser | null} onClose={() => setShowTokens(false)} />}
      {showPremium && <PremiumModal user={user as CustomUser | null} onClose={() => setShowPremium(false)} onSubscribe={() => setShowPremium(false)} />}

      <header
        className={`w-full backdrop-blur-md bg-white/80 shadow-xl fixed top-0 left-0 z-50 transition-all duration-300
          ${shouldHideHeader ? 'hidden' : ''}
        `}
      >
        {/* Botón flotante y drawer animado para páginas de perfil en móvil */}
        {isMobileProfilePage && (
          <>
            <AnimatePresence>
              {!drawerOpen && (
                <motion.button
                  key="menu-button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="fixed top-4 left-4 z-50 bg-[var(--highlight)] text-[var(--text2)] rounded-full p-3 shadow-lg transition"
                  onClick={() => setDrawerOpen(true)}
                  aria-label="Abrir menú"
                >
                  <Menu className="w-6 h-6" />
                </motion.button>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {drawerOpen && (
                <motion.div
                  key="mobile-drawer"
                  initial={{ x: '-100%' }}
                  animate={{ x: '0%' }}
                  exit={{ x: '-100%' }}
                  transition={{ type: "tween", duration: 0.3 }}
                  className="fixed top-0 left-0 w-screen h-screen z-40 bg-[var(--background)] md:hidden flex flex-col"
                >
                  {/* Contenido del drawer */}
                  <div className="flex justify-between items-center p-4">
                    <Link href={isLoggedIn ? '/kitchen' : '/'}>
                      <motion.h1
                        className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--foreground)] cursor-pointer"
                        whileHover={{ scale: 1.05, color: 'var(--highlight)' }}
                        transition={{ duration: 0.2 }}
                      >
                        Culinarium
                      </motion.h1>
                    </Link>
                    <button
                      className="text-[var(--muted)] hover:text-[var(--foreground)] transition "
                      onClick={() => setDrawerOpen(false)}
                      aria-label="Cerrar menú"
                    >
                      <X className="w-8 h-8" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-6 p-4 flex-grow overflow-y-auto items-center">
                    <MobileMenuItem href="/kitchen" icon={<Plus />} label="Nueva Receta" onClick={() => setDrawerOpen(false)} />
                    <MobileMenuItem href="/kitchen/recipes/list" icon={<BookOpen />} label="Mis Recetas" onClick={() => setDrawerOpen(false)} />
                    <MobileMenuItem href="/profile" icon={<User />} label="Mi Perfil" onClick={() => setDrawerOpen(false)} />

                    {user && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        className="mt-8 p-6 bg-[var(--primary)] rounded-xl shadow-xl text-[var(--text2)] text-center w-full max-w-sm border-2 border-[var(--highlight)]"
                      >
                        <h3 className="text-xl font-bold mb-3">Tus Tokens</h3>
                        <div className="space-y-2 mb-4">
                          <p className="flex justify-between items-center text-lg">
                            <span>Mensuales:</span> <span className="font-bold text-[var(--highlight)]">{user?.monthly_tokens || 0}</span>
                          </p>
                          <p className="flex justify-between items-center text-lg">
                            <span>Extras:</span> <span className="font-bold text-[var(--highlight)]">{user?.extra_tokens || 0}</span>
                          </p>
                        </div>
                        <p className="text-sm italic mb-4">
                          Total: <span className="font-bold text-[var(--highlight)] text-xl">{totalTokens}</span>
                        </p>
                        <button onClick={() => { setDrawerOpen(false); setShowTokens(true); }} className="w-full">
                          <motion.div
                            className="w-full py-3 rounded-full text-lg font-bold shadow-lg transition-all duration-300
                                       bg-gradient-to-r from-[var(--highlight)] to-[var(--highlight-dark)] text-[var(--text2)]
                                       hover:from-[var(--highlight-dark)] hover:to-[var(--highlight)] focus:outline-none focus:ring-4 focus:ring-[var(--highlight)] text-center"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            role="button"
                            tabIndex={0}
                          >
                            ¡Comprar Más Tokens!
                          </motion.div>
                        </button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Contenido del Header para escritorio o móvil en otras páginas */}
        {!isMobileProfilePage && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href={isLoggedIn ? '/kitchen' : '/'}>
                <motion.h1
                  className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--foreground)] cursor-pointer"
                  whileHover={{ scale: 1.05, color: 'var(--highlight)' }}
                  transition={{ duration: 0.2 }}
                >
                  Culinarium
                </motion.h1>
              </Link>

              <nav className="flex items-center gap-6">
                <ul className="hidden md:flex items-center gap-6">
                  <li>
                    <Link href={isLoggedIn ? '/kitchen' : '/'} passHref>
                      <motion.span
                        className={`text-[var(--foreground)] hover:text-[var(--highlight)] font-medium transition-colors duration-200 cursor-pointer
                          ${pathname === (isLoggedIn ? '/kitchen' : '/') ? 'underline decoration-[var(--highlight)] underline-offset-4' : ''
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Inicio
                      </motion.span>
                    </Link>
                  </li>
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

                {isLoggedIn && (
                  <div
                    className="relative flex items-center bg-[var(--background)] p-2 rounded-full shadow-inner cursor-pointer border border-[var(--highlight)]"
                    onMouseEnter={() => setShowTokensPopup(true)}
                    onMouseLeave={() => setShowTokensPopup(false)}
                  >
                    <span className="text-[var(--foreground)] font-semibold text-sm md:text-base mr-2">
                      Tokens: <span className="text-[var(--highlight)] font-bold text-lg">{totalTokens}</span>
                    </span>
                    <span className="text-[var(--highlight)] text-xl">✨</span>

                    {/* El popup de tokens, solo visible en escritorio */}
                    {showTokensPopup && !isMobile && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 p-4
                                   bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-gray-200 dark:border-zinc-700
                                   text-[var(--foreground)] z-50"
                      >
                        <h3 className="text-lg font-bold mb-2 text-center">Tus Tokens</h3>
                        <div className="space-y-2">
                          <p className="flex justify-between items-center text-sm">
                            <span>Mensuales:</span> <span className="font-bold text-[var(--highlight)]">{user?.monthly_tokens || 0}</span>
                          </p>
                          <p className="flex justify-between items-center text-sm">
                            <span>Extras:</span> <span className="font-bold text-[var(--highlight)]">{user?.extra_tokens || 0}</span>
                          </p>
                        </div>
                        <div className="h-px bg-gray-200 dark:bg-zinc-700 my-3" />
                        <p className="flex justify-between items-center text-base font-semibold">
                          <span>Total:</span> <span className="text-[var(--highlight)] font-bold">{totalTokens}</span>
                        </p>
                        <motion.button
                          onClick={() => {
                            setShowTokensPopup(false);
                            setShowTokens(true);
                          }}
                          className="mt-4 w-full py-2 text-sm font-bold shadow-md text-center rounded-full transition-all duration-300
                                     bg-gradient-to-r from-[var(--highlight)] to-[var(--highlight-dark)] text-[var(--text2)]
                                     hover:from-[var(--highlight-dark)] hover:to-[var(--highlight)]"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Comprar más tokens
                        </motion.button>

                        {/* Botón de suscripción Premium (sólo si no está suscrito) */}
                        {user && !user.isSubscribed && (
                          <motion.button
                            onClick={() => {
                              setShowTokensPopup(false);
                              setShowPremium(true);
                            }}
                            className="mt-2 w-full py-2 text-sm font-bold shadow-md text-center rounded-full transition-all duration-300
                                       bg-gradient-to-r from-yellow-400 to-yellow-600 text-white
                                       hover:from-yellow-500 hover:to-yellow-700"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Suscribirse a Premium
                          </motion.button>
                        )}
                      </motion.div>
                    )}
                  </div>
                )}
              </nav>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
