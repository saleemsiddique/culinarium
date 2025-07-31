"use client";

import Link from 'next/link';
import {
  FaYoutube,
  FaInstagram,
  FaTiktok,
} from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="w-full bg-[var(--foreground)] text-[var(--text2)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
        {/* Izquierda: iconos sociales */}
        <div className="flex items-center space-x-4">
          <Link href="https://tiktok.com" aria-label="TikTok" target="_blank">
            <FaTiktok size={20} className="hover:text-[var(--highlight)] transition-colors" />
          </Link>
          <Link href="https://youtube.com" aria-label="YouTube" target="_blank">
            <FaYoutube size={20} className="hover:text-[var(--highlight)] transition-colors" />
          </Link>
          <Link href="https://instagram.com" aria-label="Instagram" target="_blank">
            <FaInstagram size={20} className="hover:text-[var(--highlight)] transition-colors" />
          </Link>
        </div>

        {/* Centro: derechos reservados */}
        <div className="text-sm text-[var(--muted)] italic text-center">
          © Culinarium 2025. All rights reserved.
        </div>

        {/* Derecha: Logo/Nombre */}
        <div className="text-lg font-bold text-center">
          Culinarium
        </div>
      </div>
    </footer>
  );
}
