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



  const handleGoogleLogin = async () => {
    setLoading("google");
    try {
      const result = await loginWithGoogle(); 
      
      if (result?.isNewUser) {

        // ✅ Nueva línea: Enviar el correo de bienvenida a los nuevos usuarios
        /*await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: result.user!.email,
            type: "welcome",
            data: { firstName: getFirstName(result.user!.firstName) },
          }),
        });*/

        router.push("/kitchen?onboarding=1"); 
      } else {
        router.push("/kitchen");
      }
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
      // Aquí podrías mostrar un toast o mensaje de error
    } finally {
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
