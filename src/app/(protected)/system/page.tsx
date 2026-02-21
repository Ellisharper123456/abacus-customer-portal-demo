"use client";

import Link from "next/link";
import { useCompany, useSystems } from "@/lib/hooks/useCompanyScopedCollections";
import { toJsDate } from "@/lib/utils/date";

export default function SystemPage() {
  const { data: company } = useCompany();
  const { data: systems } = useSystems();
  const companyRecord = company[0];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Your systems</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        A simple list of the systems Abacus looks after for you and whether
        they&apos;re covered by your care plan.
      </p>

      {companyRecord && (
        <section className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm md:flex-row md:items-center md:justify-between dark:border-slate-800 dark:bg-neutral-950/80">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Care plan & payments
            </p>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
              {companyRecord.carePlanType ?? "No care plan on file"}
            </p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              {companyRecord.carePlanPricePerMonth
                ? `£${companyRecord.carePlanPricePerMonth.toFixed(2)} per month`
                : "Pricing details would appear here."}
              {companyRecord.carePlanBillingFrequency === "Annual" &&
                " (billed annually)"}
            </p>
            {companyRecord.carePlanNextPaymentDate && (
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Next payment {toJsDate(companyRecord.carePlanNextPaymentDate as any).toLocaleDateString()}
              </p>
            )}
          </div>
          <Link
            href="/care-plan"
            className="inline-flex items-center justify-center rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-800 hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:text-slate-100"
          >
            View what your plan includes
          </Link>
        </section>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-neutral-950/80">
        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-black">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-slate-600 dark:text-slate-300">Type</th>
              <th className="px-4 py-2 text-left font-medium text-slate-600 dark:text-slate-300">Address</th>
              <th className="hidden px-4 py-2 text-left font-medium text-slate-600 md:table-cell dark:text-slate-300">
                Last service
              </th>
              <th className="hidden px-4 py-2 text-left font-medium text-slate-600 md:table-cell dark:text-slate-300">
                Next due
              </th>
              <th className="px-4 py-2 text-left font-medium text-slate-600 dark:text-slate-300">Schedule</th>
              <th className="px-4 py-2 text-left font-medium text-slate-600 dark:text-slate-300">Care plan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {systems.map((system) => (
              <tr key={system.id} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                <td className="px-4 py-2 text-slate-900 dark:text-slate-50">
                  <Link
                    href={`/system/${system.id}`}
                    className="text-brand-600 hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300"
                  >
                    {system.systemType}
                  </Link>
                </td>
                <td className="px-4 py-2 text-slate-700 dark:text-slate-300">
                  {system.address ?? system.location ?? "-"}
                </td>
                <td className="hidden px-4 py-2 text-slate-700 md:table-cell dark:text-slate-300">
                  {system.lastServiceDate
                    ? toJsDate(system.lastServiceDate).toLocaleDateString()
                    : "-"}
                </td>
                <td className="hidden px-4 py-2 text-slate-700 md:table-cell dark:text-slate-300">
                  {system.nextServiceDue
                    ? toJsDate(system.nextServiceDue).toLocaleDateString()
                    : "-"}
                </td>
                <td className="px-4 py-2 text-slate-700 dark:text-slate-300">
                  {system.maintenanceSchedule ?? "-"}
                </td>
                <td className="px-4 py-2 text-slate-700 dark:text-slate-300">
                  {system.coveredByCarePlan ? (
                    <div className="space-y-1 text-xs">
                      <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                        Covered by care plan
                      </span>
                      {system.carePlanPricePerMonth && system.carePlanNextPaymentDate && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          £{system.carePlanPricePerMonth.toFixed(2)}/mo • Next {" "}
                          {toJsDate(system.carePlanNextPaymentDate as any).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      Not covered
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {systems.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
            No systems loaded for this account yet.
          </p>
        )}
      </div>
    </div>
  );
}
