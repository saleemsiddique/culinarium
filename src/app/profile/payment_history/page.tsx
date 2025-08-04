// components/PaymentDashboard.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useUser } from "@/context/user-context";
import { db } from "@/lib/firebase";
import { doc, collection, getDoc, getDocs, query, where } from "firebase/firestore";
import { CheckCircle } from "lucide-react";
import { useSubscription } from "@/context/subscription-context";

interface SubscriptionData {
  planName: string;
  nextRenewal: Date;
  price: number;
  status: string;
}

interface TokenPurchase {
  id: string;
  date: Date;
  tokens: number;
  amount: number;
  method: string;
  status: string;
}

export default function PaymentDashboard() {
  const { user, loading } = useUser();
  const { subscription } = useSubscription();
  const [purchases, setPurchases] = useState<TokenPurchase[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      setLoadingData(true);

      const fetchSubscription = async () => {
        const usersRef = collection(db, "user");
        const q = query(usersRef, where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const userDoc = querySnapshot.docs[0];
        const userId = userDoc.id;
        
        console.log(`Usuario encontrado: ${userId}, datos:`, userDoc.data());

        const subRef = doc(db, "user", userId, "subscripcion", "current");
        const subSnap = await getDoc(subRef);

        if (subSnap.exists()) {
          const data = subSnap.data();
          
        }
      };

      const fetchPurchases = async () => {
        const colRef = collection(db, "user", user.uid, "tokenPurchases");
        const docsSnap = await getDocs(colRef);
        const list: TokenPurchase[] = docsSnap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            date: data.date.toDate(),
            tokens: data.tokens,
            amount: data.amount,
            method: data.method,
            status: data.status,
          };
        });
        list.sort((a, b) => b.date.getTime() - a.date.getTime());
        setPurchases(list);
      };

      Promise.all([fetchSubscription(), fetchPurchases()]).finally(() =>
        setLoadingData(false)
      );
    }
  }, [loading, user]);

  if (loading || loadingData) {
    return <div className="p-8 text-center">Cargando datos...</div>;
  }

  if (!user) {
    return (
      <div className="p-8 text-center">Inicia sesión para ver tu historial</div>
    );
  }

  const totalSpent = purchases.reduce((sum, p) => sum + p.amount, 0);
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: 0.6 + i * 0.1 },
    }),
  };

    const formatDate = (date: string | Date) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };


  return (
    <div className="h-full w-full pt-24 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-8">
      <div className="container mx-auto max-w-4xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-center text-white mb-4"
        >
          <h1 className="text-4xl font-extrabold drop-shadow-lg">💳 Historial de Pagos</h1>
          <p className="mt-2 text-lg">Gestiona tu suscripción y revisa tus compras de tokens</p>
        </motion.div>

        {subscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="relative bg-white bg-opacity-90 backdrop-blur-md rounded-2xl border border-white border-opacity-20 shadow-2xl overflow-hidden"
          >
            <div className="h-1 bg-gradient-to-r from-green-400 to-green-600" />
            <div className="p-8 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center space-x-4">
                  <span className="text-2xl font-semibold">🔄 {subscription.planName}</span>
                  <span className="px-4 py-1 bg-green-500 text-white rounded-full text-sm font-medium">
                    {subscription.planName}
                  </span>
                </div>
                <button className="mt-4 md:mt-0 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl transition">
                  Gestionar Suscripción
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <div className="text-sm text-gray-600">Plan Actual</div>
                  <div className="text-lg font-semibold text-gray-800">{subscription.planName}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Próxima Facturación</div>
                  <div className="text-lg font-semibold text-gray-800">{formatDate(subscription.endsAt.toDate())}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Monto Mensual</div>
                  <div className="text-lg font-semibold text-gray-800">€ss</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Método de Pago</div>
                  <div className="text-lg font-semibold text-gray-800">{user.extra_tokens ? "Stripe" : "N/A"}</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
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
                key={row.id} custom={i} initial="hidden" animate="visible" variants={itemVariants}
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
