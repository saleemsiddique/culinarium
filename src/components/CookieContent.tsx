"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import Link from "next/link";

type ConsentShape = {
  functional: boolean;
  analytics: boolean;
};

type FullConsentData = ConsentShape & {
  timestamp: string;
  version: string;
  meta?: {
    path: string | null;
    origin: string | null;
    ref: string | null;
    user_agent: string | null;
    language: string | null;
    platform: string | null;
  };
};

function getBrowserMeta() {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : null;
  const lang = typeof navigator !== "undefined"
    ? (navigator.language || (navigator.languages && navigator.languages[0]) || "unknown")
    : null;

  return {
    user_agent: ua,
    language: lang,
    platform: typeof navigator !== "undefined" ? navigator.platform || "unknown" : null,
  };
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function CookiesContent() {
  const [consent, setConsent] = useState<FullConsentData | null>(null);
  const [loading, setLoading] = useState(true);

  // keys localStorage
  const LOCAL_KEY_FULL = "culinarium_cookie_consent";
  const LOCAL_KEY_VERSIONS = "consent_versions";

  useEffect(() => {
    // Cargar registro local (rápido para UX)
    try {
      const raw = localStorage.getItem(LOCAL_KEY_FULL);
      if (raw) {
        setConsent(JSON.parse(raw));
      } else {
        // alternativa: intentar leer versiones y construir un objeto mínimo
        const versionsRaw = localStorage.getItem(LOCAL_KEY_VERSIONS);
        if (versionsRaw) {
          const versions = JSON.parse(versionsRaw);
          const built: FullConsentData = {
            functional: true,
            analytics: !!(versions && versions["cookies_policy"] === (process.env.NEXT_PUBLIC_POLICY_VERSION || "1.0.0")),
            timestamp: new Date().toISOString(),
            version: process.env.NEXT_PUBLIC_POLICY_VERSION || "v2025-08-09",
            meta: {
              path: typeof window !== "undefined" ? window.location.pathname : null,
              origin: typeof window !== "undefined" ? window.location.origin : null,
              ref: typeof document !== "undefined" ? document.referrer : null,
              user_agent: getBrowserMeta().user_agent,
              language: getBrowserMeta().language,
              platform: getBrowserMeta().platform,
            },
          };
          setConsent(built);
        }
      }
    } catch {
      setConsent(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <motion.main
      className="bg-gray-950 text-gray-300 min-h-screen w-screen px-6 py-12 lg:py-24"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-orange-400 to-amber-500 text-transparent bg-clip-text">
          Política de Cookies
        </h1>
        <p className="mt-4 text-gray-400">
          <strong>Última actualización:</strong> 9 de agosto de 2025 — <strong>Versión:</strong> v2025-08-09
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="mt-12 space-y-8">
        <section>
          <h2 className="text-2xl font-semibold text-gray-100">¿Qué son las cookies?</h2>
          <p className="mt-2 text-gray-400">
            Las cookies son pequeños archivos que se almacenan en tu navegador para mantener la sesión, recordar tus preferencias o recoger datos analíticos de uso.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-100">Cookies que utilizamos</h2>
          <ul className="mt-2 list-disc list-inside space-y-2 text-gray-400">
            <li>
              <strong>Esenciales / funcionales:</strong> Cookies necesarias para el funcionamiento del servicio como la autenticación con Firebase Auth. No requieren tu consentimiento.
            </li>
            <li>
              <strong>Analítica:</strong> Cookies de Vercel Analytics para medir el rendimiento y uso de la plataforma. Solo se activan si das tu consentimiento explícito.
            </li>
            <li>
              <strong>Pagos:</strong> Stripe puede usar cookies propias para procesar pagos de forma segura (clasificadas como funcionales durante el checkout).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-100">Gestión del consentimiento</h2>
          <p className="mt-2 text-gray-400">
            Puedes cambiar tus preferencias en cualquier momento desde la página de gestión. Para modificar las opciones de cookies, haz clic en el siguiente enlace:
          </p>

          <div className="mt-6 p-6 bg-gray-800 rounded-xl border border-gray-700">
            <h3 className="text-xl font-semibold mb-3 text-gray-100">Estado actual de tu consentimiento</h3>

            {loading ? (
              <p className="text-gray-400">Cargando estado...</p>
            ) : consent ? (
              <div className="flex items-start gap-3 bg-gray-900 rounded-lg p-4 mb-4">
                {consent.analytics ? (
                  <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" size={20} />
                ) : (
                  <FaExclamationCircle className="text-yellow-500 mt-1 flex-shrink-0" size={20} />
                )}
                <div className="text-gray-400">
                  <p>
                    Consentimiento funcional: <strong className="text-gray-100">Aceptado</strong>
                  </p>
                  <p>
                    Consentimiento analítico:{" "}
                    <strong className={consent.analytics ? "text-green-400" : "text-yellow-400"}>
                      {consent.analytics ? "Aceptado" : "Rechazado"}
                    </strong>
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Última acción: {new Date(consent.timestamp).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Versión: {consent.version}</p>
                </div>
              </div>
            ) : (
              <p className="p-4 bg-gray-900 rounded-lg border border-gray-700 text-gray-400">
                No se ha registrado consentimiento aún en este navegador.
              </p>
            )}

            <div className="mt-4">
              <Link href="/gestion-consentimientos" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-600 text-white hover:bg-orange-700 transition">
                Ir a gestión de consentimientos
              </Link>
            </div>

            <p className="mt-3 text-sm text-gray-500">
              Nota: desde esta página solo informamos del estado. Para cambiar tus elecciones usa la página de gestión.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-100">Contacto</h2>
          <p className="mt-2 text-gray-400">
            Para cualquier duda sobre cookies o privacidad, contacta con nosotros en:{" "}
            <strong>culinariumofficial@gmail.com</strong>
          </p>
        </section>
      </motion.div>

      <motion.div variants={itemVariants} className="mt-16 text-center text-sm text-gray-500 border-t border-gray-800 pt-8">
        <p>Dirección: 03502, España — Equipo Culinarium</p>
      </motion.div>
    </motion.main>
  );
}
