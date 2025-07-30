"use client"

import Footer from "@/components/footer";
import "./globals.css";
import Header from "@/components/header";
import { UserProvider } from "@/context/user-context";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased flex flex-col h-screen">
        <UserProvider>
          <Header />
          
          {/* Contenedor que crece */}
          <div className="flex-1 flex">
            {children}
          </div>

          <Footer />
        </UserProvider>
      </body>
    </html>
  ); 
}
