"use client";

import React, { useState, useEffect } from "react";
import {
  Download,
  Calendar,
  DollarSign,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useUser } from "@/context/user-context";

const BillingContent = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    // Si no hay un ID de usuario, no hacemos la llamada
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const fetchBillingData = async () => {
      setLoading(true);
      try {
        // Llama a tu endpoint de API para obtener las facturas
        const res = await fetch(`/api/billing?userId=${user.uid}`);

        if (!res.ok) {
          // Manejar errores de la respuesta HTTP
          throw new Error("Failed to fetch billing data");
        }

        const data = await res.json();
        setInvoices(data.invoices);
      } catch (error) {
        console.error("Error fetching billing data:", error);
        setInvoices([]); // En caso de error, mostramos una lista vacía
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

  const handleDownloadInvoice = async (invoiceId: string) => {
    setLoading(true);
    setTimeout(() => {
      alert(`Simulación: Descargando factura ${invoiceId}`);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="h-full w-full min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto mt-[100px]">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Historial de Facturación
            </h1>
            <p className="text-gray-600">
              Todas tus facturas y pagos realizados.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {invoices.length > 0 ? (
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
                          {new Date(invoice.date).toLocaleDateString("es-ES")}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>
                          {invoice.description}
                          {invoice.subscription && (
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full ml-2">
                              Suscripción
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                          {"0"}{" "}
                          {invoice.currency.toUpperCase()}
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

        {/* Loading Overlay */}
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