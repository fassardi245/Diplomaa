import React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import localFont from "next/font/local";
import { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import AuditLoginListener from "@/components/admin/AuditLoginListener";
import "./globals.css";

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

const RootLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const user = await currentUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress || "";
  
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${poppins.variable} ${raleway.variable} antialiased`}>
          <AuditLoginListener email={userEmail} />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
};

export default RootLayout;