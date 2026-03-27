import { getTestSession } from "@/lib/test-session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  PlayCircle,
  CheckCircle2,
  Lock,
  Clock,
  ChevronRight,
} from "lucide-react";

export default async function SessionsPage() {
  const session = getTestSession("STUDENT");

  interface SessionWithProgress {
    id: string;
    title: string;
    description: string | null;
    duration: number | null;
    order: number;
    isMandatory: boolean;
    videoUrl: string | null;
    phase: { id: string; number: number; name: string; order: number };
    progress: Array<{
      status: string;
      watchedSeconds: number;
      completedAt: Date | null;
    }>;
  }

  let sessionsByPhase: Record<string, { phase: { id: string; number: number; name: string; order: number }; sessions: SessionWithProgress[] }> = {};
  let completedSessionIds: Set<string> = new Set();

  try {
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      include: {
        batch: true,
        sessionProgress: true,
      },
    });

    if (student?.batch) {
      const allSessions = await prisma.session.findMany({
        where: { batchId: student.batch.id },
        include: {
          phase: true,
          progress: {
            where: { studentId: student.id },
          },
        },
        orderBy: [{ phase: { order: "asc" } }, { order: "asc" }],
      });

      // Build completed set
      student.sessionProgress
        .filter((sp) => sp.status === "COMPLETED")
        .forEach((sp) => completedSessionIds.add(sp.sessionId));

      // Group by phase
      for (const s of allSessions) {
        const phaseKey = s.phase.id;
        if (!sessionsByPhase[phaseKey]) {
          sessionsByPhase[phaseKey] = {
            phase: s.phase,
            sessions: [],
          };
        }
        sessionsByPhase[phaseKey].sessions.push(s);
      }
    }
  } catch (error) {
    console.error("Sessions data error:", error);
  }

  const phases = Object.values(sessionsByPhase).sort(
    (a, b) => a.phase.order - b.phase.order
  );

  // Determine if a session is locked
  function isLocked(
    phaseIndex: number,
    sessionIndex: number,
    sessionId: string
  ): boolean {
    if (completedSessionIds.has(sessionId)) return false;
    // First session of first phase is always unlocked
    if (phaseIndex === 0 && sessionIndex === 0) return false;

    // Check if previous mandatory session is completed
    const allOrderedSessions = phases.flatMap((p) => p.sessions);
    const currentIdx = allOrderedSessions.findIndex((s) => s.id === sessionId);
    if (currentIdx <= 0) return false;

    // Find previous mandatory session
    for (let i = currentIdx - 1; i >= 0; i--) {
      const prev = allOrderedSessions[i];
      if (prev.isMandatory) {
        return !completedSessionIds.has(prev.id);
      }
    }
    return false;
  }

  function getStatusInfo(s: SessionWithProgress, locked: boolean) {
    if (locked)
      return {
        icon: <Lock size={16} className="text-text-muted" />,
        label: "Locked",
        color: "text-text-muted",
      };
    const prog = s.progress[0];
    if (prog?.status === "COMPLETED")
      return {
        icon: <CheckCircle2 size={16} className="text-neon-green" />,
        label: "Completed",
        color: "text-neon-green",
      };
    if (prog?.status === "IN_PROGRESS")
      return {
        icon: <Clock size={16} className="text-neon-blue" />,
        label: "In Progress",
        color: "text-neon-blue",
      };
    return {
      icon: <PlayCircle size={16} className="text-text-muted" />,
      label: "Not Started",
      color: "text-text-muted",
    };
  }

  function formatDuration(seconds: number | null) {
    if (!seconds) return "--";
    const m = Math.floor(seconds / 60);
    return `${m} min`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-text-primary">
          Recorded Sessions
        </h1>
        <p className="text-sm text-text-muted">
          {completedSessionIds.size} completed
        </p>
      </div>

      {phases.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <PlayCircle
            size={40}
            className="mx-auto text-text-muted mb-3"
          />
          <p className="text-text-secondary">
            No sessions available yet. Check back later.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {phases.map((phaseGroup, phaseIndex) => (
            <div key={phaseGroup.phase.id}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-purple/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-purple">
                    P{phaseGroup.phase.number}
                  </span>
                </div>
                <h2 className="text-sm font-semibold text-text-primary">
                  {phaseGroup.phase.name}
                </h2>
                <span className="text-xs text-text-muted">
                  {phaseGroup.sessions.filter((s) =>
                    completedSessionIds.has(s.id)
                  ).length}{" "}
                  / {phaseGroup.sessions.length} done
                </span>
              </div>

              <div className="space-y-2">
                {phaseGroup.sessions.map((s, sessionIndex) => {
                  const locked = isLocked(phaseIndex, sessionIndex, s.id);
                  const status = getStatusInfo(s, locked);

                  return (
                    <div key={s.id}>
                      {locked ? (
                        <div className="glass-card p-4 opacity-50 cursor-not-allowed">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-dark-primary flex items-center justify-center shrink-0">
                              {status.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-text-primary truncate">
                                {s.title}
                              </p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className={`text-xs ${status.color}`}>
                                  {status.label}
                                </span>
                                <span className="text-xs text-text-muted">
                                  {formatDuration(s.duration)}
                                </span>
                                {s.isMandatory && (
                                  <span className="text-xs text-red-400/60">
                                    Mandatory
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Link href={`/student/sessions/${s.id}`}>
                          <div className="glass-card p-4 hover:bg-surface-hover transition-colors group">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-dark-primary flex items-center justify-center shrink-0">
                                {status.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-text-primary truncate">
                                  {s.title}
                                </p>
                                <div className="flex items-center gap-3 mt-1">
                                  <span
                                    className={`text-xs ${status.color}`}
                                  >
                                    {status.label}
                                  </span>
                                  <span className="text-xs text-text-muted">
                                    {formatDuration(s.duration)}
                                  </span>
                                  {s.isMandatory && (
                                    <span className="text-xs text-red-400/60">
                                      Mandatory
                                    </span>
                                  )}
                                </div>
                              </div>
                              <ChevronRight
                                size={16}
                                className="text-text-muted group-hover:text-neon-blue transition-colors shrink-0"
                              />
                            </div>
                          </div>
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
