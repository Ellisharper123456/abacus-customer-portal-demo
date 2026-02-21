"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { useNotifications } from "@/lib/notifications/NotificationContext";
import {
  useBookings,
  useCompany,
  useCorrespondence,
  useSupportTickets,
  useSystems,
} from "@/lib/hooks/useCompanyScopedCollections";
import { toJsDate } from "@/lib/utils/date";
import { AdminSection, useAdminSection } from "@/lib/admin/AdminSectionContext";

interface AdminUserSummary {
  id: string;
  name: string;
  email: string;
  role: "homeowner" | "admin";
  status: "Active" | "Invited" | "Paused";
  companyName: string;
  companyId?: string;
  serviceLevel?: string;
  carePlan?: string;
  lastSeen?: string;
}

const INITIAL_USERS: AdminUserSummary[] = [
  {
    id: "emma-user",
    name: "Emma Thompson",
    email: "emma.thompson@example.com",
    role: "homeowner",
    status: "Active",
    companyName: "Emma Thompson",
    companyId: "demo-company",
    serviceLevel: "Care Plan",
    carePlan: "Heat pump care plan",
    lastSeen: "Today",
  },
  {
    id: "admin-user",
    name: "Abacus team",
    email: "admin@abacusenergysolutions.co.uk",
    role: "admin",
    status: "Active",
    companyName: "Abacus Energy Solutions",
    lastSeen: "Today",
  },
  {
    id: "invited-1",
    name: "Sarah Williams",
    email: "sarah@example.com",
    role: "homeowner",
    status: "Invited",
    companyName: "Sarah Williams",
    carePlan: "Not yet on plan",
  },
];

export default function AdminPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const { section: activeSection } = useAdminSection();

  const { data: company } = useCompany();
  const { data: systems } = useSystems();
  const { data: bookings } = useBookings();
  const { data: tickets } = useSupportTickets();
  const { data: correspondence } = useCorrespondence();
  const { notifications, interests, createNotification } = useNotifications();

  const [users, setUsers] = useState<AdminUserSummary[]>(INITIAL_USERS);
  const [selectedUserId, setSelectedUserId] = useState<string>("emma-user");

  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");

  const [editUserName, setEditUserName] = useState("");
  const [editUserEmail, setEditUserEmail] = useState("");
  const [editUserStatus, setEditUserStatus] = useState<"Active" | "Invited" | "Paused">(
    "Active",
  );

  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationBody, setNotificationBody] = useState("");
  const [notificationAudience, setNotificationAudience] = useState<
    "all" | "heat-pump" | "solar-battery"
  >("all");
  const [notificationCtaLabel, setNotificationCtaLabel] = useState("");
  const [sendingNotification, setSendingNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);

  const [ticketFilter, setTicketFilter] = useState<"all" | "open" | "closed">("all");
  const [ticketSearch, setTicketSearch] = useState("");

  const [adminCorrespondence, setAdminCorrespondence] = useState(correspondence);
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");

  useEffect(() => {
    setAdminCorrespondence(correspondence);
  }, [correspondence]);

  useEffect(() => {
    const selected = users.find((u) => u.id === selectedUserId) ?? users[0];
    if (selected) {
      setEditUserName(selected.name);
      setEditUserEmail(selected.email);
      setEditUserStatus(selected.status);
    }
  }, [selectedUserId, users]);

  if (!profile || profile.role !== "admin") {
    router.push("/dashboard");
    return null;
  }

  const selectedUser = users.find((u) => u.id === selectedUserId) ?? users[0];

  const companyRecord = company[0];
  const activeSystems = systems.filter((s) => s.coveredByCarePlan);
  const userSystems = systems.filter(
    (s) => selectedUser?.companyId && s.companyId === selectedUser.companyId,
  );

  const filteredTickets = tickets.filter((t) => {
      const matchesStatus =
        ticketFilter === "all"
          ? true
          : ticketFilter === "open"
          ? t.status === "Open"
          : t.status !== "Open";

      const term = ticketSearch.trim().toLowerCase();
      const matchesSearch = !term
        ? true
        : t.issueType.toLowerCase().includes(term) ||
          t.description.toLowerCase().includes(term) ||
          t.id.toLowerCase().includes(term);

      return matchesStatus && matchesSearch;
    });

  const handleInvite = (e: FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;

    const newUser: AdminUserSummary = {
      id: `invited-${Date.now()}`,
      name: inviteName,
      email: inviteEmail,
      role: "homeowner",
      status: "Invited",
      companyName: inviteName,
      carePlan: "Not yet on plan",
    };

    setUsers((prev) => [...prev, newUser]);
    setInviteName("");
    setInviteEmail("");
    setSelectedUserId(newUser.id);
  };

  const handleUserSave = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id
          ? { ...u, name: editUserName, email: editUserEmail, status: editUserStatus }
          : u,
      ),
    );
  };

  const handleSendNotification = (e: FormEvent) => {
    e.preventDefault();
    setSendingNotification(true);
    createNotification({
      title: notificationTitle,
      body: notificationBody,
      audience: notificationAudience,
      ctaLabel: notificationCtaLabel || undefined,
    });
    setTimeout(() => {
      setSendingNotification(false);
      setNotificationMessage(
        "Upsell notification created – it will now appear in customer portals.",
      );
      setNotificationTitle("");
      setNotificationBody("");
      setNotificationCtaLabel("");
    }, 400);
  };

  const handleTicketStatusChange = (id: string, status: string) => {
    // Demo only – we update a shallow local copy rather than the mock hook source.
    const updated = tickets.map((t) =>
      t.id === id ? ({ ...t, status } as (typeof tickets)[number]) : t,
    );
    // This cast is just to keep TS satisfied in the demo; in a real app
    // you would persist via Firestore and re-read.
    (tickets as any).splice(0, tickets.length, ...updated);
  };

  const handleReply = (e: FormEvent) => {
    e.preventDefault();
    if (!replySubject || !replyBody) return;
    const now = new Date();
    const newRecord = {
      id: `corr-${Date.now()}`,
      companyId: companyRecord?.id ?? "demo-company",
      subject: replySubject,
      body: replyBody,
      sentAt: now as any,
    };
    setAdminCorrespondence((prev) => [...prev, newRecord]);
    setReplySubject("");
    setReplyBody("");
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Abacus admin overview
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Everything in one place – users, care plans, tickets, upsell and
          correspondence for your homeowners.
        </p>
      </header>

      {activeSection === "users" && (
        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-neutral-950/80">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-medium text-slate-800 dark:text-slate-100">
                Users
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Overview of every user in the Abacus portal.
              </p>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {users.length} users
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <div className="space-y-2 rounded-lg border border-slate-100 bg-slate-50/60 p-2 text-xs dark:border-slate-800 dark:bg-black/40">
              {users.map((u) => {
                const active = selectedUser?.id === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setSelectedUserId(u.id)}
                    className={`flex w-full items-center justify-between rounded-md px-2 py-2 text-left transition ${
                      active
                        ? "bg-white text-slate-900 shadow-sm ring-1 ring-brand-500/60 dark:bg-neutral-900 dark:text-slate-50"
                        : "text-slate-700 hover:bg-white/70 dark:text-slate-200 dark:hover:bg-slate-900/60"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-semibold">{u.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {u.email}
                      </p>
                    </div>
                    <span className="ml-2 inline-flex items-center rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white dark:bg-slate-50 dark:text-slate-900">
                      {u.role}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-4 text-sm">
              {selectedUser && (
                <>
                  <div className="space-y-3 rounded-lg border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-black/50">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                      User detail
                    </h3>
                    <form onSubmit={handleUserSave} className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-[11px] font-medium text-slate-700 dark:text-slate-200">
                          Name
                        </label>
                        <input
                          type="text"
                          value={editUserName}
                          onChange={(e) => setEditUserName(e.target.value)}
                          className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-black dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-medium text-slate-700 dark:text-slate-200">
                          Email
                        </label>
                        <input
                          type="email"
                          value={editUserEmail}
                          onChange={(e) => setEditUserEmail(e.target.value)}
                          className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-black dark:text-slate-100"
                        />
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-[11px] font-medium text-slate-700 dark:text-slate-200">
                          Status
                        </label>
                        <select
                          value={editUserStatus}
                          onChange={(e) =>
                            setEditUserStatus(
                              e.target.value as "Active" | "Invited" | "Paused",
                            )
                          }
                          className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-black dark:text-slate-100"
                        >
                          <option value="Active">Active</option>
                          <option value="Invited">Invited</option>
                          <option value="Paused">Paused</option>
                        </select>
                      </div>
                      <div className="flex items-end justify-end">
                        <button
                          type="submit"
                          className="inline-flex items-center rounded-md bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-white shadow-sm hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
                        >
                          Save changes
                        </button>
                      </div>
                    </div>
                  </form>
                    <div className="grid gap-3 text-[11px] sm:grid-cols-2">
                      <div>
                        <p className="font-semibold text-slate-700 dark:text-slate-200">
                          Company
                        </p>
                        <p className="text-slate-600 dark:text-slate-400">
                          {selectedUser.companyName}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700 dark:text-slate-200">
                          Care plan
                        </p>
                        <p className="text-slate-600 dark:text-slate-400">
                          {selectedUser.carePlan ?? "Not on plan"}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700 dark:text-slate-200">
                          Service level
                        </p>
                        <p className="text-slate-600 dark:text-slate-400">
                          {selectedUser.serviceLevel ?? "Standard"}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700 dark:text-slate-200">
                          Last seen
                        </p>
                        <p className="text-slate-600 dark:text-slate-400">
                          {selectedUser.lastSeen ?? "Unknown"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-lg border border-slate-100 bg-slate-50/60 p-3 text-[11px] dark:border-slate-800 dark:bg-black/50">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                      Systems & care plans
                    </h3>
                    {userSystems.length > 0 ? (
                      <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                        {userSystems.map((s) => (
                          <li key={s.id} className="py-2">
                            <p className="font-semibold text-slate-800 dark:text-slate-100">
                              {s.systemType}
                            </p>
                            {s.address && (
                              <p className="text-slate-500 dark:text-slate-400">
                                {s.address}
                              </p>
                            )}
                            <p className="mt-1 text-slate-600 dark:text-slate-300">
                              {s.carePlanName
                                ? s.carePlanName
                                : s.coveredByCarePlan
                                ? "Covered by plan"
                                : "No care plan"}
                            </p>
                            <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                              {s.carePlanPricePerMonth
                                ? `£${s.carePlanPricePerMonth.toFixed(2)}/${
                                    (s.carePlanBillingFrequency ?? "Monthly").toLowerCase()
                                  }`
                                : "Pricing TBC"}
                            </p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-500 dark:text-slate-400">
                        No systems linked to this user yet.
                      </p>
                    )}
                  </div>
                </>
              )}

              <div className="space-y-2 rounded-lg border border-dashed border-emerald-300/60 bg-emerald-50/40 p-3 text-xs dark:border-emerald-400/60 dark:bg-emerald-950/20">
                <h3 className="text-[11px] font-semibold uppercase tracking-wide text-emerald-900 dark:text-emerald-200">
                  Invite a new user
                </h3>
                <p className="text-[11px] text-emerald-900/80 dark:text-emerald-100/90">
                  Capture name and email to invite a homeowner into the
                  portal. In the live system this would trigger an email
                  invite via Firebase + your CRM.
                </p>
                <form onSubmit={handleInvite} className="mt-1 grid gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto]">
                  <input
                    type="text"
                    placeholder="Homeowner name"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className="w-full rounded-md border border-emerald-200 bg-white px-2 py-1.5 text-[11px] shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-emerald-500/60 dark:bg-black dark:text-emerald-50"
                  />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full rounded-md border border-emerald-200 bg-white px-2 py-1.5 text-[11px] shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-emerald-500/60 dark:bg-black dark:text-emerald-50"
                  />
                  <button
                    type="submit"
                    className="mt-1 inline-flex items-center justify-center rounded-md bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-emerald-700 sm:mt-0"
                  >
                    Invite
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeSection === "care-plans" && (
        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-neutral-950/80">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-medium text-slate-800 dark:text-slate-100">
                Care plans
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                See which systems are covered and how they are billed.
              </p>
            </div>
            <div className="text-right text-xs text-slate-500 dark:text-slate-400">
              {companyRecord && (
                <p>
                  Company plan: {companyRecord.carePlanType ?? "None"}
                </p>
              )}
              <p>
                {activeSystems.length} active care plan
                {activeSystems.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <tr>
                  <th className="px-2 py-2">System</th>
                  <th className="px-2 py-2">Care plan</th>
                  <th className="px-2 py-2">Price</th>
                  <th className="px-2 py-2">Billing</th>
                  <th className="px-2 py-2">Next payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeSystems.map((s) => (
                  <tr key={s.id}>
                    <td className="px-2 py-2 align-top">
                      <p className="text-xs font-medium text-slate-900 dark:text-slate-50">
                        {s.systemType}
                      </p>
                      {s.address && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {s.address}
                        </p>
                      )}
                    </td>
                    <td className="px-2 py-2 align-top text-xs text-slate-700 dark:text-slate-200">
                      {s.carePlanName ?? (s.coveredByCarePlan ? "Covered" : "No plan")}
                    </td>
                    <td className="px-2 py-2 align-top text-xs text-slate-700 dark:text-slate-200">
                      {s.carePlanPricePerMonth
                        ? `£${s.carePlanPricePerMonth.toFixed(2)}/mo`
                        : "-"}
                    </td>
                    <td className="px-2 py-2 align-top text-xs text-slate-700 dark:text-slate-200">
                      {s.carePlanBillingFrequency ?? "Monthly"}
                    </td>
                    <td className="px-2 py-2 align-top text-[11px] text-slate-600 dark:text-slate-300">
                      {s.carePlanNextPaymentDate
                        ? toJsDate(s.carePlanNextPaymentDate as any).toLocaleDateString()
                        : "--"}
                    </td>
                  </tr>
                ))}
                {systems.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-2 py-4 text-xs text-slate-500 dark:text-slate-400"
                    >
                      No systems found yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            In the production build this table would be fully editable, with
            Firestore-backed care plan templates and pricing controls.
          </p>
        </section>
      )}

      {activeSection === "tickets" && (
        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-neutral-950/80">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-sm font-medium text-slate-800 dark:text-slate-100">
                Support tickets
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                View, search and triage every ticket from the portal.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={ticketFilter}
                onChange={(e) =>
                  setTicketFilter(e.target.value as "all" | "open" | "closed")
                }
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-black dark:text-slate-100"
              >
                <option value="all">All</option>
                <option value="open">Open only</option>
                <option value="closed">Closed / resolved</option>
              </select>
              <input
                type="search"
                placeholder="Search by issue, description or ID"
                value={ticketSearch}
                onChange={(e) => setTicketSearch(e.target.value)}
                className="w-full min-w-[12rem] flex-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-black dark:text-slate-100"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <tr>
                  <th className="px-2 py-2">Issue</th>
                  <th className="px-2 py-2">Priority</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Raised</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTickets.map((t) => (
                  <tr key={t.id}>
                    <td className="px-2 py-2 align-top">
                      <p className="text-xs font-medium text-slate-900 dark:text-slate-50">
                        {t.issueType}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {t.description}
                      </p>
                    </td>
                    <td className="px-2 py-2 align-top text-xs text-slate-700 dark:text-slate-200">
                      {t.priority}
                    </td>
                    <td className="px-2 py-2 align-top text-xs">
                      <select
                        value={t.status}
                        onChange={(e) => handleTicketStatusChange(t.id, e.target.value)}
                        className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      >
                        <option value="Open">Open</option>
                        <option value="In progress">In progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                    <td className="px-2 py-2 align-top text-[11px] text-slate-600 dark:text-slate-300">
                      {toJsDate(t.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {filteredTickets.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-2 py-4 text-xs text-slate-500 dark:text-slate-400"
                    >
                      No tickets match this view.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Ticket edits here are for demo only – in production they would be
            synced to your helpdesk or CRM.
          </p>
        </section>
      )}

      {activeSection === "upsell" && (
        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-neutral-950/80">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-medium text-slate-800 dark:text-slate-100">
                Upsell & push notifications
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Create targeted in-portal messages to promote care plans,
                batteries, solar and more.
              </p>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {notifications.length} live message{notifications.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <form onSubmit={handleSendNotification} className="space-y-3 rounded-lg border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-black/40">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                New upsell message
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-slate-700 dark:text-slate-200">
                    Title
                  </label>
                  <input
                    type="text"
                    value={notificationTitle}
                    onChange={(e) => setNotificationTitle(e.target.value)}
                    required
                    className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-black dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-slate-700 dark:text-slate-200">
                    Audience
                  </label>
                  <select
                    value={notificationAudience}
                    onChange={(e) =>
                      setNotificationAudience(
                        e.target.value as "all" | "heat-pump" | "solar-battery",
                      )
                    }
                    className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-black dark:text-slate-100"
                  >
                    <option value="all">All customers</option>
                    <option value="heat-pump">Heat pump customers</option>
                    <option value="solar-battery">Solar & battery customers</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-slate-700 dark:text-slate-200">
                  Message body
                </label>
                <textarea
                  value={notificationBody}
                  onChange={(e) => setNotificationBody(e.target.value)}
                  required
                  rows={4}
                  className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-black dark:text-slate-100"
                  placeholder="Explain the offer you want customers to see."
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-slate-700 dark:text-slate-200">
                  Call to action label (optional)
                </label>
                <input
                  type="text"
                  value={notificationCtaLabel}
                  onChange={(e) => setNotificationCtaLabel(e.target.value)}
                  placeholder="For example: Get a quote"
                  className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-black dark:text-slate-100"
                />
              </div>
              {notificationMessage && (
                <p className="text-[11px] text-emerald-500">{notificationMessage}</p>
              )}
              <button
                type="submit"
                disabled={sendingNotification}
                className="inline-flex items-center rounded-md bg-brand-600 px-4 py-1.5 text-[11px] font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {sendingNotification ? "Sending..." : "Send upsell message"}
              </button>
            </form>

            <div className="space-y-3 rounded-lg border border-slate-100 bg-slate-50/60 p-3 text-xs dark:border-slate-800 dark:bg-black/50">
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Performance
              </h3>
              <div className="grid gap-2 md:grid-cols-2">
                {notifications.map((n) => {
                  const count = interests.filter(
                    (i) => i.notificationId === n.id,
                  ).length;
                  return (
                    <div
                      key={n.id}
                      className="rounded-md border border-slate-100 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-950/70"
                    >
                      <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {toJsDate(n.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-50">
                        {n.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-[11px] text-slate-600 dark:text-slate-300">
                        {n.body}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-700 dark:text-slate-200">
                        {count === 0
                          ? "No clicks yet"
                          : `${count} customer${count === 1 ? "" : "s"} clicked`}
                      </p>
                    </div>
                  );
                })}
                {notifications.length === 0 && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    No upsell messages have been created yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {activeSection === "correspondence" && (
        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-neutral-950/80">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-medium text-slate-800 dark:text-slate-100">
                Correspondence
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                See and reply to messages that appear inside the customer
                portal.
              </p>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {adminCorrespondence.length} message
              {adminCorrespondence.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-[minmax(0,2.2fr)_minmax(0,2.8fr)]">
            <div className="space-y-2 rounded-lg border border-slate-100 bg-slate-50/60 p-2 text-xs dark:border-slate-800 dark:bg-black/40">
              {adminCorrespondence
                .slice()
                .sort(
                  (a, b) =>
                    toJsDate(b.sentAt).getTime() - toJsDate(a.sentAt).getTime(),
                )
                .map((c) => (
                  <div
                    key={c.id}
                    className="rounded-md border border-slate-100 bg-white p-2 text-xs shadow-sm dark:border-slate-700 dark:bg-slate-950/70"
                  >
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {toJsDate(c.sentAt).toLocaleString()}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-xs font-semibold text-slate-900 dark:text-slate-50">
                      {c.subject}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-600 dark:text-slate-300">
                      {c.body}
                    </p>
                  </div>
                ))}
              {adminCorrespondence.length === 0 && (
                <p className="px-1 py-4 text-[11px] text-slate-500 dark:text-slate-400">
                  No correspondence has been logged yet.
                </p>
              )}
            </div>

            <form onSubmit={handleReply} className="space-y-3 rounded-lg border border-slate-100 bg-slate-50/60 p-3 text-xs dark:border-slate-800 dark:bg-black/50">
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Reply to customer
              </h3>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-slate-700 dark:text-slate-200">
                  Subject
                </label>
                <input
                  type="text"
                  value={replySubject}
                  onChange={(e) => setReplySubject(e.target.value)}
                  required
                  className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-black dark:text-slate-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-slate-700 dark:text-slate-200">
                  Message
                </label>
                <textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  required
                  rows={5}
                  className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-black dark:text-slate-100"
                  placeholder="Write a reply that will appear in the customer portal."
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center rounded-md bg-slate-900 px-4 py-1.5 text-[11px] font-medium text-white shadow-sm hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
              >
                Send reply
              </button>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Demo only – in production this would send via email and store
                the message in Firestore.
              </p>
            </form>
          </div>
        </section>
      )}
    </div>
  );
}
