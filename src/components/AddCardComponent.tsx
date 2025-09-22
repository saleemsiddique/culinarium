/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import React, { useState } from "react";
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import { useUser } from "@/context/user-context";
interface PaymentMethod {
  id: string;
  type: string;
  card: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  is_default: boolean;
}
import CountrySelect from "./countrySelect";
import { useTranslation } from "react-i18next";

interface AddCardComponentProps {
  customerId: string;
  setPaymentMethods: React.Dispatch<React.SetStateAction<PaymentMethod[]>>;
  setShowAddCard: React.Dispatch<React.SetStateAction<boolean>>;
}

const AddCardComponent: React.FC<AddCardComponentProps> = ({
  customerId,
  setPaymentMethods,
  setShowAddCard,
}) => {
  const { user } = useUser();
  const [country, setCountry] = useState<string>("");
  const [postalCode, setPostalCode] = useState<string>("");
  const stripe = useStripe();
  const elements = useElements();
  const [cardholderName, setCardholderName] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const { t } = useTranslation();

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#32325d",
        "::placeholder": { color: "#aab7c4" },
      },
      invalid: { color: "#fa755a" },
    },
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!stripe || !elements) {
      setError(t("billing.addCard.errors.stripeNotLoaded"));
      return;
    }
    if (!cardholderName.trim()) {
      setError(t("billing.addCard.errors.cardholderRequired"));
      return;
    }
    if (!consent) {
      setError(
        t("billing.addCard.errors.consentRequired")
      );
      return;
    }

    setLoading(true);

    try {
      // 1) Pedir al backend el client_secret del SetupIntent
      const createResp = await fetch("/api/payment-methods/attach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId }),
      });

      const createData = await createResp.json();
      if (!createResp.ok)
        throw new Error(createData.error || "Error creando SetupIntent");

      const clientSecret = createData.clientSecret;
      if (!clientSecret)
        throw new Error("No se recibió client_secret del servidor");

      // 2) Confirmar el SetupIntent en el cliente
      const cardElement = elements.getElement(CardNumberElement);
      if (!cardElement) throw new Error(t("billing.addCard.errors.cardElementNotFound"));

      const confirmResult = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { name: cardholderName },
        },
      });

      if (confirmResult.error) {
        throw new Error(
          confirmResult.error.message || "Error confirmando SetupIntent"
        );
      }

      const setupIntent = confirmResult.setupIntent;
      if (!setupIntent || setupIntent.status !== "succeeded") {
        throw new Error(
          t("billing.addCard.errors.authenticationFailed")
        );
      }

      const paymentMethodId = setupIntent.payment_method as string;
      if (!paymentMethodId)
        throw new Error(t("billing.addCard.errors.paymentMethodNotFound"));

      // 3) Avisar al backend para obtener los datos del método y marcar por defecto si aplica
      const completeResp = await fetch("/api/payment-methods/complete-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethodId,
          customerId,
          userEmail: user?.email,
          country,
          postalCode: postalCode || undefined
        }),
      });

      const completeData = await completeResp.json();
      if (!completeResp.ok)
        throw new Error(
          completeData.error || "Error completando setup en servidor"
        );

      // 4) Actualizar estado local con el payment method devuelto
      const pm = completeData.paymentMethod;
      const newPaymentMethod: PaymentMethod = {
        id: pm.id,
        type: pm.type,
        card: {
          brand: pm.card.brand || "unknown",
          last4: pm.card.last4 || "0000",
          exp_month: pm.card.exp_month || 0,
          exp_year: pm.card.exp_year || 0,
        },
        is_default: completeData.isDefault || false,
      };

      setPaymentMethods((prev) => [
        ...prev.map((p) => ({ ...p, is_default: false })),
        newPaymentMethod,
      ]);

      setShowAddCard(false);
      window.location.reload();
    } catch (err: any) {
      console.error("Error añadiendo tarjeta:", err);
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">{t("billing.addCard.title")}</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleAddCard} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("billing.addCard.cardholderName")}
          </label>
          <input
            type="text"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            placeholder="Juan Pérez"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("billing.addCard.cardNumber")}
          </label>
          <div className="w-full min-h-[48px] p-3 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 bg-white">
            <CardNumberElement options={cardElementOptions} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("billing.addCard.expiryDate")}
            </label>
            <div className="w-full min-h-[48px] p-3 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 bg-white">
              <CardExpiryElement options={cardElementOptions} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CVC
            </label>
            <div className="w-full min-h-[48px] p-3 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 bg-white">
              <CardCvcElement options={cardElementOptions} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("billing.addCard.country")}
            </label>
            <div className="w-full min-h-[48px] p-3 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 bg-white">
              <CountrySelect value={country} onChange={setCountry} />
            </div>
            <div>
              {(country === "US" || country === "GB") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("billing.addCard.postalCode.label")}
                  </label>
                  <input
                    type="text"
                    value={postalCode.toLocaleUpperCase()}
                    minLength={5}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder={
                      country === "US" ? "Ej: 94105" : "Ej: SW1A 1AA"
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            id="saveConsent"
            type="checkbox"
            checked={consent}
            onChange={() => setConsent(!consent)}
          />
          <label htmlFor="saveConsent" className="text-sm text-gray-700">
            {t("billing.addCard.consent")}
          </label>
        </div>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => setShowAddCard(false)}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            {t("billing.addCard.buttons.cancel")}
          </button>
          <button
            type="submit"
            disabled={!stripe || loading}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t("billing.addCard.buttons.adding") : t("billing.addCard.buttons.add")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCardComponent;
