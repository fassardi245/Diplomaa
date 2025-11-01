import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "SMARTCLOTH",
  description: "Tienda de ropa online",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

export default RootLayout;
