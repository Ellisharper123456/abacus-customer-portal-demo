"use client";

import { FormEvent, useState } from "react";
import { usePromotions, useReferrals } from "@/lib/hooks/useCompanyScopedCollections";

export default function RewardsPage() {
  const { data: promotions } = usePromotions();
  const { data: referrals } = useReferrals();
  const [friendName, setFriendName] = useState("");
  const [address, setAddress] = useState("");
  const [postcode, setPostcode] = useState("");
  const [friendPhone, setFriendPhone] = useState("");
  const [friendEmail, setFriendEmail] = useState("");
  const [products, setProducts] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccessMessage(
        "Thank you – we’ve received your friend’s details. Our team will be in touch with them and, if they go ahead with an installation, we’ll send your £150 Amazon voucher once everything is complete."
      );
      setFriendName("");
      setAddress("");
      setPostcode("");
      setFriendEmail("");
      setFriendPhone("");
      setProducts([]);
      setNotes("");
    }, 600);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Refer a friend & rewards</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-neutral-950/80">
          <h2 className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-100">Refer a friend</h2>
          <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
            Know someone who would love lower bills and a warmer, more efficient home? Share a friend, family member or neighbour you think would benefit from an Abacus installation.
            If they go ahead with a system, we&apos;ll send you a £150 Amazon voucher as a thank you once their installation is complete and paid.
          </p>
          <form onSubmit={handleSubmit} className="space-y-3 text-sm">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-200">
                Your friend&apos;s name
              </label>
              <input
                type="text"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                required
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-black dark:text-slate-100"
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-200">
                  Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-black dark:text-slate-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-200">
                  Postcode
                </label>
                <input
                  type="text"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  required
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-black dark:text-slate-100"
                />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-200">
                  Friend&apos;s email
                </label>
                <input
                  type="email"
                  value={friendEmail}
                  onChange={(e) => setFriendEmail(e.target.value)}
                  required
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-black dark:text-slate-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-200">
                  Friend&apos;s phone
                </label>
                <input
                  type="tel"
                  value={friendPhone}
                  onChange={(e) => setFriendPhone(e.target.value)}
                  required
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-black dark:text-slate-100"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-200">
                Products they&apos;re interested in
              </label>
              <div className="grid gap-2 text-xs md:grid-cols-2">
                {["Solar Panels", "Battery Storage", "Air Source Heat Pump", "Ground Source Heat Pump", "EV Charger"].map(
                  (label) => {
                    const checked = products.includes(label);
                    return (
                      <label key={label} className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 hover:bg-slate-100 dark:border-slate-700 dark:bg-black/60 dark:hover:bg-black">
                        <input
                          type="checkbox"
                          className="h-3 w-3 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-500"
                          checked={checked}
                          onChange={() => {
                            setProducts((prev) =>
                              checked ? prev.filter((p) => p !== label) : [...prev, label]
                            );
                          }}
                        />
                        <span>{label}</span>
                      </label>
                    );
                  }
                )}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-200">
                Anything we should know? (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-black dark:text-slate-100"
                placeholder="For example, what they&apos;re interested in or the best time to contact them."
              />
            </div>
            {successMessage && (
              <p className="text-xs text-emerald-500">{successMessage}</p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center rounded-md bg-brand-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Submitting..." : "Submit referral"}
            </button>
          </form>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-neutral-950/80">
          <h2 className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-100">How your reward works</h2>
          {promotions.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              We&apos;ll periodically run special thank-you rewards for our customers. When one is live,
              you&apos;ll see the details here.
            </p>
          )}
          <ul className="space-y-3 text-sm">
            {promotions.map((promo) => (
              <li
                key={promo.id}
                className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900 dark:border-amber-300/70 dark:bg-amber-900/30 dark:text-amber-50"
              >
                <p className="font-medium">{promo.title}</p>
                <p className="text-xs text-amber-900/80 dark:text-amber-100">{promo.description}</p>
                <p className="mt-2 text-[11px] text-amber-900/80 dark:text-amber-100">
                  In a full build this would appear in your account automatically once your referral is marked as installed.
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-neutral-950/80">
        <h2 className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-100">Your past referrals</h2>
        {referrals.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            When you start referring friends and neighbours, you&apos;ll be able to see where each one is up to here.
          </p>
        )}
        {referrals.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <tr>
                  <th className="px-2 py-2">Friend</th>
                  <th className="px-2 py-2">Products</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Reward</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {referrals.map((ref) => (
                  <tr key={ref.id}>
                    <td className="px-2 py-2">
                      <div className="text-slate-900 dark:text-slate-50">{ref.friendName}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{ref.postcode}</div>
                    </td>
                    <td className="px-2 py-2 text-xs text-slate-700 dark:text-slate-300">
                      {ref.productsInterested.join(", ")}
                    </td>
                    <td className="px-2 py-2 text-xs">
                      <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {ref.status}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-xs">
                      {ref.status === "Completed" && ref.rewardUrl ? (
                        <button className="rounded-md bg-amber-500 px-3 py-1 text-[11px] font-medium text-white shadow-sm hover:bg-amber-600 dark:bg-amber-400 dark:hover:bg-amber-300 dark:text-slate-900">
                          View gift card
                        </button>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
