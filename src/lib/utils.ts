import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "GBP"): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const UK_TIMEZONE = "Europe/London";

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: UK_TIMEZONE,
  }).format(new Date(date));
}

export function formatTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: UK_TIMEZONE,
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: UK_TIMEZONE,
  }).format(new Date(date));
}

export function formatShortDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: UK_TIMEZONE,
  }).format(new Date(date));
}

export function formatDateWithWeekday(date: Date | string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: UK_TIMEZONE,
  }).format(new Date(date));
}

export function generateCertificateNo(sequence: number): string {
  const year = new Date().getFullYear();
  return `EDW-UK-${year}-${String(sequence).padStart(5, "0")}`;
}

export function generateInvoiceNumber(sequence: number): string {
  const year = new Date().getFullYear();
  return `EDW-INV-${year}-${String(sequence).padStart(5, "0")}`;
}

export function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const COURSE_LABELS: Record<string, string> = {
  PROFESSIONAL_MODULE: "Professional Module",
  AI_MODULE: "AI Module",
};

export const LEAD_STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  FIRST_CALL: "First Call",
  CONSULTATION_ARRANGED: "Consultation Arranged",
  CONSULTATION_COMPLETED: "Consultation Completed",
  QUALIFIED: "Qualified",
  REGISTERED: "Registered",
  ENROLLED: "Enrolled",
  LOST: "Lost",
};

export const LEAD_STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  NEW: { bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/20" },
  CONTACTED: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  FIRST_CALL: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20" },
  CONSULTATION_ARRANGED: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
  CONSULTATION_COMPLETED: { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/20" },
  QUALIFIED: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  REGISTERED: { bg: "bg-neon-green/10", text: "text-neon-green", border: "border-neon-green/20" },
  ENROLLED: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20" },
  LOST: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
};

export const LEAD_PIPELINE_ORDER = [
  "NEW", "CONTACTED", "FIRST_CALL", "CONSULTATION_ARRANGED",
  "CONSULTATION_COMPLETED", "QUALIFIED", "REGISTERED", "ENROLLED", "LOST",
] as const;

export const LEAD_CATEGORIES = [
  "First Call",
  "Arranged Call",
  "Completed Call",
  "Career Guidance Stage 1",
  "Career Guidance Stage 2",
  "Career Guidance Stage 3",
  "Batch Confirmed",
  "Not Interested",
  "Not Interested from 1st Call",
  "Dropped",
  "Enrolled",
  "In Training",
  "Offline Session",
  "Issuing Certificate",
  "Job Support",
  "Internship",
  "Projects",
  "Placed",
  "Pakistan Candidates",
] as const;

export const STUDENT_STATUS_LABELS: Record<string, string> = {
  ONBOARDING: "Onboarding",
  ACTIVE: "In Training",
  ON_HOLD: "On Hold",
  POST_TRAINING: "Post-Training",
  CAREER_SUPPORT: "Career Support",
  COMPLETED: "Completed",
  ALUMNI_PLACED: "Alumni (Placed)",
  ALUMNI_NOT_PLACED: "Alumni (Not Placed)",
  DROPPED: "Dropped",
};
