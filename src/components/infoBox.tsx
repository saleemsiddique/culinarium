"use client";
import { motion } from "framer-motion";
import { PiCookingPotFill } from "react-icons/pi";
import { GiMeal } from "react-icons/gi";
import { RiGroupLine } from "react-icons/ri";

const features = [
  {
    name: 'Generación de recetas con IA',
    description:
      'Crea recetas personalizadas a partir de los ingredientes que tienes en casa, gracias a nuestra inteligencia artificial culinaria.',
    icon: PiCookingPotFill,
    color: 'from-orange-500 to-amber-500',
  },
  {
    name: 'Planificación semanal de comidas',
    description: 'Organiza tus menús semanales de forma sencilla, guarda tus platos favoritos y recibe recomendaciones automáticas.',
    icon: GiMeal,
    color: 'from-sky-500 to-blue-500',
  },
  {
    name: 'Comunidad y Colaboración',
    description:
      'Comparte tus creaciones culinarias, descubre recetas de otros usuarios y colabora para mejorar la comunidad gastronómica.',
    icon: RiGroupLine,
    color: 'from-purple-500 to-fuchsia-500',
  },
];

export default function InfoBox() {
  return (
    <div className="bg-white py-24 sm:py-32 font-sans">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-base font-semibold text-orange-600"
          >
            Cocina inteligente
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl"
          >
            Una nueva forma de crear y disfrutar recetas
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg text-gray-700 max-w-3xl mx-auto"
          >
            Culinarium te ayuda a cocinar de forma más creativa y eficiente. Nuestra app combina inteligencia
            artificial y colaboración entre usuarios para ofrecerte recetas adaptadas a tus gustos.
          </motion.p>
        </div>
        <div className="mx-auto mt-16 max-w-full lg:mt-24">
          <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -10, boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)' }}
                className="relative flex flex-col items-center text-center p-10 bg-white/60 backdrop-blur-md rounded-3xl shadow-lg transform transition-all duration-300 ease-in-out border border-gray-100"
              >
                <div className={`-mt-20 mb-8 size-20 flex items-center justify-center rounded-full shadow-2xl bg-gradient-to-br ${feature.color} ring-4 ring-white`}>
                  <feature.icon aria-hidden="true" className="size-10 text-white" />
                </div>
                <dt className="text-xl font-bold text-gray-900 mb-2">{feature.name}</dt>
                <dd className="text-base text-gray-600">{feature.description}</dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
