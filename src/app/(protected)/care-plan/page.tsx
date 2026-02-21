"use client";

import Link from "next/link";
import { useCompany, useSystems } from "@/lib/hooks/useCompanyScopedCollections";
import { toJsDate } from "@/lib/utils/date";

export default function CarePlanPage() {
  const { data: company } = useCompany();
  const { data: systems } = useSystems();

  const companyRecord = company[0];
  const coveredSystems = systems.filter((s) => s.coveredByCarePlan);

  const carePlanInfo = (() => {
    if (!companyRecord?.carePlanType || !companyRecord.carePlanStartDate) return null;
    const start = toJsDate(companyRecord.carePlanStartDate as any);

    const years =
      companyRecord.carePlanType === "Care Plan 3 years"
        ? 3
        : companyRecord.carePlanType === "Care Plan 2 years"
        ? 2
        : 1;

    const end = new Date(start);
    end.setFullYear(end.getFullYear() + years);

    return { start, end };
  })();

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Your care plan</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          A simple overview of what Abacus looks after for you, how your care
          plan works and which systems are covered.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-neutral-950/80">
          <h2 className="text-sm font-medium text-slate-700 dark:text-slate-100">Plan summary</h2>
          <dl className="mt-2 space-y-1">
            <div className="flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Plan</dt>
              <dd className="font-medium text-slate-900 dark:text-slate-50">
                {companyRecord?.carePlanType ?? "No care plan on file"}
              </dd>
            </div>
            {carePlanInfo && (
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Start / end</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-50">
                  {carePlanInfo.start.toLocaleDateString()} – {carePlanInfo.end.toLocaleDateString()}
                </dd>
              </div>
            )}
            {companyRecord?.carePlanPricePerMonth && (
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Price</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-50">
                  £{companyRecord.carePlanPricePerMonth.toFixed(2)} per month
                  {companyRecord.carePlanBillingFrequency === "Annual" && " (billed annually)"}
                </dd>
              </div>
            )}
            {companyRecord?.carePlanNextPaymentDate && (
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Next payment</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-50">
                  {toJsDate(companyRecord.carePlanNextPaymentDate as any).toLocaleDateString()}
                </dd>
              </div>
            )}
          </dl>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            This is a demo view – in a live portal this section would match the
            exact prices and terms on your Abacus contract.
          </p>
        </div>

        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-neutral-950/80">
          <h2 className="text-sm font-medium text-slate-700 dark:text-slate-100">What your plan includes</h2>
          <ul className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-300">
            <li>• Annual service visit for covered systems</li>
            <li>• Priority booking for breakdowns</li>
            <li>• Reduced call-out charges for covered equipment</li>
            <li>• Safety checks and performance review on each visit</li>
            <li>• Paperwork and service reports stored in your portal</li>
          </ul>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Exact inclusions can vary by plan. This demo shows the sort of
            benefits an Abacus care plan could include.
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-neutral-950/80">
        <h2 className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-100">
          Systems covered by your care plan
        </h2>
        {coveredSystems.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No systems are currently marked as covered by a care plan.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {coveredSystems.map((system) => (
              <li key={system.id} className="flex items-center justify-between gap-3 py-2">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                    {system.systemType}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {system.address ?? system.location}
                  </p>
                </div>
                <Link
                  href={`/system/${system.id}`}
                  className="text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline"
                >
                  View details
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
