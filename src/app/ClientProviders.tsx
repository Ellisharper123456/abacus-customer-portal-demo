"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { NotificationProvider } from "@/lib/notifications/NotificationContext";
import { ThemeProvider } from "@/lib/theme/ThemeContext";

function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>{children}</NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default ClientProviders;
