import React from 'react';
import Link from 'next/link';
import { Plus, BookOpen, Hammer } from 'lucide-react';

interface SideMenuProps {
  className?: string;
}

const SideMenu: React.FC<SideMenuProps> = ({ className = '' }) => {
  return (
    <aside
      className={`
        fixed
        top-16       /* baja 4rem para quedar justo bajo el header */
        bottom-20    /* eleva 5rem para quedar justo sobre el footer */
        left-0
        w-20
        bg-white
        flex flex-col items-center justify-between
        py-6
        border-r border-gray-200
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
          href="kitchen/recipes"
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
  );
};

export default SideMenu;
