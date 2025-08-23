"use client";

import React, { ReactNode, useEffect } from 'react';
import SideMenu from '@/components/side-menu';
import { useUser } from '@/context/user-context';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation'; // <-- Corrected import

interface KitchenLayoutProps {
  children: ReactNode;
}

export default function KitchenLayout({ children }: KitchenLayoutProps) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Si la carga ha terminado y no hay un usuario, redirige a la página de inicio
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Si está cargando o no hay un usuario, muestra el spinner de carga
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <Loader2 className="h-12 w-12 text-gray-400 animate-spin" />
      </div>
    );
  }

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