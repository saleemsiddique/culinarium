import Footer from "@/components/footer";
import "./globals.css";
import Header from "@/components/header";
import { UserProvider } from "@/context/user-context";
import { SubscriptionProvider } from "@/context/subscription-context";
import { TokenPurchasesProvider } from "@/context/tokenpurchases-context";
import { StripeProvider } from "@/context/stripe-context";
import ConsentModal from "@/components/ConsentModal";
import AnalyticsGate from "@/components/AnalyticsGate"; // eslint-disable-line @typescript-eslint/no-unused-vars
import I18nProvider from "@/context/i18n-context";
import AppReadyProvider from "@/context/appready-context";
export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Culinarium – Generador de recetas con IA",
  description:
    "Culinarium te ayuda a crear recetas personalizadas según tus ingredientes, preferencias dietéticas y estilo de cocina.",
  keywords: [
    "Culinarium",
    "recetas",
    "inteligencia artificial",
    "IA",
    "generador de recetas",
    "cocina",
    "nutrición",
    "dietas",
    "comida",
  ],
  authors: [{ name: "Culinarium", url: "https://culinarium.io" }],
  creator: "Culinarium",
  publisher: "Culinarium",
  metadataBase: new URL("https://culinarium.io"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Culinarium – Generador de recetas con IA",
    description:
      "Culinarium te ayuda a crear recetas personalizadas según tus ingredientes, preferencias dietéticas y estilo de cocina.",
    url: "https://culinarium.io",
    siteName: "Culinarium",
    images: [
      {
        url: "https://culinarium.io/og-image.png",
        width: 1200,
        height: 630,
        alt: "Culinarium - Generador de recetas con IA",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Culinarium – Generador de recetas con IA",
    description:
      "Culinarium te ayuda a crear recetas personalizadas según tus ingredientes, preferencias dietéticas y estilo de cocina.",
    images: ["https://culinarium.io/og-image.png"],
    creator: "@CulinariumOfficial",
  },
  icons: {
    icon: "/Logo-Culinarium.png", // Debe estar en /public
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased flex flex-col h-screen">
        <UserProvider>
          <SubscriptionProvider>
            <TokenPurchasesProvider>
              <StripeProvider>
                <I18nProvider>
                  <AppReadyProvider>
                  <Header />

                  {/* Modal que solo aparece si es necesario */}
                  {<ConsentModal />}

                  {/* Contenedor que crece */}
                  <div className="flex-1 flex">{children}</div>

                  <Footer />
                  </AppReadyProvider>
                </I18nProvider>
              </StripeProvider>
            </TokenPurchasesProvider>
          </SubscriptionProvider>
        </UserProvider>
        {/* Analytics solo se monta si el usuario acepta analítica */}
        <AnalyticsGate />
      </body>
    </html>
  );
}
