"use client";

import { createContext, useContext } from "react";

export type AdminSection = "users" | "care-plans" | "tickets" | "upsell" | "correspondence";

interface AdminSectionContextValue {
  section: AdminSection;
  setSection: (section: AdminSection) => void;
}

export const AdminSectionContext = createContext<AdminSectionContextValue | undefined>(
  undefined,
);

export function useAdminSection() {
  const ctx = useContext(AdminSectionContext);
  if (!ctx) throw new Error("useAdminSection must be used within AdminSectionContext provider");
  return ctx;
}
