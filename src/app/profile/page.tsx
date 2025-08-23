// components/ProfileContent.tsx
"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useUser } from "@/context/user-context";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  CreditCard,
  Calendar,
  AlertTriangle,
  Edit,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  User,
  Mail,
  Crown,
  Coins,
  Settings,
  LogOut,
  History,
  BookOpen,
  Shield,
  Zap,
} from "lucide-react";
import { useSubscription } from "@/context/subscription-context";
import EmbeddedCheckoutButton from "@/components/EmbeddedCheckoutForm";
//import Onboarding from "@/components/onboarding";

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
  const [showOnboarding, setShowOnboarding] = useState(false);

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

  useEffect(() => {
    const hasSeen = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeen) {
      setShowOnboarding(true);
    }
  }, []);

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
    return { text: "Activa", color: "text-emerald-600" };
  };

  const subscriptionStatus = getSubscriptionStatus();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[var(--background)] via-[var(--background)] to-orange-50 py-18 px-4">
      {/* Showing OnBoarding al hacer cliq al boton */}
      {showOnboarding /* && <Onboarding onClose={() => setShowOnboarding(false)} /> */}
      
      <div className="max-w-6xl mx-auto">
        {/* Header with Profile Picture Placeholder */}
        <div className="text-center mb-12">
          <div className="relative inline-block">
            <div className="w-26 h-26 bg-gradient-to-br from-[var(--highlight)] to-[var(--highlight-dark)] rounded-full flex items-center justify-center shadow-2xl mb-6 border-4 border-white">
              <User className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-[var(--foreground)] mb-2">
            ¡Hola, {user?.firstName}!
          </h1>
          <p className="text-[var(--foreground)] opacity-70 text-lg">
            Gestiona tu perfil y configuraciones
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column - Personal Info */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Personal Information Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-orange-100 shadow-xl p-6">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-[var(--highlight)] to-[var(--highlight-dark)] rounded-lg p-2 mr-3">
                  <User className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-[var(--foreground)]">
                  Información Personal
                </h2>
              </div>

              {/* Name Section */}
              <div className="mb-6">
                <label className="text-sm font-medium text-[var(--foreground)] opacity-70 block mb-2">
                  Nombre
                </label>
                {!isEditingName ? (
                  <div className="flex items-center justify-between bg-gray-50/80 rounded-xl p-3 border border-gray-100">
                    <span className="text-[var(--foreground)] font-medium">{user?.firstName}</span>
                    <Button
                      onClick={() => setIsEditingName(true)}
                      variant="ghost"
                      size="sm"
                      className="p-2 h-8 w-8 text-[var(--highlight)] hover:bg-orange-100 rounded-lg"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] focus:border-transparent bg-white"
                      placeholder="Ingresa tu nombre"
                      disabled={isSavingName}
                    />
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleSaveName}
                        size="sm"
                        className="flex-1 bg-[var(--highlight)] text-white hover:bg-[var(--highlight-dark)] rounded-xl"
                        disabled={isSavingName}
                      >
                        {isSavingName ? "Guardando..." : <><Save className="h-4 w-4 mr-1" /> Guardar</>}
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        variant="outline"
                        size="sm"
                        className="px-4 border-gray-300 text-gray-600 hover:bg-gray-100 rounded-xl"
                        disabled={isSavingName}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Email Section */}
              <div>
                <label className="text-sm font-medium text-[var(--foreground)] opacity-70 block mb-2">
                  Email
                </label>
                <div className="flex items-center bg-gray-50/80 rounded-xl p-3 border border-gray-100">
                  <Mail className="h-4 w-4 text-[var(--highlight)] mr-2" />
                  <span className="text-[var(--foreground)]">{user?.email}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-orange-100 shadow-xl p-6">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-[var(--highlight)]" />
                Acciones Rápidas
              </h3>
              <div className="space-y-3">
                <Button
                  onClick={handleCustomerPortal}
                  className="w-full justify-start bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/90 text-white hover:from-[var(--primary)]/90 hover:to-[var(--primary)]/80 rounded-xl py-3 shadow-lg"
                >
                  <CreditCard className="h-4 w-4 mr-3" />
                  Billing
                </Button>
                <Button
                  onClick={handlePaymentHistory}
                  className="w-full justify-start bg-gradient-to-r from-[var(--highlight)] to-[var(--highlight-dark)] text-white hover:from-[var(--highlight)]/90 hover:to-[var(--highlight-dark)]/90 rounded-xl py-3 shadow-lg"
                >
                  <History className="h-4 w-4 mr-3" />
                  Historial de Pagos
                </Button>
                <Button
                  onClick={() => setShowOnboarding(true)}
                  className="w-full justify-start bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 rounded-xl py-3 shadow-lg"
                >
                  <BookOpen className="h-4 w-4 mr-3" />
                  Cómo Funciona
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Subscription Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Premium Subscription Card */}
            {user?.isSubscribed && (
              <div className="bg-gradient-to-br from-[var(--primary)] via-[var(--primary)] to-slate-800 text-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="bg-[var(--highlight)] rounded-full p-3 mr-4">
                        <Crown className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">Suscripción Premium</h2>
                        <p className="text-white/80">Disfruta de todos los beneficios</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        subscriptionStatus.text === 'Activa' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-[var(--highlight)]/20 text-orange-300'
                      }`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          subscriptionStatus.text === 'Activa' ? 'bg-emerald-300' : 'bg-orange-300'
                        }`}></div>
                        {subscriptionStatus.text}
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                      <div className="flex items-center mb-2">
                        <Calendar className="h-5 w-5 text-[var(--highlight)] mr-2" />
                        <span className="text-sm text-white/80">Próxima facturación</span>
                      </div>
                      <p className="text-xl font-semibold">
                        {subscription?.endsAt ? formatDate(subscription.endsAt.toDate()) : "N/A"}
                      </p>
                    </div>
                    
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                      <div className="flex items-center mb-2">
                        <Coins className="h-5 w-5 text-[var(--highlight)] mr-2" />
                        <span className="text-sm text-white/80">Tokens disponibles</span>
                      </div>
                      <p className="text-xl font-semibold text-[var(--highlight)]">
                        {totalOfTokens.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Subscription Actions */}
                  {user?.isSubscribed && !user?.subscriptionCanceled && user?.subscriptionStatus !== "payment_failed" && (
                    <div className="flex justify-center">
                      <Button
                        onClick={() => setShowCancelDialog(true)}
                        variant="outline"
                        className="border-red-400/50 text-red-300 hover:bg-red-500/20 hover:border-red-400 rounded-xl backdrop-blur-sm"
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Cancelar Suscripción
                      </Button>
                    </div>
                  )}

                  {/* Payment Failed Action */}
                  {user?.subscriptionStatus === "payment_failed" && (
                    <div className="text-center">
                      <Button
                        onClick={() => setShowCancelNowDialog(true)}
                        className="bg-red-600 text-white hover:bg-red-700 rounded-xl"
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Cancelar Suscripción Ahora
                      </Button>
                    </div>
                  )}

                  {/* Cancelled Subscription Notice */}
                  {user?.isSubscribed && user?.subscriptionCanceled && (
                    <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-6 backdrop-blur-sm">
                      <div className="flex items-center justify-center mb-4">
                        <AlertTriangle className="h-6 w-6 text-red-300 mr-3" />
                        <p className="text-red-200 font-medium text-center">
                          Tu suscripción ha sido cancelada pero seguirás teniendo acceso hasta el{" "}
                          {subscription?.endsAt ? formatDate(subscription.endsAt.toDate()) : "final del período"}
                        </p>
                      </div>
                      <div className="text-center">
                        <Button
                          onClick={() => setShowReactivateDialog(true)}
                          className="bg-[var(--highlight)] text-white hover:bg-[var(--highlight-dark)] rounded-xl"
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Reactivar Suscripción
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Free Account Upgrade Card */}
            {!user?.isSubscribed && (
              <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 rounded-2xl border-2 border-dashed border-[var(--highlight)]/30 p-8 text-center">
                <div className="bg-gradient-to-r from-[var(--highlight)] to-[var(--highlight-dark)] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--foreground)] mb-3">
                  Cuenta Gratuita
                </h2>
                <p className="text-[var(--foreground)]/70 mb-6 text-lg">
                  Desbloquea todo el potencial con Premium
                </p>
                <div className="max-w-md mx-auto">
                  <EmbeddedCheckoutButton
                    priceId={"price_1RrJVF2LSjDC5txTR6lOQslg"}
                    user={user}
                  />
                </div>
              </div>
            )}

            {/* Logout Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-orange-100 shadow-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1">
                    Cerrar Sesión
                  </h3>
                  <p className="text-[var(--foreground)]/60 text-sm">
                    Salir de tu cuenta de forma segura
                  </p>
                </div>
                <Button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 rounded-xl px-6 py-3 shadow-lg"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All Modals (unchanged functionality) */}
      {/* Modal de confirmación de cancelación */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-orange-100">
            <div className="text-center text-[var(--foreground)]">
              <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">¿Cancelar Suscripción?</h3>
              <p className="text-[var(--foreground)]/70 mb-8 leading-relaxed">
                Tu suscripción se cancelará, pero mantendrás acceso a todas las funciones Premium hasta el final de tu período actual de facturación.
              </p>
              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowCancelDialog(false)}
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-100 rounded-xl py-3"
                  disabled={isLoading}
                >
                  Mantener Suscripción
                </Button>
                <Button
                  onClick={handleCancelSubscription}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl py-3"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-orange-100">
            <div className="text-center text-[var(--foreground)]">
              <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">¿Cancelar Suscripción?</h3>
              <p className="text-[var(--foreground)]/70 mb-8 leading-relaxed">
                Tu suscripción se cancelará de inmediato y perderás acceso a todas las funciones Premium.
              </p>
              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowCancelNowDialog(false)}
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-100 rounded-xl py-3"
                  disabled={isLoading}
                >
                  Mantener Suscripción
                </Button>
                <Button
                  onClick={handleCancelImmediateSubscription}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl py-3"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-orange-100">
            <div className="text-center text-[var(--foreground)]">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Zap className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">¿Reactivar Suscripción?</h3>
              <p className="text-[var(--foreground)]/70 mb-8 leading-relaxed">
                Tu suscripción se reactivará y tendrás acceso a todas las funciones Premium nuevamente.
              </p>
              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowReactivateDialog(false)}
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-100 rounded-xl py-3"
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleReactivateSubscription}
                  className="flex-1 bg-[var(--highlight)] hover:bg-[var(--highlight-dark)] text-white rounded-xl py-3"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-orange-100">
            <div className="text-center text-[var(--foreground)]">
              <div className={`rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 ${
                messageModal.isError ? 'bg-red-100' : 'bg-green-100'
              }`}>
                {messageModal.isError ? (
                  <AlertCircle className="h-8 w-8 text-red-500" />
                ) : (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                )}
              </div>
              <h3 className="text-xl font-bold mb-3">{messageModal.title}</h3>
              <p className="text-[var(--foreground)]/70 mb-8 leading-relaxed">
                {messageModal.text}
              </p>
              <Button
                onClick={() => setMessageModal({ ...messageModal, visible: false })}
                className="bg-[var(--highlight)] hover:bg-[var(--highlight-dark)] text-white rounded-xl px-8 py-3"
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