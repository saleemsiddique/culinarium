import { stripe } from "@/lib/stripe";
import Link from "next/link";

type Props = {
  searchParams: Promise<{
    session_id?: string;
  }>;
};

async function getSession(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return session;
}

export default async function CheckoutReturn({ searchParams }: Props) {
  // Await searchParams antes de usar sus propiedades
  const params = await searchParams;
  const sessionId = params.session_id;

  // Verificar si sessionId existe
  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-gray-600 mt-2">No se encontró ID de sesión</p>
        </div>
      </div>
    );
  }

  try {
    const session = await getSession(sessionId);

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
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-green-600">¡Pago exitoso!</h1>
            <p className="text-gray-600 mt-2">
              Gracias por tu compra. Tu ID de cliente de Stripe es:{" "}
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                {session.customer as string}
              </span>
            </p>
            <Link 
              href="/" 
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

  } catch (error) {
    console.error('Error retrieving session:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-gray-600 mt-2">
            Hubo un problema al verificar tu pago. Contacta con soporte.
          </p>
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
}