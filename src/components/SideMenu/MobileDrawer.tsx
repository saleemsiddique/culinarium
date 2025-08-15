import React from "react";
import Link from "next/link";
import { X, Plus, BookOpen, User, Hammer } from "lucide-react";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ open, onClose }) => {
  return (
    <div className={`fixed inset-0 z-40 bg-white transform transition-transform duration-300 ease-in-out md:hidden ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex justify-end p-4">
        <button onClick={onClose} aria-label="Cerrar menú">
          <X className="w-8 h-8 text-gray-500 hover:text-gray-800 transition" />
        </button>
      </div>
      <div className="flex flex-col items-center justify-center gap-8 h-full text-2xl font-semibold">
        <Link href="/kitchen" onClick={onClose} className="flex items-center gap-4 hover:text-[var(--highlight)] transition">
          <Plus className="w-8 h-8" /><span>Nuevo Receta</span>
        </Link>
        <Link href="/kitchen/recipes" onClick={onClose} className="flex items-center gap-4 hover:text-[var(--highlight)] transition">
          <BookOpen className="w-8 h-8" /><span>Mis Recetas</span>
        </Link>
        <Link href="/profile" onClick={onClose} className="flex items-center gap-4 hover:text-[var(--highlight)] transition">
          <User className="w-8 h-8" /><span>My Profile</span>
        </Link>
        <button onClick={onClose} className="flex items-center gap-4 text-gray-700 hover:text-[var(--highlight)] transition">
          <Hammer className="w-8 h-8" /><span>Ajustes</span>
        </button>
      </div>
    </div>
  );
};
