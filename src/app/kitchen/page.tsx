"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useUser } from "@/context/user-context";

export default function KitchenPage() {
  return (
    <ProtectedRoute>
      <KitchenContent />
    </ProtectedRoute>
  );
}

function KitchenContent() {
  const { user } = useUser();
  
  return (
    <div className="h-full w-full bg-[var(--background)] text-black flex items-center justify-center">
      <section className="text-4xl md:text-6xl font-bold text-center">
      Próximamente. Hola {user?.displayName || user?.email} 👋
      </section>
    </div>
  );
}
