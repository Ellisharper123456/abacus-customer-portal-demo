"use client";

import { useEffect, useState } from "react";
import { useBookings } from "@/lib/hooks/useCompanyScopedCollections";
import { toJsDate } from "@/lib/utils/date";

export default function BookingsPage() {
  const { data: bookings } = useBookings();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("selected");
    if (fromQuery) {
      setSelectedId(fromQuery);
    }
  }, []);

  const now = new Date();
  const upcoming = bookings.filter((b) => toJsDate(b.date) >= now);
  const past = bookings.filter((b) => toJsDate(b.date) < now);

  const selected = bookings.find((b) => b.id === selectedId) ?? null;

  const renderList = (list: typeof bookings) => (
    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
      {list.map((b) => (
        <li key={b.id} className="py-3 text-sm">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-50">
                {toJsDate(b.date).toLocaleDateString()} {b.timeWindow && `• ${b.timeWindow}`}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {b.engineer ? `Engineer: ${b.engineer}` : "Engineer TBC"}
              </p>
            </div>
            <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              {b.status ?? "Scheduled"}
            </span>
          </div>
        </li>
      ))}
      {list.length === 0 && (
        <li className="py-3 text-sm text-slate-500 dark:text-slate-400">No bookings in this category.</li>
      )}
    </ul>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Bookings</h1>
      {selected && (
        <section className="rounded-xl border border-brand-100 bg-brand-50 p-4 text-sm text-slate-900 shadow-sm dark:border-brand-400/60 dark:bg-brand-500/10 dark:text-slate-50">
          <h2 className="mb-1 text-sm font-semibold text-slate-900 dark:text-slate-50">
            Next visit details
          </h2>
          <p className="text-sm">
            {toJsDate(selected.date).toLocaleDateString()} {selected.timeWindow && `• ${selected.timeWindow}`}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            {selected.engineer
              ? `Engineer: ${selected.engineer}`
              : "Engineer to be confirmed"}
          </p>
          {selected.notes && (
            <p className="mt-2 text-xs text-slate-700 dark:text-slate-200">{selected.notes}</p>
          )}
          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-300">
            This is the booking you clicked on from your dashboard.
          </p>
        </section>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-neutral-950/80">
          <h2 className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-100">Upcoming bookings</h2>
          {renderList(upcoming)}
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-neutral-950/80">
          <h2 className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-100">Past bookings</h2>
          {renderList(past)}
        </section>
      </div>
    </div>
  );
}
