"use client";

import { useEffect, useState } from "react";
import { useCorrespondence } from "@/lib/hooks/useCompanyScopedCollections";
import { toJsDate } from "@/lib/utils/date";

export default function CorrespondencePage() {
  const { data: correspondence } = useCorrespondence();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("selected");
    if (fromQuery) {
      setSelectedId(fromQuery);
    }
  }, []);

  const selected = correspondence.find((item) => item.id === selectedId) ?? null;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Correspondence</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Read-only log of emails and communications.
      </p>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-neutral-950/80">
        <ul className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
          {correspondence.map((item) => (
            <li
              key={item.id}
              className="cursor-pointer px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-900"
              onClick={() => setSelectedId(item.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-50">{item.subject}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                    {item.body}
                  </p>
                </div>
                <span className="whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                  {toJsDate(item.sentAt).toLocaleDateString()}
                </span>
              </div>
            </li>
          ))}
          {correspondence.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
              No correspondence found.
            </li>
          )}
        </ul>
      </div>

      {selected && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/30 px-4 py-6 dark:bg-black/60">
          <div className="w-full max-w-lg rounded-2xl bg-white p-4 text-sm shadow-xl dark:border dark:border-slate-700 dark:bg-neutral-950">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {toJsDate(selected.sentAt).toLocaleString()}
                </p>
                <h2 className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-50">
                  {selected.subject}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              >
                <span className="sr-only">Close</span>
                ✕
              </button>
            </div>
            <div className="prose prose-sm max-w-none text-slate-800 dark:text-slate-200">
              <p className="whitespace-pre-line text-sm">{selected.body}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
