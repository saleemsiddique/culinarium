"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export default function InAppBrowserGuard() {
    const { t, i18n } = useTranslation();

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
                <h1 className="text-xl font-bold mb-4">{t("inAppBrowser.title")}</h1>
                <p className="mb-4">{t("inAppBrowser.description")}</p>

                <p className="text-sm text-gray-600">
                    {t("inAppBrowser.instruction")}
                </p>

                <div className="mt-4">
                    <button
                        onClick={() => i18n.changeLanguage("en")}
                        className={`mr-2 px-3 py-1 text-sm rounded-xl transition-colors ${i18n.language === "en"
                            ? "bg-gradient-to-r from-[var(--highlight)] to-[var(--highlight-dark)] text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                    >
                        English
                    </button>

                    <button
                        onClick={() => i18n.changeLanguage("es")}
                        className={`px-3 py-1 text-sm rounded-xl transition-colors ${i18n.language === "es"
                            ? "bg-gradient-to-r from-[var(--highlight)] to-[var(--highlight-dark)] text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                    >
                        Español
                    </button>
                </div>
            </div>
        </div>
    );
}
