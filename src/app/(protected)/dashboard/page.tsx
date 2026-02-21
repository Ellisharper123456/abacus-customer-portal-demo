"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCompany, useBookings, useSupportTickets, useCorrespondence, usePromotions } from "@/lib/hooks/useCompanyScopedCollections";
import { toJsDate } from "@/lib/utils/date";
import { useNotifications } from "@/lib/notifications/NotificationContext";
import { useAuth } from "@/lib/auth/AuthContext";

export default function DashboardPage() {
  const router = useRouter();
  const { data: company } = useCompany();
  const { data: bookings } = useBookings();
  const { data: tickets } = useSupportTickets();
  const { data: correspondence } = useCorrespondence();
  const { data: promotions } = usePromotions();
  const { notifications, dismissedIds, dismissNotification, registerInterest } =
    useNotifications();
  const { user, profile } = useAuth();

  if (profile?.role === "admin") {
    router.replace("/admin?section=users");
    return null;
  }

  const nextBooking = bookings
    .slice()
    .sort((a, b) => toJsDate(a.date).getTime() - toJsDate(b.date).getTime())[0];

  const openTickets = tickets.filter((t) => t.status === "Open");
  const latestCorrespondence = correspondence
    .slice()
    .sort(
      (a, b) => toJsDate(b.sentAt).getTime() - toJsDate(a.sentAt).getTime()
    )[0];
  const activePromotion = promotions[0];

  const companyRecord = company[0];

  const relevantNotifications = notifications; // show all in this demo
  const firstUnread = relevantNotifications.find(
    (n) => !dismissedIds.includes(n.id)
  );

  const carePlanLabel = companyRecord?.carePlanType ?? "No care plan on file";
  const carePlanInfo = (() => {
    if (!companyRecord?.carePlanType || !companyRecord.carePlanStartDate) return null;
    const start = toJsDate(companyRecord.carePlanStartDate as any);
    const nowDate = new Date();

    const years =
      companyRecord.carePlanType === "Care Plan 3 years"
        ? 3
        : companyRecord.carePlanType === "Care Plan 2 years"
        ? 2
        : 1;

    const end = new Date(start);
    end.setFullYear(end.getFullYear() + years);

    const msRemaining = end.getTime() - nowDate.getTime();
    let remainingLabel: string;

    if (msRemaining <= 0) {
      remainingLabel = "Plan expired";
    } else {
      const days = Math.round(msRemaining / (1000 * 60 * 60 * 24));
      if (days < 30) {
        remainingLabel = `${days} day${days === 1 ? "" : "s"} remaining`;
      } else {
        const months = Math.round(days / 30);
        remainingLabel = `${months} month${months === 1 ? "" : "s"} remaining`;
      }
    }

    return { start, end, remainingLabel };
  })();

  const carePlanRemaining = carePlanInfo?.remainingLabel ?? null;

  return (
    <div className="space-y-6 relative">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
            {companyRecord?.name ?? "Dashboard"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Welcome back – this is your home for Abacus aftercare, service visits and support.
          </p>
        </div>
      </header>

      {firstUnread && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/40 dark:bg-black/60">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl dark:border dark:border-slate-700 dark:bg-neutral-950">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Message from Abacus
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-50">
                  {firstUnread.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => dismissNotification(firstUnread.id)}
                className="rounded-full p-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              >
                ✕
              </button>
            </div>
            <p className="mb-4 text-sm text-slate-700 dark:text-slate-300">{firstUnread.body}</p>
            {firstUnread.ctaLabel && user && profile && (
              <button
                type="button"
                onClick={() => {
                  registerInterest(firstUnread.id, user.uid, profile.companyId);
                  dismissNotification(firstUnread.id);
                  alert(
                    "Thanks – we\'ve let Abacus know you\'re interested. The team will be in touch."
                  );
                }}
                className="inline-flex items-center rounded-md bg-brand-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
              >
                {firstUnread.ctaLabel}
              </button>
            )}
            {!firstUnread.ctaLabel && (
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                This is an informational update. Close this message to continue
                into your portal.
              </p>
            )}
          </div>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link
          href="/support"
          className="block rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm transition hover:border-brand-300 hover:shadow-md dark:border-slate-800 dark:bg-neutral-950/80"
        >
          <h2 className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
            Service level
          </h2>
          <p className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
            {companyRecord?.serviceLevel ?? "N/A"}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Account manager: {companyRecord?.accountManager ?? "TBC"}
          </p>
          <p className="mt-2 text-[11px] text-brand-600">
            Open your support area →
          </p>
        </Link>
        <Link
          href="/care-plan"
          className="block rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm transition hover:border-brand-300 hover:shadow-md dark:border-slate-800 dark:bg-neutral-950/80"
        >
          <h2 className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
            Care plan
          </h2>
          <p className="text-sm font-medium text-slate-900 dark:text-slate-50">{carePlanLabel}</p>
          {carePlanRemaining && (
            <p className="mt-1 text-xs text-emerald-500">{carePlanRemaining}</p>
          )}
          {!carePlanRemaining && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Speak to Abacus if you&apos;d like to add a care plan.
            </p>
          )}
          {carePlanInfo && (
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Started {carePlanInfo.start.toLocaleDateString()} • Ends {carePlanInfo.end.toLocaleDateString()}
            </p>
          )}
          {companyRecord?.carePlanPricePerMonth && (
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              £{companyRecord.carePlanPricePerMonth.toFixed(2)} per month
              {companyRecord.carePlanBillingFrequency === "Annual" && " (billed annually)"}
            </p>
          )}
          {companyRecord?.carePlanNextPaymentDate && (
            <p className="mt-1 text-[11px] text-slate-500">
              Next payment {toJsDate(companyRecord.carePlanNextPaymentDate as any).toLocaleDateString()}
            </p>
          )}
          <p className="mt-2 text-[11px] text-brand-600 dark:text-brand-400">
            View your care plan →
          </p>
        </Link>
        <Link
          href={nextBooking ? `/bookings?selected=${nextBooking.id}` : "/bookings"}
          className="block rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm transition hover:border-brand-300 hover:shadow-md dark:border-slate-800 dark:bg-neutral-950/80"
        >
          <h2 className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
            Next booking
          </h2>
          {nextBooking ? (
            <div className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
              <p>{toJsDate(nextBooking.date).toLocaleDateString()}</p>
              {nextBooking.timeWindow && <p>{nextBooking.timeWindow}</p>}
              {nextBooking.engineer && (
                <p className="text-xs text-slate-500 dark:text-slate-400">Engineer: {nextBooking.engineer}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">No upcoming bookings.</p>
          )}
          <p className="mt-2 text-[11px] text-brand-600 dark:text-brand-400">
            View all bookings and details →
          </p>
        </Link>
        <Link
          href="/support#tickets"
          className="block rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm transition hover:border-brand-300 hover:shadow-md dark:border-slate-800 dark:bg-neutral-950/80"
        >
          <h2 className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
            Open support tickets
          </h2>
          <p className="text-3xl font-semibold text-slate-900 dark:text-slate-50">{openTickets.length}</p>
          <p className="mt-2 text-[11px] text-brand-600 dark:text-brand-400">
            Jump to your ticket history →
          </p>
        </Link>
        <Link
          href={latestCorrespondence ? `/correspondence?selected=${latestCorrespondence.id}` : "/correspondence"}
          className="block rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm transition hover:border-brand-300 hover:shadow-md dark:border-slate-800 dark:bg-neutral-950/80"
        >
          <h2 className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
            Latest update
          </h2>
          {latestCorrespondence ? (
            <div className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
              <p className="font-medium text-slate-900 dark:text-slate-50">{latestCorrespondence.subject}</p>
              <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                {latestCorrespondence.body}
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">No recent correspondence.</p>
          )}
          <p className="mt-2 text-[11px] text-brand-600 dark:text-brand-400">
            Read the full message history →
          </p>
        </Link>
      </div>

      {activePromotion && (
        <Link
          href="/rewards"
          className="block rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 transition hover:border-amber-300 hover:shadow-md dark:border-amber-400/80 dark:bg-black dark:text-amber-50"
        >
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-900 dark:text-amber-200">
            Active promotion
          </h2>
          <p className="font-medium text-amber-900 dark:text-amber-100">{activePromotion.title}</p>
          <p className="text-xs text-amber-900/80 dark:text-amber-200/90">
            {activePromotion.description}
          </p>
          <p className="mt-2 text-[11px] text-amber-900/80 dark:text-amber-300">
            Refer a friend and see your rewards →
          </p>
        </Link>
      )}
    </div>
  );
}
