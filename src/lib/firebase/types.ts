import type { Timestamp } from "firebase/firestore";

export type Role = "admin" | "user";

export interface Company {
  id: string;
  name: string;
  accountManager?: string;
  serviceLevel?: string;
  contractRenewalDate?: Timestamp;
  // Demo-only fields for residential care plans
  carePlanType?: "Annual service" | "Care Plan 1 year" | "Care Plan 2 years" | "Care Plan 3 years";
  carePlanStartDate?: Timestamp;
  carePlanPricePerMonth?: number;
  carePlanBillingFrequency?: "Monthly" | "Annual";
  carePlanNextPaymentDate?: Timestamp;
}

export interface UserProfile {
  uid: string;
  companyId: string;
  role: Role;
}

export interface System {
  id: string;
  companyId: string;
  systemType: string;
  installationDate?: Timestamp;
  location?: string; // legacy field
  address?: string;
  installer?: string;
  coveredByCarePlan?: boolean;
  warrantyInfo?: string;
  warrantyExpiry?: Timestamp;
  maintenanceSchedule?: string;
  lastServiceDate?: Timestamp;
  nextServiceDue?: Timestamp;
  carePlanName?: string;
  carePlanPricePerMonth?: number;
  carePlanBillingFrequency?: "Monthly" | "Annual";
  carePlanStartDate?: Timestamp;
  carePlanEndDate?: Timestamp;
  carePlanNextPaymentDate?: Timestamp;
  carePlanPayments?: {
    date: Timestamp;
    amount: number;
    status: "Paid" | "Failed" | "Refunded";
  }[];
}

export interface Booking {
  id: string;
  companyId: string;
  date: Timestamp;
  timeWindow?: string;
  engineer?: string;
  status?: string;
  notes?: string;
  createdAt?: Timestamp;
}

export interface SupportTicket {
  id: string;
  companyId: string;
  issueType: string;
  priority: "Low" | "Medium" | "High";
  description: string;
  imageUrl?: string;
  status: "Open" | "In Progress" | "Resolved";
  engineerNotes?: string;
  createdAt: Timestamp;
   resolvedAt?: Timestamp;
   resolvedBy?: string;
  zapSynced: boolean;
}

export interface DocumentRecord {
  id: string;
  companyId: string;
  fileName: string;
  category?: string;
  fileUrl: string;
  uploadedAt?: Timestamp;
}

export interface CorrespondenceRecord {
  id: string;
  companyId: string;
  subject: string;
  body: string;
  sentAt: Timestamp;
}

export interface Referral {
  id: string;
  companyId: string;
  friendName: string;
  address: string;
  postcode: string;
  phone: string;
  email: string;
  productsInterested: string[];
  notes?: string;
  createdAt: Timestamp;
  status: "Referred" | "No answer" | "Completed";
  rewardUrl?: string;
  zapSynced: boolean;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  active: boolean;
  createdAt: Timestamp;
}
