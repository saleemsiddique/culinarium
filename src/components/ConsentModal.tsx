"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/user-context";
import { v4 as uuidv4 } from "uuid";
import { emitConsentUpdated } from "@/lib/consent-events";

const POLICY_VERSION = process.env.NEXT_PUBLIC_POLICY_VERSION || "1.0.0";

export default function ConsentModal() {
  const { user, firebaseUser, loading: userLoading } = useUser();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);

  const CONSENT_TYPES = [
    "terms_of_service",
    "privacy_policy",
    "cookies_policy",
  ];

  // local storage key storing an object { type: version }
  const LOCAL_KEY = "consent_versions";
  const LEGACY_KEY = "consent_version";

  useEffect(() => {
    if (userLoading) return;

    const checkConsent = async () => {
      setLoading(true);
      try {
        if (!firebaseUser) {
          // Usuario anónimo: verificamos localStorage por tipo
          const localRaw = localStorage.getItem(LOCAL_KEY);
          if (localRaw) {
            try {
              const localObj = JSON.parse(localRaw);
              // Si todos los tipos tienen la versión actual => OK
              const allOk = CONSENT_TYPES.every((type) => {
                const localVersion = localObj[type] || null;
                return localVersion === POLICY_VERSION;
              });

              if (allOk) {
                setShow(false);
                setLoading(false);
                return;
              }
            } catch {
              // parse error => pedimos aceptación
            }
          }
          setShow(true);
        } else {
          // Usuario logueado: consultamos el backend (devuelve true/false por tipo)
          const token = await firebaseUser.getIdToken();
          const res = await fetch("/api/consent", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!res.ok) {
            console.warn("GET /api/consent respondió con status:", res.status);
            setShow(true);
            setLoading(false);
            return;
          }

          const data = await res.json();

          const allConsentsAccepted =
            data.terms_of_service && data.privacy_policy && data.cookies_policy;

          if (allConsentsAccepted) {
            // Guardamos también localStorage para mantener sincronía si el usuario se desloguea
            const saveObj: Record<string, string> = {};
            CONSENT_TYPES.forEach((t) => (saveObj[t] = POLICY_VERSION));
            localStorage.setItem(LOCAL_KEY, JSON.stringify(saveObj));
            localStorage.setItem(LEGACY_KEY, POLICY_VERSION); // compatibilidad
            setShow(false);
          } else {
            setShow(true);
          }
        }
      } catch (error) {
        console.error("Error al verificar el consentimiento:", error);
        setShow(true);
      } finally {
        setLoading(false);
      }
    };

    checkConsent();
  }, [firebaseUser, userLoading]);

  const handleAccept = async () => {
    setLoading(true);

    let userId = user?.uid;
    // Si no hay usuario logueado, generamos un ID temporal
    if (!userId) {
      let anonymousId = localStorage.getItem("anonymous_user_id");
      if (!anonymousId) {
        anonymousId = uuidv4();
        localStorage.setItem("anonymous_user_id", anonymousId);
      }
      userId = anonymousId;
    }

    // Construimos el array accepted con versión por tipo
    const accepted = CONSENT_TYPES.map((type) => ({
      type,
      version: POLICY_VERSION,
      granted: true,
    }));

    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (firebaseUser) {
      try {
        const token = await firebaseUser.getIdToken();
        headers["Authorization"] = `Bearer ${token}`;
      } catch (e) {
        console.warn("No se pudo obtener token, se enviará como anónimo en backend.");
      }
    }

    try {
      const payload = {
        accepted,
        user_id: userId,
        // opcional: detalles/origin/ref si es necesario
      };

      const res = await fetch("/api/consent", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error("Error al guardar el consentimiento (único POST):", await res.text());
      } else {
        // Guardamos versiones localmente por tipo (map) y legacy key para compatibilidad
        const saveObj: Record<string, string> = {};
        CONSENT_TYPES.forEach((t) => (saveObj[t] = POLICY_VERSION));
        localStorage.setItem(LOCAL_KEY, JSON.stringify(saveObj));
        localStorage.setItem("consent_version", POLICY_VERSION); // legacy compatibility

        // Emitimos evento global para que AnalyticsGate y otras partes reaccionen
        try {
          // cookies_policy controla la analítica en nuestro esquema
          emitConsentUpdated(true);
        } catch (e) {
          // noop
        }

        setShow(false);
      }
    } catch (err) {
      console.error("Error en la petición de consentimiento:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--background)] text-[var(--text)] p-6 rounded-lg max-w-lg w-full shadow-lg">
        <h2 className="text-xl font-bold mb-4">Política y Condiciones</h2>
        <p className="mb-4">
          Al continuar usando este sitio, confirmas que aceptas nuestros{" "}
          <a href="/terms" className="text-[var(--highlight)] underline">
            Términos y Condiciones
          </a>
          ,{" "}
          <a href="/privacy" className="text-[var(--highlight)] underline">
            Política de Privacidad
          </a>{" "}
          y{" "}
          <a href="/cookies" className="text-[var(--highlight)] underline">
            Política de Cookies
          </a>
          .
        </p>
        <button
          onClick={handleAccept}
          className="bg-[var(--highlight)] text-[var(--text2)] px-4 py-2 rounded hover:bg-[var(--highlight-dark)]"
          disabled={loading}
        >
          {loading ? "Aceptando..." : "Aceptar"}
        </button>
      </div>
    </div>
  );
}
