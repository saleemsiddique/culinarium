"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Importa useRouter
import { useUser } from '@/context/user-context'; // Importa useUser

import HeroSection from "@/components/hero";
import InfoBox from "@/components/infoBox";
import FAQ from "@/components/faq";
import Pricing from "@/components/pricing";
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { user, loading } = useUser(); // Obtén el usuario y el estado de carga del contexto
  const router = useRouter(); // Inicializa el router

  useEffect(() => {
    // Si la carga ha terminado y hay un usuario logueado, redirige a /kitchen
    if (!loading && user) {
      router.push('/kitchen');
    }
  }, [user, loading, router]);

  // Si está cargando o el usuario ya está logueado, muestra un spinner de carga
  if (loading || user) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <Loader2 className="h-12 w-12 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <main className="h-full w-full bg-[var(--background)]">
      
      {/*Video Introduction*/}
      <section className="relative flex justify-center items-center min-h-[600px] md:min-h-[820px]">
        <HeroSection/>
      </section>

      {/* Key Features */}
      <section className="flex justify-center items-center w-full">
        <InfoBox></InfoBox>
      </section>

      {/* Pricing */}
      <section id="pricing" className="flex flex-col justify-between items-center py-30 px-4 md:px-8">
        <Pricing/>
      </section>

      {/* FAQ */}
      <section>
        <FAQ/>
      </section>

    </main>
  );
}
