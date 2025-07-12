"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with Supabase password reset
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 w-full max-w-md border border-gray-200 dark:border-gray-800">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Forgotten your password?
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
          There is nothing to worry about, we’ll send you a message to help you reset your password.
        </p>
        {submitted ? (
          <div className="text-center text-green-600 dark:text-green-400 font-medium">
            If an account exists for <span className="font-semibold">{email}</span>, you’ll receive a password reset link shortly.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter personal or work email address"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Send Reset Link
            </button>
          </form>
        )}
        <div className="mt-8 text-center">
          <Link href="/auth/login" className="text-orange-600 hover:text-orange-500 font-medium">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
} 