// app/not-found.tsx  (SERVER COMPONENT — sin "use client")
import Link from "next/link";


export const dynamic = "force-static"; // opcional, ayuda a que sea 100% estática



const dict = {
  es: {
    title: "Página no encontrada",
    description: "La página que buscas no existe o fue movida.",
    button: "Volver al inicio",
  },
  en: {
    title: "Page not found",
    description: "The page you’re looking for doesn’t exist or was moved.",
    button: "Go home",
  },
} as const;

// Si quieres, elige idioma por variable de entorno en build:
// const t = process.env.NEXT_PUBLIC_DEFAULT_LOCALE === "en" ? dict.en : dict.es;
const t = dict.es;

export default function NotFound() {
  return (
    <main className="h-full w-full grid place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-gray-900">404</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">
          {t.title}
        </h1>
        <p className="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
          {t.description}
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/"
            className="rounded-md bg-gradient-to-r from-[var(--highlight)] to-[var(--highlight-dark)] px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            {t.button}
          </Link>


        </div>
      </div>
    </main>
  );
}