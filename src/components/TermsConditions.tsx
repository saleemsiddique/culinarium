"use client";

import React, { useEffect, useState }from "react";
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

const TermsContent = () => {
    const { t } = useTranslation();

  return (
    <motion.main
      className="bg-gray-950 text-gray-300 min-h-screen w-screen px-6 py-12 lg:py-24"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div variants={itemVariants}>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-orange-400 to-amber-500 text-transparent bg-clip-text">
            {t("terms.title")}
          </h1>
          <p className="mt-4 text-gray-400">
            <strong>{t("terms.lastUpdated")}</strong> 9 de agosto de 2025 —{" "}
            <strong>{t("terms.version")}</strong> v2025-08-09
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-12 space-y-8 text-gray-400"
        >
          <section>
            <h2 className="text-2xl font-semibold text-gray-100">{t("terms.sections.parties.title")}</h2>
            <p 
              className="mt-2" 
              dangerouslySetInnerHTML={{ 
                __html: t("terms.sections.parties.content")
              }} 
            />
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">
              {t("terms.sections.serviceDescription.title")}
            </h2>
            <p 
              className="mt-2" 
              dangerouslySetInnerHTML={{ 
                __html: t("terms.sections.serviceDescription.content")
              }} 
            />
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">
              {t("terms.sections.models.title")}
            </h2>
            <p className="mt-2">
              {t("terms.sections.models.content")}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">
              {t("terms.sections.tokens.title")}
            </h2>
            <ul className="mt-2 list-disc list-inside space-y-2">
              {(t("terms.sections.tokens.items", { returnObjects: true }) as string[]).map((item: string, index: number) => (
                <li 
                  key={index} 
                  dangerouslySetInnerHTML={{ __html: item }} 
                />
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">
              {t("terms.sections.payments.title")}
            </h2>
            <p 
              className="mt-2" 
              dangerouslySetInnerHTML={{ 
                __html: t("terms.sections.payments.content")
              }} 
            />
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">
              {t("terms.sections.withdrawal.title")}
            </h2>
            <p className="mt-2">
              {t("terms.sections.withdrawal.content")}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">{t("terms.sections.refunds.title")}</h2>
            <p 
              className="mt-2" 
              dangerouslySetInnerHTML={{ 
                __html: t("terms.sections.refunds.content")
              }} 
            />
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">
              {t("terms.sections.cancellation.title")}
            </h2>
            <ul className="mt-2 list-disc list-inside space-y-2">
              {(t("terms.sections.cancellation.items", { returnObjects: true }) as string[]).map((item: string, index: number) => (
                <li 
                  key={index} 
                  dangerouslySetInnerHTML={{ __html: item }} 
                />
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">
              {t("terms.sections.suspension.title")}
            </h2>
            <p className="mt-2">
              {t("terms.sections.suspension.content")}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">
              {t("terms.sections.liability.title")}
            </h2>
            <p className="mt-2">
              {t("terms.sections.liability.content")}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">
              {t("terms.sections.healthNotice.title")}
            </h2>
            <p className="mt-2">
              {t("terms.sections.healthNotice.content")}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">
              {t("terms.sections.acceptableUse.title")}
            </h2>
            <p className="mt-2">
              {t("terms.sections.acceptableUse.content")}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">
              {t("terms.sections.warranty.title")}
            </h2>
            <p className="mt-2">
              {t("terms.sections.warranty.content")}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">
              {t("terms.sections.modification.title")}
            </h2>
            <p className="mt-2">
              {t("terms.sections.modification.content")}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">
              {t("terms.sections.minimumAge.title")}
            </h2>
            <p 
              className="mt-2" 
              dangerouslySetInnerHTML={{ 
                __html: t("terms.sections.minimumAge.content")
              }} 
            />
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">
              {t("terms.sections.intellectualProperty.title")}
            </h2>
            <p className="mt-2">
              {t("terms.sections.intellectualProperty.content")}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">
              {t("terms.sections.dataProtection.title")}
            </h2>
            <p className="mt-2">
              {t("terms.sections.dataProtection.content.part1")}{" "}
              <a
                href="/consent/privacy"
                className="text-orange-400 hover:underline"
              >
                {t("terms.sections.dataProtection.content.linkText")}
              </a>
              {t("terms.sections.dataProtection.content.part2")}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">
              {t("terms.sections.jurisdiction.title")}
            </h2>
            <p className="mt-2">
              {t("terms.sections.jurisdiction.content")}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100">
              {t("terms.sections.changes.title")}
            </h2>
            <p className="mt-2">
              {t("terms.sections.changes.content")}
            </p>
          </section>

          <footer>
            <p className="mt-12 text-center text-sm text-gray-500 border-t border-gray-800 pt-8">
              {t("terms.footer.content")}
            </p>
          </footer>
        </motion.div>
      </div>
    </motion.main>
  );
};

export default TermsContent;
