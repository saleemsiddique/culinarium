"use client"

import Footer from "@/components/footer";
import "./globals.css";
import Header from "@/components/header";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased flex flex-col h-screen">
        <Header isLoggedIn={true} />
        
        {/* Contenedor que crece */}
        <div className="flex-1 flex overflow-hidden">
          {children}
        </div>

        <Footer />
      </body>
    </html>
  );
}
