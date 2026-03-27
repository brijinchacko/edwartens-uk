import { getTestSession } from "@/lib/test-session";
import { prisma } from "@/lib/prisma";
import {
  CheckCircle2,
  Clock,
  Lock,
  BookOpen,
  TrendingUp,
  PlayCircle,
} from "lucide-react";

export default async function ProgressPage() {
  const session = getTestSession("STUDENT");

  let phases: Array<{
    id: string;
    number: number;
    name: string;
    description: string;
    order: number;
    totalSessions: number;
    completedSessions: number;
    assessment: {
      id: string;
      score: number | null;
      maxScore: number;
      passed: boolean;
      feedback: string | null;
    } | null;
  }> = [];
  let overallProgress = 0;
  let totalSessions = 0;
  let completedSessions = 0;
  let currentPhase = 0;

  try {
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      include: {
        batch: true,
        sessionProgress: true,
        assessments: { include: { phase: true } },
      },
    });

    if (student) {
      currentPhase = student.currentPhase;

      const allPhases = await prisma.phase.findMany({
        where: { course: student.course },
        orderBy: { order: "asc" },
      });

      const completedSessionIds = new Set(
        student.sessionProgress
          .filter((sp: { status: string }) => sp.status === "COMPLETED")
          .map((sp: { sessionId: string }) => sp.sessionId)
      );

      for (const phase of allPhases) {
        const phaseSessions = student.batch
          ? await prisma.session.count({
              where: { batchId: student.batch.id, phaseId: phase.id },
            })
          : 0;

        const phaseCompletedSessions = student.batch
          ? await prisma.session.findMany({
              where: { batchId: student.batch.id, phaseId: phase.id },
              select: { id: true },
            })
          : [];

        const completed = phaseCompletedSessions.filter((s: { id: string }) =>
          completedSessionIds.has(s.id)
        ).length;

        totalSessions += phaseSessions;
        completedSessions += completed;

        const assessment = student.assessments.find(
          (a: { phaseId: string }) => a.phaseId === phase.id
        );

        phases.push({
          id: phase.id,
          number: phase.number,
          name: phase.name,
          description: phase.description,
          order: phase.order,
          totalSessions: phaseSessions,
          completedSessions: completed,
          assessment: assessment
            ? {
                id: assessment.id,
                score: assessment.score,
                maxScore: assessment.maxScore,
                passed: assessment.passed,
                feedback: assessment.feedback,
              }
            : null,
        });
      }

      overallProgress =
        totalSessions > 0
          ? Math.round((completedSessions / totalSessions) * 100)
          : 0;
    }
  } catch (error) {
    console.error("Progress data error:", error);
  }

  function getPhaseStatus(phase: (typeof phases)[0]) {
    if (
      phase.completedSessions === phase.totalSessions &&
      phase.totalSessions > 0 &&
      phase.assessment?.passed
    ) {
      return "completed";
    }
    if (phase.number === currentPhase) return "current";
    if (phase.number < currentPhase) return "in-progress";
    return "locked";
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">
            Learning Progress
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Track your journey through each phase
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold gradient-text">{overallProgress}%</p>
          <p className="text-xs text-text-muted">Overall</p>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-neon-blue" />
            <span className="text-sm font-medium text-text-primary">
              Overall Completion
            </span>
          </div>
          <span className="text-sm text-text-muted">
            {completedSessions} / {totalSessions} sessions
          </span>
        </div>
        <div className="h-3 bg-dark-primary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${overallProgress}%`,
              background: "linear-gradient(90deg, #2891FF, #92E02C)",
            }}
          />
        </div>
      </div>

      {/* Phase Timeline */}
      {phases.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <BookOpen size={40} className="mx-auto text-text-muted mb-3" />
          <p className="text-text-secondary">
            No phases available yet. Check back after batch assignment.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {phases.map((phase, index) => {
            const status = getPhaseStatus(phase);
            const sessionPercent =
              phase.totalSessions > 0
                ? Math.round(
                    (phase.completedSessions / phase.totalSessions) * 100
                  )
                : 0;

            return (
              <div key={phase.id} className="flex gap-4">
                {/* Timeline connector */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      status === "completed"
                        ? "bg-neon-green/10 border border-neon-green/30"
                        : status === "current"
                          ? "bg-neon-blue/10 border border-neon-blue/30"
                          : status === "in-progress"
                            ? "bg-purple/10 border border-purple/30"
                            : "bg-dark-tertiary border border-border"
                    }`}
                  >
                    {status === "completed" ? (
                      <CheckCircle2 size={18} className="text-neon-green" />
                    ) : status === "current" ? (
                      <PlayCircle size={18} className="text-neon-blue" />
                    ) : status === "locked" ? (
                      <Lock size={14} className="text-text-muted" />
                    ) : (
                      <Clock size={16} className="text-purple" />
                    )}
                  </div>
                  {index < phases.length - 1 && (
                    <div
                      className={`w-0.5 flex-1 my-1 ${
                        status === "completed"
                          ? "bg-neon-green/20"
                          : "bg-border"
                      }`}
                    />
                  )}
                </div>

                {/* Phase Card */}
                <div
                  className={`glass-card p-5 flex-1 mb-2 ${
                    status === "locked" ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-purple bg-purple/10 px-2 py-0.5 rounded">
                          Phase {phase.number}
                        </span>
                        {status === "current" && (
                          <span className="text-xs font-medium text-neon-blue bg-neon-blue/10 px-2 py-0.5 rounded">
                            Current
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-text-primary mt-2">
                        {phase.name}
                      </h3>
                      <p className="text-xs text-text-muted mt-1">
                        {phase.description}
                      </p>
                    </div>
                  </div>

                  {/* Session progress bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-text-muted">Sessions</span>
                      <span className="text-xs text-text-muted">
                        {phase.completedSessions} / {phase.totalSessions}
                      </span>
                    </div>
                    <div className="h-1.5 bg-dark-primary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${sessionPercent}%`,
                          background:
                            sessionPercent === 100 ? "#92E02C" : "#2891FF",
                        }}
                      />
                    </div>
                  </div>

                  {/* Assessment status */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-text-muted">Assessment:</span>
                    {phase.assessment ? (
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded ${
                          phase.assessment.passed
                            ? "bg-neon-green/10 text-neon-green"
                            : phase.assessment.score !== null
                              ? "bg-red-500/10 text-red-400"
                              : "bg-yellow-500/10 text-yellow-400"
                        }`}
                      >
                        {phase.assessment.passed
                          ? `Passed (${phase.assessment.score}/${phase.assessment.maxScore})`
                          : phase.assessment.score !== null
                            ? `Failed (${phase.assessment.score}/${phase.assessment.maxScore})`
                            : "Pending Review"}
                      </span>
                    ) : (
                      <span className="text-xs text-text-muted">
                        Not yet taken
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
