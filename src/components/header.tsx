"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  isLoggedIn: boolean;
}

export default function Header({ isLoggedIn }: HeaderProps) {
  const pathname = usePathname();

  // Navigation links: Home always + CTA or Profile
  const links: { label: string; path: string; isButton?: boolean }[] = [
    { label: 'Home', path: isLoggedIn ? '/kitchen' : '/' },
    isLoggedIn
      ? { label: 'My Profile', path: '/profile' }
      : { label: 'Empezar', path: '/login', isButton: true },
  ];

  return (
    <header className="w-full bg-[var(--foreground)] shadow fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Site Title */}
          <h1 className="text-2xl font-bold text-[var(--text2)]">Cullinarium</h1>

          {/* Navigation */}
          <nav>
            <ul className="flex items-center space-x-6">
              {links.map(({ label, path, isButton }) => (
                <li key={label}>
                  <Link href={path}>
                    {isButton ? (
                      <button
                        className="px-6 py-2 rounded-2xl text-lg font-semibold text-[var(--text2)] transition hover:opacity-90 bg-[var(--highlight)]">
                        {label}
                      </button>
                    ) : (
                      <span
                        className={`text-[var(--text2)] hover:text-primary transition-colors duration-200 ${
                          pathname === path ? 'font-semibold' : ''
                        }`}
                      >
                        {label}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
