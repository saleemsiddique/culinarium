"use client";

import { useMemo } from "react";

export default function InAppBrowserGuard() {
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

    if (!isInAppBrowser) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-50 p-6">
            <div className="max-w-md text-center">
                <h1 className="text-xl font-bold mb-4">⚠️ Navegador no compatible</h1>
                <p className="mb-4">
                    Estás abriendo esta página desde un navegador interno (por ejemplo TikTok,
                    Instagram o Facebook).
                    Para iniciar sesión necesitas abrir esta página en tu navegador real
                    (Safari, Chrome, etc.).
                </p>

                <p className="text-sm text-gray-600">
                    👉 Pulsa en <strong>⋮ (los tres puntos)</strong> en la parte superior
                    derecha y selecciona <strong>Abrir en el navegador</strong>.
                </p>
            </div>
        </div>
    );
}
