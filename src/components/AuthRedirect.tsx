"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/user-context";
import LoaderSkeleton from "@/components/LoaderSkeleton";

interface AuthRedirectProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function AuthRedirect({ 
  children, 
  redirectTo = "/kitchen" 
}: AuthRedirectProps) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoaderSkeleton />
      </div>
    );
  }

  // Si hay usuario, no renderizar nada (se redirigirá)
  if (user) {
    return null;
  }

  // Renderizar el contenido de auth si no hay usuario
  return <>{children}</>;
} 