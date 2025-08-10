"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useUser } from "@/context/user-context";
import Link from "next/link";
import { emitConsentUpdated } from "@/lib/consent-events";

// Definimos los tipos de consentimiento que el usuario debe aceptar
const CONSENT_TYPES = ["terms_of_service", "privacy_policy", "cookies_policy"];

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

  // Obtenemos las funciones de login y register del contexto
  const { login, register } = useUser();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type: inputType, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: inputType === "checkbox" ? checked : value
    }));
  };

  useEffect(() => {
    if (type === "register") {
      const consentVersion = localStorage.getItem("consent_version");
      const POLICY_VERSION = process.env.NEXT_PUBLIC_POLICY_VERSION || "0";
      if (consentVersion === POLICY_VERSION) {
        setFormData(prev => ({ ...prev, acceptTerms: true }));
      }
    }
  }, [type]);


  // Nota: este handleSubmit asume que tienes disponible `register` y `login` desde tu contexto (useUser)
  // y que, tras register, el usuario queda autenticado en el cliente (firebase auth).
  // Si usas Firebase v9, importa: `import { getAuth } from "firebase/auth";`

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

      // Registro
      if (!formData.acceptTerms) {
        throw new Error(
          "Debes aceptar los términos y condiciones, política de privacidad y de cookies."
        );
      }

      // 1) Crear usuario
      const newUserId = await register(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName
      );

      if (!newUserId) {
        throw new Error("No se pudo obtener el ID del usuario tras el registro.");
      }

      // 2) Preparar payload único con todos los consentimientos
      const POLICY_VERSION = process.env.NEXT_PUBLIC_POLICY_VERSION || "1.0.0";
      const clientTimestamp = new Date().toISOString();

      // Mapa corto de detalles (puedes sustituir por el texto completo si quieres)
      const POLICY_TEXTS: Record<string, string> = {
        terms_of_service: "Aceptación de Términos y Condiciones (texto versión).",
        privacy_policy: "Aceptación de Política de Privacidad (texto versión).",
        cookies_policy: "Aceptación de Política de Cookies (texto versión).",
      };

      const accepted = CONSENT_TYPES.map((ct) => ({
        type: ct,
        version: POLICY_VERSION,
        granted: !!formData.acceptTerms,
        details: POLICY_TEXTS[ct] || null,
      }));

      const meta = {
        path: typeof window !== "undefined" ? window.location.pathname : null,
        origin: typeof window !== "undefined" ? window.location.origin : null,
        ref: typeof document !== "undefined" ? document.referrer || null : null,
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
        language: typeof navigator !== "undefined" ? navigator.language || null : null,
        platform: typeof navigator !== "undefined" ? navigator.platform || null : null,
      };

      const payload = {
        accepted,
        user_id: newUserId,
        details: {
          timestamp: clientTimestamp,
          version: POLICY_VERSION,
          meta,
        },
        origin: meta.origin,
        ref: meta.ref,
        path: meta.path,
      };

      // 3) Intentar obtener idToken (si register deja al usuario autenticado)
      let token: string | null = null;
      try {
        // requiere: import { getAuth } from "firebase/auth";
        const { getAuth } = await import("firebase/auth");
        const auth = getAuth();
        if (auth.currentUser) {
          token = await auth.currentUser.getIdToken();
        }
      } catch (tokenErr) {
        // no crítico: seguiremos intentando enviar sin token (backend acepta user_id)
        console.warn("No se pudo obtener idToken en cliente:", tokenErr);
      }

      // 4) Enviar UN solo POST a /api/consent con todos los aceptados
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/consent", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.warn("/api/consent respondió con error:", res.status, await res.text());
        // no tiramos error porque el usuario ya se ha registrado; seguimos
      } else {
        // Guardamos la versión localmente para uso anónimo/offline
        localStorage.setItem("consent_version", POLICY_VERSION);

        // Emitimos evento global para que AnalyticsGate y otras partes reaccionen
        try {
          // cookies_policy controla la analítica
          emitConsentUpdated(!!formData.acceptTerms);
        } catch (e) {
          // noop
        }
      }

      // 5) Si tenemos anonymous_user_id y token, pedimos link en backend
      try {
        const anonymousId = localStorage.getItem("anonymous_user_id");
        if (anonymousId && token) {
          const linkRes = await fetch("/api/consent/link", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ anonymous_id: anonymousId }),
          });

          if (linkRes.ok) {
            // opcional: borrar anonymous id local una vez vinculado
            localStorage.removeItem("anonymous_user_id");
          } else {
            console.warn("/api/consent/link respondió con error:", linkRes.status, await linkRes.text());
          }
        }
      } catch (linkErr) {
        console.warn("Error al intentar linkear consentimientos:", linkErr);
      }

      // 6) Redirigir al usuario
      router.push("/kitchen");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ha ocurrido un error");
    } finally {
      setLoading(false);
    }
  };


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
            placeholder="Nombre"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
          />
          <Input
            placeholder="Apellido"
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
          placeholder="Contraseña"
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
        <div className="flex items-center justify-between text-sm">
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
          <Link href="/auth/forgot-password" className="text-blue-500 hover:underline">
            ¿Olvidaste tu contraseña?
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
          />
          <label htmlFor="terms">
            Acepto los <Link href="/terms" className="text-blue-500 hover:underline">Términos y Condiciones</Link>, <Link href="/privacy" className="text-blue-500 hover:underline">Política de Privacidad</Link> y <Link href="/cookies" className="text-blue-500 hover:underline">Política de Cookies</Link>.
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
            {type === "login" ? "Iniciando sesión..." : "Registrando..."}
          </>
        ) : (
          type === "login" ? "Iniciar Sesión" : "Registrarse"
        )}
      </Button>
    </form>
  );
}
