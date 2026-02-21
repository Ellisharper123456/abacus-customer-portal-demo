"use client";

import { FormEvent, useMemo, useState } from "react";
import { useSupportTickets } from "@/lib/hooks/useCompanyScopedCollections";
import { toJsDate } from "@/lib/utils/date";
import type { SupportTicket } from "@/lib/firebase/types";

type ProductKey = "ashp" | "gshp" | "solar" | "battery" | "ev";
type SymptomKey =
  | "no_power"
  | "low_output"
  | "error_code"
  | "strange_noise"
  | "charging_issue"
  | "other";

interface QuickFix {
  title: string;
  body: string;
}

const QUICK_FIXES: Record<ProductKey, Record<SymptomKey, QuickFix[]>> = {
  ashp: {
    no_power: [
      { title: "Check isolator", body: "Ensure external isolator is ON." },
      {
        title: "Check circuit breaker",
        body: "Make sure the breaker in your fuse box is not tripped.",
      },
      {
        title: "Check display",
        body: "Is the controller/display showing any lights or messages?",
      },
    ],
    low_output: [
      { title: "Check filters", body: "Clean or replace air filters if dirty." },
      {
        title: "Check settings",
        body: "Ensure thermostat and system settings are correct.",
      },
      {
        title: "Check radiators",
        body: "Bleed radiators to remove trapped air.",
      },
    ],
    error_code: [
      {
        title: "Note error code",
        body: "Write down the error code for support.",
      },
      { title: "Restart system", body: "Try turning the system off and on again." },
    ],
    strange_noise: [
      {
        title: "Check for obstructions",
        body: "Remove any debris near the outdoor unit.",
      },
      { title: "Check fan", body: "Is the fan running smoothly?" },
    ],
    charging_issue: [
      {
        title: "Check power",
        body: "Ensure the system is powered and charging indicator is on.",
      },
    ],
    other: [
      { title: "Describe issue", body: "Give as much detail as possible." },
    ],
  },
  gshp: {
    no_power: [
      { title: "Check isolator", body: "Ensure external isolator is ON." },
      {
        title: "Check circuit breaker",
        body: "Make sure the breaker in your fuse box is not tripped.",
      },
    ],
    low_output: [
      {
        title: "Check settings",
        body: "Ensure thermostat and system settings are correct.",
      },
      {
        title: "Check radiators",
        body: "Bleed radiators to remove trapped air.",
      },
    ],
    error_code: [
      {
        title: "Note error code",
        body: "Write down the error code for support.",
      },
      { title: "Restart system", body: "Try turning the system off and on again." },
    ],
    strange_noise: [
      {
        title: "Check for obstructions",
        body: "Remove any debris near the outdoor unit.",
      },
    ],
    charging_issue: [
      {
        title: "Check power",
        body: "Ensure the system is powered and charging indicator is on.",
      },
    ],
    other: [{ title: "Contact support", body: "We\'ll assist you further." }],
  },
  solar: {
    no_power: [
      { title: "Check inverter", body: "Ensure inverter lights are on." },
      { title: "Check isolator", body: "Ensure isolator switches are ON." },
    ],
    low_output: [
      {
        title: "Check panels",
        body: "Are panels clean and unobstructed?",
      },
      {
        title: "Check inverter",
        body: "Any warning lights or error codes?",
      },
    ],
    error_code: [
      {
        title: "Note error code",
        body: "Write down the error code for support.",
      },
      {
        title: "Restart inverter",
        body: "Turn inverter off and on if safe to do so.",
      },
    ],
    strange_noise: [
      {
        title: "Check inverter",
        body: "Is the inverter making unusual sounds?",
      },
    ],
    charging_issue: [
      {
        title: "Check battery",
        body: "Is the battery showing as charging?",
      },
    ],
    other: [
      { title: "Check inverter", body: "Ensure inverter lights are on." },
    ],
  },
  battery: {
    no_power: [
      {
        title: "Check isolator",
        body: "Ensure battery isolator is ON.",
      },
      {
        title: "Check display",
        body: "Is the battery display showing any lights or messages?",
      },
    ],
    low_output: [
      {
        title: "Check charge level",
        body: "Is the battery sufficiently charged?",
      },
    ],
    error_code: [
      {
        title: "Note error code",
        body: "Write down the error code for support.",
      },
      {
        title: "Restart system",
        body: "Power off/on the battery system safely.",
      },
    ],
    strange_noise: [
      {
        title: "Check for obstructions",
        body: "Remove any debris near the battery unit.",
      },
    ],
    charging_issue: [
      {
        title: "Check connections",
        body: "Ensure all cables are securely connected.",
      },
    ],
    other: [
      {
        title: "Restart system",
        body: "Power off/on the battery system safely.",
      },
    ],
  },
  ev: {
    no_power: [
      {
        title: "Check charger power",
        body: "Ensure charger is plugged in and powered.",
      },
      {
        title: "Check vehicle connection",
        body: "Is the cable securely connected to the car?",
      },
    ],
    low_output: [
      {
        title: "Check settings",
        body: "Is the charger set to the correct output?",
      },
    ],
    error_code: [
      {
        title: "Note error code",
        body: "Write down the error code for support.",
      },
      {
        title: "Restart charger",
        body: "Unplug and restart your charger.",
      },
    ],
    strange_noise: [
      {
        title: "Check for obstructions",
        body: "Remove any debris near the charger.",
      },
    ],
    charging_issue: [
      {
        title: "Check cable",
        body: "Try a different charging cable if available.",
      },
      {
        title: "Restart charger",
        body: "Unplug and restart your charger.",
      },
    ],
    other: [
      {
        title: "Reset charger",
        body: "Unplug and restart your charger.",
      },
    ],
  },
};

const PRODUCTS: { key: ProductKey; label: string }[] = [
  { key: "ashp", label: "Air source heat pump" },
  { key: "gshp", label: "Ground source heat pump" },
  { key: "solar", label: "Solar PV" },
  { key: "battery", label: "Battery" },
  { key: "ev", label: "EV charger" },
];

const SYMPTOMS: { key: SymptomKey; label: string }[] = [
  { key: "no_power", label: "No power" },
  { key: "low_output", label: "Low output" },
  { key: "error_code", label: "Error code" },
  { key: "strange_noise", label: "Strange noise" },
  { key: "charging_issue", label: "Not charging" },
  { key: "other", label: "Other" },
];

function generateTicketId(prefix = "ABA") {
  const now = Date.now();
  return `${prefix}-${now.toString().slice(-6)}`;
}

export default function SupportPage() {
  const { data: existingTickets } = useSupportTickets();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [postcode, setPostcode] = useState("");
  const [product, setProduct] = useState<ProductKey | "">("");
  const [symptom, setSymptom] = useState<SymptomKey | "">("");
  const [details, setDetails] = useState("");
  const [priority] = useState<"Low" | "Medium" | "High">("Medium");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [ticketStatus, setTicketStatus] = useState("Draft");
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdTickets, setCreatedTickets] = useState<SupportTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const quickFixes = useMemo<QuickFix[]>(() => {
    if (!product || !symptom) return [];
    const byProduct = QUICK_FIXES[product as ProductKey];
    if (!byProduct) return [];
    return byProduct[symptom as SymptomKey] ?? [];
  }, [product, symptom]);

  const allTickets: SupportTicket[] = [...createdTickets, ...existingTickets];
  const selectedTicket =
    allTickets.find((t) => t.id === selectedTicketId) ?? null;

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!firstName.trim()) nextErrors.firstName = "First name is required.";
    if (!lastName.trim()) nextErrors.lastName = "Last name is required.";
    if (!email.trim()) nextErrors.email = "Email is required.";
    if (!phone.trim()) nextErrors.phone = "Telephone is required.";
    if (!postcode.trim()) nextErrors.postcode = "Postcode is required.";
    if (!product) nextErrors.product = "Product / system is required.";
    if (!symptom) nextErrors.symptom = "Symptom is required.";
    if (!details.trim())
      nextErrors.details = "Please provide as much detail as possible.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setTicketStatus("Draft");
      return;
    }

    setSubmitting(true);
    const id = generateTicketId();

    const now = new Date();
    const newTicket: SupportTicket = {
      id,
      companyId: "demo-company",
      issueType: `${
        PRODUCTS.find((p) => p.key === product)?.label ?? "System"
      } • ${SYMPTOMS.find((s) => s.key === symptom)?.label ?? "Issue"}`,
      priority,
      description: details,
      status: "Open",
      createdAt: now as any,
      zapSynced: false,
    };

    setCreatedTickets((prev) => [newTicket, ...prev]);
    setTicketId(id);
    setTicketStatus("Submitted");

    setTimeout(() => {
      setSubmitting(false);
      setShowSuccessModal(true);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setPostcode("");
      setProduct("");
      setSymptom("");
      setDetails("");
      setErrors({});
    }, 600);
  };

  const handleClear = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setPostcode("");
    setProduct("");
    setSymptom("");
    setDetails("");
    setErrors({});
    setTicketStatus("Draft");
    setTicketId(null);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
        Report a system issue
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Having trouble with your heat pump, solar, battery or EV charger?
        Fill this in and the Abacus support team will pick it up.
      </p>

      <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] dark:border-slate-800 dark:bg-neutral-950/80">
        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-200">
                First name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-black dark:text-slate-100"
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-200">
                Last name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-black dark:text-slate-100"
              />
              {errors.lastName && (
                <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-200">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-black dark:text-slate-100"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-200">
                Telephone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-black dark:text-slate-100"
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-200">
              Postcode
            </label>
            <input
              type="text"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-black dark:text-slate-100"
            />
            {errors.postcode && (
              <p className="mt-1 text-xs text-red-500">{errors.postcode}</p>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-200">
                Product / system
              </label>
              <select
                value={product}
                onChange={(e) => setProduct(e.target.value as ProductKey | "")}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-black dark:text-slate-100"
              >
                <option value="">Select</option>
                {PRODUCTS.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.label}
                  </option>
                ))}
              </select>
              {errors.product && (
                <p className="mt-1 text-xs text-red-500">{errors.product}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-200">
                Symptom
              </label>
              <select
                value={symptom}
                onChange={(e) => setSymptom(e.target.value as SymptomKey | "")}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-black dark:text-slate-100"
              >
                <option value="">Select</option>
                {SYMPTOMS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
              {errors.symptom && (
                <p className="mt-1 text-xs text-red-500">{errors.symptom}</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-200">
              More details
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-black dark:text-slate-100"
              placeholder="Include when the issue started, what is happening, any error codes, what you have tried and whether you have spoken to the manufacturer helpline."
            />
            {errors.details && (
              <p className="mt-1 text-xs text-red-500">{errors.details}</p>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Creating ticket..." : "Create ticket"}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              Clear
            </button>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              In production this would create a ticket in your CRM / helpdesk.
            </p>
          </div>
        </form>

        <aside className="space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-black/40">
          <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-slate-950/70">
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100">
                Ticket ID
              </div>
              <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white dark:bg-slate-50 dark:text-slate-900">
                {ticketStatus}
              </span>
            </div>
            <p className="mt-3 font-mono text-sm font-semibold text-slate-900 dark:text-slate-50">
              {ticketId ?? "—"}
            </p>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              You&apos;ll see this reference in any emails and updates from Abacus.
            </p>
          </div>

          <div
            className={`space-y-2 rounded-lg border border-emerald-300/80 bg-emerald-50 p-3 shadow-sm transition dark:border-emerald-500/60 dark:bg-emerald-950/30 ${
              quickFixes.length ? "ring-1 ring-emerald-500/40" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">💡</span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900 dark:text-emerald-100">
                  Quick checks before you submit
                </p>
                <p className="text-[11px] text-emerald-900/80 dark:text-emerald-100/80">
                  These steps often resolve common issues without needing a visit.
                </p>
              </div>
            </div>
            <div className="mt-2 space-y-2">
              {quickFixes.length === 0 && (
                <p className="text-[11px] text-emerald-900/80 dark:text-emerald-100/80">
                  Choose a product and symptom to see tailored quick fixes.
                </p>
              )}
              {quickFixes.map((fix, idx) => (
                <div
                  key={idx}
                  className="rounded-md border border-emerald-100 bg-white px-2.5 py-2 shadow-sm dark:border-emerald-500/40 dark:bg-emerald-950/60"
                >
                  <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-50">
                    {fix.title}
                  </p>
                  <p className="text-[11px] text-emerald-900/90 dark:text-emerald-100/80">
                    {fix.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Once submitted, your ticket appears below with any updates from the
            Abacus team.
          </p>
        </aside>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-neutral-950/80">
        <h2 className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-100">
          Your tickets
        </h2>
        <ul className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
          {allTickets.map((t) => {
            const created = toJsDate(t.createdAt);
            const resolved = t.resolvedAt ? toJsDate(t.resolvedAt as any) : null;

            return (
              <li
                key={t.id}
                className="cursor-pointer py-3 hover:bg-slate-50 dark:hover:bg-slate-900"
                onClick={() => setSelectedTicketId(t.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-50">
                      {t.issueType}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Raised on {created.toLocaleDateString()} at
                      {" "}
                      {created.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {resolved && (
                      <p className="text-xs text-emerald-500">
                        Resolved on {resolved.toLocaleDateString()} at
                        {" "}
                        {resolved.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {t.resolvedBy ? ` by ${t.resolvedBy}` : ""}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {t.status}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      Priority: {t.priority}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
          {allTickets.length === 0 && (
            <li className="py-4 text-sm text-slate-500 dark:text-slate-400">
              No support tickets yet.
            </li>
          )}
        </ul>
      </section>

      {selectedTicket && (
        <section className="rounded-xl border border-brand-100 bg-brand-50 p-4 text-sm text-slate-900 shadow-sm dark:border-brand-400/60 dark:bg-brand-500/10 dark:text-slate-50">
          <h2 className="mb-1 text-sm font-semibold text-slate-900 dark:text-slate-50">
            Ticket details
          </h2>
          <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
            {selectedTicket.issueType}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Raised {toJsDate(selectedTicket.createdAt).toLocaleString()} • Priority {" "}
            {selectedTicket.priority}
          </p>
          <p className="mt-2 whitespace-pre-line text-sm text-slate-800 dark:text-slate-200">
            {selectedTicket.description}
          </p>
          {selectedTicket.engineerNotes && (
            <p className="mt-2 text-xs text-slate-700 dark:text-slate-200">
              Engineer notes: {selectedTicket.engineerNotes}
            </p>
          )}
          {selectedTicket.resolvedAt && (
            <p className="mt-2 text-xs text-emerald-500">
              Resolved {toJsDate(selectedTicket.resolvedAt as any).toLocaleString()}
              {selectedTicket.resolvedBy ? ` by ${selectedTicket.resolvedBy}` : ""}
            </p>
          )}
          <button
            type="button"
            onClick={() => setSelectedTicketId(null)}
            className="mt-3 text-xs font-medium text-brand-700 hover:underline dark:text-brand-400"
          >
            Close details
          </button>
        </section>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 text-center shadow-xl dark:bg-neutral-950">
            <h2 className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
              Ticket submitted
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Thanks for contacting Abacus – your ticket
              {ticketId ? ` ${ticketId}` : ""} has been logged. The team will be in
              touch soon.
            </p>
            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="mt-4 inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
