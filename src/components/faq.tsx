"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import Link from "next/link";

const staggerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export default function FAQ() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqData = t("faq.questions", { returnObjects: true }) as Array<{
    question: string;
    answer: string;
  }>;

  const toggleFAQ = (faqIndex: number) => {
    setOpenIndex(openIndex === faqIndex ? null : faqIndex);
  };

  return (
    <div className="py-20 md:py-24 w-full bg-[var(--background)]">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="text-sm font-bold uppercase tracking-wider text-[var(--highlight)]">
            {t("faq.section.title")}
          </span>
          <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold tracking-tight text-[var(--foreground)]">
            {t("faq.section.subtitle")}
          </h2>
          <p className="mt-4 text-base text-[var(--foreground)]/60 max-w-xl mx-auto leading-relaxed">
            {t("faq.section.description")}
          </p>
        </motion.div>

        <motion.div
          variants={staggerVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          className="space-y-3"
        >
          {faqData.map((faq, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white rounded-2xl overflow-hidden border border-[var(--border-subtle)] shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-[var(--background)]/50 transition-colors duration-200 focus:outline-none"
              >
                <h3 className="text-base font-semibold text-[var(--foreground)] pr-4">
                  {faq.question}
                </h3>
                <motion.div
                  initial={false}
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="h-5 w-5 text-[var(--highlight)]" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 pt-0">
                      <p className="text-[var(--foreground)]/70 text-sm leading-relaxed">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-12 text-center">
          <Link href="/auth/register">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3.5 bg-gradient-to-r from-[var(--highlight)] to-[var(--highlight-dark)] text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              {t("faq.buttons.startNow")}
            </motion.button>
          </Link>
        </div>

        <div className="mt-10 text-center">
          <p className="text-[var(--foreground)]/50 text-sm">
            {t("faq.contact.message")}{" "}
            <a
              href="mailto:culinariumofficial@gmail.com"
              className="text-[var(--highlight)] hover:text-[var(--highlight-dark)] font-medium transition-colors"
            >
              {t("faq.contact.linkText")}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
