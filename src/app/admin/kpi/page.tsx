import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import KPIDashboardClient from "./KPIDashboardClient";

export const metadata: Metadata = {
  title: "KPI Dashboard | EDWartens Admin",
  description: "Employee performance metrics and KPI tracking",
};

const ALLOWED_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "SALES_LEAD",
  "ADMISSION_COUNSELLOR",
];

export default async function KPIDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as {
    id: string;
    role: string;
    name?: string | null;
  };

  if (!ALLOWED_ROLES.includes(user.role)) {
    redirect("/admin/dashboard");
  }

  return (
    <KPIDashboardClient
      userId={user.id}
      userRole={user.role}
      userName={user.name ?? ""}
    />
  );
}
