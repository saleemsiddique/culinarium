// components/SocialAuth.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { useUser } from "@/context/user-context";

export function SocialAuth() {
  const [loading, setLoading] = useState<string | null>(null);
  const { loginWithGoogle } = useUser();
  const router = useRouter();

  // Helper para mostrar nombre si lo necesitas (no se usa aquí para redirect)
  const getFirstName = (displayName: string | null) => {
    if (!displayName) return "Usuario";
    return displayName.split(" ")[0];
  };

  const handleGoogleLogin = async () => {
    setLoading("google");
    try {
      // START: iniciar flujo de redirect. NO devuelve resultado.
      await loginWithGoogle();
      // La app se redirigirá; cuando regrese, UserProvider procesará el resultado
    } catch (error) {
      console.error("Error al iniciar login con Google:", error);
      // mostrar toast si quieres
    } finally {
      // no importa mucho porque la página normalmente se redirige
      setLoading(null);
    }
  };

  const handleAppleLogin = () => {
    // Apple Sign-In no está implementado aún
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="w-1/2 flex items-center gap-2 border-yellow-400"
          onClick={handleGoogleLogin}
          disabled={loading === "google"}
        >
          {loading === "google" ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <FcGoogle size={20} />
          )}
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-1/2 flex items-center gap-2 border-yellow-400 opacity-50 cursor-not-allowed"
          onClick={handleAppleLogin}
          disabled
        >
          <FaApple size={20} className="text-yellow-500" />
          Apple
        </Button>
      </div>
    </div>
  );
}