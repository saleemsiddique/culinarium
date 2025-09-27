// app/not-found.tsx  (SERVER: sin "use client")
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="h-full w-full grid place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-gray-900">404</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-gray-900 sm:text-7xl">
          Página no encontrada
        </h1>
        <p className="mt-6 text-lg text-gray-500 sm:text-xl/8">
          Lo sentimos, no pudimos encontrar la página que estás buscando.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/"
            className="rounded-md bg-gradient-to-r from-[var(--highlight)] to-[var(--highlight-dark)] px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
