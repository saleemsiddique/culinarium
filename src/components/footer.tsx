"use client";

import Link from 'next/link';
import {
  FaYoutube,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
} from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="w-full bg-[var(--foreground)] text-[var(--text2)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        {/* Izquierda: logo / nombre */}
        <div className="text-lg font-bold">
          Culinarium
        </div>

        {/* Centro: derechos reservados */}
        <div className="text-sm text-[var(--muted)] italic">
          © Culinarium 2025. All rights reserved.
        </div>

        {/* Derecha: iconos sociales */}
        <div className="flex items-center space-x-4">
          <Link href="https://youtube.com" aria-label="YouTube" target="_blank">
            <FaYoutube size={20} className="hover:text-[var(--highlight)] transition-colors" />
          </Link>
          <Link href="https://facebook.com" aria-label="Facebook" target="_blank">
            <FaFacebook size={20} className="hover:text-[var(--highlight)] transition-colors" />
          </Link>
          <Link href="https://twitter.com" aria-label="Twitter" target="_blank">
            <FaTwitter size={20} className="hover:text-[var(--highlight)] transition-colors" />
          </Link>
          <Link href="https://instagram.com" aria-label="Instagram" target="_blank">
            <FaInstagram size={20} className="hover:text-[var(--highlight)] transition-colors" />
          </Link>
          <Link href="https://linkedin.com" aria-label="LinkedIn" target="_blank">
            <FaLinkedin size={20} className="hover:text-[var(--highlight)] transition-colors" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
