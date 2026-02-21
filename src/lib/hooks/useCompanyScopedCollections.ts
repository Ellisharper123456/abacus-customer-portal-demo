"use client";

import { useEffect, useState } from "react";
import type {
  Booking,
  Company,
  CorrespondenceRecord,
  DocumentRecord,
  Promotion,
  Referral,
  SupportTicket,
  System,
} from "@/lib/firebase/types";
import { useAuth } from "@/lib/auth/AuthContext";

interface HookState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

// --- In-memory mock data for demo purposes only ---
const DEMO_COMPANY_ID = "demo-company";

const mockCompany: Company = {
  id: DEMO_COMPANY_ID,
  name: "Emma Thompson",
  accountManager: "Alex Johnson",
  serviceLevel: "Care Plan",
  carePlanType: "Care Plan 3 years",
  carePlanStartDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) as any,
  carePlanPricePerMonth: 22.5,
  carePlanBillingFrequency: "Monthly",
  carePlanNextPaymentDate: new Date(new Date().setMonth(new Date().getMonth() + 1, 1)) as any,
} as Company;

const now = new Date();
const twoYearsAgo = new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000);
const lastYear = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
const sixMonthsAgo = new Date(now.getTime() - 182 * 24 * 60 * 60 * 1000);
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

// For the demo, we use JS Date and cast to any where Timestamp is expected.
const mockBookings: Booking[] = [
  // Installation visit two years ago
  {
    id: "booking-install-1",
    companyId: DEMO_COMPANY_ID,
    date: twoYearsAgo as any,
    timeWindow: "All day",
    engineer: "Abacus install team A",
    status: "Completed",
    notes: "Full heat pump system install completed for Emma Thompson.",
    createdAt: twoYearsAgo as any,
  },
  // First annual service last year
  {
    id: "booking-service-1",
    companyId: DEMO_COMPANY_ID,
    date: lastYear as any,
    timeWindow: "09:00 - 11:00",
    engineer: "James Griffith",
    status: "Completed",
    notes:
      "Annual service: no faults found. Cleaned filters, checked pressures and confirmed flow temperatures.",
    createdAt: lastYear as any,
  },
  // Upcoming service tomorrow
  {
    id: "booking-service-2",
    companyId: DEMO_COMPANY_ID,
    date: tomorrow as any,
    timeWindow: "09:00 - 11:00",
    engineer: "James Griffith",
    status: "Scheduled",
    notes: "Second annual service due – please ensure access to outdoor unit.",
    createdAt: now as any,
  },
];

const mockTickets: SupportTicket[] = [
  {
    id: "ticket-1",
    companyId: DEMO_COMPANY_ID,
    issueType: "No heating from heat pump",
    priority: "High",
    description: "Living room zone not heating despite thermostat calling for heat.",
    status: "Open",
    createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) as any,
    zapSynced: true,
  } as SupportTicket,
  {
    id: "ticket-2",
    companyId: DEMO_COMPANY_ID,
    issueType: "Heat pump noise",
    priority: "Medium",
    description: "Outdoor unit making intermittent rattling noise on start-up.",
    status: "Resolved",
    createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000) as any,
    resolvedAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000) as any,
    resolvedBy: "Abacus Engineer Taylor",
    zapSynced: true,
  } as SupportTicket,
];

const mockSystems: System[] = [
  {
    id: "system-1",
    companyId: DEMO_COMPANY_ID,
    systemType: "Air Source Heat Pump",
    installationDate: twoYearsAgo as any,
    address: "12 Oak Avenue, L30 1AB",
    location: "Rear garden",
    installer: "Abacus install team A",
    coveredByCarePlan: true,
    warrantyInfo:
      "5-year parts and labour warranty from install date (subject to annual service).",
    warrantyExpiry: new Date(twoYearsAgo.getTime() + 5 * 365 * 24 * 60 * 60 * 1000) as any,
    maintenanceSchedule: "Annual service",
    lastServiceDate: lastYear as any,
    nextServiceDue: tomorrow as any,
    carePlanName: "Heat pump care plan",
    carePlanPricePerMonth: 22.5,
    carePlanBillingFrequency: "Monthly",
    carePlanStartDate: lastYear as any,
    carePlanEndDate: new Date(lastYear.getTime() + 2 * 365 * 24 * 60 * 60 * 1000) as any,
    carePlanNextPaymentDate: new Date(now.getFullYear(), now.getMonth() + 1, 1) as any,
    carePlanPayments: [
      {
        date: new Date(now.getFullYear(), now.getMonth() - 2, 1) as any,
        amount: 22.5,
        status: "Paid",
      },
      {
        date: new Date(now.getFullYear(), now.getMonth() - 1, 1) as any,
        amount: 22.5,
        status: "Paid",
      },
      {
        date: new Date(now.getFullYear(), now.getMonth(), 1) as any,
        amount: 22.5,
        status: "Paid",
      },
    ],
  } as System,
  {
    id: "system-2",
    companyId: DEMO_COMPANY_ID,
    systemType: "Hot water cylinder",
    address: "12 Oak Avenue, L30 1AB",
    location: "Utility room",
    installer: "Abacus install team A",
    coveredByCarePlan: true,
    warrantyInfo: "Cylinder warranty to 2030.",
    maintenanceSchedule: "Visual check at annual service",
  } as System,
];

const mockDocuments: DocumentRecord[] = [
  {
    id: "doc-1",
    companyId: DEMO_COMPANY_ID,
    fileName: "Heat-pump-install-photos.zip",
    category: "Installation photos",
    fileUrl: "#",
    uploadedAt: twoYearsAgo as any,
  },
  {
    id: "doc-2",
    companyId: DEMO_COMPANY_ID,
    fileName: "Annual-service-report-heat-pump.pdf",
    category: "Service reports",
    fileUrl: "#",
    uploadedAt: lastYear as any,
  },
];

const mockCorrespondence: CorrespondenceRecord[] = [
  {
    id: "corr-1",
    companyId: DEMO_COMPANY_ID,
    subject: "Heat pump installation completed",
    body:
      "Hi Emma,\n\nThanks again for choosing Abacus. Your new air source heat pump at 12 Oak Avenue is now up and running. Attached are a few photos for your records.\n\nBest wishes,\nAbacus install team A",
    sentAt: twoYearsAgo as any,
  },
  {
    id: "corr-2",
    companyId: DEMO_COMPANY_ID,
    subject: "Annual service report – heat pump",
    body:
      "Hi Emma,\n\nToday I completed the annual service on your heat pump. Everything is operating as expected. I cleaned strainers and filters, checked pressures and confirmed flow temperatures. No issues to report.\n\nComments: System in good condition for its age. Please keep the area around the outdoor unit clear of leaves and debris.\n\nBest,\nJames Griffith",
    sentAt: lastYear as any,
  },
];

const mockReferrals: Referral[] = [
  {
    id: "ref-1",
    companyId: DEMO_COMPANY_ID,
    friendName: "Sarah Williams",
    address: "12 Oak Avenue",
    postcode: "L30 1AB",
    phone: "07123 456789",
    email: "sarah@example.com",
    productsInterested: ["Air Source Heat Pump"],
    status: "Completed",
    rewardUrl: "#",
    notes: "Interested after seeing our system in action.",
    createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000) as any,
    zapSynced: true,
  },
  {
    id: "ref-2",
    companyId: DEMO_COMPANY_ID,
    friendName: "Mark Evans",
    address: "34 Maple Close",
    postcode: "L30 2CD",
    phone: "07987 654321",
    email: "mark@example.com",
    productsInterested: ["Solar Panels", "Battery Storage"],
    status: "Referred",
    createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) as any,
    zapSynced: true,
  },
];

const mockPromotions: Promotion[] = [
  {
    id: "promo-1",
    title: "Refer a friend – £150 thank you",
    description:
      "Introduce a friend, family member or neighbour to Abacus. If they go ahead with a full installation, we will send you a £150 Amazon voucher as a thank you once their system is installed and paid.",
    active: true,
    createdAt: now as any,
  },
];

function useMockCollection<T>(data: T[]): HookState<T> {
  const [state, setState] = useState<HookState<T>>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setState({ data, loading: false, error: null });
    }, 300);

    return () => clearTimeout(timeout);
  }, [data]);

  return state;
}

export function useCompany(): HookState<Company> {
  // For the demo, we ignore profile.companyId and return a single mock company.
  return useMockCollection<Company>([mockCompany]);
}

export function useSystems() {
  return useMockCollection<System>(mockSystems);
}

export function useBookings() {
  return useMockCollection<Booking>(mockBookings);
}

export function useDocuments() {
  return useMockCollection<DocumentRecord>(mockDocuments);
}

export function useSupportTickets() {
  return useMockCollection<SupportTicket>(mockTickets);
}

export function useCorrespondence() {
  return useMockCollection<CorrespondenceRecord>(mockCorrespondence);
}

export function useReferrals() {
  return useMockCollection<Referral>(mockReferrals);
}

export function usePromotions() {
  return useMockCollection<Promotion>(mockPromotions);
}
