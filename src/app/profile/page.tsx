"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useUser } from "@/context/user-context";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreditCard, Calendar, AlertTriangle, Check } from "lucide-react";
import { useSubscription } from "@/context/subscription-context";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user, logout } = useUser();
  const { subscription } = useSubscription();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showReactivateDialog, setShowReactivateDialog] = useState(false);

  const totalOfTokens = (user?.monthly_tokens ?? 0) + (user?.extra_tokens ?? 0);
  const customerPortalLink = "https://billing.stripe.com/p/login/test_fZu00c7Dz0T31RZg4QcQU00";

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handlePaymentHistory= async () => {
    try {
      router.push("/profile/payment_history");
    } catch (error) {
      console.error("Error al entrar en payment history:", error);
    }
  };

  const handleCustomerPortal = async () => {
    window.location.href = customerPortalLink + "?prefilled_email=" + user?.email;
  }

  const handleCancelSubscription = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.uid,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al cancelar la suscripción");
      }

      const data = await response.json();

      // Actualizar el contexto del usuario con la nueva información
      // Aquí deberías actualizar el contexto del usuario
      alert(
        "Suscripción cancelada exitosamente. Mantendrás acceso hasta el final del período actual."
      );

      // Opcional: recargar la página o actualizar el estado
      window.location.reload();
    } catch (error) {
      console.error("Error:", error);
      alert("Error al cancelar la suscripción. Por favor, inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
      setShowCancelDialog(false);
      setShowReactivateDialog(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/subscription/reactivate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.uid,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al reactivar la suscripción");
      }

      const data = await response.json();

      // Actualizar el contexto del usuario con la nueva información
      // Aquí deberías actualizar el contexto del usuario
      alert("Suscripción reactivada exitosamente..");

      // Opcional: recargar la página o actualizar el estado
      window.location.reload();
    } catch (error) {
      console.error("Error:", error);
      alert(
        "Error al reactivar la suscripción. Por favor, inténtalo de nuevo."
      );
    } finally {
      setIsLoading(false);
      setShowCancelDialog(false);
      setShowReactivateDialog(false);
    }
  };

  const formatDate = (date: string | Date) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getSubscriptionStatus = () => {
    if (!user?.isSubscribed)
      return { text: "Sin suscripción", color: "text-gray-600" };
    if (user?.subscriptionCanceled)
      return {
        text: "Cancelada (activa hasta el final del período)",
        color: "text-orange-600",
      };
    return { text: "Activa", color: "text-green-600" };
  };

  const subscriptionStatus = getSubscriptionStatus();

  return (
    <div className="h-full w-full bg-[var(--background)] flex items-center justify-center p-4">
      <section className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl w-full">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>

          {/* Información Personal */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Nombre</p>
              <p className="text-lg font-semibold">{user?.firstName}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-lg font-semibold">{user?.email}</p>
            </div>
          </div>

          {/* Información de Suscripción */}
          {user?.isSubscribed && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-blue-800">
                  Suscripción Premium
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Estado</p>
                  <p
                    className={`text-lg font-semibold ${subscriptionStatus.color}`}
                  >
                    {subscriptionStatus.text}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600">Próxima facturación</p>
                  <div className="flex items-center justify-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <p className="text-lg font-semibold">
                      {subscription?.endsAt
                        ? formatDate(subscription.endsAt.toDate())
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">Tokens restantes</p>
                <p className="text-2xl font-bold text-green-600">
                  {totalOfTokens}
                </p>
              </div>

              {/* Botón de cancelación */}
              {user?.isSubscribed && !user?.subscriptionCanceled && (
                <div className="text-center">
                  <Button
                    onClick={() => setShowCancelDialog(true)}
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Cancelar Suscripción
                  </Button>
                </div>
              )}

              {/* Mensaje para suscripciones ya canceladas */}
              {user?.isSubscribed && user?.subscriptionCanceled && (
                <div className="bg-orange-100 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                    <p className="text-sm text-orange-700">
                      Tu suscripción ha sido cancelada pero seguirás teniendo
                      acceso hasta el{" "}
                      {subscription?.endsAt
                        ? formatDate(subscription.endsAt.toDate())
                        : "final del período"}
                    </p>
                  </div>
                  <div className="mt-4 text-center">
                    <Button
                      onClick={() => setShowReactivateDialog(true)}
                      variant="outline"
                      className="cursor-pointer border-green-200 text-white bg-green-400 hover:bg-green-50 hover:text-green-600"
                    >
                      Reactivar Suscripción
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Usuario sin suscripción */}
          {!user?.isSubscribed && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Cuenta Gratuita
              </h2>
              <p className="text-gray-600 mb-4">
                Actualiza a Premium para obtener más funciones
              </p>
              <Button
                onClick={() => router.push("/subscription")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Actualizar a Premium
              </Button>
            </div>
          )}
          {/* Botón de historial de pagos */}
          <Button onClick={handleCustomerPortal} className="cursor-pointer w-full bg-orange-500 hover:bg-orange-600 text-white mb-5">
            Billing
          </Button>
          <Button
            onClick={handlePaymentHistory}
            className="cursor-pointer w-full bg-orange-500 hover:bg-orange-600 text-white mb-5"
          >
            Historial de Pagos
          </Button>
          {/* Botón de cerrar sesión */}
          <Button
            onClick={handleLogout}
            className="cursor-pointer w-full bg-red-500 hover:bg-red-600 text-white"
          >
            Cerrar Sesión
          </Button>
        </div>
      </section>

      {/* Modal de confirmación de cancelación */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                ¿Cancelar Suscripción?
              </h3>
              <p className="text-gray-600 mb-6">
                Tu suscripción se cancelará, pero mantendrás acceso a todas las
                funciones Premium hasta el final de tu período actual de
                facturación.
              </p>

              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowCancelDialog(false)}
                  variant="outline"
                  className="flex-1"
                  disabled={isLoading}
                >
                  Mantener Suscripción
                </Button>
                <Button
                  onClick={handleCancelSubscription}
                  className="flex-1 bg-red-500 hover:bg-red-600"
                  disabled={isLoading}
                >
                  {isLoading ? "Cancelando..." : "Confirmar Cancelación"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de reactivación */}
      {showReactivateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                ¿Reactivar Suscripción?
              </h3>
              <p className="text-gray-600 mb-6">
                Tu suscripción se reactivará y tendrás acceso a todas las
                funciones Premium nuevamente.
              </p>

              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowReactivateDialog(false)}
                  variant="outline"
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleReactivateSubscription}
                  className="flex-1 bg-red-500 hover:bg-red-600"
                  disabled={isLoading}
                >
                  {isLoading ? "Cancelando..." : "Confirmar Reactivación"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
