import React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import localFont from "next/font/local";
import { Metadata } from "next";
import "./globals.css";
// 1. Aquí está el import correcto
import AuditLogoutListener from "@/components/admin/AuditLogoutListener";

export const metadata: Metadata = {
  title: "SMARTCLOTH",
  description: "Tienda de ropa online",
};

const poppins = localFont({
  src: "./fonts/Poppins.woff2",
  variable: "--font-poppins",
  weight: "400",
  preload: false,
});
const raleway = localFont({
  src: "./fonts/Raleway.woff2",
  variable: "--font-raleway",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${poppins.variable} ${raleway.variable} antialiased`}>
          
          {/* ▼ 2. AGREGADO: Aquí es donde debe ir el espía para funcionar ▼ */}
          <AuditLogoutListener />
          
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}