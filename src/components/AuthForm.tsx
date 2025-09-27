// AuthForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useUser } from "@/context/user-context";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export function AuthForm({
  type = "login",
}: {
  type: "login" | "register";
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    rememberMe: false,
    acceptTerms: false,
  });
  
  const { t } = useTranslation();


  const { login, register } = useUser();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type: inputType, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: inputType === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (type === "login") {
        await login(formData.email, formData.password);
        router.push("/kitchen");
        return;
      }

      // Lógica de registro simplificada
      if (!formData.acceptTerms) {
        throw new Error("Debes aceptar los términos y condiciones, política de privacidad y de cookies.");
      }

      await register(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName
      );

      // Por seguridad (por si register no disparó el evento por alguna razón),
      // emitimos también aquí en el cliente.
      if (typeof window !== "undefined") {
        try {
          window.dispatchEvent(
            new CustomEvent("consent_updated", { detail: { source: "authform" } })
          );
        } catch {
          // noop
        }
      }

      // Una vez que el registro y el consentimiento se han gestionado en el UserContext, redirigimos
      router.push("/kitchen?onboarding=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ha ocurrido un error");
    } finally {
      setLoading(false);
    }
  };

  // El resto del JSX del formulario sigue igual
  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}
      {type === "register" && (
        <div className="flex gap-2">
          <Input
            placeholder={t("auth.register.firstNamePlaceholder")}
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
          />
          <Input
            placeholder={t("auth.register.lastNamePlaceholder")}
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            required
          />
        </div>
      )}
      <Input
        placeholder="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleInputChange}
        required
      />
      <div className="relative">
        <Input
          placeholder={t("auth.register.passwordPlaceholder")}
          type={showPassword ? "text" : "password"}
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          required
        />
        <button
          type="button"
          className="absolute right-3 top-2 text-gray-400"
          tabIndex={-1}
          onClick={() => setShowPassword((v) => !v)}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {type === "login" ? (
        <div className="flex items-center justify-between text-sm w-72">
        {/* 
          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              name="rememberMe"
              checked={formData.rememberMe}
              onCheckedChange={(checked) =>
                setFormData(prev => ({ ...prev, rememberMe: checked as boolean }))
              }
            />
            <label htmlFor="remember" className="select-none text-gray-600">
              Recordarme
            </label>
          </div>
        */}
          <Link
            href="/auth/forgot-password"
            className="text-blue-500 hover:underline"
          >
            {t("auth.login.forgotPassword")}
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Checkbox
            id="terms"
            name="acceptTerms"
            checked={formData.acceptTerms}
            onCheckedChange={(checked) =>
              setFormData(prev => ({ ...prev, acceptTerms: checked as boolean }))
            }
            required
            className="border border-1 text-gray-300"
          />
          <label htmlFor="terms">
            {t("auth.register.terms")} 
            <Link href="/consent/terms" className="text-blue-500 hover:underline">{t("auth.register.termsLink")}</Link>, <Link href="/consent/privacy" className="text-blue-500 hover:underline">{t("auth.register.privacyLink")}</Link> {t("auth.register.and")} <Link href="/consent/cookies" className="text-blue-500 hover:underline">{t("auth.register.cookiesLink")}</Link>.
          </label>
        </div>
      )}
      <Button
        type="submit"
        className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      {type === "login" ? t("auth.login.loading") : t("auth.register.loading")}
      </>
      ) : (
        type === "login" ? t("auth.login.button") : t("auth.register.button")
      )}
      </Button>
    </form>
  );
}