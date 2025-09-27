"use client";
import { useEffect, useState } from "react";

interface Props {
  authStartPath?: string; // ruta de tu app que inicia el flujo OAuth, p.ej. "/auth/start?provider=google"
}

function isInAppBrowser(): boolean {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const inappRegex = /(FBAN|FBAV|Instagram|Line|WhatsApp|Twitter|LinkedInApp|FB_IAB|FB4A|MicroMessenger|TikTok|Puffin|WebView)/i;
  const isIosWebview = /iPhone|iPad|iPod/i.test(ua) && !/Safari/i.test(ua);
  return inappRegex.test(ua) || isIosWebview;
}

export default function InAppBrowserGuard({ authStartPath = "/auth/start?provider=google" }: Props) {
  const [isInApp, setIsInApp] = useState(false);

  useEffect(() => {
    setIsInApp(isInAppBrowser());
  }, []);

  const fullAuthUrl = `${location.protocol}//${location.host}${authStartPath}`;

  const openInExternalBrowser = async (url: string) => {
    // 1) Intent for Android (Chrome)
    try {
      const hostAndPath = url.replace(/^https?:\/\//, "");
      const intentUrl = `intent://${hostAndPath}#Intent;scheme=https;package=com.android.chrome;end`;
      // Cambiamos location; si Chrome está instalado debería abrirlo
      window.location.href = intentUrl;
      // Si el intent no hace nada, luego cae al fallback (después de timeout)
    } catch (e) {
      // swallow
    }

    // 2) Fallback: window.open (puede fallar en algunos webviews)
    setTimeout(() => {
      const win = window.open(url, "_blank", "noopener,noreferrer");
      if (win) {
        try { win.focus(); } catch (_) {}
        return;
      }

      // 3) Último fallback: copiar enlace al portapapeles y mostrar instrucciones
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
          alert("Enlace copiado al portapapeles. Ábrelo en Chrome o Safari y continúa el inicio de sesión.");
        }).catch(() => {
          prompt("Copia este enlace y pégalo en tu navegador externo:", url);
        });
      } else {
        prompt("Copia este enlace y pégalo en tu navegador externo:", url);
      }
    }, 600);
  };

  if (!isInApp) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-2 text-lg font-semibold">Abrir en el navegador</h2>
        <p className="mb-4 text-sm text-gray-600">
          Estás usando el navegador dentro de otra app. Ese navegador puede bloquear el inicio de sesión. Abre este enlace en Chrome o Safari para continuar.
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => openInExternalBrowser(fullAuthUrl)}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Abrir en navegador
          </button>

          <button
            onClick={() => {
              // Copiar enlace como acción alternativa rápida
              navigator.clipboard?.writeText(fullAuthUrl)
                .then(() => alert("Enlace copiado. Ábrelo en tu navegador externo."))
                .catch(() => prompt("Copia este enlace y pégalo en tu navegador:", fullAuthUrl));
            }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            Copiar enlace
          </button>
        </div>

        <p className="mt-4 text-xs text-gray-500">
          En iOS puede que tengas que usar el botón Compartir → “Abrir en Safari”. Si la opción de abrir no funciona, pega el enlace en tu navegador externo.
        </p>
      </div>
    </div>
  );
}
