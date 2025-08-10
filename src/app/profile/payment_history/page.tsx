// components/PaymentDashboard.tsx
"use client";

import { motion } from "framer-motion";
import { useUser } from "@/context/user-context";
import { useSubscription } from "@/context/subscription-context";
import { useTokenPurchases } from "@/context/tokenpurchases-context";

export default function PaymentDashboard() {
  const { user, loading: loadingUser } = useUser();
  const { subscription, loading: loadingSub } = useSubscription();
  const { purchases, loading: loadingPurchases } = useTokenPurchases();

  // Mostrar loader hasta que todo cargue
  if (loadingUser || loadingSub || loadingPurchases) {
    return <div className="p-8 text-center">Cargando datos...</div>;
  }

  if (!user) {
    return <div className="p-8 text-center">Inicia sesión para ver tu historial</div>;
  }

  const totalSpent = purchases.reduce((sum: number, p) => sum + Number(p.price), 0);
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: 0.6 + i * 0.1 },
    }),
  };

  const formatDate = (ts: string | Date) => {
    const d = typeof ts === "string" ? new Date(ts) : ts;
    return d.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="h-full w-full pt-24 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-8">
      <div className="container mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-center text-white mb-4"
        >
          <h1 className="text-4xl font-extrabold drop-shadow-lg">💳 Historial de Pagos</h1>
          <p className="mt-2 text-lg">Gestiona tu suscripción y revisa tus compras de tokens</p>
        </motion.div>

        {/* Suscripción */}
        {subscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="relative bg-white bg-opacity-90 backdrop-blur-md rounded-2xl border border-white border-opacity-20 shadow-2xl overflow-hidden"
          >
            <div className="h-1 bg-gradient-to-r from-green-400 to-green-600" />
            <div className="p-8 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center space-x-4">
                  <span className="text-2xl font-semibold">🔄 Suscripción Premium</span>
                  <span className="px-4 py-1 bg-green-500 text-white rounded-full text-sm font-bold">
                    {subscription.status.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <div className="text-sm text-gray-600">Plan Actual</div>
                  <div className="text-lg font-semibold text-gray-800">{subscription.planName}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Próxima Facturación</div>
                  <div className="text-lg font-semibold text-gray-800">
                    {formatDate(subscription.endsAt.toDate())}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Monto Mensual</div>
                  <div className="text-lg font-semibold text-gray-800">
                    €{subscription.price}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Historial de Tokens */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-white bg-opacity-90 backdrop-blur-md rounded-2xl border border-white border-opacity-20 shadow-2xl p-8 space-y-6"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center border-b pb-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">🪙 Compras de Tokens</h2>
              <p className="text-gray-600">Historial de todas tus compras de tokens</p>
            </div>
            <div className="mt-4 sm:mt-0 text-gray-800 font-semibold">
              Total gastado: €{totalSpent.toFixed(2)}
            </div>
          </div>

          <div className="space-y-4">
            {purchases.map((row, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={itemVariants}
                className="relative bg-white rounded-xl p-6 shadow-lg border-l-4 border-indigo-500 hover:shadow-2xl transition"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-800">
                    {formatDate(row.createdAt.toDate())}
                  </span>
                  <span className="text-lg font-bold text-green-500">
                    €{row.price}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-gray-600">
                  <div>
                    <div className="text-xs uppercase text-gray-400">Tokens</div>
                    <div className="font-medium">{row.tokensAmount}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase text-gray-400">Paquete</div>
                    <div className="font-medium">{row.productName}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase text-gray-400">Estado</div>
                    <div className="font-medium">{row.status}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
