import React from "react";
import { Crown, Divide } from "lucide-react";
import { CustomUser } from "@/context/user-context";
import EmbeddedCheckoutButton from "../EmbeddedCheckoutForm";
import Link from "next/link";

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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-lg mx-4 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Culinarium Premium
          </h2>
          <p className="text-gray-600">
            {isSubscribed
              ? "¡Gracias por ser un suscriptor Premium!"
              : `Hola ${user?.firstName}, desbloquea todas las funciones avanzadas`}
          </p>
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 mb-6">
          {/* Premium Features List */}
          <div className="text-center mb-4">
            <span className="text-4xl font-bold text-transparent bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text">
              €7.99
            </span>
            <span className="text-gray-600 ml-2">/mes</span>
          </div>
          <ul className="space-y-3">
            {[
              "300 tokens permiten acceder a 30 recetas distintas",
              "Función para restringir ingredientes disponibles",
              "Opción para seleccionar estilos de cocina",
            ].map((item) => (
              <li key={item} className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {isSubscribed ? (
          <div className="flex items-center justify-center space-x-3">
            <button
              onClick={onClose}
              className="cursor-pointer flex-1 py-3 p-5 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all"
            >
              Cancelar
            </button>
            <Link
              href="/profile"
              className="cursor-pointer flex items-center justify-center py-3 px-3 border-2 border-neutral-800 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300">
              Gestionar Suscripción
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-3">
            <div></div>
            <EmbeddedCheckoutButton
              priceId={"price_1RrJVF2LSjDC5txTR6lOQslg"}
              user={user}
            />
          </div>
        )}
      </div>
    </div>
  );
};
