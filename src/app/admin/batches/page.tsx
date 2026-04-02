import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import BatchListClient from "./BatchListClient";

export default async function BatchesPage() {
  const session = await auth();
  if (!session?.user || !hasPermission(session.user.role, "batches:manage")) {
    redirect("/admin");
  }

  const batches = await prisma.batch.findMany({
    include: {
      instructor: {
        include: {
          user: { select: { name: true, email: true } },
        },
      },
      _count: {
        select: { students: true, sessions: true, readiness: true },
      },
      readiness: {
        where: { isReady: true },
        select: { id: true },
      },
    },
    orderBy: { startDate: "desc" },
  });

  // Serialize dates for client component
  const serialized = batches.map((b) => ({
    ...b,
    startDate: b.startDate.toISOString(),
    endDate: b.endDate?.toISOString() || null,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
    trainerAcceptedAt: b.trainerAcceptedAt?.toISOString() || null,
  }));

  // Collect unique trainer names for filter dropdown
  const trainerNames = Array.from(
    new Set(
      batches
        .map((b) => b.instructor?.user?.name)
        .filter((n): n is string => !!n)
    )
  ).sort();

  return <BatchListClient initialBatches={serialized} trainerNames={trainerNames} />;
}
