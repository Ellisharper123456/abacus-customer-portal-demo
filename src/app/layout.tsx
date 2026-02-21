import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import ClientProviders from "./ClientProviders";

export const metadata: Metadata = {
  title: "Abacus Customer Portal",
  description: "Customer portal for Abacus clients",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased transition-colors dark:bg-slate-950 dark:text-slate-50">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
