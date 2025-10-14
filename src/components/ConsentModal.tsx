/* eslint-disable @typescript-eslint/no-explicit-any */

// ConsentModal.tsx
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/user-context";
import { emitConsentUpdated } from "@/lib/consent-events";
import { usePathname } from "next/navigation";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useTranslation } from "react-i18next";

const POLICY_VERSION = process.env.NEXT_PUBLIC_POLICY_VERSION || "1.0.5";
const url_base = ""; // '/mi_base' si aplica

type ConsentType = "terms_of_service" | "privacy_policy" | "cookies_policy";
type AcceptedItem = { type: ConsentType; version?: string; granted?: boolean; details?: Record<string, unknown> };
type ConsentDoc = {
  accepted?: AcceptedItem[];
  accepted_types?: ConsentType[];
  client_timestamp?: string;
  timestamp?: string;
  user_id?: string;
  [k: string]: any;
};

export default function ConsentModal() {
  const { t } = useTranslation();
  const pathname = usePathname() || "";

  // ✅ en vez de return temprano, usamos un flag:
  const skipModalRoute = pathname.startsWith(`${url_base}/consent`);

  const { firebaseUser, loading: userLoading, user, setNewsletterConsent } = useUser();

  // Inicialmente NO mostramos el modal para evitar el "flash"
  const [show, setShow] = useState<boolean>(false);
  // Flag que indica que la comprobación inicial ya terminó (ok o KO)
  const [initialized, setInitialized] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);
  const [newsletterChecked, setNewsletterChecked] = useState<boolean>(false);

  const CONSENT_TYPES: ConsentType[] = ["terms_of_service", "privacy_policy", "cookies_policy"];

  const LOCAL_KEY = "consent_versions";
  const LEGACY_KEY = "consent_version";
  const FULL_KEY = "culinarium_cookie_consent";
  const LAST_UPDATE_KEY = "culinarium_cookie_consent_last_update";

  const toMillis = (d?: string) => {
    if (!d) return 0;
    const iso = Date.parse(d);
    if (!Number.isNaN(iso)) return iso;
    const ms = new Date(d).getTime();
    return Number.isNaN(ms) ? 0 : ms;
  };

  function normalizeConsents(input: unknown) {
    let docs: ConsentDoc[] = [];
    if (Array.isArray(input)) {
      docs = input as ConsentDoc[];
    } else if (input && typeof input === "object") {
      const obj = input as any;
      if (Array.isArray(obj.accepted)) {
        docs = [obj as ConsentDoc];
      } else {
        const accepted: AcceptedItem[] = CONSENT_TYPES.map((type) => ({
          type,
          version: typeof obj[type] === "string" ? obj[type] : undefined,
          granted: typeof obj[type] === "string" ? true : undefined,
        }));
        docs = [{ accepted, accepted_types: CONSENT_TYPES, client_timestamp: obj.updatedAt || obj.timestamp }];
      }
    }

    if (!docs.length) {
      return {
        hasAnyRecord: false,
        byType: { terms_of_service: {}, privacy_policy: {}, cookies_policy: {} } as Record<
          ConsentType,
          { version?: string; granted?: boolean }
        >,
        hasAnyRejected: false,
        missingTypes: CONSENT_TYPES.slice(),
        allVersionsOk: false,
      };
    }

    const latest =
      docs
        .map((d) => ({ doc: d, ms: Math.max(toMillis(d.client_timestamp), toMillis(d.timestamp)) }))
        .sort((a, b) => b.ms - a.ms)?.[0]?.doc || docs[0];

    const byType: Record<ConsentType, { version?: string; granted?: boolean }> = {
      terms_of_service: {},
      privacy_policy: {},
      cookies_policy: {},
    };

    (latest.accepted || []).forEach((a) => {
      if (a?.type && CONSENT_TYPES.includes(a.type)) {
        byType[a.type as ConsentType] = { version: a.version, granted: a.granted };
      }
    });

    const missingTypes = CONSENT_TYPES.filter((t) => byType[t].version === undefined);
    const hasAnyRejected = CONSENT_TYPES.some((t) => byType[t].granted === false);
    const allVersionsOk = CONSENT_TYPES.every((t) => byType[t].version === POLICY_VERSION);

    return { hasAnyRecord: true, latest, byType, hasAnyRejected, missingTypes, allVersionsOk };
  }

  function writeLocalStorageSnapshot(granted = true) {
    try {
      const saveObj: Record<string, string> = {};
      CONSENT_TYPES.forEach((t) => (saveObj[t] = POLICY_VERSION));
      localStorage.setItem(LOCAL_KEY, JSON.stringify(saveObj));
      localStorage.setItem(LEGACY_KEY, POLICY_VERSION);

      const full = {
        accepted: CONSENT_TYPES.map((type) => ({ type, version: POLICY_VERSION, granted, details: {} })),
        accepted_types: CONSENT_TYPES,
        client_timestamp: new Date().toISOString(),
        created_by_authenticated: !!firebaseUser,
        details: { ip_masked: "" },
        meta: {
          origin: typeof window !== "undefined" ? window.location.origin : "",
          path: typeof window !== "undefined" ? window.location.pathname : "",
          ref: typeof document !== "undefined" ? document.referrer || "" : "",
        },
        timestamp: new Date().toLocaleString(),
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        user_id: firebaseUser ? firebaseUser.uid : undefined,
      };
      localStorage.setItem(FULL_KEY, JSON.stringify(full));
      localStorage.setItem(LAST_UPDATE_KEY, String(Date.now()));
    } catch {}
  }

  // Estado inicial checkbox newsletter
  useEffect(() => {
    if (user && typeof (user as any).newsletterConsent !== "undefined") {
      setNewsletterChecked(Boolean((user as any).newsletterConsent));
    }
  }, [user]);

  // Sincronización por evento
  useEffect(() => {
    const onConsentUpdated = (ev: Event) => {
      try {
        const custom = ev as CustomEvent;
        if (custom?.detail) writeLocalStorageSnapshot(true);
      } catch (err) {
        console.warn("ConsentModal: onConsentUpdated error", err);
      }
      setShow(false);
      setLoading(false);
      // marcar que ya hemos procesado el evento / inicializado
      setInitialized(true);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("consent:updated", onConsentUpdated as EventListener);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("consent:updated", onConsentUpdated as EventListener);
      }
    };
    // no dependas de show/flags para no reordenar hooks
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseUser]);

  // Chequeo principal
  useEffect(() => {
    if (userLoading) return;

    const checkConsent = async () => {
      setLoading(true);
      try {
        if (firebaseUser) {
          localStorage.removeItem("anonymous_user_id");
          localStorage.setItem("user_id", firebaseUser.uid);

          const token = await firebaseUser.getIdToken();
          const res = await fetch("/api/consent", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.status === 404) {
            setShow(true);
            setInitialized(true);
            return;
          }
          if (!res.ok) {
            setShow(true);
            setInitialized(true);
            return;
          }

          const data = await res.json();
          const norm = normalizeConsents(data);

          if (!norm.hasAnyRecord || norm.hasAnyRejected || !norm.allVersionsOk || norm.missingTypes.length > 0) {
            setShow(true);
            setInitialized(true);
            return;
          }

          writeLocalStorageSnapshot(true);
          setShow(false);
          setInitialized(true);
        } else {
          localStorage.removeItem("user_id");
          localStorage.removeItem("anonymous_user_id");

          const localRaw = localStorage.getItem(LOCAL_KEY);
          if (localRaw) {
            try {
              const localObj = JSON.parse(localRaw) as Record<string, string>;
              const allOk = CONSENT_TYPES.every((type) => localObj && localObj[type] === POLICY_VERSION);
              if (allOk) {
                setShow(false);
                setInitialized(true);
                return;
              }
            } catch (err) {
              console.error(t("consent.modal.errors.checkConsent"), err);
            }
          }
          setShow(true);
          setInitialized(true);
        }
      } catch (error) {
        console.error(t("consent.modal.errors.checkConsent"), error);
        setShow(true);
        setInitialized(true);
      } finally {
        setLoading(false);
        try {
          localStorage.setItem("consent_debug_last_check", new Date().toISOString());
        } catch {}
      }
    };

    checkConsent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseUser, userLoading, t]);

  // Aceptar
  const handleAccept = async () => {
    setLoading(true);

    const accepted = CONSENT_TYPES.map((type) => ({
      type,
      version: POLICY_VERSION,
      granted: true,
      details: {},
    }));

    if (!firebaseUser) {
      try {
        writeLocalStorageSnapshot(true);
        emitConsentUpdated?.(true, { accepted_types: CONSENT_TYPES });
      } catch {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("consent:updated", { detail: { analytics: true, accepted_types: CONSENT_TYPES } }));
          try { localStorage.setItem(LAST_UPDATE_KEY, String(Date.now())); } catch {}
        }
      }
      setShow(false);
      setLoading(false);
      return;
    }

    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch("/api/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          accepted,
          user_id: firebaseUser.uid,
          details: {},
          origin: window.location.origin,
          ref: document.referrer || "",
          path: window.location.pathname,
          client_timestamp: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        console.error(t("consent.modal.errors.saveConsent"), await res.text());
        setShow(true);
      } else {
        writeLocalStorageSnapshot(true);

        try {
          emitConsentUpdated?.(true, { accepted_types: CONSENT_TYPES });
        } catch {
          window.dispatchEvent(new CustomEvent("consent:updated", { detail: { analytics: true, accepted_types: CONSENT_TYPES } }));
          try { localStorage.setItem(LAST_UPDATE_KEY, String(Date.now())); } catch {}
        }

        // newsletter independiente de consents
        try {
          if (typeof setNewsletterConsent === "function") {
            if (newsletterChecked) {
              await setNewsletterConsent(true);
            } else if (user && (user as any).newsletterConsent === true) {
              await setNewsletterConsent(false);
            }
          }
        } catch (e) {
          console.error("No se pudo actualizar newsletter en Firestore:", e);
        }

        setShow(false);
      }
    } catch (err) {
      console.error(t("consent.modal.errors.requestError"), err);
      setShow(true);
    } finally {
      setLoading(false);
    }
  };

  // ✅ llama SIEMPRE al hook; sólo condiciona su efecto
  useBodyScrollLock(show && !loading && !skipModalRoute);

  // No renderices nada hasta que la comprobación inicial haya terminado.
  // Esto evita cualquier "flash" del modal.
  if (skipModalRoute || !initialized || !show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999]">
      <div className="bg-[var(--background)] text-[var(--text)] p-6 rounded-lg max-w-lg w-full shadow-lg">
        <h2 className="text-xl font-bold mb-4">{t("consent.modal.title")}</h2>
        <p className="mb-4">
          {t("consent.modal.message")}{" "}
          <a href="/consent/terms" target="_blank" className="text-[var(--highlight)] underline" rel="noreferrer">
            {t("consent.modal.terms")}
          </a>
          ,{" "}
          <a href="/consent/privacy" target="_blank" className="text-[var(--highlight)] underline" rel="noreferrer">
            {t("consent.modal.privacy")}
          </a>{" "}
          {t("and")}{" "}
          <a href="/consent/cookies" target="_blank" className="text-[var(--highlight)] underline" rel="noreferrer">
            {t("consent.modal.cookies")}
          </a>
          .
        </p>

        {firebaseUser && user && (
          <label className="flex items-center gap-2 mb-4 text-sm">
            <input
              type="checkbox"
              checked={newsletterChecked}
              onChange={(e) => setNewsletterChecked(e.target.checked)}
              className="w-4 h-4"
              aria-label={t("consent.modal.newsletterLabel") || "Suscribirme al newsletter"}
            />
            <span>{t("consent.modal.newsletterLabel") || "Quiero recibir el newsletter"}</span>
          </label>
        )}

        <button
          onClick={handleAccept}
          className="bg-[var(--highlight)] text-[var(--text2)] px-4 py-2 rounded hover:bg-[var(--highlight-dark)] disabled:opacity-60"
          disabled={loading}
        >
          {loading ? t("consent.modal.acceptingButton") : t("consent.modal.acceptButton")}
        </button>
      </div>
    </div>
  );
}
