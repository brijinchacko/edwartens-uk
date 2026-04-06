import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AnalyticsClient from "./AnalyticsClient";

export const metadata: Metadata = {
  title: "Site Analytics | EDWartens Admin",
  description: "Website traffic, sources, and visitor analytics",
};

const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN"];

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as { role: string };
  if (!ALLOWED_ROLES.includes(user.role)) {
    redirect("/admin/dashboard");
  }

  return <AnalyticsClient />;
}
