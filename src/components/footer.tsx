"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FaYoutube,
  FaInstagram,
  FaTiktok,
  FaLock,
  FaClipboardList,
  FaCookieBite,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useUser } from "@/context/user-context";
import { useTranslation } from "react-i18next";
import { t } from "i18next";

const footerVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function Footer() {
  const year = new Date().getFullYear();
  const { firebaseUser } = useUser();
  const { t, i18n } = useTranslation();
  
  // Una vez montado y con traducciones listas, renderizar el contenido completo
  return (
    <>
      <motion.footer
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.3 }}
        variants={footerVariants}
        className="bg-gray-950 text-gray-300 border-t border-gray-800"
      >
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-32 py-10 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-6 items-center">
            {/* Socials and Brand */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              {/* Brand and Slogan */}
              <div className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-orange-400 to-amber-500 text-transparent bg-clip-text">
                Culinarium
              </div>
              <p className="mt-2 text-sm text-gray-400 italic">
                {t("footer.brand.slogan")}
              </p>

              {/* Social Icons */}
              <div className="flex items-center gap-4 mt-6">
                <a
                  href="https://tiktok.com/@culinariumofficial"
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
                  href="/consent/privacy"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm bg-gray-800 hover:bg-gray-700 transition-colors duration-300"
                  aria-label="Política de Privacidad"
                >
                  <FaLock size={14} />
                  <span>{t("footer.legal.privacy")}</span>
                </Link>

                <Link
                  href="/consent/terms"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm bg-gray-800 hover:bg-gray-700 transition-colors duration-300"
                  aria-label="Términos y Condiciones"
                >
                  <FaClipboardList size={14} />
                  <span>{t("footer.legal.terms")}</span>
                </Link>

                <Link
                  href="/consent/cookies"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm bg-gray-800 hover:bg-gray-700 transition-colors duration-300"
                  aria-label="Política de Cookies"
                >
                  <FaCookieBite size={14} />
                  <span>{t("footer.legal.cookies")}</span>
                </Link>
              </div>
              <p className="mt-8 text-sm text-gray-500">
                © Culinarium {year}. {t("footer.copyright")}
              </p>
            </div>

            {/* Contact and Micro Info */}
            <div className="flex flex-col items-center lg:items-end text-center lg:text-right mt-6 lg:mt-0">
              <p className="text-sm font-semibold text-gray-400">{t("footer.contact.title")}</p>
              <p className="mt-2 text-sm text-gray-500">
                culinariumofficial@gmail.com
              </p>

              <div className="mt-8">
                {/* Mostrar enlace a ajustes solo si el usuario está logueado */}
                {firebaseUser ? <CookieSettingsLink /> : null}
              </div>

              <div className="mt-4">
                <button 
                  onClick={() => i18n.changeLanguage("en")}
                  className="mr-2 px-3 py-1 text-sm bg-gray-800 hover:bg-gray-700 rounded transition-colors"
                >
                  English
                </button>
                <button 
                  onClick={() => i18n.changeLanguage("es")}
                  className="px-3 py-1 text-sm bg-gray-800 hover:bg-gray-700 rounded transition-colors"
                >
                  Español
                </button>
              </div>

              <p className="mt-2 text-xs text-gray-500">Current language: {i18n.language}</p>
            </div>
          </div>
        </div>
      </motion.footer>
    </>
  );
}

/* ---------------------------
  Cookie Settings Link
  --------------------------- */
function CookieSettingsLink() {
  return (
    <Link
      href="/consent/gestion-consentimientos"
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800 hover:bg-orange-600 hover:text-white transition-colors duration-300 text-sm font-medium"
      aria-label="Gestionar consentimientos"
    >
      <FaCookieBite />
      <span>{t("footer.manageConsent")}</span>
    </Link>
  );
}