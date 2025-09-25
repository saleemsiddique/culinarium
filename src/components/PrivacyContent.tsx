"use client";

import React, { useEffect, useState } from "react";
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

const PrivacyContent = () => {
    const { t } = useTranslation();        

  return (
    <motion.main
      className="bg-gray-950 text-gray-300 min-h-screen w-screen flex flex-col justify-center px-6 py-12 lg:py-24"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-4xl w-full mx-auto flex flex-col overflow-y-auto">
        <motion.div variants={itemVariants}>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-orange-400 to-amber-500 text-transparent bg-clip-text">
            {t("privacy.title")}
          </h1>
          <p className="mt-4 text-gray-400">
            <strong>{t("privacy.lastUpdated")}</strong> 9 de agosto de 2025 — <strong>{t("privacy.version")}</strong> v2025-08-09
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-12 space-y-8 text-gray-400">
          <section>
            <h2 className="text-2xl font-semibold text-gray-100">{t("privacy.sections.responsible.title")}</h2>
            <p 
              className="mt-2" 
              dangerouslySetInnerHTML={{ 
                __html: t("privacy.sections.responsible.content") 
              }} 
            />
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">{t("privacy.sections.introduction.title")}</h2>
            <p className="mt-2">
              {t("privacy.sections.introduction.content")}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">{t("privacy.sections.dataCollected.title")}</h2>
            <ul className="mt-2 list-disc list-inside space-y-2">
              {(t("privacy.sections.dataCollected.items", { returnObjects: true }) as string[]).map((item, index) => (
                <li 
                  key={index} 
                  dangerouslySetInnerHTML={{ __html: item }} 
                />
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">{t("privacy.sections.purposes.title")}</h2>
            <ul className="mt-2 list-disc list-inside space-y-2">
              {(t("privacy.sections.purposes.items", { returnObjects: true }) as string[]).map((item, index) => (
                <li 
                  key={index} 
                  dangerouslySetInnerHTML={{ __html: item }} 
                />
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">{t("privacy.sections.processors.title")}</h2>
            <p className="mt-2">{t("privacy.sections.processors.content")}</p>
            <ul className="mt-2 list-disc list-inside space-y-2">
              {(t("privacy.sections.processors.items", { returnObjects: true }) as string[]).map((item: string, index: number) => (
                <li 
                  key={index} 
                  dangerouslySetInnerHTML={{ __html: item }} 
                />
              ))}
            </ul>
            <p className="mt-2">{t("privacy.sections.processors.additional")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">{t("privacy.sections.transfers.title")}</h2>
            <p className="mt-2">
              {t("privacy.sections.transfers.content")}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">{t("privacy.sections.retention.title")}</h2>
            <ul className="mt-2 list-disc list-inside space-y-2">
              {(t("privacy.sections.retention.items", { returnObjects: true }) as string[]).map((item: string, index: number) => (
                <li 
                  key={index} 
                  dangerouslySetInnerHTML={{ __html: item }} 
                />
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">{t("privacy.sections.rights.title")}</h2>
            <p 
              className="mt-2" 
              dangerouslySetInnerHTML={{ 
                __html: t("privacy.sections.rights.content") 
              }} 
            />
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">{t("privacy.sections.minors.title")}</h2>
            <p 
              className="mt-2" 
              dangerouslySetInnerHTML={{ 
                __html: t("privacy.sections.minors.content") 
              }} 
            />
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">{t("privacy.sections.security.title")}</h2>
            <p className="mt-2">{t("privacy.sections.security.content")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">{t("privacy.sections.complaints.title")}</h2>
            <p 
              className="mt-2" 
              dangerouslySetInnerHTML={{ 
                __html: t("privacy.sections.complaints.content") 
              }} 
            />
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">{t("privacy.sections.changes.title")}</h2>
            <p className="mt-2">{t("privacy.sections.changes.content")}</p>
          </section>

          <footer>
            <p className="mt-12 text-center text-sm text-gray-500 border-t border-gray-800 pt-8">
              {t("privacy.footer.content")}
            </p>
          </footer>
        </motion.div>
      </div>
    </motion.main>
  );
};

export default PrivacyContent;
