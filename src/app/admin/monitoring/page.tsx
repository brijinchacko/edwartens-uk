import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import MonitoringClient from "./MonitoringClient";

export const metadata: Metadata = {
  title: "Site Monitoring | EDWartens Admin",
};

export default async function MonitoringPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");

  const user = session.user as { role: string };
  if (user.role !== "SUPER_ADMIN") redirect("/admin/dashboard");

  return <MonitoringClient />;
}
