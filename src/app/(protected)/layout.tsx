"use client";

import { ReactNode, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { useNotifications } from "@/lib/notifications/NotificationContext";
import { useTheme } from "@/lib/theme/ThemeContext";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, profile, loading, signOut } = useAuth();
  const pathname = usePathname();
  const isAdmin = profile?.role === "admin";
  const searchParams = useSearchParams();
  const { notifications, dismissedIds } = useNotifications();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const unreadCount = notifications.filter(
    (n) => !dismissedIds.includes(n.id)
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-black">
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading your workspace...</p>
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  const adminSection = searchParams.get("section") ?? "users";

  const navItems: { href: string; label: string; section?: string }[] = isAdmin
    ? [
        { href: "/admin?section=users", label: "Users", section: "users" },
        {
          href: "/admin?section=care-plans",
          label: "Care plans",
          section: "care-plans",
        },
        {
          href: "/admin?section=tickets",
          label: "Support tickets",
          section: "tickets",
        },
        {
          href: "/admin?section=upsell",
          label: "Upsell",
          section: "upsell",
        },
        {
          href: "/admin?section=correspondence",
          label: "Correspondence",
          section: "correspondence",
        },
      ]
    : [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/system", label: "Systems" },
        { href: "/bookings", label: "Bookings" },
        { href: "/files", label: "Files" },
        { href: "/support", label: "Support" },
        { href: "/correspondence", label: "Correspondence" },
        { href: "/rewards", label: "Refer a friend" },
        { href: "/settings", label: "Settings" },
      ];

  return (
    <div className="flex min-h-screen bg-slate-100 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-black dark:via-slate-950 dark:to-black">
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white/90 px-4 py-6 backdrop-blur md:flex dark:border-slate-800 dark:bg-neutral-950/70">
        <div className="mb-6 flex items-center gap-3">
          <div className="relative h-8 w-8 overflow-hidden rounded-md bg-slate-100">
            <Image
              src="/Abacus-logo.png"
              alt="Abacus logo"
              fill
              className="object-contain p-1"
              sizes="32px"
              priority
            />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">Abacus Energy Solutions</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your aftercare portal for heat pumps, solar & battery
            </p>
          </div>
        </div>
        <nav className="space-y-1 text-sm">
          {navItems.map((item) => {
            const isAdminNav = isAdmin && item.section;
            const active = isAdminNav
              ? adminSection === item.section
              : pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center rounded-md px-2 py-2 font-medium transition hover:bg-slate-50 dark:hover:bg-slate-800/80 ${
                  active
                    ? "bg-slate-100 text-brand-700 dark:bg-slate-800/90 dark:text-slate-50"
                    : "text-slate-700 dark:text-slate-300"
                }`}
              >
                <span>{item.label}</span>
                {item.href === "/dashboard" && unreadCount > 0 && (
                  <span className="ml-auto inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm hover:border-slate-300 dark:border-slate-700 dark:bg-black/60 dark:text-slate-100"
          >
            {theme === "light" ? "☾ Night mode" : "☼ Day mode"}
          </button>
          <button
            onClick={() => signOut().then(() => router.push("/login"))}
            className="flex items-center justify-center rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            Sign out
          </button>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:hidden dark:border-slate-800 dark:bg-neutral-950/80">
          <div className="flex items-center gap-2">
            <div className="relative h-7 w-7 overflow-hidden rounded-md bg-slate-100">
              <Image src="/Abacus-logo.png" alt="Abacus logo" fill className="object-contain p-1" sizes="28px" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-50">Abacus portal</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Renewable energy experts you can count on</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-[11px] shadow-sm hover:border-slate-300 dark:border-slate-700 dark:bg-black dark:text-slate-100"
            >
              {theme === "light" ? "☾" : "☼"}
            </button>
            {unreadCount > 0 && (
              <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-semibold text-white">
                {unreadCount}
              </span>
            )}
            <button
              type="button"
              onClick={() => setMobileNavOpen((prev) => !prev)}
              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-sm dark:border-slate-700 dark:bg-black dark:text-slate-100"
            >
              Menu
            </button>
          </div>
        </header>
        {mobileNavOpen && (
          <nav className="border-b border-slate-200 bg-white px-4 py-2 text-sm md:hidden dark:border-slate-800 dark:bg-black">
            <div className="flex flex-wrap gap-2">
              {navItems.map((item) => {
                const isAdminNav = isAdmin && item.section;
                const active = isAdminNav
                  ? adminSection === item.section
                  : pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className={`rounded-full px-3 py-1 text-xs font-medium shadow-sm ${
                      active
                        ? "bg-brand-600 text-white"
                        : "bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
        <main className="flex-1 px-0 py-4 sm:px-4 sm:py-6 md:px-8 md:py-8">
          <div className="mx-0 max-w-none rounded-none bg-white p-4 shadow-none ring-0 ring-slate-100 backdrop-blur dark:bg-black md:mx-auto md:max-w-5xl md:rounded-2xl md:bg-white/90 md:p-6 md:shadow-sm md:ring-1 dark:md:bg-neutral-950/80 dark:md:ring-slate-800">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
