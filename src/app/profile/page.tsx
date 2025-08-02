"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useUser } from "@/context/user-context";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user, logout } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="h-full w-full bg-[var(--background)] flex items-center justify-center p-4">
      <section className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-6">Mi Perfil</h1>

          <div className="space-y-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Nombre</p>
              <p className="text-lg font-semibold">{user?.firstName}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-lg font-semibold">{user?.email}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Cuenta verificada</p>
              <p className="text-lg font-semibold">{user?.isSubscribed ? "Si" : "No"}</p>
            </div>
          </div>

          <Button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white"
          >
            Cerrar Sesión
          </Button>
        </div>
      </section>
    </div>
  );
}
