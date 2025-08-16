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
  collection,
  doc,
  getDocs,
  query,
  where,
  setDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
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
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserName: (newName: string) => Promise<void>;
  deductTokens: (amount: number) => Promise<void>;
  hasEnoughTokens: (amount: number) => boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userAuth) => {
      setFirebaseUser(userAuth);
      if (userAuth?.email) {
        const usersRef = collection(db, "user");
        const q = query(usersRef, where("email", "==", userAuth.email));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const docData = snapshot.docs[0].data() as CustomUser;
          docData.uid = snapshot.docs[0].id;

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
      const usersRef = collection(db, "user");
      const q = query(usersRef, where("email", "==", firebaseUser.email));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docData = snapshot.docs[0].data() as CustomUser;
        docData.uid = snapshot.docs[0].id;

        setUser(docData);
        console.log("✅ Datos de usuario refrescados desde la base de datos");
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
      console.log("🔄 Evento de actualización de tokens detectado, refrescando usuario...");
      refreshUser().catch(console.error);
    };

    const handleVisibilityChange = () => {
      // Refrescar cuando el usuario regrese a la pestaña (útil después de completar compras en Stripe)
      if (!document.hidden && firebaseUser?.email) {
        console.log("🔄 Usuario regresó a la pestaña, refrescando datos...");
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

  const login = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = result.user;

    const usersRef = collection(db, "user");
    const q = query(usersRef, where("email", "==", firebaseUser.email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) throw new Error("Usuario no encontrado");

    const docData = snapshot.docs[0].data() as CustomUser;
    docData.uid = snapshot.docs[0].id;

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
      const token = await userCredential.user.getIdToken();

      
      const newUser: Omit<CustomUser, "password"> = {
        uid: id,
        email,
        firstName,
        lastName,
        created_at: Timestamp.now(),
        extra_tokens: 0,
        isSubscribed: false,
        lastRenewal: Timestamp.now(),
        monthly_tokens: 30,
        stripeCustomerId: "",
        subscriptionId: "",
        subscriptionStatus: "cancelled",
        subscriptionCanceled: false,
        tokens_reset_date: Timestamp.now(),
      };

      const docRef = doc(db, "user", id);
      await setDoc(docRef, newUser);

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
        console.log("Consentimiento registrado correctamente.");

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
        console.log("Consentimiento registrado correctamente.");
        // ✅ Nueva línea: Guardar en localStorage para evitar que el modal aparezca inmediatamente
        const saveObj: Record<string, string> = {};
        CONSENT_TYPES.forEach((t) => (saveObj[t] = POLICY_VERSION));
        localStorage.setItem("consent_versions", JSON.stringify(saveObj));
        localStorage.setItem("consent_version", POLICY_VERSION); // Por si acaso
      }

      setUser(newUser);
      setFirebaseUser(userCredential.user);
      setLoading(false);

      return id;
    } catch (error) {
      console.error("Error al registrarse:", error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const userInfo = result.user;

    const email = userInfo.email;
    if (!email) throw new Error("No se pudo obtener el email");

    const usersRef = collection(db, "user");
    const q = query(usersRef, where("email", "==", email));
    const snapshot = await getDocs(q);

    let userData: CustomUser;

    if (snapshot.empty) {
      // Nuevo usuario con Google, creamos copia en Firestore
      userData = {
        uid: userInfo.uid, // ✅ Usar el uid de Firebase Auth
        email: email,
        firstName: userInfo.displayName?.split(" ")[0] || "",
        lastName: userInfo.displayName?.split(" ").slice(1).join(" ") || "",
        created_at: Timestamp.now(),
        extra_tokens: 0,
        isSubscribed: false,
        lastRenewal: Timestamp.now(),
        monthly_tokens: 30,
        stripeCustomerId: "",
        subscriptionId: "",
        subscriptionStatus: "cancelled",
        subscriptionCanceled: false,
        tokens_reset_date: Timestamp.now(),
      };

      const docRef = doc(db, "user", userInfo.uid);
      await setDoc(docRef, userData);
    } else {
      userData = snapshot.docs[0].data() as CustomUser;
      // ✅ Añadir el ID del documento
      userData.uid = snapshot.docs[0].id;
    }

    setUser(userData);
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
