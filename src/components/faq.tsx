"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import ButtonPrimary from "./buttonPrimary";

const faqData = [
  {
    question: "¿Cómo funciona la generación de recetas con IA?",
    answer:
      "Nuestra inteligencia artificial analiza los ingredientes que tienes disponibles y genera recetas personalizadas basadas en tus preferencias dietéticas, restricciones alimentarias y estilo de cocina favorito.",
  },
  {
    question: "¿Puedo guardar mis recetas favoritas?",
    answer:
      "Sí, puedes guardar todas tus recetas favoritas en tu perfil personal. También puedes organizarlas por categorías, crear colecciones temáticas y compartirlas con otros usuarios de la comunidad.",
  },
  {
    question: "¿La app funciona sin conexión a internet?",
    answer:
      "Algunas funciones básicas están disponibles offline, como consultar recetas guardadas y tu planificación semanal. Sin embargo, necesitarás conexión para generar nuevas recetas con IA y sincronizar tus datos.",
  },
  {
    question: "¿Cómo puedo cancelar mi suscripción?",
    answer:
      "Puedes cancelar tu suscripción en cualquier momento desde la configuración de tu cuenta. La cancelación será efectiva al final del período de facturación actual y mantendrás acceso completo hasta entonces.",
  },
  {
    question: "¿Hay opciones para dietas especiales?",
    answer:
      "Absolutamente. Culinarium soporta múltiples tipos de dietas incluyendo vegetariana, vegana, keto, sin gluten, mediterránea y muchas más. Puedes configurar tus preferencias en tu perfil.",
  },
  {
    question: "¿Puedo compartir recetas con otros usuarios?",
    answer:
      "Sí, Culinarium tiene una comunidad activa donde puedes compartir tus creaciones, valorar recetas de otros usuarios y seguir a chefs y cocineros que te inspiren.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (faqIndex: number) => {
    setOpenIndex(openIndex === faqIndex ? null : faqIndex);
  };

  return (
    <div className="pb-24 sm:pb-32 w-full">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-base/7 font-semibold text-indigo-600">
            Preguntas frecuentes
          </h2>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-black sm:text-5xl">
            Todo lo que necesitas saber sobre Culinarium
          </p>
          <p className="mt-6 text-lg/8 text-gray-600">
            Resolvemos las dudas más comunes sobre nuestra plataforma y
            servicios
          </p>
        </div>

        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 pr-4">
                  {faq.question}
                </h3>
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                )}
              </button>

              {openIndex === index && (
                <div className="px-6 pb-4 bg-gray-50">
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className=" mt-10 justify-center w-full text-center">
          <ButtonPrimary />
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600">
            ¿No encuentras la respuesta que buscas?{" "}
            <a
              href="#"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Contáctanos
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
