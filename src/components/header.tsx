"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  isLoggedIn: boolean;
}

export default function Header({ isLoggedIn }: HeaderProps) {
  const pathname = usePathname();

  const isMobileHidden = pathname !== '/';

  // Estilos comunes para el botón "Empezar"
  const buttonClasses =
    "px-6 py-2 rounded-2xl text-lg font-semibold text-[var(--text2)] bg-[var(--highlight)] shadow-lg transition hover:opacity-90 hover:shadow-xl";

  // Enlaces para escritorio
  const desktopLinks: { label: string; path: string; isButton?: boolean }[] = [
    { label: 'Home', path: isLoggedIn ? '/kitchen' : '/' },
    isLoggedIn
      ? { label: 'My Profile', path: '/profile' }
      : { label: 'Empezar', path: '/login', isButton: true },
  ];

  return (
    <header
      className={`w-full bg-[var(--foreground)] shadow fixed top-0 left-0 z-50 
        ${isMobileHidden ? 'hidden md:block' : ''}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Site Title */}
          <h1 className="text-2xl font-bold text-[var(--text2)]">Cullinarium</h1>

          {/* Navegación */}
          <nav>
            {/* Menú escritorio */}
            <ul className="hidden md:flex items-center space-x-6">
              {desktopLinks.map(({ label, path, isButton }) => {
                const isActive = pathname === path;
                return (
                  <li key={label}>
                    <Link href={path}>
                      {isButton ? (
                        <button className={buttonClasses}>
                          {label}
                        </button>
                      ) : (
                        <span
                          className={`text-[var(--text2)] hover:text-[var(--highlight)] transition-colors duration-200 ${
                            isActive
                              ? 'text-[var(--highlight)] underline decoration-[var(--highlight)]'
                              : ''
                          }`}
                        >
                          {label}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Menú móvil: solo "Empezar" en '/' cuando no está logueado */}
            <div className="flex md:hidden">
              {!isLoggedIn && pathname === '/' && (
                <Link href="/login">
                  <button className={buttonClasses}>Empezar</button>
                </Link>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
