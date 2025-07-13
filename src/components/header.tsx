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

const buttonClasses =
  "px-6 py-2 rounded-full text-lg font-semibold bg-gradient-to-r from-[var(--highlight)] to-yellow-400 text-[var(--text2)] shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 cursor-pointer";

  const desktopLinks: { label: string; path: string; isButton?: boolean }[] = [
    { label: 'Home', path: isLoggedIn ? '/kitchen' : '/' },
    isLoggedIn
      ? { label: 'My Profile', path: '/profile' }
      : { label: 'Empezar', path: '/login', isButton: true },
  ];

  return (
    <header
      className={`w-full backdrop-blur bg-[var(--foreground)]/80 shadow-lg fixed top-0 left-0 z-50 
        ${isMobileHidden ? 'hidden md:block' : ''}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Título */}
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--text2)] hover:text-[var(--highlight)] transition-colors duration-300">
            Cullinarium
          </h1>

          {/* Navegación */}
          <nav>
            {/* Escritorio */}
            <ul className="hidden md:flex items-center gap-6">
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
                          className={`text-[var(--text2)] hover:text-[var(--highlight)] font-medium transition-colors duration-200 ${
                            isActive ? 'underline decoration-[var(--highlight)]' : ''
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

            {/* Móvil */}
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
