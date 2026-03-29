import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import SessionsClient from "./SessionsClient";

export const metadata: Metadata = {
  title: "Sessions | EDWartens Admin",
  description: "Manage training sessions",
};

async function getSessions() {
  try {
    const sessions = await prisma.session.findMany({
      include: {
        phase: { select: { id: true, number: true, name: true, course: true } },
        batch: { select: { id: true, name: true } },
        _count: { select: { progress: true } },
      },
      orderBy: [{ phase: { number: "asc" } }, { order: "asc" }],
    });

    const completionCounts = await prisma.sessionProgress.groupBy({
      by: ["sessionId"],
      where: { status: "COMPLETED" },
      _count: true,
    });

    const completionMap = Object.fromEntries(
      completionCounts.map((c: any) => [c.sessionId, c._count])
    );

    return sessions.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      videoUrl: s.videoUrl,
      videoPlatform: s.videoPlatform,
      duration: s.duration,
      isMandatory: s.isMandatory,
      order: s.order,
      phase: s.phase,
      batch: s.batch,
      enrolled: s._count.progress,
      completed: completionMap[s.id] || 0,
    }));
  } catch {
    return [];
  }
}

export default async function SessionsPage() {
  const sessions = await getSessions();
  return <SessionsClient initialSessions={sessions} />;
}
