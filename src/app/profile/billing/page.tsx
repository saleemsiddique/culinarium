"use client";

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Download,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  FileText,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Datos de ejemplo para las facturas (simulación)
const DUMMY_INVOICES = [
  {
    id: 'inv_1',
    date: '2025-08-01',
    description: 'Suscripción PRO - Agosto 2025',
    amount: 25.00,
    currency: 'EUR',
    status: 'paid',
    invoice_pdf: '#',
    subscription: true
  },
  {
    id: 'inv_2',
    date: '2025-08-15',
    description: '50 tokens extra',
    amount: 10.00,
    currency: 'EUR',
    status: 'paid',
    invoice_pdf: '#',
    subscription: false
  },
  {
    id: 'inv_3',
    date: '2025-09-01',
    description: 'Suscripción PRO - Septiembre 2025',
    amount: 25.00,
    currency: 'EUR',
    status: 'open',
    invoice_pdf: '#',
    subscription: true
  }
];

// Datos de ejemplo para las tarjetas (simulación)
const DUMMY_PAYMENT_METHODS = [
  {
    id: 'pm_1',
    type: 'card',
    card: {
      brand: 'visa',
      last4: '4242',
      exp_month: 12,
      exp_year: 2027
    },
    is_default: true
  },
  {
    id: 'pm_2',
    type: 'card',
    card: {
      brand: 'mastercard',
      last4: '5555',
      exp_month: 8,
      exp_year: 2026
    },
    is_default: false
  }
];

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const BillingContent = () => {
  const [activeTab, setActiveTab] = useState('invoices');
  const [loading, setLoading] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  
  // Modificación aquí: el estado inicial de las facturas y métodos de pago es un array vacío
  const [invoices, setInvoices] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    // Simular una carga de datos con un pequeño retraso
    // Ahora, en lugar de cargar los datos de ejemplo, iniciamos con arrays vacíos.
    // Este `useEffect` se reemplazará por la llamada a tu API real en el siguiente paso.
    setLoading(true);
    setTimeout(() => {
      // Si quisieras simular un cliente con datos, puedes descomentar las líneas de abajo
      // setInvoices(DUMMY_INVOICES);
      // setPaymentMethods(DUMMY_PAYMENT_METHODS);

      setInvoices([]); // Mantener vacío para clientes nuevos
      setPaymentMethods([]); // Mantener vacío para clientes nuevos
      
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'paid': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'open': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'void': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'paid': return 'Pagado';
      case 'open': return 'Pendiente';
      case 'void': return 'Anulado';
      default: return 'Desconocido';
    }
  };
  
  const handleDownloadInvoice = async (invoiceId: string) => {
    setLoading(true);
    setTimeout(() => {
      alert(`Simulación: Descargando factura ${invoiceId}`);
      setLoading(false);
    }, 1000);
  };

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta tarjeta?')) {
      setLoading(true);
      setTimeout(() => {
        setPaymentMethods(prev => prev.filter(pm => pm.id !== paymentMethodId));
        setLoading(false);
      }, 500);
    }
  };

  const handleSetDefaultPaymentMethod = async (paymentMethodId: string) => {
    setLoading(true);
    setTimeout(() => {
      setPaymentMethods(prev =>
        prev.map(pm => ({
          ...pm,
          is_default: pm.id === paymentMethodId
        }))
      );
      setLoading(false);
    }, 500);
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    // Lógica de simulación
    setLoading(true);
    setTimeout(() => {
      alert("Simulación: Tarjeta añadida correctamente.");
      // Añadir una nueva tarjeta a la lista de forma simulada
      const newDummyCard = {
        id: `pm_${Math.random().toString(36).substring(7)}`,
        type: 'card',
        card: {
          brand: 'visa', // O 'mastercard', etc.
          last4: '9876',
          exp_month: 1,
          exp_year: 2029
        },
        is_default: false
      };
      setPaymentMethods(prev => [...prev.map(pm => ({...pm, is_default: false})), newDummyCard]);
      setShowAddCard(false);
      setLoading(false);
    }, 1500);
  };

  const AddCardForm = () => (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Añadir nueva tarjeta</h3>
      <form onSubmit={handleAddCard}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de tarjeta
            </label>
            <CardElement className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setShowAddCard(false)}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!stripe || !elements || loading}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              Añadir tarjeta
            </button>
          </div>
        </div>
      </form>
    </div>
  );

  return (
    <div className="h-full w-full min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto mt-[100px]">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Portal de Facturación
            </h1>
            <p className="text-gray-600">
              Gestiona tus facturas y métodos de pago
            </p>
          </div>
          
          {/* Navigation Tabs */}
          <div className="border-t border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('invoices')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'invoices'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Facturas
              </button>
              <button
                onClick={() => setActiveTab('payment-methods')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'payment-methods'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <CreditCard className="w-4 h-4 inline mr-2" />
                Métodos de pago
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'invoices' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Historial de facturas
              </h2>
              <p className="text-gray-600 mt-1">
                Todas tus facturas y pagos realizados
              </p>
            </div>
            
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
                            {new Date(invoice.date).toLocaleDateString('es-ES')}
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
                            {invoice.amount.toFixed(2)} {invoice.currency.toUpperCase()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center">
                            {getStatusIcon(invoice.status)}
                            <span className="ml-2">{getStatusText(invoice.status)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleDownloadInvoice(invoice.id)}
                            disabled={loading || invoice.status !== 'paid'}
                            className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md transition-colors ${
                              invoice.status === 'paid'
                                ? 'text-gray-700 bg-white hover:bg-gray-50'
                                : 'text-gray-400 bg-gray-100 cursor-not-allowed'
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

        {activeTab === 'payment-methods' && (
          <div className="space-y-6">
            {/* Add Card Button */}
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

            {/* Add Card Form */}
            {showAddCard && <AddCardForm />}

            {/* Payment Methods List */}
            <div className="space-y-4">
              {paymentMethods.length > 0 ? (
                paymentMethods.map((pm) => (
                  <div
                    key={pm.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-8 bg-gradient-to-r rounded flex items-center justify-center ${
                          pm.card.brand === 'visa'
                            ? 'from-blue-600 to-blue-700'
                            : 'from-red-500 to-red-600'
                        }`}>
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
                            Caduca {pm.card.exp_month.toString().padStart(2, '0')}/{pm.card.exp_year}
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
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                          title={pm.is_default ? 'No puedes eliminar la tarjeta predeterminada' : 'Eliminar tarjeta'}
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

const WrappedBilling = () => (
  <Elements stripe={stripePromise}>
    <BillingContent />
  </Elements>
);

export default WrappedBilling;
