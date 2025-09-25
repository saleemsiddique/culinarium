"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import ButtonPrimary from "./buttonPrimary";

const staggerVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
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
    <div className="pb-12 sm:pb-12 w-full font-sans">
      <div className="mx-auto max-w-4xl pt-16 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-base md:text-xl font-semibold text-orange-600">
            {t("faq.section.title")}
          </h2>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl">
            {t("faq.section.subtitle")}
          </p>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
             {t("faq.section.description")}
          </p>
        </motion.div>

        <motion.div
          variants={staggerVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          className="space-y-4"
        >
          {faqData.map((faq, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden transition-shadow duration-300 border border-gray-100"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 text-left flex justify-between items-center bg-white hover:bg-gray-50 transition-colors duration-200 focus:outline-none"
              >
                <h3 className="text-lg font-semibold text-gray-900 pr-4">
                  {faq.question}
                </h3>
                <motion.div
                  initial={false}
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="h-5 w-5 text-orange-600" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 pt-0">
                      <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        <div className=" mt-12 justify-center w-full text-center">
          <ButtonPrimary route={"/auth/login"} description={t("faq.buttons.startNow")} />
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600">
            {t("faq.contact.message")}{" "}
            <a
              href="#"
              className="text-orange-600 hover:text-indigo-700 font-medium"
            >
              {t("faq.contact.linkText")}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
