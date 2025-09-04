// app/auth/login/page.tsx
"use client";

import { AuthForm } from "@/components/AuthForm";
import { SocialAuth } from "@/components/SocialAuth";
import { AuthRedirect } from "@/components/AuthRedirect";
import Link from "next/link";

export default function LoginPage() {
  return (
    <AuthRedirect>
      <main className="h-full w-full bg-[var(--background)] pt-32 pb-12 px-2 flex items-center justify-center bg-gray-50">
        <section className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-1">Welcome Back</h1>
          <p className="text-gray-600 mb-6 text-sm">Please log in to continue</p>
          <AuthForm type="login" />
          <div className="my-6 w-full flex items-center gap-2">
            <span className="flex-1 border-t border-gray-200" />
            <span className="text-gray-400 text-xs">Or log in with:</span>
            <span className="flex-1 border-t border-gray-200" />
          </div>
          <SocialAuth />
          <Link href="/auth/register" className="text-xs text-blue-500 mt-6">
            No account yet? Sign Up
          </Link>
        </section>
      </main>
    </AuthRedirect>
  );
}
