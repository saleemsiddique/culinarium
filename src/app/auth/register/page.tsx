// app/auth/register/page.tsx
"use client";

import { AuthForm } from "@/components/AuthForm";
import { SocialAuth } from "@/components/SocialAuth";
import { AuthRedirect } from "@/components/AuthRedirect";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <AuthRedirect>
      <main className="h-full w-full bg-[var(--background)] flex items-center justify-center bg-gray-50">
        <section className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-1">Sign Up Free</h1>
          <p className="text-gray-600 mb-6 text-sm">14 day free access to unlimited resources</p>
          <AuthForm type="register" />
          <div className="my-6 w-full flex items-center gap-2">
            <span className="flex-1 border-t border-gray-200" />
            <span className="text-gray-400 text-xs">Or sign up with:</span>
            <span className="flex-1 border-t border-gray-200" />
          </div>
          <SocialAuth />
          <Link href="/auth/login" className="text-xs text-blue-500 mt-6">
            Already have an account?
          </Link>
        </section>
      </main>
    </AuthRedirect>
  );
}
