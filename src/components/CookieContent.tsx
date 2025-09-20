"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function CookiesContent() {
        const { t } = useTranslation();
  
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
            {t("cookies.title")}
          </h1>
          <p className="mt-4 text-gray-400">
            <strong>{t("cookies.lastUpdated")}</strong> 9 de agosto de 2025 — <strong>{t("cookies.version")}</strong> v2025-08-09
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-12 space-y-8 text-gray-400">
          <section>
            <h2 className="text-2xl font-semibold text-gray-100">{t("cookies.sections.whatAreCookies.title")}</h2>
            <p className="mt-2">
              {t("cookies.sections.whatAreCookies.content")}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">{t("cookies.sections.cookiesWeUse.title")}</h2>
           <ul className="mt-2 list-disc list-inside space-y-2">
              {(t("cookies.sections.cookiesWeUse.items", { returnObjects: true }) as string[]).map((item: string, index: number) => (
                <li 
                  key={index} 
                  dangerouslySetInnerHTML={{ __html: item }} 
                />
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">{t("cookies.sections.consentManagement.title")}</h2>
            <p className="mt-2">
              {t("cookies.sections.consentManagement.content")}
            </p>
            <div className="mt-6">
              <a
                href="/consent/gestion-consentimientos"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-orange-600 text-white hover:bg-orange-700 transition"
              >
                {t("cookies.sections.consentManagement.buttonText")}
              </a>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">{t("cookies.sections.contact.title")}</h2>
            <p 
              className="mt-2" 
              dangerouslySetInnerHTML={{ 
                __html: t("cookies.sections.contact.content")
              }} 
            />
          </section>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-16 text-sm text-gray-500 border-t border-gray-800 pt-8">
          <p>{t("cookies.footer.content")}</p>
        </motion.div>
      </div>
    </motion.main>
  );
}
