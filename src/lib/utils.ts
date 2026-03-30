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

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
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
  QUALIFIED: "Qualified",
  ENROLLED: "Enrolled",
  LOST: "Lost",
};

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
