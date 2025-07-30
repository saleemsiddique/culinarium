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
  query,
  where,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import bcrypt from "bcryptjs";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { v4 as uuidv4 } from 'uuid';

interface CustomUser {
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
  tokens_reset_date: Timestamp;
}

interface UserContextType {
  user: CustomUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, surname: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const usersRef = collection(db, "user");
    const q = query(usersRef, where("email", "==", email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) throw new Error("Usuario no encontrado");

    const docData = snapshot.docs[0].data() as CustomUser;

    const match = await bcrypt.compare(password, docData.password || "");
    if (!match) throw new Error("Contraseña incorrecta");

    setUser(docData);
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    const usersRef = collection(db, "user");
    const q = query(usersRef, where("email", "==", email));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) throw new Error("El usuario ya existe");

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser: CustomUser = {
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
      tokens_reset_date: Timestamp.now(),
    };
    const id = uuidv4();
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
        email: email,
        firstName: userInfo.displayName?.split(' ')[0] || '',
        lastName: userInfo.displayName?.split(' ').slice(1).join(' ') || '',
        created_at: Timestamp.now(),
        extra_tokens: 0,
        isSubscribed: false,
        lastRenewal: Timestamp.now(),
        monthly_tokens: 30,
        stripeCustomerId: "",
        subscriptionId: "",
        subscriptionStatus: "",
        tokens_reset_date: Timestamp.now(),
      };

      const docRef = doc(db, "user", userInfo.uid);
      await setDoc(docRef, userData);
    } else {
      userData = snapshot.docs[0].data() as CustomUser;
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

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser debe ser usado dentro de un UserProvider");
  }
  return context;
}
