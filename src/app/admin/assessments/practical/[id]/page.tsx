import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Download, FileText, User, Calendar, Hash } from "lucide-react";
import Link from "next/link";
import PracticalGradeForm from "./PracticalGradeForm";

export const metadata: Metadata = {
  title: "Grade Practical Submission | EDWartens Admin",
  description: "Review and grade a practical assessment submission",
};

async function getSubmission(id: string) {
  try {
    return await prisma.projectSubmission.findUnique({
      where: { id },
      include: {
        student: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
    });
  } catch {
    return null;
  }
}

async function getPreviousSubmissions(studentId: string, currentId: string) {
  try {
    return await prisma.projectSubmission.findMany({
      where: {
        studentId,
        id: { not: currentId },
      },
      orderBy: { submittedAt: "desc" },
      take: 10,
    });
  } catch {
    return [];
  }
}

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  UNDER_REVIEW: "bg-neon-blue/10 text-neon-blue border-neon-blue/20",
  APPROVED: "bg-green-500/10 text-green-400 border-green-500/20",
  RESUBMIT_REQUIRED: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default async function PracticalGradePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const submission = await getSubmission(id);

  if (!submission) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/assessments"
          className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Assessments
        </Link>
        <div className="glass-card p-12 text-center">
          <p className="text-text-muted">Submission not found</p>
        </div>
      </div>
    );
  }

  const previousSubmissions = await getPreviousSubmissions(
    submission.studentId,
    id
  );

  return (
    <div className="space-y-6">
      <Link
        href="/admin/assessments"
        className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Assessments
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Grade Practical Submission
        </h1>
        <p className="text-text-muted mt-1">
          Review and score this practical assessment
        </p>
      </div>

      {/* Submission Details */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">
            Submission Details
          </h2>
          <span
            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[submission.status] || "bg-white/[0.05] text-text-muted"}`}
          >
            {submission.status.replace(/_/g, " ")}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center">
              <User size={14} className="text-text-muted" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Student</p>
              <p className="text-sm text-text-primary font-medium">
                {submission.student.user.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center">
              <Calendar size={14} className="text-text-muted" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Submitted</p>
              <p className="text-sm text-text-primary font-medium">
                {formatDate(submission.submittedAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center">
              <Hash size={14} className="text-text-muted" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Attempt Number</p>
              <p className="text-sm text-text-primary font-medium">
                #{submission.attemptNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center">
              <FileText size={14} className="text-text-muted" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Course</p>
              <p className="text-sm text-text-primary font-medium">
                {submission.course?.replace(/_/g, " ") || "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.06] pt-4">
          <h3 className="text-sm font-medium text-text-primary mb-1">
            {submission.title}
          </h3>
          {submission.description && (
            <p className="text-sm text-text-muted whitespace-pre-wrap">
              {submission.description}
            </p>
          )}
        </div>

        {submission.fileUrl && (
          <div className="border-t border-white/[0.06] pt-4">
            <a
              href={submission.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20 transition-colors text-sm font-medium"
            >
              <Download size={14} />
              Download Submission File
              {submission.fileSize && (
                <span className="text-xs opacity-70">
                  ({(submission.fileSize / 1024 / 1024).toFixed(1)} MB)
                </span>
              )}
            </a>
          </div>
        )}
      </div>

      {/* Grading Form */}
      {submission.status === "SUBMITTED" || submission.status === "UNDER_REVIEW" ? (
        <PracticalGradeForm submissionId={id} />
      ) : (
        <div className="glass-card p-6 space-y-3">
          <h2 className="text-lg font-semibold text-text-primary">
            Grading Result
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-text-muted">Score</p>
              <p className="text-2xl font-bold text-text-primary">
                {submission.score ?? "-"}/100
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Status</p>
              <span
                className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[submission.status] || ""}`}
              >
                {submission.status.replace(/_/g, " ")}
              </span>
            </div>
          </div>
          {submission.feedback && (
            <div>
              <p className="text-xs text-text-muted mb-1">Feedback</p>
              <p className="text-sm text-text-secondary whitespace-pre-wrap">
                {submission.feedback}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Previous Submissions */}
      {previousSubmissions.length > 0 && (
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">
            Previous Submissions by This Student
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-4 py-2 text-text-muted font-medium">
                    Title
                  </th>
                  <th className="text-left px-4 py-2 text-text-muted font-medium">
                    Attempt
                  </th>
                  <th className="text-left px-4 py-2 text-text-muted font-medium">
                    Score
                  </th>
                  <th className="text-left px-4 py-2 text-text-muted font-medium">
                    Status
                  </th>
                  <th className="text-left px-4 py-2 text-text-muted font-medium">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {previousSubmissions.map((prev: any) => (
                  <tr
                    key={prev.id}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-2 text-text-primary">
                      {prev.title}
                    </td>
                    <td className="px-4 py-2 text-text-secondary">
                      #{prev.attemptNumber}
                    </td>
                    <td className="px-4 py-2 text-text-secondary">
                      {prev.score ?? "-"}/100
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[prev.status] || "bg-white/[0.05] text-text-muted"}`}
                      >
                        {prev.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-text-muted">
                      {formatDate(prev.submittedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
