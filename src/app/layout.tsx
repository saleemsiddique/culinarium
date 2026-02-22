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
import InAppBrowserGuard from "@/components/InAppBrowserGuard";
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
    languages: {
      "es": "https://culinarium.io",
      "en": "https://culinarium.io",
    },
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

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://culinarium.io/#organization",
      "name": "Culinarium",
      "url": "https://culinarium.io",
      "logo": {
        "@type": "ImageObject",
        "url": "https://culinarium.io/Logo-Culinarium.png"
      },
      "sameAs": ["https://twitter.com/CulinariumOfficial"]
    },
    {
      "@type": "WebApplication",
      "@id": "https://culinarium.io/#webapp",
      "name": "Culinarium – Generador de recetas con IA",
      "url": "https://culinarium.io",
      "applicationCategory": "LifestyleApplication",
      "operatingSystem": "Web",
      "description": "Genera recetas personalizadas con IA según tus ingredientes, utensilios disponibles, restricciones dietéticas y estilo de cocina.",
      "offers": [
        {
          "@type": "Offer",
          "name": "Plan Gratuito",
          "price": "0",
          "priceCurrency": "EUR",
          "description": "5 recetas al mes"
        },
        {
          "@type": "Offer",
          "name": "Culinarium Premium",
          "price": "9.99",
          "priceCurrency": "EUR",
          "description": "Recetas ilimitadas con todas las funciones avanzadas",
          "priceSpecification": {
            "@type": "UnitPriceSpecification",
            "price": "9.99",
            "priceCurrency": "EUR",
            "unitCode": "MON"
          }
        }
      ]
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <head>
        <link rel="stylesheet" href="global.css" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased flex flex-col h-screen">
        <UserProvider>
          <SubscriptionProvider>
            <TokenPurchasesProvider>
              <StripeProvider>
                <I18nProvider>
                  <AppReadyProvider>
                    <InAppBrowserGuard/>

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
