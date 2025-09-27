// app/auth/register/page.tsx
"use client";

import { AuthForm } from "@/components/AuthForm";
import { SocialAuth } from "@/components/SocialAuth";
import { AuthRedirect } from "@/components/AuthRedirect";
import Link from "next/link";
import { useTranslation } from "react-i18next";
export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  const { t } = useTranslation();

  return (
    <AuthRedirect>
      <main className="h-full w-full bg-[var(--background)] pt-24 pb-12 px-2 flex items-center justify-center bg-gray-50">
        <section className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-8">{t("auth.register.title")}</h1>
          <AuthForm type="register" />
          <div className="my-6 w-full flex items-center gap-2">
            <span className="flex-1 border-t border-gray-200" />
            <span className="text-gray-400 text-xs">{t("auth.register.socialDivider")}</span>
            <span className="flex-1 border-t border-gray-200" />
          </div>
          <SocialAuth />
          <Link href="/auth/login" className="text-xs text-blue-500 mt-6">
            {t("auth.register.alreadyAccount")}
          </Link>
        </section>
      </main>
    </AuthRedirect>
  );
}
