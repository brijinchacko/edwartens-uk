import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import PipelineClient from "./PipelineClient";

export const metadata: Metadata = {
  title: "Lifecycle Pipeline | EDWartens Admin",
  description: "Lead to Student to Alumni lifecycle pipeline view",
};

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userRole = (session.user as { role: string }).role;
  return <PipelineClient userRole={userRole} />;
}
