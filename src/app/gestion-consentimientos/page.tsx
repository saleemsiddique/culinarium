/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@/context/user-context";
import { motion } from "framer-motion";
import { emitConsentUpdated } from "@/lib/consent-events";

const CONSENT_TYPES = ["terms_of_service", "privacy_policy", "cookies_policy"] as const;
const POLICY_VERSION = process.env.NEXT_PUBLIC_POLICY_VERSION || "1.0.0";

type ConsentState = Record<typeof CONSENT_TYPES[number], boolean>;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function GestionConsentimientosPage() {
  const { firebaseUser, user, loading: userLoading } = useUser();

  const [status, setStatus] = useState<ConsentState>({
    terms_of_service: false,
    privacy_policy: false,
    cookies_policy: false,
  });
  const [localRecord, setLocalRecord] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Utilities
  const LOCAL_KEY_FULL = "culinarium_cookie_consent"; // used by cookies content
  const LOCAL_KEY_VERSIONS = "consent_versions"; // map type->version
  const LOCAL_ANON_ID = "anonymous_user_id";

  function ensureAnonymousId() {
    let id = localStorage.getItem(LOCAL_ANON_ID);
    if (!id) {
      id = uuidv4();
      localStorage.setItem(LOCAL_ANON_ID, id);
    }
    return id;
  }

  function getStoredVersions() {
    const raw = localStorage.getItem(LOCAL_KEY_VERSIONS);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function getFullLocalConsent() {
    const raw = localStorage.getItem(LOCAL_KEY_FULL);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  // Called on mount and when user state changes
  useEffect(() => {
    // load local
    const local = getFullLocalConsent();
    setLocalRecord(local);

    // If user is logged, try to fetch server-side consent status
    const fetchStatus = async () => {
      setLoading(true);
      setError(null);
      try {
        // try to get idToken
        let token: string | null = null;
        try {
          if (firebaseUser) token = await firebaseUser.getIdToken();
        } catch {
          // ignore
        }

        if (!token) {
          // anonymous — use local versions if available
          const versions = getStoredVersions();
          if (versions) {
            const nextStatus: ConsentState = {
              terms_of_service: versions["terms_of_service"] === POLICY_VERSION,
              privacy_policy: versions["privacy_policy"] === POLICY_VERSION,
              cookies_policy: versions["cookies_policy"] === POLICY_VERSION,
            };
            setStatus(nextStatus);
            setLoading(false);
            return;
          }
          setLoading(false);
          return;
        }

        const res = await fetch("/api/consent", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          const nextStatus: ConsentState = {
            terms_of_service: !!data.terms_of_service,
            privacy_policy: !!data.privacy_policy,
            cookies_policy: !!data.cookies_policy,
          };
          setStatus(nextStatus);
        } else {
          // fallback to local
          const versions = getStoredVersions();
          if (versions) {
            const nextStatus: ConsentState = {
              terms_of_service: versions["terms_of_service"] === POLICY_VERSION,
              privacy_policy: versions["privacy_policy"] === POLICY_VERSION,
              cookies_policy: versions["cookies_policy"] === POLICY_VERSION,
            };
            setStatus(nextStatus);
          }
        }
      } catch (err) {
        console.error(err);
        setError("No se pudo comprobar el estado de consentimientos.");
      } finally {
        setLoading(false);
      }
    };

    if (!userLoading) fetchStatus();
  }, [firebaseUser, userLoading]);

  // Toggle a single consent locally in the UI
  const toggle = (type: typeof CONSENT_TYPES[number]) => {
    setStatus((s) => ({ ...s, [type]: !s[type] }));
  };

  // Prepare accepted array
  function buildAcceptedArray(fromStatus: ConsentState) {
    const POLICY_TEXTS: Record<string, string> = {
      terms_of_service: "Aceptación de Términos y Condiciones (versión).",
      privacy_policy: "Aceptación de Política de Privacidad (versión).",
      cookies_policy: "Aceptación de Política de Cookies (versión).",
    };

    return CONSENT_TYPES.map((t) => ({
      type: t,
      version: POLICY_VERSION,
      granted: !!fromStatus[t],
      details: POLICY_TEXTS[t] || null,
    }));
  }

  // Disable analytics placeholder
  function disableAnalyticsClientSide() {
    try {
      // GA example (replace with your measurement id if used):
      // window['ga-disable-GA_MEASUREMENT_ID'] = true;
      // Clear common analytics cookies
      ["_ga", "_gid", "_gat"].forEach((c) => {
        document.cookie = `${c}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
      });
      // If you use other SDKs, call their opt-out APIs here.
    } catch (e) {
      console.warn("No se pudo desactivar analytics en cliente:", e);
    }
  }

  function enableAnalyticsClientSide() {
    try {
      // Re-initialize analytics SDK if needed
      // e.g., re-run initialisation code
    } catch (e) {
      console.warn("No se pudo activar analytics en cliente:", e);
    }
  }

  // Update consents: creates a new consent doc (not overwrite)
  const updateConsents = async (newStatus: ConsentState) => {
    setSaving(true);
    setMessage(null);
    setError(null);

    const accepted = buildAcceptedArray(newStatus);

    const clientTimestamp = new Date().toISOString();
    const meta = {
      path: typeof window !== "undefined" ? window.location.pathname : null,
      origin: typeof window !== "undefined" ? window.location.origin : null,
      ref: typeof document !== "undefined" ? document.referrer || null : null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent || null : null,
      language: typeof navigator !== "undefined" ? navigator.language || null : null,
      platform: typeof navigator !== "undefined" ? navigator.platform || null : null,
    };

    const userId = (user && (user.uid || (firebaseUser && firebaseUser.uid))) || localStorage.getItem(LOCAL_ANON_ID) || ensureAnonymousId();

    const payload: any = {
      accepted,
      user_id: userId,
      details: { timestamp: clientTimestamp, version: POLICY_VERSION, meta },
      origin: meta.origin,
      ref: meta.ref,
      path: meta.path,
    };

    // try to obtain token
    let token: string | null = null;
    try {
      if (firebaseUser) token = await firebaseUser.getIdToken();
    } catch {
      // ignore
    }

    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/consent", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Error guardando consentimiento");
      }

      // update local storage versions map
      const storedRaw = localStorage.getItem(LOCAL_KEY_VERSIONS);
      const stored = storedRaw ? JSON.parse(storedRaw) : {};
      accepted.forEach((a: any) => (stored[a.type] = a.version));
      localStorage.setItem(LOCAL_KEY_VERSIONS, JSON.stringify(stored));

      // also save a full local record for UI
      const fullLocal = { ...newStatus, timestamp: clientTimestamp, version: POLICY_VERSION, meta };
      localStorage.setItem(LOCAL_KEY_FULL, JSON.stringify(fullLocal));
      setLocalRecord(fullLocal);

      // apply client-side effects
      if (!newStatus.cookies_policy) {
        disableAnalyticsClientSide();
      } else {
        enableAnalyticsClientSide();
      }

      // Emit global event to notify other parts of the app (AnalyticsGate, other tabs...)
      const analyticsAccepted = (newStatus as any).cookies_policy ?? (newStatus as any).analytics ?? false;
      try {
        emitConsentUpdated(analyticsAccepted);
      } catch {
        // noop
      }

      setStatus(newStatus);
      setMessage("Consentimientos actualizados correctamente.");

      // If we have anonymous id stored and user just logged in (token present), try to link
      try {
        const anonymousId = localStorage.getItem(LOCAL_ANON_ID);
        if (anonymousId && token) {
          await fetch("/api/consent/link", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ anonymous_id: anonymousId }),
          });
          // optionally remove anonymous id
          // localStorage.removeItem(LOCAL_ANON_ID);
        }
      } catch (linkErr) {
        console.warn("No se pudo linkear anonymous consent:", linkErr);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al actualizar consentimientos");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    await updateConsents(status);
  };

  const handleRevokeAll = async () => {
    const newStatus: ConsentState = { terms_of_service: false, privacy_policy: false, cookies_policy: false };
    await updateConsents(newStatus);
  };

  return (
    <motion.div
      className="w-screen min-h-screen bg-gray-950 text-gray-300 p-6 lg:py-24"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        variants={itemVariants}
        className="max-w-3xl mx-auto bg-gray-900 border border-gray-800 rounded-xl p-6 lg:p-8 shadow-xl"
      >
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-orange-400 to-amber-500 text-transparent bg-clip-text mb-2">
          Gestión de consentimientos
        </h1>
        <p className="text-sm text-gray-400 mb-6">
          Aquí puedes ver y modificar tus preferencias de privacidad y cookies en cualquier momento. Los cambios quedan registrados para auditoría.
        </p>

        {loading ? (
          <p className="text-center py-8 text-gray-500">Cargando estado...</p>
        ) : (
          <div className="space-y-6">
            {CONSENT_TYPES.map((t) => (
              <div key={t} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
                <div>
                  <p className="font-semibold text-gray-200">
                    {t === 'terms_of_service' ? 'Términos y Condiciones' : t === 'privacy_policy' ? 'Política de Privacidad' : 'Política de Cookies'}
                  </p>
                  <p className="text-sm text-gray-500">Versión: {POLICY_VERSION}</p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggle(t)}
                    className={`px-4 py-2 rounded-full font-medium transition-colors duration-200 ${status[t]
                      ? 'bg-orange-600 text-white hover:bg-orange-700'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    aria-pressed={status[t]}
                  >
                    {status[t] ? 'Aceptado' : 'Rechazado'}
                  </button>
                </div>
              </div>
            ))}

            <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-8">
              <button
                onClick={handleSave}
                disabled={saving}
                className={`px-6 py-3 rounded-full font-medium transition ${saving ? 'bg-orange-800 text-gray-500 cursor-not-allowed' : 'bg-orange-600 text-white hover:bg-orange-700'}`}
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
              <button
                onClick={handleRevokeAll}
                disabled={saving}
                className={`px-6 py-3 rounded-full font-medium transition ${saving ? 'bg-red-800 text-gray-500 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}
              >
                {saving ? 'Procesando...' : 'Revocar todo'}
              </button>
            </div>

            {message && <p className="mt-4 text-green-500">{message}</p>}
            {error && <p className="mt-4 text-red-500">{error}</p>}

            <div className="mt-6 p-4 bg-gray-800 border border-gray-700 rounded-lg">
              <h3 className="font-semibold text-gray-200">Registro local</h3>
              <pre className="text-xs overflow-auto max-h-48 text-gray-400 bg-gray-900 rounded p-2 mt-2">
                {JSON.stringify(localRecord, null, 2)}
              </pre>
              <p className="text-xs text-gray-500 mt-2">
                Si estás autenticado, el historial real se guarda en nuestro backend. Aquí verás la última elección local.
              </p>
            </div>

            <div className="mt-4 text-sm text-gray-500">
              <p>
                Derechos: puedes revocar el consentimiento en cualquier momento. La revocación no afecta al tratamiento previo realizado de forma legítima.
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
