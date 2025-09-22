// context/user-context.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import {
  doc,
  setDoc,
  updateDoc,
  Timestamp,
  getDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  getAdditionalUserInfo,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  confirmPasswordReset as firebaseConfirmPasswordReset,
  User as FirebaseUser,
} from "firebase/auth";

export interface CustomUser {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  created_at: Timestamp;
  extra_tokens: number;
  isSubscribed: boolean;
  lastRenewal: Timestamp;
  monthly_tokens: number;
  stripeCustomerId: string;
  subscriptionId: string;
  subscriptionStatus: string;
  subscriptionCanceled: boolean;
  tokens_reset_date: Timestamp;
  // Optional debug fields:
  stripeCreationFailed?: boolean;
  stripeCreationErrorMsg?: string;
  stripeCustomerCreatedAt?: Timestamp | any;
}

interface UserContextType {
  user: CustomUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    surname: string
  ) => Promise<string>;
  // Ahora loginWithGoogle inicia el redirect (no devuelve user inmediatamente)
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserName: (newName: string) => Promise<void>;
  deductTokens: (amount: number) => Promise<void>;
  hasEnoughTokens: (amount: number) => boolean;
  refreshUser: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  confirmPasswordReset: (oobCode: string, newPassword: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const STRIPE_PLACEHOLDER = "__STRIPE_CREATING__";

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const redirectProcessedRef = useRef(false); // evita re-procesar si ya lo hicimos esta sesión
  const router = useRouter();

  // ---------------------------
  // Utilities ya presentes
  // ---------------------------
  const checkAndResetMonthlyTokens = async (userData: CustomUser): Promise<CustomUser> => {
    if (userData.isSubscribed && (userData.subscriptionStatus === 'active' || userData.subscriptionStatus === 'cancel_at_period_end')) {
      return userData;
    }

    const now = Timestamp.now();
    const resetDate = userData.tokens_reset_date;
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    const timeDiff = now.toMillis() - resetDate.toMillis();

    if (timeDiff >= thirtyDaysInMs) {
      try {
        const userDocRef = doc(db, "user", userData.uid);
        const newResetDate = Timestamp.now();

        await updateDoc(userDocRef, {
          monthly_tokens: 50,
          tokens_reset_date: newResetDate,
        });

        return {
          ...userData,
          monthly_tokens: 50,
          tokens_reset_date: newResetDate,
        };
      } catch (error) {
        console.error("Error al resetear tokens:", error);
        return userData;
      }
    }

    return userData;
  };

  // createStripeCustomer llama a tu endpoint server-side (ya lo tenías)
  const createStripeCustomer = async (email: string, userId: string) => {
    try {
      const response = await fetch("/api/create-stripe-customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al crear customer en Stripe");
      }

      const { customerId } = await response.json();
      return customerId;
    } catch (error) {
      console.error("Error creando Stripe customer:", error);
      throw error;
    }
  };

  // ---------------------------
  // Función que inicia el redirect (reemplaza signInWithPopup)
  // ---------------------------
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    // Si necesitas scopes extra: provider.addScope("...");
    await signInWithRedirect(auth, provider);
    // la app será redirigida y NO obtendrás user aquí
  };

  // ---------------------------
  // Función que procesa el resultado del redirect (evita duplicados Stripe)
  // ---------------------------
  // Esta función intenta replicar y mejorar la lógica anterior usando transacciones
  // para evitar que varios clientes creen clientes Stripe duplicados.
  const handleLoginRedirectResult = async (): Promise<{ user: CustomUser | null; isNewUser: boolean }> => {
    try {
      const result = await getRedirectResult(auth);

      if (!result || !result.user) {
        return { user: null, isNewUser: false };
      }

      const userInfo = result.user;
      const email = userInfo.email;
      if (!email) throw new Error("No se pudo obtener el email del usuario Google.");

      const additionalInfo = getAdditionalUserInfo(result);
      const firebaseSaysNew = Boolean(additionalInfo?.isNewUser);

      const userDocRef = doc(db, "user", userInfo.uid);

      // tokens_reset_date = +1 mes
      const nowDate = new Date();
      nowDate.setMonth(nowDate.getMonth() + 1);
      const tokens_reset_date = Timestamp.fromDate(nowDate);

      let userData: CustomUser | null = null;
      let isNewUser = false;

      // 1) Transacción para crear documento con placeholder si no existe
      const txResult = await runTransaction(db, async (tx) => {
        const snap = await tx.get(userDocRef);
        if (snap.exists()) {
          return { existed: true, data: snap.data() as CustomUser };
        } else {
          // crear doc con placeholder de stripe
          isNewUser = true;
          const newDoc = {
            uid: userInfo.uid,
            email,
            firstName: userInfo.displayName?.split(" ")[0] || "",
            lastName: userInfo.displayName?.split(" ").slice(1).join(" ") || "",
            created_at: serverTimestamp(),
            extra_tokens: 0,
            isSubscribed: false,
            lastRenewal: serverTimestamp(),
            monthly_tokens: 50,
            stripeCustomerId: STRIPE_PLACEHOLDER,
            subscriptionId: "",
            subscriptionStatus: "cancelled",
            subscriptionCanceled: false,
            tokens_reset_date,
          };
          tx.set(userDocRef, newDoc);
          return { existed: false };
        }
      });

      if (txResult.existed) {
        // Ya existía: leer y aplicar check/reset tokens
        userData = txResult.data!;
        userData.uid = userDocRef.id;
        userData = await checkAndResetMonthlyTokens(userData);
        isNewUser = firebaseSaysNew || false;
      } else {
        // Acabamos de crear placeholder: ahora crear cliente Stripe fuera de la transacción.
        try {
          const stripeCustomerId = await createStripeCustomer(email, userInfo.uid);

          // Actualizar condicionalmente el stripeCustomerId (solo si sigue el placeholder)
          await runTransaction(db, async (tx) => {
            const snap = await tx.get(userDocRef);
            if (!snap.exists()) throw new Error("Documento desapareció tras crear placeholder.");
            const cur = snap.data() as any;
            if (cur.stripeCustomerId === STRIPE_PLACEHOLDER) {
              tx.update(userDocRef, {
                stripeCustomerId,
                stripeCustomerCreatedAt: serverTimestamp(),
              });
            } else {
              // otro proceso ya actualizó stripeCustomerId -> no hacer nada
            }
          });
        } catch (stripeErr) {
          console.error("Error creando cliente Stripe:", stripeErr);
          // Intentar limpiar placeholder y marcar fallo para reintentos posteriores
          try {
            await runTransaction(db, async (tx) => {
              const snap = await tx.get(userDocRef);
              if (!snap.exists()) return;
              const cur = snap.data() as any;
              if (cur.stripeCustomerId === STRIPE_PLACEHOLDER) {
                tx.update(userDocRef, {
                  stripeCustomerId: "",
                  stripeCreationFailed: true,
                  stripeCreationErrorMsg: (stripeErr instanceof Error ? stripeErr.message : String(stripeErr)),
                });
              }
            });
          } catch (e) {
            console.error("No se pudo limpiar placeholder tras fallo de Stripe:", e);
          }
        }

        // Leer documento final y aplicar check/reset tokens
        const finalSnap = await getDoc(userDocRef);
        if (!finalSnap.exists()) {
          throw new Error("Documento debería existir después de la creación pero no está.");
        }
        userData = finalSnap.data() as CustomUser;
        userData.uid = finalSnap.id;
        userData = await checkAndResetMonthlyTokens(userData);
        // isNewUser ya es true en este camino
        isNewUser = firebaseSaysNew || true;
      }

      return { user: userData, isNewUser };
    } catch (err) {
      console.error("Error procesando redirect result:", err);
      return { user: null, isNewUser: false };
    }
  };

  // ---------------------------
  // useEffect: procesar redirect (se ejecuta una sola vez al montar)
  // ---------------------------
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // Evitar re-procesar si ya se hizo en esta sesión
        if (redirectProcessedRef.current) {
          return;
        }

        const { user: redirectUser, isNewUser } = await handleLoginRedirectResult();

        if (redirectUser) {
          // Guardar usuario en estado
          setUser(redirectUser);
          // Actualiza firebaseUser si auth ya tiene el user
          setFirebaseUser(auth.currentUser);

          // Marcar que ya procesamos el redirect (para esta sesión)
          redirectProcessedRef.current = true;

          // Si es nuevo usuario, enviar email y redirigir a onboarding
          if (isNewUser) {
            try {
              await fetch("/api/send-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  to: redirectUser.email,
                  type: "welcome",
                  data: { firstName: redirectUser.firstName || "Usuario" },
                }),
              });
            } catch (e) {
              console.error("Error enviando welcome email:", e);
            }

            try {
              router.push("/kitchen?onboarding=1");
            } catch (e) {
              // en algunos entornos router.push podría fallar — no es crítico
              console.warn("No se pudo redirigir automáticamente tras onboarding:", e);
            }
          } else {
            // Para usuarios existentes re-dirigir al kitchen (o no, según tu flujo)
            // router.push("/kitchen");
          }
        }
      } catch (e) {
        console.error("Error en procesamiento de redirect en UserProvider:", e);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------
  // Listener de auth state normal (mantener sincronía)
  // ---------------------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userAuth) => {
      setFirebaseUser(userAuth);
      if (userAuth?.email) {
        const userDocRef = doc(db, "user", userAuth.uid);
        const userSnapshot = await getDoc(userDocRef);

        if (userSnapshot.exists()) {
          let docData = userSnapshot.data() as CustomUser;
          docData.uid = userSnapshot.id;

          docData = await checkAndResetMonthlyTokens(docData);

          setUser(docData);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------
  // Resto de funciones (login, register, logout, updateUserName, tokens, etc.)
  // Mantengo tus implementaciones prácticamente igual; copia/pega las tuyas
  // y he ajustado register/login para usar la createStripeCustomer que ya está arriba.
  // ---------------------------

  const login = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = result.user;

    const userDocRef = doc(db, "user", firebaseUser.uid);
    const snapshot = await getDoc(userDocRef);

    if (!snapshot.exists()) {
      throw new Error("Usuario no encontrado");
    }

    let docData = snapshot.data() as CustomUser;
    docData.uid = snapshot.id;

    docData = await checkAndResetMonthlyTokens(docData);

    setUser(docData);
  };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const id = userCredential.user.uid;
      const now = new Date();
      now.setMonth(now.getMonth() + 1);
      const tokens_reset_date = Timestamp.fromDate(now);

      const stripeCustomerId = await createStripeCustomer(email, id);

      const newUser: Omit<CustomUser, "password"> = {
        uid: id,
        email,
        firstName,
        lastName,
        created_at: Timestamp.now(),
        extra_tokens: 0,
        isSubscribed: false,
        lastRenewal: Timestamp.now(),
        monthly_tokens: 50,
        stripeCustomerId: stripeCustomerId,
        subscriptionId: "",
        subscriptionStatus: "cancelled",
        subscriptionCanceled: false,
        tokens_reset_date: tokens_reset_date,
      };

      const docRef = doc(db, "user", id);
      await setDoc(docRef, newUser);

      setUser(newUser);
      setFirebaseUser(userCredential.user);
      setLoading(false);

      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          type: "welcome",
          data: { firstName },
        }),
      });

      return id;
    } catch (error) {
      console.error("Error al registrarse:", error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const updateUserName = async (newName: string) => {
    if (!user) {
      throw new Error("No hay usuario autenticado");
    }

    if (!newName.trim()) {
      throw new Error("El nombre no puede estar vacío");
    }

    try {
      const userDocRef = doc(db, "user", user.uid);
      await updateDoc(userDocRef, {
        firstName: newName.trim(),
      });

      setUser((prevUser) => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          firstName: newName.trim(),
        };
      });
    } catch (error) {
      console.error("Error al actualizar el nombre:", error);
      throw new Error("No se pudo actualizar el nombre");
    }
  };

  const hasEnoughTokens = (amount: number) => {
    if (!user) return false;
    const totalTokens = (user.monthly_tokens || 0) + (user.extra_tokens || 0);
    return totalTokens >= amount;
  };

  const refreshUser = useCallback(async () => {
    if (!firebaseUser?.email) {
      console.warn("No hay usuario autenticado para refrescar");
      return;
    }

    try {
      const userDocRef = doc(db, "user", firebaseUser.uid);
      const userSnapshot = await getDoc(userDocRef);

      if (userSnapshot.exists()) {
        const docData = userSnapshot.data() as CustomUser;
        docData.uid = userSnapshot.id;
        setUser(docData);
      } else {
        console.warn("No se encontró el usuario en la base de datos");
      }
    } catch (error) {
      console.error("Error al refrescar datos del usuario:", error);
    }
  }, [firebaseUser?.email]);

  const deductTokens = async (amount: number) => {
    if (!user || !firebaseUser) {
      throw new Error("No hay usuario autenticado");
    }

    if (!hasEnoughTokens(amount)) {
      throw new Error("Tokens insuficientes");
    }

    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch('/api/deduct-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al descontar tokens');
      }

      const { updatedUser } = await response.json();

      setUser((prevUser) => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          monthly_tokens: updatedUser.monthly_tokens,
          extra_tokens: updatedUser.extra_tokens,
        };
      });

      setTimeout(() => {
        refreshUser().catch(console.error);
      }, 100);
    } catch (error) {
      console.error("Error al descontar tokens:", error);
      throw error;
    }
  };

  const sendPasswordResetEmail = async (email: string) => {
    try {
      await firebaseSendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Error sending password reset email:", error);
      throw error;
    }
  };

  const confirmPasswordReset = async (oobCode: string, newPassword: string) => {
    try {
      await firebaseConfirmPasswordReset(auth, oobCode, newPassword);
    } catch (error) {
      console.error("Error confirming password reset:", error);
      throw error;
    }
  };

  const value: UserContextType = {
    user,
    firebaseUser,
    loading,
    login,
    register,
    loginWithGoogle, // inicia redirect
    logout,
    updateUserName,
    deductTokens,
    hasEnoughTokens,
    refreshUser,
    sendPasswordResetEmail,
    confirmPasswordReset,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser debe ser usado dentro de un UserProvider");
  }
  return context;
}