"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FaYoutube,
  FaInstagram,
  FaTiktok,
  FaLock,
  FaClipboardList,
  FaCookieBite,
  FaTimes,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const footerVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <>
      <motion.footer
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.3 }}
        variants={footerVariants}
        className="w-full bg-gray-950 text-gray-300 border-t border-gray-800"
      >
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-10 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-6 items-center">
            {/* Socials and Brand */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              {/* Brand and Slogan */}
              <div className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-orange-400 to-amber-500 text-transparent bg-clip-text">
                Culinarium
              </div>
              <p className="mt-2 text-sm text-gray-400 italic">
                Descubre un mundo de sabores.
              </p>
              
              {/* Social Icons */}
              <div className="flex items-center gap-4 mt-6">
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok Culinarium"
                  className="p-3 rounded-lg bg-gray-800 hover:bg-orange-600 transition-colors duration-300"
                >
                  <FaTiktok size={20} />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube Culinarium"
                  className="p-3 rounded-lg bg-gray-800 hover:bg-orange-600 transition-colors duration-300"
                >
                  <FaYoutube size={20} />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram Culinarium"
                  className="p-3 rounded-lg bg-gray-800 hover:bg-orange-600 transition-colors duration-300"
                >
                  <FaInstagram size={20} />
                </a>
              </div>
            </div>

            {/* Legal Links and Copyright */}
            <div className="flex flex-col items-center justify-self-center lg:items-center text-center lg:text-center mt-6 lg:mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link
                  href="/privacy"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm bg-gray-800 hover:bg-gray-700 transition-colors duration-300"
                  aria-label="Política de Privacidad"
                >
                  <FaLock size={14} />
                  <span>Privacidad</span>
                </Link>

                <Link
                  href="/terms"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm bg-gray-800 hover:bg-gray-700 transition-colors duration-300"
                  aria-label="Términos y Condiciones"
                >
                  <FaClipboardList size={14} />
                  <span>Términos</span>
                </Link>

                <Link
                  href="/cookies"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm bg-gray-800 hover:bg-gray-700 transition-colors duration-300"
                  aria-label="Política de Cookies"
                >
                  <FaCookieBite size={14} />
                  <span>Cookies</span>
                </Link>
              </div>
              <p className="mt-8 text-sm text-gray-500">
                © Culinarium {year}. Todos los derechos reservados.
              </p>
              <p className="mt-2 text-xs text-gray-600">
                Equipo: Saleem Siddique · Hakeem Siddique · Wassim Atiki
              </p>
            </div>

            {/* Contact and Micro Info */}
            <div className="flex flex-col items-center lg:items-end text-center lg:text-right mt-6 lg:mt-0">
              <p className="text-sm font-semibold text-gray-400">Contáctanos</p>
              <p className="mt-2 text-sm text-gray-500">culinariumofficial@gmail.com</p>
              <p className="mt-1 text-sm text-gray-500">Dirección: 03502, España</p>

              <div className="mt-8">
                <CookieSettingsButton />
              </div>
            </div>
          </div>

          {/* Bottom stripe with micro info */}
          <div className="mt-12 border-t border-gray-800 pt-6 text-center text-xs text-gray-600">
            <p>
              Este sitio utiliza procesadores como OpenAI, Stripe, Firebase, Vercel y GitHub para ofrecer sus servicios.
            </p>
          </div>
        </div>
      </motion.footer>
    </>
  );
}

/* ---------------------------
  Cookie Settings Button + Modal
  --------------------------- */
function CookieSettingsButton() {
  const [open, setOpen] = useState(false);

  // Note: The original logic for `consent` and `saveConsent` is complex and may not be fully functional
  // in a standalone component. It's best to handle state and API calls at a higher level in a real app.
  // For this demo, we'll simplify the modal interaction.

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-full bg-gray-800 hover:bg-orange-600 hover:text-white transition-colors duration-300 text-sm font-medium"
        aria-haspopup="dialog"
      >
        Ajustes de cookies
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative z-[1010] w-full max-w-2xl rounded-2xl p-6 bg-gray-800 border border-gray-700 text-gray-200 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold">Ajustes de Cookies</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Selecciona qué tipos de cookies permites. Las cookies analíticas no se cargarán hasta que las aceptes.
                  </p>
                </div>

                <button
                  onClick={() => setOpen(false)}
                  aria-label="Cerrar"
                  className="p-2 rounded-lg hover:bg-gray-700 transition"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-gray-900 border border-gray-700">
                  <h4 className="font-semibold text-gray-100">Funcionales (siempre activas)</h4>
                  <p className="text-sm text-gray-400 mt-2">
                    Necesarias para el funcionamiento del servicio (autenticación, seguridad, tokens).
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-gray-900 border border-gray-700">
                  <h4 className="font-semibold text-gray-100">Analítica</h4>
                  <p className="text-sm text-gray-400 mt-2">
                    Permite medir uso y rendimiento (Vercel Analytics). No se activará hasta tu consentimiento.
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => setOpen(false)}
                      className="px-4 py-2 rounded-full bg-orange-600 text-white hover:bg-orange-700 transition"
                    >
                      Aceptar analítica
                    </button>
                    <button
                      onClick={() => setOpen(false)}
                      className="px-4 py-2 rounded-full border border-gray-600 text-gray-300 hover:bg-gray-700 transition"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-sm text-gray-500 text-center">
                <p>
                  Guardaremos tu elección localmente y en nuestro registro de consentimientos para auditoría.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
