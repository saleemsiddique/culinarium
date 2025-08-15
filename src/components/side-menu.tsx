"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus, BookOpen, Menu, X, User, Crown, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, CustomUser } from '@/context/user-context';
import { TokensModal } from "./SideMenu/TokensModal";
import { PremiumModal } from "./SideMenu/PremiumModal";

interface SideMenuProps {
  className?: string;
}

interface LucideIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
  absoluteStrokeWidth?: boolean;
}

const SideMenuItem: React.FC<{ href: string; icon: React.ReactNode; label: string }> = ({ href, icon, label }) => {
  const pathname = usePathname();
  const isActive = pathname === href || (href === '/kitchen/recipes/list' && pathname.startsWith('/kitchen/recipes/list'));

  return (
    <Link href={href} passHref>
      <motion.div
        className={`
          w-full h-20 flex flex-col items-center justify-center rounded-xl transition-all duration-200 p-2 cursor-pointer
          ${isActive
            ? 'bg-gradient-to-r from-[var(--highlight)] to-[var(--highlight-dark)] text-[var(--text2)] shadow-lg'
            : 'bg-[var(--primary)] text-[var(--text2)] hover:bg-[var(--primary)]/80 shadow-md'
          }
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={label}
      >
        {React.cloneElement(icon as React.ReactElement<LucideIconProps>, { className: `w-8 h-8 ${isActive ? 'text-[var(--text2)]' : 'text-[var(--text2)]'}` })}
        <span className="text-xs mt-1 font-semibold">{label}</span>
      </motion.div>
    </Link>
  );
};

const MobileMenuItem: React.FC<{ href: string; icon: React.ReactNode; label: string; onClick: () => void }> = ({ href, icon, label, onClick }) => {
  const pathname = usePathname();
  const isActive = pathname === href || (href === '/kitchen/recipes/list' && pathname.startsWith('/kitchen/recipes/list'));

  return (
    <Link href={href} passHref>
      <motion.div
        onClick={onClick}
        className={`flex items-center gap-4 py-3 px-4 rounded-lg transition-colors duration-200 cursor-pointer w-full justify-center
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

const SideMenu: React.FC<SideMenuProps> = ({ className = '' }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showTokens, setShowTokens] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const { user } = useUser(); // CustomUser | null

  const totalTokens = (user?.monthly_tokens || 0) + (user?.extra_tokens || 0);
  const remainingTokens = totalTokens;
  const onOpenPremium = () => setShowPremium(true);
  const onOpenTokens = () => setShowTokens(true);

  return (
    <>
      {/* Botón flotante en móvil (solo si drawer está cerrado) */}
      <AnimatePresence>
        {!drawerOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-4 left-4 z-50 bg-[var(--highlight)] text-[var(--text2)] rounded-full p-3 shadow-lg md:hidden transition"
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Drawer animado a pantalla completa en móvil */}
      <div
        className={`fixed inset-0 z-40 bg-[var(--background)] transform transition-transform duration-300 ease-in-out md:hidden ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        {/* Botón cerrar */}
        <div className="flex justify-end p-4">
          <button
            className="text-[var(--muted)] hover:text-[var(--foreground)] transition"
            onClick={() => setDrawerOpen(false)}
            aria-label="Cerrar menú"
          >
            <X className="w-8 h-8" />
          </button>
        </div>

        {/* Contenido centrado */}
        <div className="flex flex-col items-center justify-center gap-6 p-4 flex-grow">
          <MobileMenuItem href="/kitchen" icon={<Plus />} label="Nueva Receta" onClick={() => setDrawerOpen(false)} />
          <MobileMenuItem href="/kitchen/recipes/list" icon={<BookOpen />} label="Mis Recetas" onClick={() => setDrawerOpen(false)} />
          <MobileMenuItem href="/profile" icon={<User />} label="Mi Perfil" onClick={() => setDrawerOpen(false)} />

          {/* Sección de Tokens en Móvil */}
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

              {/* Botón para abrir el modal de tokens */}
              <motion.button
                onClick={() => {
                  onOpenTokens();
                  setDrawerOpen(false); // Cierra el cajón al abrir el modal
                }}
                className="w-full py-3 rounded-full text-lg font-bold shadow-lg transition-all duration-300
                            bg-gradient-to-r from-[var(--highlight)] to-[var(--highlight-dark)] text-[var(--text2)]
                            hover:from-[var(--highlight-dark)] hover:to-[var(--highlight)] focus:outline-none focus:ring-4 focus:ring-[var(--highlight)] text-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                role="button"
              >
                ¡Comprar Más Tokens!
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Side menu para escritorio */}
      <aside
        className={`
          hidden md:flex
          fixed top-16 bottom-0 left-0 w-24 h-[calc(100vh-4rem)]
          bg-[var(--background)] flex-col items-center justify-start
          py-6 border-r border-[var(--primary)] shadow-lg
          ${className}
        `}
      >
        <div className="flex flex-col gap-6 w-full px-2 mt-4">
          <SideMenuItem href="/kitchen" icon={<Plus />} label="Nueva" />
          <SideMenuItem href="/kitchen/recipes/list" icon={<BookOpen />} label="Recetas" />
        </div>

        {/* Espacio flexible para empujar controles abajo */}
        <div className="flex-1" />

        {/* Sección inferior: tokens / premium / perfil */}
        <div className="w-full px-3 space-y-4">
          {user ? (
            <>
              {/* Botones con el estilo que pediste */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={onOpenPremium}
                  className={`cursor-pointer w-16 h-16 flex items-center justify-center rounded-lg hover:bg-gray-100 transition
                    ${user?.isSubscribed ? "bg-gradient-to-r from-orange-500 to-yellow-400 shadow-lg border-transparent" : "bg-gray-50 border-dashed border-amber-400 hover:bg-amber-50"}
                  `}
                  title="Premium"
                  aria-label="Abrir Premium"
                >
                  <Crown className={`w-6 h-6 ${user?.isSubscribed ? "text-white" : "text-amber-500"}`} />
                </button>

                <button
                  onClick={onOpenTokens}
                  className="cursor-pointer w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex flex-col items-center justify-center relative group"
                  title="Ver Tokens"
                  aria-label="Ver Tokens"
                >
                  <Zap className="w-6 h-6 text-white mb-0.5" />
                  {!user?.isSubscribed && remainingTokens <= 5 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  )}
                </button>
              </div>

              {/* Perfil como Link sin <a> dentro */}
              <Link
                href="/profile"
                className="block w-full text-center py-2 rounded-lg text-sm font-medium bg-[var(--background)] border border-[var(--primary)] hover:bg-[var(--primary)]/5 transition"
              >
                Perfil
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="block w-full text-center py-2 rounded-lg text-sm font-medium bg-[var(--highlight)] text-[var(--text2)] hover:opacity-95 transition"
            >
              Entrar
            </Link>
          )}
        </div>
      </aside>

      {/* Modales */}
      {showTokens && <TokensModal user={user as CustomUser | null} onClose={() => setShowTokens(false)} />}
      {showPremium && <PremiumModal user={user as CustomUser | null} onClose={() => setShowPremium(false)} onSubscribe={() => setShowPremium(false)} />}
    </>
  );
};

export default SideMenu;
