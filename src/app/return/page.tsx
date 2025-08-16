"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface SessionData {
  status: string;
}

export default function CheckoutReturn() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkSession() {
      if (!sessionId) {
        setError("No se encontró ID de sesión");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/check-session?session_id=${sessionId}`);
        const data = await response.json();
        
        if (response.ok) {
          setSession(data.session);
          
          // Si el pago fue exitoso, disparar evento de actualización de tokens
          if (data.session.status === 'complete') {
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('token_update'));
            }, 500);
          }
        } else {
          setError(data.error || "Error al verificar la sesión");
        }
      } catch (err) {
        console.error('Error checking session:', err);
        setError("Error al verificar el pago");
      } finally {
        setLoading(false);
      }
    }

    checkSession();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Verificando pago...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-gray-600 mt-2">{error}</p>
          <Link 
            href="/" 
            className="mt-4 inline-block bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  if (session?.status === "open") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Pago fallido</h1>
          <p className="text-gray-600 mt-2">El pago no se completó correctamente.</p>
          <Link 
            href="/" 
            className="mt-4 inline-block bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  if (session?.status === "complete") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-green-600">¡Pago exitoso!</h1>
          <p className="text-gray-600 mt-2">
            Gracias por tu compra. Tus tokens se han actualizado automáticamente.
          </p>
          <Link 
            href="/kitchen" 
            className="mt-4 inline-block bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Ir al Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
        <p className="text-gray-600 mt-4">Procesando pago...</p>
      </div>
    </div>
  );
}