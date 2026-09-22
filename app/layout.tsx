import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "OCCDO — LGU Ormoc",
    template: "%s — OCCDO",
  },
  description:
    "Internal Cooperative Management Information System for the Ormoc City Cooperatives Development Office.",
  robots: {
    index: false,
    follow: false,
  },
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={`${sourceSans.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
