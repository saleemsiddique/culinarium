"use client";

import Footer from "@/components/footer";
import "./globals.css";
import Header from "@/components/header";
import { UserProvider } from "@/context/user-context";
import { SubscriptionProvider } from "@/context/subscription-context";
import { TokenPurchasesProvider } from "@/context/tokenpurchases-context";
import { StripeProvider } from "@/context/stripe-context";
import ConsentModal from "@/components/ConsentModal";
import AnalyticsGate from "@/components/AnalyticsGate"; // eslint-disable-line @typescript-eslint/no-unused-vars

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
                <Header />

                {/* Modal que solo aparece si es necesario */}
                <ConsentModal />

                {/* Contenedor que crece */}
                <div className="flex-1 flex">{children}</div>

                <Footer />
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
