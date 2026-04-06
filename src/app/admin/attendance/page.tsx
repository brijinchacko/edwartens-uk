import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AttendanceClient from "./AttendanceClient";

export const metadata: Metadata = {
  title: "Attendance | EDWartens Admin",
  description: "Employee attendance reports and downloads",
};

const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN", "HR_MANAGER"];

export default async function AttendancePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as { role: string };
  if (!ALLOWED_ROLES.includes(user.role)) {
    redirect("/admin/dashboard");
  }

  return <AttendanceClient />;
}
