"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/user-context";

const POLICY_VERSION = process.env.NEXT_PUBLIC_POLICY_VERSION || "0";

export default function ConsentModal() {
  const { user } = useUser();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localConsentVersion = localStorage.getItem("consent_version");

    if (!user) {
      // Usuario anónimo
      if (localConsentVersion === POLICY_VERSION) {
        setShow(false);
      } else {
        setShow(true);
      }
      setLoading(false);
    } else {
      // Usuario logueado → consultar backend
      fetch("/api/consent/me")
        .then((res) => res.json())
        .then((data) => {
          if (data.consent_version === POLICY_VERSION) {
            setShow(false);
          } else {
            setShow(true);
          }
          setLoading(false);
        });
    }
  }, [user]);

  const handleAccept = async () => {
    setLoading(true);

    const payload = {
      version: POLICY_VERSION,
      accepted_at: new Date().toISOString(),
    };

    try {
      if (!user) {
        const res = await fetch("/api/consent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        localStorage.setItem("consent_id", data.id);
        localStorage.setItem("consent_version", POLICY_VERSION);
      } else {
        const res = await fetch("/api/consent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, user_id: user.uid }),
        });
        const data = await res.json();
        localStorage.setItem("consent_id", data.id);
        localStorage.setItem("consent_version", POLICY_VERSION);
      }

      setShow(false);
    } catch (err) {
      console.error(err);
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
          <a href="/terminos" className="text-[var(--highlight)] underline">
            Términos y Condiciones
          </a>
          ,{" "}
          <a href="/privacidad" className="text-[var(--highlight)] underline">
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
        >
          Aceptar
        </button>
      </div>
    </div>
  );
}
