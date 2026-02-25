"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/user-context';

import InfoBox from "@/components/infoBox";
import FAQ from "@/components/faq";
import Pricing from "@/components/pricing";
import CTASection from "@/components/CTASection";
import { Loader2 } from 'lucide-react';
import KitchenContent from "./kitchen/KitchenContent";

export default function Home() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/kitchen');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <Loader2 className="h-10 w-10 text-[var(--highlight)] animate-spin" />
      </div>
    );
  }

  return (
    <main className="h-full w-full bg-[var(--background)]">
      {/* Form as hero — the product IS the landing */}
      <section className="relative flex justify-center items-start min-h-[600px] md:min-h-[820px]">
        <KitchenContent />
      </section>

      {/* Key Features */}
      <section className="flex justify-center items-center w-full">
        <InfoBox />
      </section>

      {/* Pricing */}
      <section id="pricing" className="flex flex-col justify-between items-center">
        <Pricing />
      </section>

      {/* FAQ */}
      <section>
        <FAQ />
      </section>

      {/* Final CTA */}
      <section>
        <CTASection />
      </section>
    </main>
  );
}
