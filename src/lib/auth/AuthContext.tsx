"use client";

import { ReactNode, createContext, useContext, useState } from "react";
import type { UserProfile } from "@/lib/firebase/types";

interface AuthContextValue {
  user: { uid: string; email: string } | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (identifier: string, password: string) => Promise<UserProfile>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ uid: string; email: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const signIn = async (identifier: string, password: string) => {
    // Demo auth: only two accounts are supported – Emma (customer) and admin.
    if (!identifier) {
      throw new Error("Please enter a username or email");
    }

    setLoading(true);

    try {
      const trimmed = identifier.trim().toLowerCase();

      let email: string;
      let mockProfile: UserProfile;

      if (trimmed === "admin") {
        email = "admin@abacusenergysolutions.co.uk";
        mockProfile = {
          uid: "admin-user",
          companyId: "abacus-internal",
          role: "admin",
        };
      } else if (
        trimmed === "emma" ||
        trimmed === "emma.thompson@example.com" ||
        trimmed === "emma@demo.com"
      ) {
        email = "emma.thompson@example.com";
        mockProfile = {
          uid: "emma-user",
          companyId: "demo-company",
          role: "user",
        };
      } else {
        throw new Error(
          "Demo logins are: 'emma' for the customer view or 'admin' for the Abacus view.",
        );
      }

      setUser({ uid: mockProfile.uid, email });
      setProfile(mockProfile);
      return mockProfile;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
  };

  const value: AuthContextValue = {
    user,
    profile,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
