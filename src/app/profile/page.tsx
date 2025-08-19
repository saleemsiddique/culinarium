// components/ProfileContent.tsx
"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useUser } from "@/context/user-context";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CreditCard,
  Calendar,
  AlertTriangle,
  Edit,
  Save,
  X,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useSubscription } from "@/context/subscription-context";
import EmbeddedCheckoutButton from "@/components/EmbeddedCheckoutForm";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user, logout, updateUserName } = useUser();
  const { subscription } = useSubscription();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showCancelNowDialog, setShowCancelNowDialog] = useState(false);
  const [showReactivateDialog, setShowReactivateDialog] = useState(false);

  // Estados para editar nombre
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.firstName || "");
  const [isSavingName, setIsSavingName] = useState(false);

  // Estado para el modal de mensaje
  const [messageModal, setMessageModal] = useState({
    visible: false,
    title: "",
    text: "",
    isError: false,
  });

  const totalOfTokens = (user?.monthly_tokens ?? 0) + (user?.extra_tokens ?? 0);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handlePaymentHistory = async () => {
    try {
      router.push("/profile/payment_history");
    } catch (error) {
      console.error("Error al entrar en payment history:", error);
    }
  };

  const handleCustomerPortal = async () => {
    try {
      router.push("/profile/billing");
    } catch (error) {
      console.error("Error al entrar en billing:", error);
    }
  };

  // Función para guardar el nuevo nombre
  const handleSaveName = async () => {
    if (!newName.trim()) {
      setMessageModal({
        visible: true,
        title: "Error",
        text: "El nombre no puede estar vacío.",
        isError: true,
      });
      return;
    }

    setIsSavingName(true);
    try {
      // Si tienes una función updateUserName en tu contexto de usuario
      if (updateUserName) {
        await updateUserName(newName.trim());
      } else {
        // Alternativa: hacer la llamada directa a la API
        const response = await fetch("/api/user/update-name", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user?.uid,
            firstName: newName.trim(),
          }),
        });

        if (!response.ok) {
          throw new Error("Error al actualizar el nombre");
        }
      }

      setIsEditingName(false);
      setMessageModal({
        visible: true,
        title: "Éxito",
        text: "Nombre actualizado exitosamente.",
        isError: false,
      });

      // Si no tienes la función updateUserName en el contexto, puedes recargar
      if (!updateUserName) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error:", error);
      setMessageModal({
        visible: true,
        title: "Error",
        text: "Error al actualizar el nombre. Por favor, inténtalo de nuevo.",
        isError: true,
      });
    } finally {
      setIsSavingName(false);
    }
  };

  // Función para cancelar la edición
  const handleCancelEdit = () => {
    setNewName(user?.firstName || "");
    setIsEditingName(false);
  };

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

      setMessageModal({
        visible: true,
        title: "Suscripción Cancelada",
        text: "Suscripción cancelada exitosamente. Mantendrás acceso hasta el final del período actual.",
        isError: false,
      });

      window.location.reload();
    } catch (error) {
      console.error("Error:", error);
      setMessageModal({
        visible: true,
        title: "Error",
        text: "Error al cancelar la suscripción. Por favor, inténtalo de nuevo.",
        isError: true,
      });
    } finally {
      setIsLoading(false);
      setShowCancelDialog(false);
      setShowReactivateDialog(false);
    }
  };

  const handleCancelImmediateSubscription = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/subscription/cancel-now", {
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

      setMessageModal({
        visible: true,
        title: "Suscripción Cancelada",
        text: "Suscripción cancelada exitosamente.",
        isError: false,
      });

      window.location.reload();
    } catch (error) {
      console.error("Error:", error);
      setMessageModal({
        visible: true,
        title: "Error",
        text: "Error al cancelar la suscripción. Por favor, inténtalo de nuevo.",
        isError: true,
      });
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

      setMessageModal({
        visible: true,
        title: "Suscripción Reactivada",
        text: "Suscripción reactivada exitosamente.",
        isError: false,
      });

      window.location.reload();
    } catch (error) {
      console.error("Error:", error);
      setMessageModal({
        visible: true,
        title: "Error",
        text: "Error al reactivar la suscripción. Por favor, inténtalo de nuevo.",
        isError: true,
      });
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
        color: "text-[var(--highlight)]",
      };
    if (user?.subscriptionStatus === "payment_failed") {
      return {
        text: "Pago Fallido. Gestiona tu suscripción",
        color: "text-[var(--highlight)]",
      };
    }
    return { text: "Activa", color: "text-green-600" };
  };

  const subscriptionStatus = getSubscriptionStatus();

  return (
    <div className="h-full w-full min-h-screen bg-[var(--background)] flex items-center justify-center md:py-24">
      <section className="bg-white bg-opacity-90 backdrop-blur-md rounded-[var(--radius)] border border-white border-opacity-20 shadow-2xl p-8 max-w-2xl w-full text-[var(--foreground)] m-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>

          {/* Información Personal */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-[var(--background)] rounded-[var(--radius)] border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Nombre</p>
              {!isEditingName ? (
                <div className="flex items-center justify-center space-x-2">
                  <p className="text-lg font-semibold">{user?.firstName}</p>
                  <Button
                    onClick={() => setIsEditingName(true)}
                    variant="ghost"
                    size="sm"
                    className="p-1 h-6 w-6 text-[var(--foreground)] hover:bg-gray-200"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-2 py-1 text-center rounded-[var(--radius)] border focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]"
                    placeholder="Ingresa tu nombre"
                    disabled={isSavingName}
                  />
                  <div className="flex justify-center space-x-1">
                    <Button
                      onClick={handleSaveName}
                      size="sm"
                      className="px-2 py-1 h-7 bg-[var(--highlight)] text-[var(--text2)] hover:bg-[var(--highlight-dark)]"
                      disabled={isSavingName}
                    >
                      {isSavingName ? (
                        "Guardando..."
                      ) : (
                        <Save className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      variant="outline"
                      size="sm"
                      className="px-2 py-1 h-7 border-gray-400 text-gray-600 hover:bg-gray-200"
                      disabled={isSavingName}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-[var(--background)] rounded-[var(--radius)] border border-gray-200">
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-lg font-semibold">{user?.email}</p>
            </div>
          </div>

          {/* Información de Suscripción */}
          {user?.isSubscribed && (
            <div className="bg-[var(--primary)] text-[var(--text2)] rounded-[var(--radius)] p-6 mb-8">
              <div className="flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6 text-[var(--highlight)] mr-2" />
                <h2 className="text-xl font-semibold">Suscripción Premium</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-sm text-[var(--text2)] opacity-80">
                    Estado
                  </p>
                  <p
                    className={`text-lg font-semibold ${subscriptionStatus.color}`}
                  >
                    {subscriptionStatus.text}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-[var(--text2)] opacity-80">
                    Próxima facturación
                  </p>
                  <div className="flex items-center justify-center">
                    <Calendar className="h-4 w-4 mr-1 text-[var(--highlight)]" />
                    <p className="text-lg font-semibold">
                      {subscription?.endsAt
                        ? formatDate(subscription.endsAt.toDate())
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center mb-4">
                <p className="text-sm text-[var(--text2)] opacity-80">
                  Tokens restantes
                </p>
                <p className="text-2xl font-bold text-[var(--highlight)]">
                  {totalOfTokens}
                </p>
              </div>

              {/* Botón de cancelación */}
              {user?.isSubscribed &&
                !user?.subscriptionCanceled &&
                user?.subscriptionStatus !== "payment_failed" && (
                  <div className="text-center">
                    <Button
                      onClick={() => setShowCancelDialog(true)}
                      variant="outline"
                      className="border-[var(--highlight)] text-[var(--highlight)] hover:bg-[var(--highlight)] hover:text-[var(--text2)]"
                    >
                      Cancelar Suscripción
                    </Button>
                  </div>
                )}

              {/* Botón de cancelación para pagos fallidos*/}
              {user?.subscriptionStatus === "payment_failed" && (
                <div className="text-center mt-4">
                  <Button
                    onClick={() => setShowCancelNowDialog(true)}
                    variant="destructive"
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    Cancelar Suscripción Ahora
                  </Button>
                </div>
              )}

              {/* Mensaje para suscripciones ya canceladas */}
              {user?.isSubscribed && user?.subscriptionCanceled && (
                <div className="bg-black/50 bg-opacity-20 border border-white border-opacity-30 rounded-[var(--radius)] p-4">
                  <div className="flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-[var(--highlight)] mr-2" />
                    <p className="text-sm font-bold">
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
                      className="cursor-pointer bg-[var(--highlight)] text-[var(--text2)] hover:bg-[var(--highlight-dark)]"
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
            <div className="bg-[var(--background)] border border-gray-200 rounded-[var(--radius)] p-6 mb-8">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
                Cuenta Gratuita
              </h2>
              <p className="text-[var(--foreground)] opacity-80 mb-4">
                Actualiza a Premium para obtener más funciones
              </p>
              <EmbeddedCheckoutButton
                priceId={"price_1RrJVF2LSjDC5txTR6lOQslg"}
                user={user}
              />
            </div>
          )}

          {/* Botones */}
          <Button
            onClick={handleCustomerPortal}
            className="cursor-pointer w-full bg-[var(--highlight)] hover:bg-[var(--highlight-dark)] text-[var(--text2)] mb-5"
          >
            Billing
          </Button>
          <Button
            onClick={handlePaymentHistory}
            className="cursor-pointer w-full bg-[var(--highlight)] hover:bg-[var(--highlight-dark)] text-[var(--text2)] mb-5"
          >
            Historial de Pagos
          </Button>
          <Button
            onClick={handleLogout}
            className="cursor-pointer w-full bg-red-600 hover:bg-red-700 text-white"
          >
            Cerrar Sesión
          </Button>
        </div>
      </section>

      {/* Modal de confirmación de cancelación */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[var(--radius)] p-6 max-w-md w-full">
            <div className="text-center text-[var(--foreground)]">
              <AlertTriangle className="h-12 w-12 text-[var(--highlight)] mx-auto mb-4" />
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
                  className="flex-1 border-gray-400 text-gray-600 hover:bg-gray-200"
                  disabled={isLoading}
                >
                  Mantener Suscripción
                </Button>
                <Button
                  onClick={handleCancelSubscription}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Cancelando..." : "Confirmar Cancelación"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de cancelación inmediata */}
      {showCancelNowDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[var(--radius)] p-6 max-w-md w-full">
            <div className="text-center text-[var(--foreground)]">
              <AlertTriangle className="h-12 w-12 text-[var(--highlight)] mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                ¿Cancelar Suscripción?
              </h3>
              <p className="text-gray-600 mb-6">
                Tu suscripción se cancelará de inmediato y perderás acceso a
                todas las funciones Premium.
              </p>
              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowCancelNowDialog(false)}
                  variant="outline"
                  className="flex-1 border-gray-400 text-gray-600 hover:bg-gray-200"
                  disabled={isLoading}
                >
                  Mantener Suscripción
                </Button>
                <Button
                  onClick={handleCancelImmediateSubscription}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
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
          <div className="bg-white rounded-[var(--radius)] p-6 max-w-md w-full">
            <div className="text-center text-[var(--foreground)]">
              <AlertTriangle className="h-12 w-12 text-[var(--highlight)] mx-auto mb-4" />
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
                  className="flex-1 border-gray-400 text-gray-600 hover:bg-gray-200"
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleReactivateSubscription}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Reactivando..." : "Confirmar Reactivación"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de mensaje personalizado */}
      {messageModal.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[var(--radius)] p-6 max-w-md w-full">
            <div className="text-center text-[var(--foreground)]">
              {messageModal.isError ? (
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              ) : (
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              )}
              <h3 className="text-lg font-semibold mb-2">
                {messageModal.title}
              </h3>
              <p className="text-gray-600 mb-6">{messageModal.text}</p>
              <Button
                onClick={() =>
                  setMessageModal({ ...messageModal, visible: false })
                }
                className="bg-[var(--highlight)] hover:bg-[var(--highlight-dark)] text-[var(--text2)]"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
