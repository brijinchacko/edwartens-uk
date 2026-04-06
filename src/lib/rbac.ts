// Role-Based Access Control for EDWartens CRM

export type Permission =
  | "users:manage"
  | "settings:manage"
  | "leads:read"
  | "leads:write"
  | "leads:assign"
  | "students:read"
  | "students:write"
  | "batches:manage"
  | "sessions:manage"
  | "assessments:manage"
  | "documents:manage"
  | "alumni:read"
  | "career:manage"
  | "certificates:manage"
  | "software:verify"
  | "jobs:manage"
  | "pipeline:read"
  | "notifications:read"
  | "question-bank:manage"
  | "dashboard:read";

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  SUPER_ADMIN: [
    "users:manage",
    "settings:manage",
    "leads:read",
    "leads:write",
    "leads:assign",
    "students:read",
    "students:write",
    "batches:manage",
    "sessions:manage",
    "assessments:manage",
    "documents:manage",
    "alumni:read",
    "career:manage",
    "certificates:manage",
    "software:verify",
    "jobs:manage",
    "pipeline:read",
    "notifications:read",
    "question-bank:manage",
    "dashboard:read",
  ],
  ADMIN: [
    "users:manage",
    "leads:read",
    "leads:write",
    "leads:assign",
    "students:read",
    "students:write",
    "batches:manage",
    "sessions:manage",
    "assessments:manage",
    "documents:manage",
    "alumni:read",
    "career:manage",
    "certificates:manage",
    "software:verify",
    "jobs:manage",
    "pipeline:read",
    "notifications:read",
    "question-bank:manage",
    "dashboard:read",
  ],
  SALES_LEAD: [
    "leads:read",
    "leads:write",
    "leads:assign",
    "pipeline:read",
    "dashboard:read",
  ],
  ADMISSION_COUNSELLOR: [
    "leads:read",
    "leads:write",
    "students:read",
    "students:write",
    "documents:manage",
    "alumni:read",
    "career:manage",
    "pipeline:read",
    "dashboard:read",
  ],
  TRAINER: [
    "students:read",
    "batches:manage",
    "sessions:manage",
    "assessments:manage",
    "software:verify",
    "question-bank:manage",
    "dashboard:read",
  ],
  HR_MANAGER: [
    "users:manage",
    "students:read",
    "alumni:read",
    "dashboard:read",
    "pipeline:read",
    "notifications:read",
    "documents:manage",
  ],
};

export function hasPermission(role: string, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.includes(permission);
}

export function hasAnyPermission(role: string, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function getPermissions(role: string): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

// CRM roles that can access the admin panel
export const CRM_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "SALES_LEAD",
  "ADMISSION_COUNSELLOR",
  "TRAINER",
  "HR_MANAGER",
];

// Check if a role can access admin panel
export function isCrmRole(role: string): boolean {
  return CRM_ROLES.includes(role);
}

// Role display labels
export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  SALES_LEAD: "Sales Lead",
  ADMISSION_COUNSELLOR: "Admission Counsellor",
  TRAINER: "Trainer",
  HR_MANAGER: "HR Manager",
  STUDENT: "Student",
};

// Navigation items per role for the admin sidebar
export function getNavItemsForRole(role: string): string[] {
  switch (role) {
    case "SUPER_ADMIN":
      return [
        "dashboard", "leads", "pipeline", "students", "batches", "sessions",
        "assessments", "question-bank", "career", "certificates", "invoices", "jobs", "alumni", "alumni-network", "referrals", "team-activity", "employees",
        "kpi", "reports", "feedback", "users", "emails", "drip-campaigns", "calendar", "notifications", "import", "audit", "monitoring", "analytics", "attendance", "settings",
      ];
    case "ADMIN":
      return [
        "dashboard", "leads", "pipeline", "students", "batches", "sessions",
        "assessments", "question-bank", "career", "certificates", "invoices", "jobs", "alumni", "alumni-network", "referrals", "team-activity", "employees",
        "kpi", "reports", "feedback", "emails", "drip-campaigns", "calendar", "notifications", "import", "analytics", "settings",
      ];
    case "SALES_LEAD":
      return ["dashboard", "leads", "pipeline", "kpi", "emails", "calendar", "notifications", "settings"];
    case "ADMISSION_COUNSELLOR":
      return [
        "dashboard", "leads", "pipeline", "students", "career", "alumni", "kpi", "emails", "calendar", "notifications", "settings",
      ];
    case "TRAINER":
      return ["dashboard", "batches", "sessions", "assessments", "question-bank", "students", "notifications", "settings"];
    case "HR_MANAGER":
      return ["dashboard", "employees", "team-activity", "kpi", "reports", "attendance", "monitoring", "users", "notifications", "settings"];
    default:
      return ["dashboard"];
  }
}
