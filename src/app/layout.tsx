"use client"

import Footer from "@/components/footer";
import "./globals.css";
import Header from "@/components/header";
import { UserProvider } from "@/context/user-context";
import { Analytics } from '@vercel/analytics/react';
import ConsentModal from "@/components/ConsentModal"; // <-- nuevo componente

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased flex flex-col h-screen">
        <UserProvider>
          <Header />

          {/* Modal que solo aparece si es necesario */}
          <ConsentModal />

          <div className="flex-1 flex">
            {children}
          </div>

          <Footer />
        </UserProvider>
        <Analytics />
      </body>
    </html>
  );
}
