"use client";
import { motion } from "framer-motion";

export default function Pricing() {
  const pricingData = [
    {
      title: "Gratis",
      description: "Ideal para empezar a explorar la cocina con IA.",
      price: "0€",
      features: [
        "5 recetas gratis al mes (50 tokens)",
        "Creación de recetas básicas",
        "Funcionalidades restringidas",
        "Sin restricciones dietéticas",
        "Sin estilos de cocina específicos"
      ],
      isHighlighted: false,
    },
    {
      title: "Premium",
      description: "¡Desbloquea tu potencial culinario sin límites!",
      price: "7,99€",
      features: [
        "30 recetas al mes (300 tokens)",
        "Todas las funcionalidades premium",
        "Restricciones dietéticas personalizadas",
        "Estilos de cocina (japonesa, española...)",
        "Soporte prioritario",
        "Acceso anticipado a nuevas funciones"
      ],
      isHighlighted: true,
    },
  ];

  return (
    <div className="w-full bg-[#4B3F2F] py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="font-bold text-base md:text-xl text-orange-200 mb-4">
            PRECIOS
          </div>
          <div className="font-bold text-3xl md:text-5xl text-white mb-4 leading-tight">
            Elige el plan que te llevará a otro nivel
          </div>
          <p className="mt-4 text-lg text-orange-100 max-w-2xl mx-auto leading-relaxed">
            ¿Listo para empezar? Elige tu plan y comienza a cocinar con la magia de la IA.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col items-center gap-10 mt-16 md:flex-row md:justify-center md:gap-8 lg:gap-12"
        >
          {pricingData.map((plan, index) => (
            <div
              key={index}
              className={`w-full max-w-sm ${plan.isHighlighted ? 'md:scale-105 md:z-10' : ''}`}
            >
              <motion.div
                whileHover={{
                  y: -8,
                  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)'
                }}
                transition={{
                  type: "tween",
                  duration: 0.3,
                  ease: "easeOut"
                }}
                className={`flex flex-col rounded-3xl p-8 transition-all duration-300 ease-out ${plan.isHighlighted
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-2xl'
                    : 'bg-white text-slate-800 shadow-xl border-2 border-orange-200 hover:border-orange-300'
                  }`}
              >
                <h3 className="text-xl font-bold mb-4">
                  {plan.title}
                </h3>
                <p className={`text-sm mb-6 leading-6 ${plan.isHighlighted ? 'text-orange-50' : 'text-slate-600'
                  }`}>
                  {plan.description}
                </p>

                <div className="flex items-baseline justify-center mb-8">
                  <span className="text-4xl font-bold tracking-tight">
                    {plan.price}
                  </span>
                  <span className={`text-base font-semibold ml-1 ${plan.isHighlighted ? 'text-orange-100' : 'text-slate-500'
                    }`}>
                    /mes
                  </span>
                </div>

                <ul className="space-y-3 text-sm leading-6 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <svg
                        className={`h-5 w-5 flex-shrink-0 mr-3 mt-0.5 ${plan.isHighlighted ? 'text-white' : 'text-orange-600'
                          }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className={plan.isHighlighted ? 'text-white' : 'text-slate-600'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <a
                  href="auth/login"
                  className={`block w-full rounded-full py-3.5 px-6 text-center font-semibold shadow-lg transition-all duration-300 hover:shadow-xl ${plan.isHighlighted
                      ? 'bg-white text-orange-700 hover:bg-orange-50'
                      : 'bg-gradient-to-r from-orange-600 to-orange-700 text-white hover:from-orange-700 hover:to-orange-800'
                    }`}
                >
                  Empezar
                </a>
              </motion.div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}