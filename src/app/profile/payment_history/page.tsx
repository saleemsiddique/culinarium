// components/PaymentDashboard.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

type Subscription = {
  name: string;
  nextRenewal: string;
  price: number;
  status: "Active" | "Canceled" | "Expired";
};

type TokenPurchase = {
  id: number;
  date: string;
  tokens: number;
  amount: number;
  method: string;
  status: "Completed" | "Pending" | "Failed";
};

const subscription: Subscription = {
  name: "Suscripción Premium",
  nextRenewal: "2025-09-15",
  price: 29.99,
  status: "Active",
};

const tokenPurchases: TokenPurchase[] = [
  { id: 1, date: "2025-08-02", tokens: 2500, amount: 24.99, method: "Tarjeta **** 1234", status: "Completed" },
  { id: 2, date: "2025-07-28", tokens: 5500, amount: 49.99, method: "PayPal", status: "Completed" },
  { id: 3, date: "2025-07-15", tokens: 1200, amount: 12.99, method: "Tarjeta **** 1234", status: "Completed" },
  { id: 4, date: "2025-07-08", tokens: 12000, amount: 99.99, method: "Transferencia", status: "Completed" },
];

export default function PaymentDashboard() {
  const [subs] = useState(subscription);
  const [purchases] = useState(tokenPurchases);
  const totalSpent = purchases.reduce((sum, p) => sum + p.amount, 0);

  const itemVariants = { hidden: { opacity: 0, x: -20 }, visible: (i: number) => ({ opacity: 1, x: 0, transition: { delay: 0.6 + i * 0.1 } }) };

  return (
    <div className="h-full w-full pt-24 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-8">
      <div className="container mx-auto max-w-4xl space-y-8">
        {/* Título Animado */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center text-white mb-4"
        >
          <h1 className="text-4xl font-extrabold drop-shadow-lg">💳 Historial de Pagos</h1>
          <p className="mt-2 text-lg">Gestiona tu suscripción y revisa tus compras de tokens</p>
        </motion.div>

        {/* Tarjeta de Suscripción */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative bg-white bg-opacity-90 backdrop-blur-md rounded-2xl border border-white border-opacity-20 shadow-2xl overflow-hidden"
        >
          <div className="h-1 bg-gradient-to-r from-green-400 to-green-600" />
          <div className="p-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-4">
                <span className="text-2xl font-semibold">🔄 {subs.name}</span>
                <span className="px-4 py-1 bg-green-500 text-white rounded-full text-sm font-medium">Activa</span>
              </div>
              <button className="mt-4 md:mt-0 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl transition">
                Gestionar Suscripción
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <div className="text-sm text-gray-600">Plan Actual</div>
                <div className="text-lg font-semibold text-gray-800">Premium Plus</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Próxima Facturación</div>
                <div className="text-lg font-semibold text-gray-800"></div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Monto Mensual</div>
                <div className="text-lg font-semibold text-gray-800">€{subs.price.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Método de Pago</div>
                <div className="text-lg font-semibold text-gray-800">**** 1234</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sección de Tokens */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white bg-opacity-90 backdrop-blur-md rounded-2xl border border-white border-opacity-20 shadow-2xl p-8 space-y-6"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center border-b pb-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">🪙 Compras de Tokens</h2>
              <p className="text-gray-600">Historial de todas tus compras de tokens</p>
            </div>
            <div className="mt-4 sm:mt-0 text-gray-800 font-semibold">Total gastado: €{totalSpent.toFixed(2)}</div>
          </div>

          <div className="space-y-4">
            {purchases.map((row, i) => (
              <motion.div
                key={row.id}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={itemVariants}
                className="relative bg-white rounded-xl p-6 shadow-lg border-l-4 border-indigo-500 hover:shadow-2xl transition"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-800"></span>
                  <span className="text-lg font-bold text-green-500">€{row.amount.toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-gray-600">
                  <div>
                    <div className="text-xs uppercase text-gray-400">Tokens</div>
                    <div className="font-medium">{row.tokens.toLocaleString()} tokens</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase text-gray-400">Método</div>
                    <div className="font-medium">{row.method}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase text-gray-400">Estado</div>
                    <div className="font-medium">{row.status === 'Completed' ? '✅ Completado' : row.status}</div>
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
