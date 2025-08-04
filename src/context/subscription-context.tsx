"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "./user-context";

interface Subscription {
  endsAt: Timestamp;
  planName: string;
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  loading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        const subsRef = collection(db, "user", user.uid, "subscripcion");
        const snapshot = await getDocs(subsRef);

        if (!snapshot.empty) {
          // Si solo hay uno, tomamos el primero
          const data = snapshot.docs[0].data() as Subscription;
          setSubscription(data);
        } else {
          setSubscription(null);
        }
      } catch (err) {
        console.error("Error fetching subscription:", err);
        setSubscription(null);
      }
      setLoading(false);
    };

    fetchSubscription();
  }, [user]);

  return (
    <SubscriptionContext.Provider value={{ subscription, loading }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error("useSubscription debe usarse dentro de SubscriptionProvider");
  return ctx;
}
