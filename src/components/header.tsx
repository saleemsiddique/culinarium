"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, CustomUser } from '@/context/user-context';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BookOpen, Menu, X, User, Sparkles, ChefHat, Crown } from 'lucide-react';
import { TokensModal } from "./SideMenu/TokensModal";
import { PremiumModal } from "./SideMenu/PremiumModal";
import { useTranslation } from "react-i18next";

interface LucideIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
  absoluteStrokeWidth?: boolean;
}

const MobileMenuItem: React.FC<{ href: string; icon: React.ReactNode; label: string; onClick: () => void }> = ({ href, icon, label, onClick }) => {
  const pathname = usePathname();
  const isActive = pathname === href || (href === '/kitchen/recipes/list' && pathname.startsWith('/kitchen/recipes/list'));

  return (
    <Link href={href} passHref>
      <motion.div
        onClick={onClick}
        className={`flex items-center gap-4 py-3 px-4 rounded-xl transition-colors duration-200 cursor-pointer w-full justify-start
          ${isActive
            ? 'bg-gradient-to-r from-[var(--highlight)] to-[var(--highlight-dark)] text-white shadow-md'
            : 'bg-white/60 text-[var(--foreground)] hover:bg-white'
          }
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {React.cloneElement(icon as React.ReactElement<LucideIconProps>, { className: `w-6 h-6 ${isActive ? 'text-white' : 'text-[var(--foreground)]'}` })}
        <span className="text-base font-semibold">{label}</span>
      </motion.div>
    </Link>
  );
};

export default function Header() {
  const pathname = usePathname();
  const { user } = useUser() || {};
  const isLoggedIn = !!user;
  const { t } = useTranslation();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showTokens, setShowTokens] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [showTokensPopup, setShowTokensPopup] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobileProfilePage = isMobile && pathname.startsWith('/profile');
  const isAuthPage = isMobile && pathname.startsWith('/auth');
  const shouldHideHeader = isMobile && !isMobileProfilePage && !isAuthPage && pathname !== '/';

  const totalTokens = (user?.monthly_tokens || 0) + (user?.extra_tokens || 0);
  const totalRecipes = Math.floor(totalTokens / 10);
  const monthlyRecipes = Math.floor((user?.monthly_tokens || 0) / 10);
  const extraRecipes = Math.floor((user?.extra_tokens || 0) / 10);
  const isActiveSubscriber = user?.isSubscribed &&
    (user?.subscriptionStatus === 'active' || user?.subscriptionStatus === 'cancel_at_period_end');
  const recipesDisplay = isActiveSubscriber ? '\u221E' : String(totalRecipes);
  const isLowRecipes = !isActiveSubscriber && totalRecipes <= 2;

  return (
    <>
      {showTokens && <TokensModal user={user as CustomUser | null} onClose={() => setShowTokens(false)} />}
      {showPremium && <PremiumModal user={user as CustomUser | null} onClose={() => setShowPremium(false)} onSubscribe={() => setShowPremium(false)} />}

      <header
        className={`w-full backdrop-blur-xl bg-white/85 border-b border-[var(--border-subtle)] fixed top-0 left-0 z-50 transition-all duration-300
          ${shouldHideHeader ? 'hidden' : ''}
        `}
      >
        {/* Mobile profile page drawer */}
        {isMobileProfilePage && (
          <>
            <AnimatePresence>
              {!drawerOpen && (
                <motion.button
                  key="menu-button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="fixed top-4 left-4 z-50 bg-[var(--highlight)] text-white rounded-full p-3 shadow-lg transition"
                  onClick={() => setDrawerOpen(true)}
                  aria-label={t("header.menu.open")}
                >
                  <Menu className="w-5 h-5" />
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
                  <div className="flex justify-between items-center p-5 border-b border-[var(--border-subtle)]">
                    <Link href={isLoggedIn ? '/kitchen' : '/'}>
                      <span className="font-display text-2xl font-bold tracking-tight text-[var(--foreground)]">
                        Culinarium
                      </span>
                    </Link>
                    <button
                      className="p-2 rounded-lg hover:bg-black/5 transition"
                      onClick={() => setDrawerOpen(false)}
                      aria-label={t("header.menu.close")}
                    >
                      <X className="w-6 h-6 text-[var(--foreground)]" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-2 p-5 flex-grow overflow-y-auto">
                    <MobileMenuItem href="/kitchen" icon={<Plus />} label={t("header.menu.newRecipe")} onClick={() => setDrawerOpen(false)} />
                    <MobileMenuItem href="/kitchen/recipes/list" icon={<BookOpen />} label={t("header.menu.myRecipes")} onClick={() => setDrawerOpen(false)} />
                    <MobileMenuItem href="/profile" icon={<User />} label={t("header.menu.myProfile")} onClick={() => setDrawerOpen(false)} />

                    {user && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        className="mt-6 p-5 bg-[var(--primary)] rounded-2xl text-white"
                      >
                        <h3 className="font-display text-lg font-bold mb-3">{t("header.tokens.popup.title")}</h3>
                        <div className="space-y-2 mb-4 text-sm">
                          <p className="flex justify-between items-center">
                            <span className="text-white/70">{t("header.tokens.popup.monthly")}</span>
                            <span className="font-bold text-[var(--highlight)]">{monthlyRecipes}</span>
                          </p>
                          <p className="flex justify-between items-center">
                            <span className="text-white/70">{t("header.tokens.popup.extra")}</span>
                            <span className="font-bold text-[var(--highlight)]">{extraRecipes}</span>
                          </p>
                        </div>
                        <div className="h-px bg-white/20 my-3" />
                        <p className="flex justify-between items-center text-sm font-semibold">
                          <span>{t("header.tokens.popup.total")}</span>
                          <span className="text-[var(--highlight)] font-bold text-lg">
                            {isActiveSubscriber
                              ? t("header.tokens.unlimited")
                              : t("header.tokens.recipes", { count: totalRecipes })}
                          </span>
                        </p>
                        <button onClick={() => { setDrawerOpen(false); setShowTokens(true); }} className="w-full mt-4">
                          <motion.div
                            className="w-full py-3 rounded-xl text-sm font-bold shadow-md text-center transition-all duration-300
                                       bg-gradient-to-r from-[var(--highlight)] to-[var(--highlight-dark)] text-white
                                       hover:from-[var(--highlight-dark)] hover:to-[var(--highlight)]"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            role="button"
                            tabIndex={0}
                          >
                            {t("header.tokens.buy")}
                          </motion.div>
                        </button>
                        {user && !user.isSubscribed && (
                          <motion.button
                            onClick={() => {
                              setShowPremium(true);
                              setDrawerOpen(false);
                            }}
                            className="w-full py-3 mt-3 rounded-xl text-sm font-bold shadow-md text-center transition-all duration-300
                                       bg-gradient-to-r from-amber-400 to-amber-500 text-white
                                       hover:from-amber-500 hover:to-amber-600"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <span className="flex items-center justify-center gap-2">
                              <Crown className="w-4 h-4" />
                              {t("header.tokens.premium.subscribeButton")}
                            </span>
                          </motion.button>
                        )}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Main header content */}
        {!isMobileProfilePage && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <Link href={isLoggedIn ? '/kitchen' : '/'} className="flex items-center gap-2">
                <ChefHat className="w-7 h-7 text-[var(--highlight)]" strokeWidth={2} />
                <span className="font-display text-2xl md:text-[1.65rem] font-bold tracking-tight text-[var(--foreground)]">
                  Culinarium
                </span>
              </Link>

              <nav className="flex items-center gap-4">
                <ul className="hidden md:flex items-center gap-1">
                  <li>
                    <Link href={isLoggedIn ? '/kitchen' : '/'} passHref>
                      <motion.span
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer inline-block
                          ${pathname === (isLoggedIn ? '/kitchen' : '/')
                            ? 'bg-[var(--highlight)]/10 text-[var(--highlight)]'
                            : 'text-[var(--foreground)]/70 hover:text-[var(--foreground)] hover:bg-black/[0.03]'
                          }`}
                        whileTap={{ scale: 0.97 }}
                      >
                        {t("header.menu.home")}
                      </motion.span>
                    </Link>
                  </li>
                  {isLoggedIn && (
                    <li>
                      <Link href="/profile" passHref>
                        <motion.span
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer inline-block
                            ${pathname === '/profile'
                              ? 'bg-[var(--highlight)]/10 text-[var(--highlight)]'
                              : 'text-[var(--foreground)]/70 hover:text-[var(--foreground)] hover:bg-black/[0.03]'
                            }`}
                          whileTap={{ scale: 0.97 }}
                        >
                          {t("header.menu.myProfile")}
                        </motion.span>
                      </Link>
                    </li>
                  )}
                </ul>

                {/* CTA for non-logged users */}
                {!isLoggedIn && (
                  <Link href="/auth/register" passHref>
                    <motion.button
                      className="px-5 py-2 rounded-full text-sm font-semibold shadow-sm transition-all duration-300 cursor-pointer
                        bg-gradient-to-r from-[var(--highlight)] to-[var(--highlight-dark)] text-white
                        hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]/50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {t("header.auth.getStarted")}
                    </motion.button>
                  </Link>
                )}

                {/* Recipe counter pill for logged users */}
                {isLoggedIn && (
                  <div
                    className={`relative flex items-center gap-2 bg-white px-3.5 py-2 rounded-full shadow-sm cursor-pointer border transition-all duration-300
                      ${isLowRecipes
                        ? 'border-[var(--highlight)] recipe-warning'
                        : 'border-[var(--border-medium)] hover:border-[var(--highlight)]/40 hover:shadow-md'
                      }`}
                    onMouseEnter={() => setShowTokensPopup(true)}
                    onMouseLeave={() => setShowTokensPopup(false)}
                  >
                    <Sparkles className="w-4 h-4 text-[var(--highlight)]" />
                    <span className="text-sm font-semibold text-[var(--foreground)]">
                      <span className={`font-bold ${isLowRecipes ? 'text-[var(--highlight)]' : 'text-[var(--foreground)]'}`}>
                        {recipesDisplay}
                      </span>
                      {' '}
                      <span className="text-[var(--foreground)]/60 font-normal hidden sm:inline">
                        {isActiveSubscriber ? t("header.tokens.unlimited") : (totalRecipes === 1 ? 'receta' : 'recetas')}
                      </span>
                    </span>

                    {/* Desktop popup */}
                    <AnimatePresence>
                      {showTokensPopup && !isMobile && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.96 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full mt-2 right-0 w-72 p-5
                                     bg-white rounded-2xl shadow-xl border border-[var(--border-subtle)]
                                     text-[var(--foreground)] z-50"
                        >
                          <h3 className="font-display text-base font-bold mb-3">{t("header.tokens.popup.title")}</h3>
                          <div className="space-y-2.5">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-[var(--foreground)]/60">{t("header.tokens.popup.monthly")}</span>
                              <span className="font-semibold text-[var(--foreground)]">{monthlyRecipes}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-[var(--foreground)]/60">{t("header.tokens.popup.extra")}</span>
                              <span className="font-semibold text-[var(--foreground)]">{extraRecipes}</span>
                            </div>
                          </div>
                          <div className="h-px bg-[var(--border-subtle)] my-3" />
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold">{t("header.tokens.popup.total")}</span>
                            <span className="text-[var(--highlight)] font-bold text-lg">
                              {isActiveSubscriber
                                ? t("header.tokens.unlimited")
                                : t("header.tokens.recipes", { count: totalRecipes })}
                            </span>
                          </div>

                          <div className="mt-4 space-y-2">
                            <motion.button
                              onClick={() => {
                                setShowTokensPopup(false);
                                setShowTokens(true);
                              }}
                              className="w-full py-2.5 text-sm font-semibold text-center rounded-xl transition-all duration-300
                                         bg-gradient-to-r from-[var(--highlight)] to-[var(--highlight-dark)] text-white
                                         hover:shadow-md"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {t("header.tokens.buyMore")}
                            </motion.button>

                            {user && !user.isSubscribed && (
                              <motion.button
                                onClick={() => {
                                  setShowTokensPopup(false);
                                  setShowPremium(true);
                                }}
                                className="w-full py-2.5 text-sm font-semibold text-center rounded-xl transition-all duration-300
                                           bg-gradient-to-r from-amber-400 to-amber-500 text-white
                                           hover:shadow-md"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <span className="flex items-center justify-center gap-1.5">
                                  <Crown className="w-3.5 h-3.5" />
                                  {t("header.tokens.premium.subscribeButton")}
                                </span>
                              </motion.button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
