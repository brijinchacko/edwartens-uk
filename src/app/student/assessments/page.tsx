import { getTestSession } from "@/lib/test-session";
import { prisma } from "@/lib/prisma";
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
} from "lucide-react";

export default async function AssessmentsPage() {
  const session = getTestSession("STUDENT");

  let assessments: Array<{
    id: string;
    score: number | null;
    maxScore: number;
    passed: boolean;
    feedback: string | null;
    assessedAt: Date;
    phase: {
      number: number;
      name: string;
    };
    assessor: {
      user: { name: string };
    } | null;
  }> = [];

  try {
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    });

    if (student) {
      assessments = await prisma.assessment.findMany({
        where: { studentId: student.id },
        include: {
          phase: true,
          assessor: { include: { user: { select: { name: true } } } },
        },
        orderBy: { phase: { order: "asc" } },
      });
    }
  } catch (error) {
    console.error("Assessments data error:", error);
  }

  const passedCount = assessments.filter((a) => a.passed).length;
  const avgScore =
    assessments.filter((a) => a.score !== null).length > 0
      ? Math.round(
          assessments
            .filter((a) => a.score !== null)
            .reduce((sum, a) => sum + ((a.score! / a.maxScore) * 100), 0) /
            assessments.filter((a) => a.score !== null).length
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-text-primary">Assessments</h1>
        <p className="text-sm text-text-muted mt-1">
          Your phase assessment scores and feedback
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neon-blue/10 flex items-center justify-center">
              <ClipboardCheck size={18} className="text-neon-blue" />
            </div>
            <div>
              <p className="text-lg font-bold text-text-primary">
                {assessments.length}
              </p>
              <p className="text-xs text-text-muted">Total Assessments</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neon-green/10 flex items-center justify-center">
              <CheckCircle2 size={18} className="text-neon-green" />
            </div>
            <div>
              <p className="text-lg font-bold text-text-primary">
                {passedCount}
              </p>
              <p className="text-xs text-text-muted">Passed</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple/10 flex items-center justify-center">
              <span className="text-sm font-bold text-purple">{avgScore}%</span>
            </div>
            <div>
              <p className="text-lg font-bold text-text-primary">{avgScore}%</p>
              <p className="text-xs text-text-muted">Average Score</p>
            </div>
          </div>
        </div>
      </div>

      {/* Assessments Table */}
      {assessments.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <ClipboardCheck size={40} className="mx-auto text-text-muted mb-3" />
          <p className="text-text-secondary">No assessments yet.</p>
          <p className="text-xs text-text-muted mt-1">
            Assessments will appear here after you complete each phase.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Desktop Table */}
          <div className="hidden md:block glass-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-text-muted px-5 py-3">
                    Phase
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted px-5 py-3">
                    Score
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted px-5 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted px-5 py-3">
                    Assessor
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted px-5 py-3">
                    Date
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted px-5 py-3">
                    Feedback
                  </th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-border last:border-0 hover:bg-surface-hover transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-purple bg-purple/10 px-1.5 py-0.5 rounded">
                          P{a.phase.number}
                        </span>
                        <span className="text-sm text-text-primary">
                          {a.phase.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {a.score !== null ? (
                        <span className="text-sm font-medium text-text-primary">
                          {a.score} / {a.maxScore}
                        </span>
                      ) : (
                        <span className="text-sm text-text-muted">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {a.score === null ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded">
                          <Clock size={12} />
                          Pending
                        </span>
                      ) : a.passed ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-neon-green bg-neon-green/10 px-2 py-1 rounded">
                          <CheckCircle2 size={12} />
                          Passed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-400 bg-red-500/10 px-2 py-1 rounded">
                          <XCircle size={12} />
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-text-secondary">
                      {a.assessor?.user.name || "-"}
                    </td>
                    <td className="px-5 py-4 text-sm text-text-muted">
                      {a.assessedAt.toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      {a.feedback ? (
                        <div className="flex items-start gap-1 max-w-[200px]">
                          <MessageSquare
                            size={12}
                            className="text-text-muted mt-0.5 shrink-0"
                          />
                          <p className="text-xs text-text-secondary line-clamp-2">
                            {a.feedback}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-text-muted">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {assessments.map((a) => (
              <div key={a.id} className="glass-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-purple bg-purple/10 px-1.5 py-0.5 rounded">
                      P{a.phase.number}
                    </span>
                    <span className="text-sm font-medium text-text-primary">
                      {a.phase.name}
                    </span>
                  </div>
                  {a.score === null ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded">
                      <Clock size={12} />
                      Pending
                    </span>
                  ) : a.passed ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-neon-green bg-neon-green/10 px-2 py-1 rounded">
                      <CheckCircle2 size={12} />
                      Passed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-400 bg-red-500/10 px-2 py-1 rounded">
                      <XCircle size={12} />
                      Failed
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Score</span>
                  <span className="text-text-primary font-medium">
                    {a.score !== null ? `${a.score} / ${a.maxScore}` : "Pending"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">
                    {a.assessedAt.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-text-muted">
                    {a.assessor?.user.name || ""}
                  </span>
                </div>
                {a.feedback && (
                  <div className="p-3 bg-dark-primary/50 rounded-lg">
                    <p className="text-xs text-text-secondary">{a.feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
