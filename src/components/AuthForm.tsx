// components/AuthForm.tsx
"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

export function AuthForm({
  type = "login",
}: {
  type: "login" | "register";
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form className="space-y-4">
      {type === "register" && (
        <div className="flex gap-2">
          <Input placeholder="First Name" name="firstName" required />
          <Input placeholder="Last Name" name="lastName" required />
        </div>
      )}
      <Input
        placeholder="Email"
        type="email"
        name="email"
        required
      />
      <div className="relative">
        <Input
          placeholder="Password"
          type={showPassword ? "text" : "password"}
          name="password"
          required
        />
        <button
          type="button"
          className="absolute right-3 top-2 text-gray-400"
          tabIndex={-1}
          onClick={() => setShowPassword((v) => !v)}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {type === "login" ? (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Checkbox id="remember" />
            <label htmlFor="remember" className="select-none text-gray-600">Remember me</label>
          </div>
          <Link href="#" className="text-blue-500 hover:underline">Forgot Password?</Link>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Checkbox id="terms" required />
          <label htmlFor="terms">
            Acepto los <Link href="#" className="text-blue-500 hover:underline">Términos y Condiciones</Link>
          </label>
        </div>
      )}
      <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded">
        {type === "login" ? "Log In" : "Button Text"}
      </Button>
    </form>
  );
}
