"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/db";

// Tipos
interface UserContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
}

// Crear el contexto
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider del contexto
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Función de login
  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al iniciar sesión";
      throw new Error(message);
    }
  };

  // Función de registro
  const register = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      console.log("registerrrr", email, password, firstName, lastName);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      console.log("userCredential", userCredential);
      // Actualizar el perfil del usuario con nombre completo
      if (firstName || lastName) {
        const displayName = `${firstName || ''} ${lastName || ''}`.trim();
        await updateProfile(userCredential.user, {
          displayName
        });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al registrarse";
      throw new Error(message);
    }
  };

  // Función de logout
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al cerrar sesión";
      throw new Error(message);
    }
  };

  // Función de login con Google
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al iniciar sesión con Google";
      throw new Error(message);
    }
  };

  const value: UserContextType = {
    user,
    loading,
    login,
    register,
    logout,
    loginWithGoogle,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// Hook para usar el contexto
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser debe ser usado dentro de un UserProvider");
  }
  return context;
}
