import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  PlayCircle,
  CheckCircle2,
  Lock,
  Clock,
  ChevronRight,
  BookOpen,
  TrendingUp,
} from "lucide-react";

export default async function SessionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  interface SessionWithProgress {
    id: string;
    title: string;
    description: string | null;
    duration: number | null;
    order: number;
    isMandatory: boolean;
    videoUrl: string | null;
    videoPlatform: string | null;
    videoId: string | null;
    thumbnailUrl: string | null;
    phase: { id: string; number: number; name: string; order: number };
    progress: Array<{
      status: string;
      watchedSeconds: number;
      completedAt: Date | null;
      lastAccessedAt: Date | null;
    }>;
  }

  let sessionsByPhase: Record<
    string,
    {
      phase: { id: string; number: number; name: string; order: number };
      sessions: SessionWithProgress[];
    }
  > = {};
  let completedSessionIds: Set<string> = new Set();
  let totalSessions = 0;
  let lastAccessedSession: (SessionWithProgress & { lastAccessedAt: Date }) | null = null;

  try {
    const student = await prisma.student.findUnique({
      where: { userId: session?.user?.id },
      include: {
        batch: true,
        sessionProgress: true,
      },
    });

    if (student) {
      // Show sessions assigned to the student's batch OR global sessions (no batch) matching their course
      const courseType = student.batch?.course || student.course;
      const allSessions = await prisma.session.findMany({
        where: {
          OR: [
            ...(student.batchId ? [{ batchId: student.batchId }] : []),
            { batchId: null, phase: { course: courseType as any } },
          ],
        },
        include: {
          phase: true,
          progress: {
            where: { studentId: student.id },
          },
        },
        orderBy: [{ phase: { order: "asc" } }, { order: "asc" }],
      });

      totalSessions = allSessions.length;

      // Build completed set and find last accessed
      let latestAccess: Date | null = null;
      for (const sp of student.sessionProgress) {
        if (sp.status === "COMPLETED") completedSessionIds.add(sp.sessionId);
        if (sp.lastAccessedAt && sp.status !== "COMPLETED") {
          if (!latestAccess || sp.lastAccessedAt > latestAccess) {
            latestAccess = sp.lastAccessedAt;
            const found = allSessions.find((s) => s.id === sp.sessionId);
            if (found) {
              lastAccessedSession = { ...found, lastAccessedAt: sp.lastAccessedAt };
            }
          }
        }
      }

      // Group by phase
      for (const s of allSessions) {
        const phaseKey = s.phase.id;
        if (!sessionsByPhase[phaseKey]) {
          sessionsByPhase[phaseKey] = { phase: s.phase, sessions: [] };
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

  const completedCount = completedSessionIds.size;
  const progressPercent =
    totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0;

  // All sessions are unlocked — students can take any video anytime
  function isLocked(
    _phaseIndex: number,
    _sessionIndex: number,
    _sessionId: string
  ): boolean {
    return false;
  }

  function getStatusInfo(
    s: SessionWithProgress,
    locked: boolean
  ) {
    if (locked)
      return {
        icon: <Lock size={16} className="text-text-muted" />,
        label: "Locked",
        color: "text-text-muted",
        bg: "bg-white/[0.02]",
      };
    const prog = s.progress[0];
    if (prog?.status === "COMPLETED")
      return {
        icon: <CheckCircle2 size={16} className="text-neon-green" />,
        label: "Completed",
        color: "text-neon-green",
        bg: "bg-neon-green/[0.03]",
      };
    if (prog?.status === "IN_PROGRESS")
      return {
        icon: <Clock size={16} className="text-neon-blue" />,
        label: "In Progress",
        color: "text-neon-blue",
        bg: "bg-neon-blue/[0.03]",
      };
    return {
      icon: <PlayCircle size={16} className="text-text-muted" />,
      label: "Not Started",
      color: "text-text-muted",
      bg: "bg-white/[0.02]",
    };
  }

  function formatDuration(seconds: number | null) {
    if (!seconds) return "--";
    const m = Math.floor(seconds / 60);
    return `${m} min`;
  }

  function getThumbnail(s: SessionWithProgress): string | null {
    if (s.thumbnailUrl) return s.thumbnailUrl;
    if (s.videoPlatform === "youtube" && s.videoId) {
      return `https://img.youtube.com/vi/${s.videoId}/mqdefault.jpg`;
    }
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neon-blue/10 flex items-center justify-center">
              <BookOpen size={20} className="text-neon-blue" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-text-primary">
                Learning Sessions
              </h1>
              <p className="text-xs text-text-muted">
                {completedCount} of {totalSessions} sessions completed
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-neon-green" />
            <span className="text-sm font-semibold text-neon-green">
              {progressPercent}%
            </span>
          </div>
        </div>
        <div className="h-2 bg-dark-primary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progressPercent}%`,
              background:
                progressPercent === 100
                  ? "#92E02C"
                  : "linear-gradient(90deg, #2891FF, #92E02C)",
            }}
          />
        </div>
      </div>

      {/* Continue Where You Left Off */}
      {lastAccessedSession && (
        <Link href={`/student/sessions/${lastAccessedSession.id}`}>
          <div className="glass-card p-4 border border-neon-blue/20 hover:bg-neon-blue/[0.03] transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-neon-blue/10 flex items-center justify-center shrink-0">
                <PlayCircle size={24} className="text-neon-blue" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-neon-blue font-medium mb-0.5">
                  Continue where you left off
                </p>
                <p className="text-sm font-medium text-text-primary truncate">
                  {lastAccessedSession.title}
                </p>
                <p className="text-xs text-text-muted">
                  Phase {lastAccessedSession.phase.number} &bull;{" "}
                  {lastAccessedSession.phase.name}
                </p>
              </div>
              <ChevronRight
                size={18}
                className="text-text-muted group-hover:text-neon-blue transition-colors shrink-0"
              />
            </div>
          </div>
        </Link>
      )}

      {phases.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <PlayCircle size={40} className="mx-auto text-text-muted mb-3" />
          <p className="text-text-secondary">
            No sessions available yet. Check back later.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {phases.map((phaseGroup, phaseIndex) => {
            const phaseCompleted = phaseGroup.sessions.filter((s) =>
              completedSessionIds.has(s.id)
            ).length;
            const phaseTotal = phaseGroup.sessions.length;
            const phasePercent =
              phaseTotal > 0
                ? Math.round((phaseCompleted / phaseTotal) * 100)
                : 0;

            return (
              <div key={phaseGroup.phase.id}>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      phasePercent === 100
                        ? "bg-neon-green/10"
                        : "bg-purple/10"
                    }`}
                  >
                    {phasePercent === 100 ? (
                      <CheckCircle2 size={14} className="text-neon-green" />
                    ) : (
                      <span className="text-xs font-bold text-purple">
                        P{phaseGroup.phase.number}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-sm font-semibold text-text-primary">
                      {phaseGroup.phase.name}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1.5 bg-dark-primary rounded-full overflow-hidden hidden sm:block">
                      <div
                        className="h-full bg-neon-green rounded-full"
                        style={{ width: `${phasePercent}%` }}
                      />
                    </div>
                    <span className="text-xs text-text-muted">
                      {phaseCompleted}/{phaseTotal}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {phaseGroup.sessions.map((s, sessionIndex) => {
                    const locked = isLocked(phaseIndex, sessionIndex, s.id);
                    const status = getStatusInfo(s, locked);
                    const thumb = getThumbnail(s);
                    const prog = s.progress[0];
                    const watchPercent =
                      prog && s.duration
                        ? Math.min(
                            Math.round(
                              (prog.watchedSeconds / s.duration) * 100
                            ),
                            100
                          )
                        : 0;

                    const content = (
                      <div
                        className={`glass-card p-4 ${
                          locked
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-surface-hover transition-colors group cursor-pointer"
                        } ${status.bg}`}
                      >
                        <div className="flex items-center gap-4">
                          {/* Thumbnail or Icon */}
                          {thumb && !locked ? (
                            <div className="w-16 h-10 rounded-lg overflow-hidden bg-dark-primary shrink-0 hidden sm:block">
                              <img
                                src={thumb}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-dark-primary flex items-center justify-center shrink-0">
                              {status.icon}
                            </div>
                          )}
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
                                  Required
                                </span>
                              )}
                            </div>
                            {/* Mini progress bar for in-progress sessions */}
                            {prog?.status === "IN_PROGRESS" && watchPercent > 0 && (
                              <div className="mt-2 h-1 w-full max-w-[200px] bg-dark-primary rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-neon-blue rounded-full"
                                  style={{ width: `${watchPercent}%` }}
                                />
                              </div>
                            )}
                          </div>
                          {!locked && (
                            <ChevronRight
                              size={16}
                              className="text-text-muted group-hover:text-neon-blue transition-colors shrink-0"
                            />
                          )}
                        </div>
                      </div>
                    );

                    return (
                      <div key={s.id}>
                        {locked ? (
                          content
                        ) : (
                          <Link href={`/student/sessions/${s.id}`}>
                            {content}
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
