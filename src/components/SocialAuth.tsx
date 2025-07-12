// components/SocialAuth.tsx
"use client";

import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";

export function SocialAuth() {
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="w-1/2 flex items-center gap-2 border-yellow-400"
        >
          <FcGoogle size={20} />
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-1/2 flex items-center gap-2 border-yellow-400"
        >
          <FaApple size={20} className="text-yellow-500" />
          Apple
        </Button>
      </div>
    </div>
  );
}
