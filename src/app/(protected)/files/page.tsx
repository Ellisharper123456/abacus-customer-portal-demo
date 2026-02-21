"use client";

import { useState } from "react";
import { useDocuments } from "@/lib/hooks/useCompanyScopedCollections";
import { toJsDate } from "@/lib/utils/date";

export default function FilesPage() {
  const { data: documents } = useDocuments();
  const [view, setView] = useState<"list" | "grid">("list");

  const isPdf = (name: string) => name.toLowerCase().endsWith(".pdf");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Files</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Documents and reports shared with your company.
          </p>
        </div>
        <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 text-xs shadow-sm dark:border-slate-700 dark:bg-black/60">
          <button
            type="button"
            onClick={() => setView("list")}
            className={`rounded-full px-3 py-1 font-medium ${
              view === "list"
                ? "bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900"
                : "text-slate-700 dark:text-slate-300"
            }`}
          >
            List
          </button>
          <button
            type="button"
            onClick={() => setView("grid")}
            className={`rounded-full px-3 py-1 font-medium ${
              view === "grid"
                ? "bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900"
                : "text-slate-700 dark:text-slate-300"
            }`}
          >
            Grid
          </button>
        </div>
      </div>

      {view === "list" && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-neutral-950/80">
          <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-black">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-slate-600 dark:text-slate-300">Name</th>
              <th className="hidden px-4 py-2 text-left font-medium text-slate-600 md:table-cell dark:text-slate-300">
                Category
              </th>
              <th className="px-4 py-2 text-left font-medium text-slate-600 dark:text-slate-300">Uploaded</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                <td className="px-4 py-2 text-slate-900 dark:text-slate-50">
                  <a
                    href={doc.fileUrl}
                    className="text-brand-600 hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {doc.fileName}
                  </a>
                </td>
                <td className="hidden px-4 py-2 text-slate-700 md:table-cell dark:text-slate-300">
                  {doc.category ?? "-"}
                </td>
                <td className="px-4 py-2 text-slate-700 dark:text-slate-300">
                  {doc.uploadedAt
                    ? toJsDate(doc.uploadedAt).toLocaleDateString()
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {documents.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
            No documents available yet.
          </p>
        )}
        </div>
      )}

      {view === "grid" && (
        <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-neutral-950/80 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <a
              key={doc.id}
              href={doc.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col justify-between rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm shadow-sm hover:border-brand-200 hover:bg-slate-100 dark:border-slate-800 dark:bg-black/60 dark:hover:border-brand-400/60 dark:hover:bg-black"
            >
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-slate-200 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-100">
                    {isPdf(doc.fileName) ? "PDF" : "DOC"}
                  </span>
                  <p className="line-clamp-2 font-medium text-slate-900 dark:text-slate-50">
                    {doc.fileName}
                  </p>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {doc.category ?? "Document"}
                </p>
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {doc.uploadedAt
                  ? toJsDate(doc.uploadedAt).toLocaleDateString()
                  : "-"}
              </p>
            </a>
          ))}
          {documents.length === 0 && (
            <p className="col-span-full py-6 text-center text-sm text-slate-500 dark:text-slate-400">
              No documents available yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
