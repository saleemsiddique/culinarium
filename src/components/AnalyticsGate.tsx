// components/AnalyticsGate.tsx
"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const DynamicAnalytics = dynamic(
  // import dinámico para evitar incluir Analytics en el bundle si no hace falta
  () => import("@vercel/analytics/react").then((m) => m.Analytics),
  { ssr: false }
);

const LOCAL_KEY_VERSIONS = "consent_versions";
const LOCAL_KEY_FULL = "culinarium_cookie_consent";

/**
 * Determina si el usuario ha aceptado analítica.
 * Aquí asumimos que "cookies_policy" controla analítica (ajústalo si tu clave es otra).
 */
function hasAnalyticsConsentFromLocal(): boolean {
  try {
    const fullRaw = localStorage.getItem(LOCAL_KEY_FULL);
    if (fullRaw) {
      const full = JSON.parse(fullRaw);
      // si tu objeto usa `analytics` boolean:
      if (typeof full.analytics === "boolean") return !!full.analytics;
    }
    const versionsRaw = localStorage.getItem(LOCAL_KEY_VERSIONS);
    if (versionsRaw) {
      const versions = JSON.parse(versionsRaw);
      // Comprueba si existe versión para cookies_policy
      return !!(versions && versions["cookies_policy"]);
    }
  } catch {
    // ignore
  }
  return false;
}

export default function AnalyticsGate() {
  const [allowed, setAllowed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return hasAnalyticsConsentFromLocal();
  });

  useEffect(() => {
    // Handler para cambios de consentimiento en la misma página / otras pestañas
    function onConsentUpdate(e: Event) {
      // el detail puede venir con { analytics: boolean } si lo emitimos
      try {
        // primero intentamos leer el detail
        const custom = e as CustomEvent;
        if (custom?.detail && typeof custom.detail.analytics === "boolean") {
          setAllowed(!!custom.detail.analytics);
          return;
        }
      } catch {}
      // fallback: volver a leer localStorage
      setAllowed(hasAnalyticsConsentFromLocal());
    }

    window.addEventListener("consent:updated", onConsentUpdate);
    window.addEventListener("storage", onConsentUpdate); // si se actualiza desde otra pestaña

    return () => {
      window.removeEventListener("consent:updated", onConsentUpdate);
      window.removeEventListener("storage", onConsentUpdate);
    };
  }, []);

  // Si no está permitido, no renderizamos Analytics
  if (!allowed) return null;

  // Si allowed, montamos dinamicamente Analytics
  return <DynamicAnalytics />;
}
