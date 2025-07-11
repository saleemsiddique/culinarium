import React, { ReactNode } from 'react';
import SideMenu from '@/components/side-menu';

interface KitchenLayoutProps {
  children: ReactNode;
}

export default function KitchenLayout({ children }: KitchenLayoutProps) {
  return (
    <div className="flex w-full h-full">
      {/* SideMenu con altura completa del contenedor */}
      <SideMenu />

      {/* Contenido principal con scroll si desborda */}
      <main className="w-full h-full overflow-auto md:ml-20">
        {children}
      </main>
    </div>
  );
}
