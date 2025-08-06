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
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { v4 as uuidv4 } from "uuid";

export interface CustomUser {
  uid: string;
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
  const result = await createUserWithEmailAndPassword(auth, email, password);
  const firebaseUser = result.user;

  const newUser: CustomUser = {
    uid: firebaseUser.uid,
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

  const docRef = doc(db, "user", firebaseUser.uid);
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
