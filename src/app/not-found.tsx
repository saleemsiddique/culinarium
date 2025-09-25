"use client";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export default function Example() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleClick = () => {
    router.push("/");
  };

  return (
    <>
      <main className="h-full w-full grid place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center">
          <p className="text-base font-semibold text-gray-900">404</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">
            {t("notFound.title")}
          </h1>
          <p className="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
            {t("notFound.description")}
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <button
              onClick={handleClick}
              className="rounded-md bg-gradient-to-r from-[var(--highlight)] to-[var(--highlight-dark)] px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer"
            >
              {t("notFound.button")}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
