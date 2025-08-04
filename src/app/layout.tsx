"use client"

import Footer from "@/components/footer";
import "./globals.css";
import Header from "@/components/header";
import { UserProvider } from "@/context/user-context";
import { SubscriptionProvider } from "@/context/subscription-context";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased flex flex-col h-screen">
        <UserProvider>
          <SubscriptionProvider>
          <Header />
          
          {/* Contenedor que crece */}
          <div className="flex-1 flex">
            {children}
          </div>

          <Footer />
          </SubscriptionProvider>
        </UserProvider>
      </body>
    </html>
  ); 
}
