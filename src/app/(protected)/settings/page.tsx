"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";

export default function SettingsPage() {
  const { user, profile } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match.");
      return;
    }
    setMessage(
      "In a full build this would securely update your password. For this demo we just confirm the flow."
    );
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Account settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage your Abacus portal login details. Renewable energy experts you can
          count on.
        </p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-sm dark:border-slate-800 dark:bg-neutral-950/80">
        <h2 className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-100">Profile</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">These details come from your Abacus account.</p>
        <dl className="mt-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500 dark:text-slate-400">Email</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-50">{user?.email ?? "-"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500 dark:text-slate-400">Role</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-50">{profile?.role ?? "-"}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-sm dark:border-slate-800 dark:bg-neutral-950/80">
        <h2 className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-100">Change password</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-200">
              Current password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-black dark:text-slate-100"
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-200">
                New password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-black dark:text-slate-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-200">
                Confirm new password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-black dark:text-slate-100"
              />
            </div>
          </div>
          {message && <p className="text-xs text-slate-600 dark:text-slate-400">{message}</p>}
          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-brand-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            Update password
          </button>
        </form>
      </section>
    </div>
  );
}
