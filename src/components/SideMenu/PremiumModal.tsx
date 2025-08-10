import React from "react";
import { Crown, CheckCircle, X, Star } from "lucide-react";
import { CustomUser } from "@/context/user-context";
import EmbeddedCheckoutButton from "../EmbeddedCheckoutForm";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface PremiumModalProps {
  onClose: () => void;
  onSubscribe: () => void;
  user: CustomUser | null;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({
  onClose,
  onSubscribe,
  user,
}) => {
  const isSubscribed = user?.isSubscribed || false;
  const features = [
    "300 tokens permiten acceder a 30 recetas distintas",
    "Añade restricciones dietéticas para excluir ingredientes no deseados",
    "Elige estilos de cocina de distintos países para un toque típico",
  ];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white rounded-3xl w-full max-w-lg mx-auto shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Botón de cerrar */}
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Contenido principal (desplazable) */}
          <div className="flex-grow overflow-y-auto p-6 md:p-8">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Culinarium Premium
              </h2>
              <p className="text-gray-600 px-4 sm:px-0">
                {isSubscribed
                  ? "¡Gracias por ser un suscriptor Premium!"
                  : `Hola ${user?.firstName || 'allí'}, desbloquea todas las funciones avanzadas.`}
              </p>
            </div>

            {isSubscribed ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center px-2 -mx-2 pb-2">
                    <div className="p-6 md:p-8 bg-gray-50 rounded-2xl border border-gray-200 w-full max-w-md">
                        <div className="w-20 h-20 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                            <Star className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">
                            ¡Ya eres un suscriptor Premium!
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Mantienes tus tokens y acceso a todas las funcionalidades premium.
                        </p>
                        <p className="text-gray-600 text-sm mt-4">
                            Tu suscripción se renovará automáticamente el{" "}
                            <span className="font-semibold">
                                {user?.tokens_reset_date ? formatDate(user.tokens_reset_date.toDate()) : 'N/A'}
                            </span>
                            .
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 mb-6 border border-amber-100">
                    <div className="text-center mb-4">
                        <span className="text-4xl font-bold text-transparent bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text">
                            €7.99
                        </span>
                        <span className="text-gray-600 ml-2">/mes</span>
                    </div>
                    <ul className="space-y-3 text-left">
                        {features.map((item) => (
                            <li key={item} className="flex items-start text-sm md:text-base">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mr-3" />
                                <span className="text-gray-700">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
          </div>

          {/* Botones de acción (fijos en la parte inferior) */}
          <div className="p-6 md:p-8 pt-0 bg-white">
            {isSubscribed ? (
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto py-3 px-6 border-2 border-gray-300 rounded-full font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cerrar
                </button>
                <Link
                  href="/profile"
                  className="w-full sm:w-auto flex items-center justify-center py-3 px-6 bg-gradient-to-r from-[var(--highlight)] to-[var(--highlight-dark)] text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Gestionar Suscripción
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto py-3 px-6 border-2 border-gray-300 rounded-full font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <EmbeddedCheckoutButton
                  priceId={"price_1RrJVF2LSjDC5txTR6lOQslg"}
                  user={user}
                />
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
