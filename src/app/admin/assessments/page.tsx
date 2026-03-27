import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Assessments | EDWartens Admin",
  description: "Grade and manage student assessments",
};

async function getAssessments() {
  try {
    return await prisma.assessment.findMany({
      include: {
        student: {
          include: { user: { select: { name: true } } },
        },
        phase: { select: { name: true, number: true } },
        assessor: {
          include: { user: { select: { name: true } } },
        },
      },
      orderBy: { assessedAt: "desc" },
      take: 100,
    });
  } catch {
    return [];
  }
}

export default async function AssessmentsPage() {
  const assessments = await getAssessments();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Assessments</h1>
        <p className="text-text-muted mt-1">
          {assessments.length} assessment record
          {assessments.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-4 py-3 text-text-muted font-medium">
                  Student
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">
                  Phase
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">
                  Score
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">
                  Result
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">
                  Assessor
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">
                  Feedback
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden lg:table-cell">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {assessments.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-text-muted"
                  >
                    No assessments found
                  </td>
                </tr>
              ) : (
                assessments.map((a: any) => (
                  <tr
                    key={a.id}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3 text-text-primary font-medium">
                      {a.student.user.name}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      Phase {a.phase.number}: {a.phase.name}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {a.score ?? "-"}/{a.maxScore}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          a.passed
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}
                      >
                        {a.passed ? "Passed" : "Failed"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary hidden md:table-cell">
                      {a.assessor?.user?.name || "-"}
                    </td>
                    <td className="px-4 py-3 text-text-muted hidden md:table-cell max-w-[200px] truncate">
                      {a.feedback || "-"}
                    </td>
                    <td className="px-4 py-3 text-text-muted hidden lg:table-cell">
                      {formatDate(a.assessedAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
