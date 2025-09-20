"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function AppReadyProvider({
  children,
}: { children: React.ReactNode }) {
  const { ready } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!ready || !mounted) {
    // Aquí pones tu skeleton global
    return (
      <main className="bg-gray-950 text-gray-300 min-h-screen w-screen flex items-center justify-center px-6 py-12 lg:py-24">
        <div className="max-w-4xl w-full mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-800 rounded w-1/3" />
            <div className="h-4 bg-gray-800 rounded w-2/3" />
            <div className="h-4 bg-gray-800 rounded w-1/2" />
            <div className="h-4 bg-gray-800 rounded w-full mt-6" />
            <div className="h-4 bg-gray-800 rounded w-5/6" />
            <div className="h-4 bg-gray-800 rounded w-2/3" />
          </div>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
