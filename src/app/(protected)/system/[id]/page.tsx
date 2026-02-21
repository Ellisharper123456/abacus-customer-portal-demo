"use client";

import { useBookings, useSystems } from "@/lib/hooks/useCompanyScopedCollections";
import { toJsDate } from "@/lib/utils/date";
import { useState } from "react";

export default function SystemDetailPage({ params }: { params: { id: string } }) {
  const { data: systems, loading } = useSystems();
  const { data: bookings } = useBookings();
  const system = systems.find((s) => s.id === params.id);
  const [uploads, setUploads] = useState<string[]>([]);
  const [renewRequested, setRenewRequested] = useState(false);

  if (loading && !system) {
    return (
      <div className="space-y-4">
        <div className="h-5 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-24 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-900" />
      </div>
    );
  }

  if (!system) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">System not found</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          We couldn't find that system in your account. If you followed a
          link from an email, it may have expired.
        </p>
      </div>
    );
  }

  const installedDate = system.installationDate
    ? toJsDate(system.installationDate as any).toLocaleDateString()
    : "-";
  const lastService = system.lastServiceDate
    ? toJsDate(system.lastServiceDate as any).toLocaleDateString()
    : "-";
  const nextService = system.nextServiceDue
    ? toJsDate(system.nextServiceDue as any).toLocaleDateString()
    : "-";

  const carePlanPayments = (system.carePlanPayments || [])
    .slice()
    .sort((a, b) => toJsDate(b.date as any).getTime() - toJsDate(a.date as any).getTime());

  const serviceHistory = bookings
    .filter((b) => b.status === "Completed")
    .sort((a, b) => toJsDate(b.date).getTime() - toJsDate(a.date).getTime());

  const handleUpload: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = Array.from(e.target.files || []).map((f) => f.name);
    if (files.length) {
      setUploads((prev) => [...prev, ...files]);
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">{system.systemType}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {system.address ?? system.location}
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-neutral-950/80">
          <h2 className="text-sm font-medium text-slate-700 dark:text-slate-100">System details</h2>
          <dl className="mt-2 space-y-1">
            <div className="flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Installed</dt>
              <dd className="font-medium text-slate-900 dark:text-slate-50">{installedDate}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Installed by</dt>
              <dd className="font-medium text-slate-900 dark:text-slate-50">
                {system.installer ?? "Abacus install team"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Covered by care plan</dt>
              <dd className="font-medium text-slate-900 dark:text-slate-50">
                {system.coveredByCarePlan ? "Yes" : "No"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Maintenance schedule</dt>
              <dd className="font-medium text-slate-900 dark:text-slate-50">
                {system.maintenanceSchedule ?? "See your care plan"}
              </dd>
            </div>
          </dl>
        </div>
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-neutral-950/80">
          <h2 className="text-sm font-medium text-slate-700 dark:text-slate-100">Care plan & warranty</h2>
          <dl className="mt-2 space-y-1">
            {system.coveredByCarePlan && (
              <>
                <div className="flex justify-between">
                  <dt className="text-slate-500 dark:text-slate-400">Care plan</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-50">
                    {system.carePlanName ?? "Heat pump care plan"}
                  </dd>
                </div>
                {system.carePlanPricePerMonth && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500 dark:text-slate-400">Price</dt>
                    <dd className="font-medium text-slate-900 dark:text-slate-50">
                      £{system.carePlanPricePerMonth.toFixed(2)}/month
                    </dd>
                  </div>
                )}
                {system.carePlanStartDate && system.carePlanEndDate && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500 dark:text-slate-400">Start / end</dt>
                    <dd className="font-medium text-slate-900 dark:text-slate-50">
                      {toJsDate(system.carePlanStartDate as any).toLocaleDateString()} – {" "}
                      {toJsDate(system.carePlanEndDate as any).toLocaleDateString()}
                    </dd>
                  </div>
                )}
                {system.carePlanNextPaymentDate && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500 dark:text-slate-400">Next payment</dt>
                    <dd className="font-medium text-slate-900 dark:text-slate-50">
                      {toJsDate(system.carePlanNextPaymentDate as any).toLocaleDateString()}
                    </dd>
                  </div>
                )}
              </>
            )}
            <div className="flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Last service</dt>
              <dd className="font-medium text-slate-900 dark:text-slate-50">{lastService}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Next service due</dt>
              <dd className="font-medium text-slate-900 dark:text-slate-50">{nextService}</dd>
            </div>
            <div>
              <dt className="text-slate-500 dark:text-slate-400">Warranty</dt>
              <dd className="text-sm text-slate-900 dark:text-slate-200">
                {system.warrantyInfo ?? "Warranty details can be added here."}
              </dd>
            </div>
          </dl>
          {system.coveredByCarePlan && (
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Want to keep this cover going after it ends?
              </p>
              <button
                type="button"
                onClick={() => setRenewRequested(true)}
                className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-black"
              >
                Request renewal
              </button>
            </div>
          )}
          {renewRequested && (
            <p className="mt-2 text-xs text-emerald-500">
              Thanks – in a full build this would notify Abacus to discuss
              renewing your care plan for this system.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-neutral-950/80">
        <h2 className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-100">Service history</h2>
        <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
          A snapshot of past engineer visits for this system.
        </p>
        {serviceHistory.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No completed services recorded yet.</p>
        ) : (
          <ul className="space-y-2">
            {serviceHistory.map((b) => (
              <li
                key={b.id}
                className="flex items-start justify_between gap-3 rounded-lg bg-slate-50 px-3 py-2 dark:bg-black/60"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                    {toJsDate(b.date as any).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {b.notes ?? "Routine service"}
                  </p>
                  {b.engineer === "James Griffith" && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Completed by James Griffith (Abacus engineer).
                    </p>
                  )}
                </div>
                <span className="mt-1 inline-flex rounded_full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                  {b.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {carePlanPayments.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-neutral-950/80">
          <h2 className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-100">Care plan payments</h2>
          <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
            Recent payments for this system&apos;s care plan.
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <tr>
                  <th className="px-2 py-1">Date</th>
                  <th className="px-2 py-1">Amount</th>
                  <th className="px-2 py-1">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {carePlanPayments.map((p, idx) => (
                  <tr key={idx}>
                    <td className="px-2 py-1 text-slate-800 dark:text-slate-200">
                      {toJsDate(p.date as any).toLocaleDateString()}
                    </td>
                    <td className="px-2 py-1 text-slate-800 dark:text-slate-200">
                      £{p.amount.toFixed(2)}
                    </td>
                    <td className="px-2 py-1">
                      <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-neutral-950/80">
        <h2 className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-100">Photos & videos</h2>
        <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
          You can share photos or short clips of this system if Abacus requests
          them for troubleshooting or marketing. In a full build this would
          upload securely to Abacus storage.
        </p>
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleUpload}
          className="mb-2 block w-full cursor-pointer text-xs text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-slate-800 hover:file:bg-slate-200 dark:text-slate-400 dark:file:bg-black dark:file:text-slate-100 dark:hover:file:bg-slate-900"
        />
        {uploads.length > 0 && (
          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-700 dark:text-slate-300">
            {uploads.map((name, idx) => (
              <li key={idx}>{name}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
