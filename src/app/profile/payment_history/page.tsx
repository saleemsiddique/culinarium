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
    return <div className="p-8 text-center text-[var(--foreground)]">Cargando datos...</div>;
  }

  if (!user) {
    return <div className="p-8 text-center text-[var(--foreground)]">Inicia sesión para ver tu historial</div>;
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
    <div className="h-full min-h-screen w-full pt-24 bg-gradient-to-br from-[var(--primary)] to-[var(--highlight-dark)] p-8">
      <div className="container mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-center text-[var(--text2)] mb-4"
        >
          <h1 className="text-4xl font-extrabold drop-shadow-lg">💳 Historial de Pagos</h1>
          <p className="mt-2 text-lg">Gestiona tu suscripción y revisa tus compras de tokens</p>
        </motion.div>

        {/* Suscripción */}
        {subscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="relative bg-white bg-opacity-90 backdrop-blur-md rounded-[var(--radius)] border border-white border-opacity-20 shadow-2xl overflow-hidden"
          >
            {/* Cambiamos el degradado de la barra superior para que coincida con el tema */}
            <div className="h-1 bg-gradient-to-r from-[var(--highlight)] to-[var(--highlight-dark)]" />
            <div className="p-8 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center space-x-4">
                  <span className="text-2xl font-semibold text-[var(--foreground)]">🔄 Suscripción Premium</span>
                  {/* Cambiamos el color del badge de estado */}
                  <span className="px-4 py-1 bg-[var(--highlight)] text-[var(--text2)] rounded-full text-sm font-bold">
                    {subscription.status.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-[var(--foreground)]">
                <div>
                  <div className="text-sm text-gray-600">Plan Actual</div>
                  <div className="text-lg font-semibold">{subscription.planName}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Próxima Facturación</div>
                  <div className="text-lg font-semibold">
                    {formatDate(subscription.endsAt.toDate())}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Monto Mensual</div>
                  <div className="text-lg font-semibold">
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
          className="bg-white bg-opacity-90 backdrop-blur-md rounded-[var(--radius)] border border-white border-opacity-20 shadow-2xl p-8 space-y-6"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center border-b pb-4 border-gray-300">
            <div>
              <h2 className="text-2xl font-semibold text-[var(--foreground)]">🪙 Compras de Tokens</h2>
              <p className="text-[var(--foreground)] opacity-80">Historial de todas tus compras de tokens</p>
            </div>
            <div className="mt-4 sm:mt-0 text-[var(--foreground)] font-semibold">
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
                className="relative bg-white rounded-xl p-6 shadow-lg border-l-4 border-[var(--highlight)] hover:shadow-2xl transition"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-[var(--foreground)]">
                    {formatDate(row.createdAt.toDate())}
                  </span>
                  {/* Cambiamos el color del precio */}
                  <span className="text-lg font-bold text-[var(--highlight)]">
                    €{row.price}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[var(--foreground)] opacity-90">
                  <div>
                    <div className="text-xs uppercase text-[var(--foreground)] opacity-60">Tokens</div>
                    <div className="font-medium">{row.tokensAmount}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase text-[var(--foreground)] opacity-60">Paquete</div>
                    <div className="font-medium">{row.productName}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase text-[var(--foreground)] opacity-60">Estado</div>
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
