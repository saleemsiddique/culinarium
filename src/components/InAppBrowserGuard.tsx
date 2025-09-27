"use client";

import { useMemo } from "react";

interface Props {
  authStartPath: string;
}

export default function InAppBrowserGuard({ authStartPath }: Props) {
  // Detecta si está en un InAppBrowser problemático
  const isInAppBrowser = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent.toLowerCase();
    return (
      ua.includes("tiktok") ||
      ua.includes("instagram") ||
      ua.includes("fbav") ||
      ua.includes("fb_iab") ||
      ua.includes("wv") || // Android WebView
      ua.includes("webview")
    );
  }, []);

  // Detecta si es iOS o Android
  const platform = useMemo(() => {
    if (typeof navigator === "undefined") return "unknown";
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) return "ios";
    if (/android/.test(ua)) return "android";
    return "other";
  }, []);

  if (!isInAppBrowser) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50 p-6">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-bold mb-4">⚠️ Navegador no compatible</h1>
        <p className="mb-4">
          Parece que estás abriendo esta página desde un navegador interno (por
          ejemplo TikTok, Instagram o Facebook).  
          Para poder iniciar sesión de forma segura, por favor abre la página en
          tu navegador habitual.
        </p>

        <a
          href={authStartPath}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 block mb-4"
        >
          Abrir en navegador
        </a>

        {platform === "ios" && (
          <p className="text-sm text-gray-600">
            ℹ️ Si no se abre automáticamente, pulsa{" "}
            <strong>el icono de compartir</strong> (⬆️) y selecciona{" "}
            <strong>Abrir en Safari</strong>.
          </p>
        )}

        {platform === "android" && (
          <p className="text-sm text-gray-600">
            ℹ️ Si no se abre automáticamente, pulsa{" "}
            <strong>⋮ (menú)</strong> y selecciona{" "}
            <strong>Abrir en Chrome</strong>.
          </p>
        )}

        {platform === "other" && (
          <p className="text-sm text-gray-600">
            ℹ️ Abre esta página en tu navegador habitual para continuar.
          </p>
        )}
      </div>
    </div>
  );
}
