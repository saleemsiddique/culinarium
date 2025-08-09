"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

// Aquí se define el tipo de datos para el consentimiento de cookies.
type ConsentShape = {
  functional: boolean;
  analytics: boolean;
  timestamp?: string;
  version?: string;
};

// Este es el COMPONENTE DE CLIENTE que contiene toda la lógica interactiva.
// Se renderiza dentro del componente de servidor.
const CookiesContent = () => {
  const [consent, setConsent] = useState<ConsentShape | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("culinarium_cookie_consent");
      if (raw) setConsent(JSON.parse(raw));
    } catch (e) {
      setConsent(null);
    }
  }, []);

  function saveConsent(c: ConsentShape) {
    const full = { ...c, timestamp: new Date().toISOString(), version: "v2025-08-09" };
    localStorage.setItem("culinarium_cookie_consent", JSON.stringify(full));
    setConsent(full);
    // Intentamos guardar en backend para auditoría (si tienes /api/consent)
    fetch("/api/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "cookies", granted: c.analytics, details: full }),
    }).catch(() => {});
  }

  function revokeAll() {
    const full = { functional: true, analytics: false, timestamp: new Date().toISOString(), version: "v2025-08-09" };
    localStorage.setItem("culinarium_cookie_consent", JSON.stringify(full));
    setConsent(full);
    fetch("/api/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "cookies", granted: false, details: full }),
    }).catch(() => {});
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

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
              <strong>Pagos:</strong> Stripe puede usar cookies propias para procesar pagos de forma segura.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-100">Gestión del consentimiento</h2>
          <p className="mt-2 text-gray-400">
            Puedes gestionar tus preferencias de consentimiento de cookies en cualquier momento.
          </p>

          <div className="mt-6 p-6 bg-gray-800 rounded-xl border border-gray-700">
            <h3 className="text-xl font-semibold mb-3 text-gray-100">Estado actual de tu consentimiento</h3>
            {consent ? (
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
                </div>
              </div>
            ) : (
              <p className="p-4 bg-gray-900 rounded-lg border border-gray-700 text-gray-400">No se ha registrado consentimiento aún.</p>
            )}

            <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-4">
              <button
                onClick={() => saveConsent({ functional: true, analytics: true })}
                className="px-6 py-3 rounded-full bg-orange-600 text-white font-medium hover:bg-orange-700 transition"
              >
                Aceptar analítica
              </button>

              <button
                onClick={() => saveConsent({ functional: true, analytics: false })}
                className="px-6 py-3 rounded-full border border-gray-600 text-gray-300 font-medium hover:bg-gray-700 transition"
              >
                Rechazar analítica
              </button>

              <button
                onClick={revokeAll}
                className="px-6 py-3 rounded-full border border-gray-600 text-gray-300 font-medium hover:bg-gray-700 transition"
              >
                Revocar consentimiento
              </button>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              Tu elección se guarda localmente y en nuestro registro de consentimientos para fines de auditoría.
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
        <p>
          Dirección: 03502, España — Equipo Culinarium
        </p>
      </motion.div>
    </motion.main>
  );
};

export default CookiesContent;
