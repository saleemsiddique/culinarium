'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, BookOpen, Hammer, User, Menu, X } from 'lucide-react';

interface SideMenuProps {
  className?: string;
}

const SideMenu: React.FC<SideMenuProps> = ({ className = '' }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {/* Botón flotante en móvil (solo si drawer está cerrado) */}
      {!drawerOpen && (
        <button
          className="fixed top-4 left-4 z-50 bg-[var(--highlight)] text-white rounded-full p-3 shadow-lg md:hidden transition"
          onClick={() => setDrawerOpen(true)}
          aria-label="Abrir menú"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* Drawer animado a pantalla completa en móvil */}
      <div
        className={`fixed inset-0 z-40 bg-white transform transition-transform duration-300 ease-in-out md:hidden ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Botón cerrar arriba a la derecha */}
        <div className="flex justify-end p-4">
          <button
            className="text-gray-500 hover:text-gray-800 transition"
            onClick={() => setDrawerOpen(false)}
            aria-label="Cerrar menú"
          >
            <X className="w-8 h-8" />
          </button>
        </div>

        {/* Contenido centrado */}
        <div className="flex flex-col items-center justify-center gap-8 h-full text-2xl font-semibold">
          <Link
            href="/kitchen"
            onClick={() => setDrawerOpen(false)}
            className="flex items-center gap-4 hover:text-[var(--highlight)] transition"
          >
            <Plus className="w-8 h-8" />
            <span>Nuevo Receta</span>
          </Link>

          <Link
            href="/kitchen/recipes"
            onClick={() => setDrawerOpen(false)}
            className="flex items-center gap-4 hover:text-[var(--highlight)] transition"
          >
            <BookOpen className="w-8 h-8" />
            <span>Mis Recetas</span>
          </Link>

          <Link
            href="/profile"
            onClick={() => setDrawerOpen(false)}
            className="flex items-center gap-4 hover:text-[var(--highlight)] transition"
          >
            <User className="w-8 h-8" />
            <span>My Profile</span>
          </Link>

          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="flex items-center gap-4 text-gray-700 hover:text-[var(--highlight)] transition"
          >
            <Hammer className="w-8 h-8" />
            <span>Ajustes</span>
          </button>
        </div>
      </div>

      {/* Side menu para escritorio */}
      <aside
        className={`
          hidden md:flex
          fixed top-16 bottom-20 left-0 w-20
          bg-white flex-col items-center justify-between
          py-6 border-r border-gray-200
          ${className}
        `}
      >
        <div className="space-y-4">
          <Link
            href="/kitchen"
            className="w-16 h-16 flex flex-col items-center justify-center border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition"
          >
            <Plus className="w-6 h-6 text-gray-700" />
            <span className="sr-only">Nuevo Receta</span>
          </Link>

          <Link
            href="/kitchen/recipes"
            className="w-16 h-16 flex flex-col items-center justify-center bg-orange-400 rounded-lg hover:opacity-90 transition"
          >
            <BookOpen className="w-6 h-6 text-white" />
            <span className="sr-only">Mis Recetas</span>
          </Link>
        </div>

        <button
          type="button"
          className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 transition"
        >
          <Hammer className="w-5 h-5" />
          <span className="sr-only">Ajustes</span>
        </button>
      </aside>
    </>
  );
};

export default SideMenu;
