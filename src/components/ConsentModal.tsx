// ConsentModal.tsx
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/user-context";
import { emitConsentUpdated } from "@/lib/consent-events";
import { usePathname } from "next/navigation";

const POLICY_VERSION = process.env.NEXT_PUBLIC_POLICY_VERSION || "1.0.0";
const url_base = ""; // pon aquí tu url_base si tienes uno, por ejemplo '/mi_base'

export default function ConsentModal() {
  const pathname = usePathname();

  // Si la ruta comienza por `${url_base}/consent`, NO mostrar el modal:
  if (pathname.startsWith(`${url_base}/consent`)) {
    return null;
  }

  const { user, firebaseUser, loading: userLoading } = useUser();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);

  const CONSENT_TYPES = [
    "terms_of_service",
    "privacy_policy",
    "cookies_policy",
  ];

  const LOCAL_KEY = "consent_versions";
  const LEGACY_KEY = "consent_version";

  useEffect(() => {
    const onConsentUpdated = (ev: Event) => {
      try {
        // Opcional: sincronizar localStorage por si viene de otra parte
        const saveObj: Record<string, string> = {};
        CONSENT_TYPES.forEach((t) => (saveObj[t] = POLICY_VERSION));
        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_KEY, JSON.stringify(saveObj));
          localStorage.setItem(LEGACY_KEY, POLICY_VERSION);
        }
      } catch { }

      // Cerrar modal y quitar loading
      setShow(false);
      setLoading(false);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("consent_updated", onConsentUpdated as EventListener);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("consent_updated", onConsentUpdated as EventListener);
      }
    };
  }, []); // una vez


  useEffect(() => {
    if (userLoading) return;

    const checkConsent = async () => {
      setLoading(true);

      try {
        if (firebaseUser) {
          // Usuario logueado: consultamos backend
          localStorage.removeItem("anonymous_user_id");
          localStorage.setItem("user_id", firebaseUser.uid);

          const token = await firebaseUser.getIdToken();
          const res = await fetch("/api/consent", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!res.ok) {
            console.warn("GET /api/consent respondió con status:", res.status);
            setShow(true);
            setLoading(false);
            return;
          }

          const data = await res.json();

          // Lógica Corregida: Verifica si la versión de cada tipo de consentimiento
          // en la base de datos coincide con la versión de la política actual.
          const allConsentsAccepted = CONSENT_TYPES.every(
            (type) => data[type] === POLICY_VERSION
          );

          if (allConsentsAccepted) {
            const saveObj: Record<string, string> = {};
            CONSENT_TYPES.forEach((t) => (saveObj[t] = POLICY_VERSION));
            localStorage.setItem(LOCAL_KEY, JSON.stringify(saveObj));
            localStorage.setItem(LEGACY_KEY, POLICY_VERSION);
            setShow(false);
          } else {
            setShow(true);
          }
        } else {
          // ... (el resto de la lógica para usuarios no logueados es correcta)
          localStorage.removeItem("user_id");
          localStorage.removeItem("anonymous_user_id");

          const localRaw = localStorage.getItem(LOCAL_KEY);
          if (localRaw) {
            try {
              const localObj = JSON.parse(localRaw);
              const allOk = CONSENT_TYPES.every(
                (type) => localObj && localObj[type] === POLICY_VERSION
              );
              if (allOk) {
                setShow(false);
                setLoading(false);
                return;
              }
            } catch {
              console.error("Error al verificar el consentimiento:");
            }
          }

          setShow(true);
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

    if (!firebaseUser) {
      // Usuario anónimo: no guardamos nada en backend, solo localStorage
      const saveObj: Record<string, string> = {};
      CONSENT_TYPES.forEach((t) => (saveObj[t] = POLICY_VERSION));
      localStorage.setItem(LOCAL_KEY, JSON.stringify(saveObj));
      localStorage.setItem(LEGACY_KEY, POLICY_VERSION);

      // Emitir evento para que otras partes reaccionen
      try {
        emitConsentUpdated(true);
      } catch { }

      setShow(false);
      setLoading(false);
      return;
    }

    // Usuario logueado: hacemos POST para guardar consentimiento en backend
    try {
      const token = await firebaseUser.getIdToken();

      const accepted = CONSENT_TYPES.map((type) => ({
        type,
        version: POLICY_VERSION,
        granted: true,
        // Añade un objeto de detalles vacío si no hay ninguno
        details: {},
      }));

      // Obtener la URL completa del cliente
      const clientOrigin = window.location.origin;
      const clientRef = document.referrer || ""; // Referrer puede estar vacío
      const clientPath = window.location.pathname;
      const clientTimestamp = new Date().toISOString(); // Timestamp en formato ISO

      const res = await fetch("/api/consent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          accepted,
          user_id: firebaseUser.uid,
          // Enviar estos campos con valores definidos (o cadenas vacías)
          details: {}, // Puedes agregar aquí detalles específicos si los tuvieras
          origin: clientOrigin,
          ref: clientRef,
          path: clientPath,
          client_timestamp: clientTimestamp, // Asegúrate de enviar este campo
        }),
      });

      if (!res.ok) {
        console.error("Error al guardar el consentimiento:", await res.text());
        setShow(true);
      } else {
        const saveObj: Record<string, string> = {};
        CONSENT_TYPES.forEach((t) => (saveObj[t] = POLICY_VERSION));
        localStorage.setItem(LOCAL_KEY, JSON.stringify(saveObj));
        localStorage.setItem(LEGACY_KEY, POLICY_VERSION);

        try {
          emitConsentUpdated(true);
        } catch { }

        setShow(false);
      }
    } catch (err) {
      console.error("Error en la petición de consentimiento:", err);
      setShow(true);
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
          <a href="/consent/terms" className="text-[var(--highlight)] underline">
            Términos y Condiciones
          </a>
          ,{" "}
          <a href="/consent/privacy" className="text-[var(--highlight)] underline">
            Política de Privacidad
          </a>{" "}
          y{" "}
          <a href="/consent/cookies" className="text-[var(--highlight)] underline">
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