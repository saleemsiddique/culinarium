"use client";
import PricingCard from "@/components/pricingCard";
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
      price: "9,99€",
      features: [
        "30 recetas al mes (300 tokens)",
        "Todas las funcionalidades premium",
        "Restricciones dietéticas personalizadas",
        "Estilos de cocina (japonesa, española...)",
        "Soporte prioritario",
        "Acceso anticipado a nuevas funciones",
        "Integración con tu lista de la compra"
      ],
      isHighlighted: true,
    },
  ];
      
  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="font-bold text-base md:text-xl text-orange-600">PRECIOS</div>
        <div className="font-bold text-3xl md:text-5xl text-gray-900 mt-2">
          Elige el plan que te llevará a otro nivel
        </div>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          ¿Listo para empezar? Elige tu plan y comienza a cocinar con la magia de la IA.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-col items-center gap-10 mt-10 md:mt-24 md:flex-row md:gap-14"
      >
        {pricingData.map((plan, index) => (
          <div key={index} className={`w-full max-w-sm ${plan.isHighlighted ? 'md:scale-110 md:z-10' : ''}`}>
            {/* The PricingCard component would need to be updated to handle the new props.
                For demonstration, we'll assume it receives 'price' and 'isHighlighted'.
                The button inside should link to the login page.
            */}
            <motion.div
              whileHover={{ scale: 1.05, boxShadow: '0 25px 50px rgba(0, 0, 0, 0.2)' }}
              transition={{ type: "spring", stiffness: 300 }}
              className={`flex flex-col rounded-3xl p-8 transition-all duration-500 ease-in-out 
                ${plan.isHighlighted 
                  ? 'bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-2xl scale-105' 
                  : 'bg-white shadow-md text-gray-900 border border-gray-200'
                }`}
            >
              <h3 className="text-xl font-bold">{plan.title}</h3>
              <p className={`mt-4 text-sm ${plan.isHighlighted ? 'text-gray-100' : 'text-gray-600'}`}>{plan.description}</p>
              
              <p className={`mt-6 flex items-baseline justify-center text-4xl font-bold tracking-tight ${plan.isHighlighted ? 'text-white' : 'text-gray-900'}`}>
                {plan.price}
                <span className={`text-base font-semibold tracking-normal ${plan.isHighlighted ? 'text-gray-200' : 'text-gray-500'}`}>/mes</span>
              </p>

              <ul className={`mt-8 space-y-3 text-sm leading-6 xl:mt-10 ${plan.isHighlighted ? 'text-white' : 'text-gray-600'}`}>
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <svg
                      className={`h-5 w-5 flex-shrink-0 ${plan.isHighlighted ? 'text-white' : 'text-orange-600'}`}
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
                    <span className="ml-3">{feature}</span>
                  </li>
                ))}
              </ul>

              <a 
                href="/login"
                className={`mt-6 block w-full rounded-full py-3 px-4 text-center font-semibold shadow-md focus:outline-none focus:ring-2
                  ${plan.isHighlighted
                    ? 'bg-white text-orange-600 hover:bg-gray-100 focus:ring-white'
                    : 'bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-600'
                  }`}
              >
                Empezar
              </a>
            </motion.div>
          </div>
        ))}
      </motion.div>
    </>
  );
}
