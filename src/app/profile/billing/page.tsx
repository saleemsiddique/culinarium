/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Download,
  Plus,
  Trash2,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useUser } from "@/context/user-context";
import AddCardComponent from "@/components/AddCardComponent";

const BillingContent = () => {
  const [activeTab, setActiveTab] = useState("invoices");

  const [invoices, setInvoices] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  const [loading, setLoading] = useState(true); // Se inicia en true para mostrar el spinner
  const { user } = useUser();
  const [showAddCard, setShowAddCard] = useState(false);
  useEffect(() => {
    // Si no hay un ID de usuario, no hacemos la llamada
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const fetchBillingData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/billing?userId=${user.uid}`);
        if (!res.ok) {
          throw new Error("Failed to fetch billing data");
        }
        const data = await res.json();
        setInvoices(data.invoices || []);
        setPaymentMethods(data.paymentMethods || []);
      } catch (error) {
        console.error("Error fetching billing data:", error);
        setInvoices([]);
        setPaymentMethods([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, [user?.uid]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "open":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "void":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Pagado";
      case "open":
        return "Pendiente";
      case "void":
        return "Anulado";
      default:
        return "Desconocido";
    }
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (invoice && invoice.invoice_pdf) {
      window.open(invoice.invoice_pdf, "_blank");
    } else {
      alert("URL de la factura no encontrada.");
    }
  };

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta tarjeta?")) {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/payment-methods/delete?userId=${user?.uid}&paymentMethodId=${paymentMethodId}`,
          {
            method: "DELETE",
          }
        );

        if (!res.ok) {
          throw new Error("Failed to delete payment method");
        }

        setPaymentMethods((prev) =>
          prev.filter((pm) => pm.id !== paymentMethodId)
        );
        alert("Tarjeta eliminada correctamente.");
      } catch (error) {
        console.error("Error deleting payment method:", error);
        alert("Error al eliminar la tarjeta.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSetDefaultPaymentMethod = async (paymentMethodId: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/payment-methods/default?userId=${user?.uid}&paymentMethodId=${paymentMethodId}`,
        {
          method: "PUT",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to set default payment method");
      }

      setPaymentMethods((prev) =>
        prev.map((pm) => ({
          ...pm,
          is_default: pm.id === paymentMethodId,
        }))
      );
    } catch (error) {
      console.error("Error setting default payment method:", error);
      alert("Error al establecer la tarjeta predeterminada.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto mt-[100px]">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Portal de Facturación
            </h1>
            <p className="text-gray-600">
              Gestiona tus facturas y métodos de pago
            </p>
          </div>

          <div className="border-t border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("invoices")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "invoices"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Facturas
              </button>
              {user?.stripeCustomerId && (
                <button
                  onClick={() => setActiveTab("payment-methods")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "payment-methods"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <CreditCard className="w-4 h-4 inline mr-2" />
                  Métodos de pago
                </button>
              )}
            </nav>
          </div>
        </div>

        {activeTab === "invoices" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Historial de facturas
              </h2>
              <p className="text-gray-600 mt-1">
                Todas tus facturas y pagos realizados
              </p>
            </div>

            {loading ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center border-t border-gray-200">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando facturas...</p>
              </div>
            ) : invoices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Concepto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Importe
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Factura
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                            {new Date(
                              invoice.created * 1000
                            ).toLocaleDateString("es-ES")}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div>
                            {invoice.description ||
                              invoice.lines?.data?.[0]?.description ||
                              "N/A"}
                            {invoice.lines?.data?.[0]?.price?.type ===
                              "recurring" && (
                              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full ml-2">
                                Suscripción
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            {(invoice.amount_due / 100)?.toFixed(2) ?? "0.00"}{" "}
                            {invoice.currency?.toUpperCase()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center">
                            {getStatusIcon(invoice.status)}
                            <span className="ml-2">
                              {getStatusText(invoice.status)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleDownloadInvoice(invoice.id)}
                            disabled={loading || invoice.status !== "paid"}
                            className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md transition-colors ${
                              invoice.status === "paid"
                                ? "text-gray-700 bg-white hover:bg-gray-50"
                                : "text-gray-400 bg-gray-100 cursor-not-allowed"
                            }`}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center border-t border-gray-200">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No tienes facturas disponibles
                </h3>
                <p className="text-gray-600 mb-4">
                  Las facturas aparecerán aquí después de tu primer pago.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "payment-methods" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Métodos de pago
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Gestiona tus tarjetas de crédito y débito
                  </p>
                </div>
                <button
                  onClick={() => setShowAddCard(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir tarjeta
                </button>
              </div>
            </div>

            {showAddCard && user?.stripeCustomerId && (
              <AddCardComponent
                customerId={user.stripeCustomerId}
                setPaymentMethods={setPaymentMethods}
                setShowAddCard={setShowAddCard}
              />
            )}
            <div className="space-y-4">
              {paymentMethods.length > 0 ? (
                paymentMethods.map((pm) => (
                  <div
                    key={pm.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-12 h-8 bg-gradient-to-r rounded flex items-center justify-center ${
                            pm.card.brand === "visa"
                              ? "from-blue-600 to-blue-700"
                              : pm.card.brand === "mastercard"
                              ? "from-red-500 to-red-600"
                              : "from-gray-400 to-gray-500"
                          }`}
                        >
                          <CreditCard className="w-5 h-5 text-white" />
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900 capitalize">
                              {pm.card.brand}
                            </span>
                            <span className="text-gray-600">
                              •••• {pm.card.last4}
                            </span>
                            {pm.is_default && (
                              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                Predeterminada
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            Caduca{" "}
                            {pm.card.exp_month.toString().padStart(2, "0")}/
                            {pm.card.exp_year}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {!pm.is_default && (
                          <button
                            onClick={() => handleSetDefaultPaymentMethod(pm.id)}
                            disabled={loading}
                            className="px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            Establecer como predeterminada
                          </button>
                        )}

                        <button
                          onClick={() => handleDeletePaymentMethod(pm.id)}
                          disabled={loading || pm.is_default}
                          className={`p-2 rounded-md transition-colors ${
                            pm.is_default
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-red-600 hover:bg-red-50"
                          }`}
                          title={
                            pm.is_default
                              ? "No puedes eliminar la tarjeta predeterminada"
                              : "Eliminar tarjeta"
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No tienes métodos de pago
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Añade una tarjeta para continuar con tus pagos
                  </p>
                  <button
                    onClick={() => setShowAddCard(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Añadir primera tarjeta
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-700">Procesando...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingContent;
