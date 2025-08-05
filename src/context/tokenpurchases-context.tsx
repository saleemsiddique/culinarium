"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "./user-context"; 

interface TokenPurchase {
  tokensAmount: number;
  productName: string;
}

interface TokenPurchasesContextType {
  purchases: TokenPurchase[];
  loading: boolean;
}

const TokenPurchasesContext = createContext<TokenPurchasesContextType | undefined>(undefined);

export function TokenPurchasesProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [purchases, setPurchases] = useState<TokenPurchase[]>([]);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
    if (!user?.uid) {
      setPurchases([]);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const tokensRef = collection(db, "user", user.uid, "token_purchases"); // ← asegúrate de que coincide
        const snap = await getDocs(tokensRef);
        const docs = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<TokenPurchase, "id">),
        }));
        // opcional: ordena por fecha
        docs.sort((a, b) => b.tokensAmount - a.tokensAmount);
        setPurchases(docs);
      } catch (e) {
        console.error("Error fetching token purchases:", e);
        setPurchases([]);
      }
      setLoading(false);
    })();
  }, [user]);

  return (
    <TokenPurchasesContext.Provider value={{ purchases, loading }}>
      {children}
    </TokenPurchasesContext.Provider>
  );
}

export function useTokenPurchases() {
  const ctx = useContext(TokenPurchasesContext);
  if (!ctx) throw new Error("useTokenPurchases debe usarse dentro de TokenPurchasesProvider");
  return ctx;
}
