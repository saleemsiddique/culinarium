"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import bcrypt from "bcryptjs";
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { v4 as uuidv4 } from "uuid";

export interface CustomUser {
  uid: string; // ✅ Añadido el campo uid
  email: string;
  firstName: string;
  lastName: string;
  created_at: Timestamp;
  password?: string;
  extra_tokens: number;
  isSubscribed: boolean;
  lastRenewal: Timestamp;
  monthly_tokens: number;
  stripeCustomerId: string;
  subscriptionId: string;
  subscriptionStatus: string;
  subscriptionCanceled: boolean;
  tokens_reset_date: Timestamp;
  subscriptionEndDate?: Date | null;
}

interface UserContextType {
  user: CustomUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    surname: string
  ) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser?.email) {
      const usersRef = collection(db, "user");
      const q = query(usersRef, where("email", "==", firebaseUser.email));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docData = snapshot.docs[0].data() as CustomUser;
        docData.uid = snapshot.docs[0].id;
        
        // ✅ Obtener datos de suscripción
        try {
          const subscriptionDocRef = doc(db, 'user', docData.uid, 'subscripcion', 'current');
          const subscriptionDoc = await getDoc(subscriptionDocRef);
          
          if (subscriptionDoc.exists()) {
            const subscriptionData = subscriptionDoc.data();
            docData.subscriptionEndDate = subscriptionData?.endsAt?.toDate() || null;
          } else {
            docData.subscriptionEndDate = null;
          }
        } catch (error) {
          console.error('Error obteniendo suscripción:', error);
          docData.subscriptionEndDate = null;
        }
        
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
  const login = async (email: string, password: string) => {
    const usersRef = collection(db, "user");
    const q = query(usersRef, where("email", "==", email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) throw new Error("Usuario no encontrado");

    const docData = snapshot.docs[0].data() as CustomUser;
    // ✅ Añadir el ID del documento
    docData.uid = snapshot.docs[0].id;

    const match = await bcrypt.compare(password, docData.password || "");
    if (!match) throw new Error("Contraseña incorrecta");

    setUser(docData);
  };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    const usersRef = collection(db, "user");
    const q = query(usersRef, where("email", "==", email));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) throw new Error("El usuario ya existe");

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();

    const newUser: CustomUser = {
      uid: id, // ✅ Incluir el uid en el objeto
      email,
      firstName,
      lastName,
      password: hashedPassword,
      created_at: Timestamp.now(),
      extra_tokens: 0,
      isSubscribed: false,
      lastRenewal: Timestamp.now(),
      monthly_tokens: 30,
      stripeCustomerId: "",
      subscriptionId: "",
      subscriptionStatus: "",
      subscriptionCanceled: false,
      tokens_reset_date: Timestamp.now(),
    };

    const docRef = doc(db, "user", id);
    await setDoc(docRef, newUser);
    setUser(newUser);
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
        subscriptionStatus: "",
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
    setUser(null);
  };

  const value: UserContextType = {
    user,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
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