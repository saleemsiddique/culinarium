"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  doc,
  setDoc,
  updateDoc,
  Timestamp,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  confirmPasswordReset as firebaseConfirmPasswordReset,
  User as FirebaseUser,
  getRedirectResult,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import i18n from "@/lib/i18n";

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
  loginWithGoogle: () => Promise<{ user: CustomUser | null; isNewUser: boolean }>;
  logout: () => Promise<void>;
  updateUserName: (newName: string) => Promise<void>;
  deductTokens: (amount: number) => Promise<void>;
  hasEnoughTokens: (amount: number) => boolean;
  refreshUser: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  confirmPasswordReset: (oobCode: string, newPassword: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ✅ Función para verificar y resetear tokens mensuales
  const checkAndResetMonthlyTokens = async (userData: CustomUser): Promise<CustomUser> => {
    // Solo verificar para usuarios sin suscripción activa
    if (userData.isSubscribed && (userData.subscriptionStatus === 'active' || userData.subscriptionStatus === 'cancel_at_period_end')) {
      return userData;
    }

    const now = Timestamp.now();
    const resetDate = userData.lastRenewal;

    // 30 días en milisegundos
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    const timeDiff = now.toMillis() - resetDate.toMillis();

    if (timeDiff >= thirtyDaysInMs) {
      try {
        const userDocRef = doc(db, "user", userData.uid);
        const newResetDate = Timestamp.now();

        await updateDoc(userDocRef, {
          monthly_tokens: 50,
          lastRenewal: newResetDate,
        });


        // Retornar datos actualizados
        return {
          ...userData,
          monthly_tokens: 50,
          lastRenewal: newResetDate,
        };

      } catch (error) {
        console.error("Error al resetear tokens:", error);
        // Si falla el update, devolver datos originales
        return userData;
      }
    }

    return userData;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userAuth) => {
      setFirebaseUser(userAuth);
      if (userAuth?.email) {
        const userDocRef = doc(db, "user", userAuth.uid);
        const userSnapshot = await getDoc(userDocRef);

        if (userSnapshot.exists()) {
          let docData = userSnapshot.data() as CustomUser;
          docData.uid = userSnapshot.id;

          // ✅ Verificar y resetear tokens si es necesario
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
  }, []);

  // 🆕 Función para refrescar los datos del usuario desde la base de datos
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

  // Listener para eventos de actualización de tokens (ej: después de compras)
  useEffect(() => {
    const handleTokenUpdate = () => {
      refreshUser().catch(console.error);
    };

    const handleVisibilityChange = () => {
      // Refrescar cuando el usuario regrese a la pestaña (útil después de completar compras en Stripe)
      if (!document.hidden && firebaseUser?.email) {
        setTimeout(() => {
          refreshUser().catch(console.error);
        }, 1000); // Delay para asegurar que los webhooks se hayan procesado
      }
    };

    // Escuchar eventos personalizados de actualización de tokens
    window.addEventListener('token_update', handleTokenUpdate);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('token_update', handleTokenUpdate);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [firebaseUser?.email, refreshUser]);

  // ✅ Nuevo efecto: procesa el resultado de Google Redirect (solo tras volver del proveedor)
  useEffect(() => {
    let processed = false;
    console.log("Procesando getRedirectResult...");
    (async () => {
      console.log("Dentro de la función asíncrona de getRedirectResult");
      if (processed) return;
      console.log("Llamando a getRedirectResult");
      try {
        const result = await getRedirectResult(auth);
        console.log("Resultado de getRedirectResult 1:", result);
        if (!result) return; // No hubo redirect pendiente
        processed = true;
        console.log("Resultado de getRedirectResult:", result);
        const userInfo = result.user;
        if (!userInfo?.email) return;

        const userDocRef = doc(db, "user", userInfo.uid);
        const snapshot = await getDoc(userDocRef);
        console.log("Llegando aquí después de getRedirectResult");
        const now = new Date();
        now.setMonth(now.getMonth() + 1);
        const tokens_reset_date = Timestamp.fromDate(now);

        let finalUser: CustomUser;
        //let isNew = false;
        console.log("Usuario from Google:", userInfo);
        if (!snapshot.exists()) {
          // Crear nuevo usuario
          //const stripeCustomerId = await createStripeCustomer(userInfo.email, userInfo.uid);
          //isNew = true;
          finalUser = {
            uid: userInfo.uid,
            email: userInfo.email,
            firstName: userInfo.displayName?.split(" ")[0] || "",
            lastName: userInfo.displayName?.split(" ").slice(1).join(" ") || "",
            created_at: Timestamp.now(),
            extra_tokens: 0,
            isSubscribed: false,
            lastRenewal: Timestamp.now(),
            monthly_tokens: 50,
            stripeCustomerId: "",
            subscriptionId: "",
            subscriptionStatus: "cancelled",
            subscriptionCanceled: false,
            tokens_reset_date,
          };
          await setDoc(userDocRef, finalUser);
        } else {
          finalUser = snapshot.data() as CustomUser;
          finalUser.uid = snapshot.id;
          finalUser = await checkAndResetMonthlyTokens(finalUser);
        }

        setUser(finalUser);
        setFirebaseUser(userInfo);
        console.log("Usuario autenticado con Google Redirect:", finalUser);
        // Redirigir a /kitchen
        router.replace("/kitchen");
      } catch (e: unknown) {
        console.error("Error en getRedirectResult:", e);
        // Ignorar si no hay evento de auth
        if (typeof e === "object" && e !== null && "code" in e && (e as { code?: string }).code !== "auth/no-auth-event") {
          console.error("Error procesando getRedirectResult:", e);
        }
      }
    })();
  }, [router, checkAndResetMonthlyTokens]);

  // Función helper para crear customer en Stripe
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

    // ✅ Verificar y resetear tokens si es necesario
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
      // const token = await userCredential.user.getIdToken();
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

      /*
      const CONSENT_TYPES = ["terms_of_service", "privacy_policy", "cookies_policy"];
      const POLICY_VERSION = process.env.NEXT_PUBLIC_POLICY_VERSION || "1.0.0";
      const clientTimestamp = new Date().toISOString();

      const accepted = CONSENT_TYPES.map(type => ({
        type,
        granted: true,
        version: POLICY_VERSION,
        details: {},
      }));

      const payload = {
        accepted,
        user_id: newUser.uid,
        client_timestamp: clientTimestamp,
        origin: typeof window !== "undefined" ? window.location.origin : null,
        ref: typeof document !== "undefined" ? document.referrer || null : null,
        path: typeof window !== "undefined" ? window.location.pathname : null,
        details: {},
      };

      const consentResponse = await fetch("/api/consent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!consentResponse.ok) {
        console.error("Error al registrar el consentimiento:", await consentResponse.json());
      } else {

        // Guardar en localStorage (solo en cliente)
        if (typeof window !== "undefined") {
          try {
            const saveObj: Record<string, string> = {};
            CONSENT_TYPES.forEach((t) => (saveObj[t] = POLICY_VERSION));
            localStorage.setItem("consent_versions", JSON.stringify(saveObj));
            localStorage.setItem("consent_version", POLICY_VERSION);
          } catch (e) {
            console.warn("No se pudo escribir consent en localStorage:", e);
          }

          // DISPATCH: notificar al resto de la app que el consentimiento ya está guardado
          try {
            window.dispatchEvent(
              new CustomEvent("consent_updated", {
                detail: { userId: id, source: "register" },
              })
            );
          } catch {
            // noop
          }
        }
      }

      if (!consentResponse.ok) {
        console.error("Error al registrar el consentimiento:", await consentResponse.json());
      } else {
        // ✅ Nueva línea: Guardar en localStorage para evitar que el modal aparezca inmediatamente
        const saveObj: Record<string, string> = {};
        CONSENT_TYPES.forEach((t) => (saveObj[t] = POLICY_VERSION));
        localStorage.setItem("consent_versions", JSON.stringify(saveObj));
        localStorage.setItem("consent_version", POLICY_VERSION); // Por si acaso
      }
      */

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
          lang: i18n.language
        }),
      });

      return id;
    } catch (error) {
      console.error("Error al registrarse:", error);
      throw error;
    }
  };

  // Detecta si está en un InAppBrowser problemático
  const isInAppBrowser = function isInAppBrowser() {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes("tiktok") || ua.includes("instagram") || ua.includes("fbav") || ua.includes("fb_iab");
  }

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();

    // Usa redirect si es InAppBrowser, si no usa popup
    let result;
    if (isInAppBrowser()) {
      await signInWithRedirect(auth, provider);
      // El flujo con redirect requiere que el usuario vuelva a la app y se procese en onAuthStateChanged
      // Aquí puedes retornar un estado especial si lo necesitas
      return { user: null, isNewUser: false };
    } else {
      result = await signInWithPopup(auth, provider);
    }

    const userInfo = result.user;
    const email = userInfo.email;
    if (!email) throw new Error("No se pudo obtener el email");

    const userDocRef = doc(db, "user", userInfo.uid);
    const userSnapshot = await getDoc(userDocRef);

    const now = new Date();
    now.setMonth(now.getMonth() + 1);
    const tokens_reset_date = Timestamp.fromDate(now);

    let userData: CustomUser;
    let isNewUser = false; // ✅ Flag para detectar usuario nuevo

    if (!userSnapshot.exists()) {
      // ✅ Nuevo usuario con Google, creamos copia en Firestore
      isNewUser = true; // Marcamos como usuario nuevo

      const stripeCustomerId = await createStripeCustomer(email, userInfo.uid);

      userData = {
        uid: userInfo.uid,
        email: email,
        firstName: userInfo.displayName?.split(" ")[0] || "",
        lastName: userInfo.displayName?.split(" ").slice(1).join(" ") || "",
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

      const docRef = doc(db, "user", userInfo.uid);
      await setDoc(docRef, userData);
    } else {
      userData = userSnapshot.data() as CustomUser;
      userData.uid = userSnapshot.id;
      userData = await checkAndResetMonthlyTokens(userData);
    }

    setUser(userData);

    return {
      user: userData,
      isNewUser: isNewUser
    };
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  // 🆕 Nueva función para actualizar el nombre de usuario
  const updateUserName = async (newName: string) => {
    if (!user) {
      throw new Error("No hay usuario autenticado");
    }

    if (!newName.trim()) {
      throw new Error("El nombre no puede estar vacío");
    }

    try {
      // Actualizar en Firestore
      const userDocRef = doc(db, "user", user.uid);
      await updateDoc(userDocRef, {
        firstName: newName.trim(),
      });

      // Actualizar el estado local
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

  // 🆕 Función para verificar si el usuario tiene suficientes tokens
  const hasEnoughTokens = (amount: number) => {
    if (!user) return false;
    const totalTokens = (user.monthly_tokens || 0) + (user.extra_tokens || 0);
    return totalTokens >= amount;
  };

  // 🆕 Función para descontar tokens
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

      // Actualizar el estado local con los nuevos valores de tokens
      setUser((prevUser) => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          monthly_tokens: updatedUser.monthly_tokens,
          extra_tokens: updatedUser.extra_tokens,
        };
      });

      // También refrescar los datos desde la base de datos para asegurar sincronización
      setTimeout(() => {
        refreshUser().catch(console.error);
      }, 100); // Pequeño delay para asegurar que la base de datos se haya actualizado
    } catch (error) {
      console.error("Error al descontar tokens:", error);
      throw error;
    }
  };


  // 🆕 Nueva función para enviar el correo de restablecimiento
  const sendPasswordResetEmail = async (email: string) => {
    try {
      await firebaseSendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Error sending password reset email:", error);
      throw error;
    }
  };

  // 🆕 Nueva función para confirmar el restablecimiento de la contraseña
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
    loginWithGoogle,
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