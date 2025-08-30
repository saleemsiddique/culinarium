"use client";

import { useState, useEffect } from "react";
import { Lock, Loader2 } from "lucide-react";
import { initializeApp } from "firebase/app";
import { getAuth, confirmPasswordReset } from "firebase/auth";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oobCode, setOobCode] = useState<string | null>(null);

  useEffect(() => {
    // We get the oobCode from the URL query parameters
    const params = new URLSearchParams(window.location.search);
    setOobCode(params.get("oobCode"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres.");
        setLoading(false);
        return;
    }

    if (!oobCode) {
      setError("Código de restablecimiento no válido. Por favor, intenta de nuevo.");
      setLoading(false);
      return;
    }

    try {
      // Firebase handles secure hashing automatically
      const firebaseConfig = {
        // Replace with your Firebase project configuration
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_AUTH_DOMAIN",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_STORAGE_BUCKET",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID"
      };
      
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      await confirmPasswordReset(auth, oobCode, password);
      setSuccess(true);
    } catch (err: any) {
      console.error("Error resetting password:", err);
      setError("No se pudo cambiar la contraseña. El enlace puede haber expirado o ya fue usado.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="h-full w-full bg-[#FDF5E6] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md border border-[#4A2C2A] text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-[#E67E22] mb-4">
            ¡Contraseña Restablecida!
          </h1>
          <p className="text-[#4A2C2A] mb-8">
            Tu contraseña ha sido cambiada con éxito.
          </p>
          <a href="/auth/login" className="text-[#E67E22] hover:text-[#C2651A] font-medium transition-colors">
            Volver a Iniciar Sesión
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-[#FDF5E6] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md border border-[#4A2C2A] text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-[#2C3E50] mb-2">
          Establece una nueva contraseña
        </h1>
        <p className="text-[#4A2C2A] mb-8">
          Introduce y confirma tu nueva contraseña.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#4A2C2A] mb-2 text-left">
              Nueva contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Introduce tu nueva contraseña"
                className="w-full pl-10 pr-4 py-3 border border-[#4A2C2A] rounded-lg bg-[#FDF5E6] text-[#4A2C2A] focus:ring-2 focus:ring-[#E67E22] focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-[#4A2C2A] mb-2 text-left">
              Confirmar contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirma tu nueva contraseña"
                className="w-full pl-10 pr-4 py-3 border border-[#4A2C2A] rounded-lg bg-[#FDF5E6] text-[#4A2C2A] focus:ring-2 focus:ring-[#E67E22] focus:border-transparent"
              />
            </div>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full bg-[#E67E22] hover:bg-[#C2651A] text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading && <Loader2 size={20} className="animate-spin" />}
            Cambiar Contraseña
          </button>
        </form>
        <div className="mt-8">
          <a href="/auth/login" className="text-[#E67E22] hover:text-[#C2651A] font-medium transition-colors">
            Volver a Iniciar Sesión
          </a>
        </div>
      </div>
    </div>
  );
}
