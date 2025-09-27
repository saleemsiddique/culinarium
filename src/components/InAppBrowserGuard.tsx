"use client";

import { useEffect, useState } from "react";

interface Props {
  authStartPath: string;
}

export default function InAppBrowserGuard({ authStartPath }: Props) {
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent
    const isApp =
      ua.includes("fban") ||
      ua.includes("fbav") ||
      ua.includes("instagram") ||
      ua.includes("line") ||
      ua.includes("twitter") ||
      ua.includes("tiktok");

    setIsInAppBrowser(isApp);
  }, []);

  if (isInAppBrowser) return null;
  else
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
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Abrir en navegador
        </a>
      </div>
    </div>
  );
}
