import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import TeamActivityClient from "./TeamActivityClient";

export const metadata: Metadata = {
  title: "Team Activity | EDWartens Admin",
  description: "Real-time team work session monitoring",
};

export default async function TeamActivityPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as { role: string };

  // Only SUPER_ADMIN and ADMIN can see team activity
  if (!["SUPER_ADMIN", "ADMIN"].includes(user.role)) {
    redirect("/admin/dashboard");
  }

  return <TeamActivityClient />;
}
