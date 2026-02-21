"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, loading } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const profile = await signIn(identifier, password);
      if (profile.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      const message = err?.message ?? "Unable to sign in. Please try again.";
      setError(message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-black">
      <div className="w-full max-w-md rounded-2xl bg-white/95 p-8 shadow-xl ring-1 ring-slate-200 dark:bg-neutral-950/90 dark:ring-slate-800">
        <h1 className="mb-2 text-center text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Abacus Customer Portal
        </h1>
        <p className="mb-1 text-center text-sm text-slate-500 dark:text-slate-400">
          Renewable energy experts you can count on. Sign in to access your aftercare and rewards.
        </p>
        <p className="mb-6 text-center text-xs text-slate-400 dark:text-slate-500">
          Demo logins: type <span className="font-semibold text-slate-600 dark:text-slate-100">emma</span> for the customer view or <span className="font-semibold text-slate-600 dark:text-slate-100">admin</span> for the Abacus team view (any password).
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Email or username
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-black dark:text-slate-100 dark:placeholder:text-slate-500"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="you@example.com or your username"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-black dark:text-slate-100"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="mt-1 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  setShowReset((prev) => !prev);
                  setResetMessage(null);
                }}
                className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
              >
                Forgot password?
              </button>
            </div>
          </div>
          {error && (
            <p className="text-sm text-red-500" role="alert">
              {error}
            </p>
          )}
          {showReset && (
            <div className="rounded-md bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-300">
              <p className="mb-2 font-medium text-slate-700 dark:text-slate-100">Reset your password</p>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-200">
                Email
              </label>
              <input
                type="email"
                className="mb-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-black dark:text-slate-100"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="you@example.com"
              />
              <button
                type="button"
                onClick={() =>
                  setResetMessage(
                    "In a full build this would email you a secure reset link. For this demo we&apos;ll just assume that step.",
                  )
                }
                className="rounded-md bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-black"
              >
                Send reset link
              </button>
              {resetMessage && (
                <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">{resetMessage}</p>
              )}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
