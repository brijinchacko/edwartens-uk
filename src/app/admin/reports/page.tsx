import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReportsClient } from "./ReportsClient";

export const metadata: Metadata = {
  title: "Reports | EDWartens Admin",
  description: "Comprehensive CRM reports and analytics",
};

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = (session.user as { role?: string }).role;
  if (!role || !["SUPER_ADMIN", "ADMIN"].includes(role)) {
    redirect("/admin/dashboard");
  }

  return <ReportsClient userRole={role || "ADMIN"} />;
}
