"use client";

import React from "react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function CookiesContent() {
  return (
    <motion.main
      className="bg-gray-950 text-gray-300 min-h-screen w-screen flex flex-col justify-center px-6 py-12 lg:py-24"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-3xl w-full mx-auto flex flex-col overflow-y-auto">
        <motion.div variants={itemVariants}>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-orange-400 to-amber-500 text-transparent bg-clip-text">
            Política de Cookies
          </h1>
          <p className="mt-4 text-gray-400">
            <strong>Última actualización:</strong> 9 de agosto de 2025 — <strong>Versión:</strong> v2025-08-09
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-12 space-y-8 text-gray-400">
          <section>
            <h2 className="text-2xl font-semibold text-gray-100">¿Qué son las cookies?</h2>
            <p className="mt-2">
              Las cookies son pequeños archivos que se almacenan en tu navegador para mantener la sesión, recordar tus preferencias o recoger datos analíticos de uso.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">Cookies que utilizamos</h2>
            <ul className="mt-2 list-disc list-inside space-y-2">
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
            <p className="mt-2">
              Puedes cambiar tus preferencias en cualquier momento desde la página de gestión de consentimientos.
            </p>
            <div className="mt-6">
              <a
                href="/consent/gestion-consentimientos"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-orange-600 text-white hover:bg-orange-700 transition"
              >
                Ir a gestión de consentimientos
              </a>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">Contacto</h2>
            <p className="mt-2">
              Para cualquier duda sobre cookies o privacidad, contacta con nosotros en: <strong>culinariumofficial@gmail.com</strong>
            </p>
          </section>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-16 text-sm text-gray-500 border-t border-gray-800 pt-8">
          <p>Dirección: 03502, España — Equipo Culinarium</p>
        </motion.div>
      </div>
    </motion.main>
  );
}
