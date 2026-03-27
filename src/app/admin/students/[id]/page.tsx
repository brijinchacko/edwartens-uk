import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  COURSE_LABELS,
  STUDENT_STATUS_LABELS,
  formatDate,
  formatCurrency,
} from "@/lib/utils";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  BookOpen,
  Award,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Student Detail | EDWartens Admin",
};

const STATUS_COLORS: Record<string, string> = {
  ONBOARDING: "bg-cyan/10 text-cyan border-cyan/20",
  ACTIVE: "bg-green-500/10 text-green-400 border-green-500/20",
  ON_HOLD: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  COMPLETED: "bg-neon-blue/10 text-neon-blue border-neon-blue/20",
  DROPPED: "bg-red-500/10 text-red-400 border-red-500/20",
};

const PAYMENT_COLORS: Record<string, string> = {
  PENDING: "text-yellow-400",
  PAID: "text-green-400",
  PARTIAL: "text-orange-400",
  REFUNDED: "text-red-400",
};

async function getStudent(id: string) {
  try {
    return await prisma.student.findUnique({
      where: { id },
      include: {
        user: true,
        batch: { select: { name: true, course: true } },
        assessments: {
          include: { phase: { select: { name: true, number: true } } },
          orderBy: { assessedAt: "desc" },
        },
        certificates: {
          orderBy: { issuedDate: "desc" },
        },
        sessionProgress: {
          include: {
            session: { select: { title: true, isMandatory: true } },
          },
          orderBy: { lastAccessedAt: "desc" },
          take: 20,
        },
        documents: {
          orderBy: { uploadedAt: "desc" },
        },
        placements: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  } catch {
    return null;
  }
}

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = await getStudent(id);

  if (!student) {
    notFound();
  }

  const completedSessions = student.sessionProgress.filter(
    (sp: any) => sp.status === "COMPLETED"
  ).length;
  const totalSessions = student.sessionProgress.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/students"
          className="p-2 rounded-lg hover:bg-white/[0.03] text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {student.user.name}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span
              className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[student.status]}`}
            >
              {STUDENT_STATUS_LABELS[student.status] || student.status}
            </span>
            <span className="text-text-muted text-sm">
              {COURSE_LABELS[student.course] || student.course}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="space-y-6">
          <div className="glass-card p-5">
            <h2 className="text-base font-semibold text-text-primary mb-4">
              Profile
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail size={16} className="text-text-muted shrink-0" />
                <span className="text-text-secondary">
                  {student.user.email}
                </span>
              </div>
              {student.user.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone size={16} className="text-text-muted shrink-0" />
                  <span className="text-text-secondary">
                    {student.user.phone}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Calendar size={16} className="text-text-muted shrink-0" />
                <span className="text-text-secondary">
                  Enrolled: {formatDate(student.enrollmentDate)}
                </span>
              </div>
              {student.batch && (
                <div className="flex items-center gap-3 text-sm">
                  <BookOpen size={16} className="text-text-muted shrink-0" />
                  <span className="text-text-secondary">
                    Batch: {student.batch.name}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <BookOpen size={16} className="text-text-muted shrink-0" />
                <span className="text-text-secondary">
                  Phase {student.currentPhase}
                </span>
              </div>
              {student.qualification && (
                <div className="flex items-center gap-3 text-sm">
                  <Award size={16} className="text-text-muted shrink-0" />
                  <span className="text-text-secondary">
                    {student.qualification}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Status */}
          <div className="glass-card p-5">
            <h2 className="text-base font-semibold text-text-primary mb-4">
              Payment
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Status</span>
                <span
                  className={`font-medium ${PAYMENT_COLORS[student.paymentStatus] || "text-text-secondary"}`}
                >
                  {student.paymentStatus}
                </span>
              </div>
              {student.paidAmount != null && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Paid</span>
                  <span className="text-text-secondary">
                    {formatCurrency(student.paidAmount)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Session Progress */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-text-primary">
                Session Progress
              </h2>
              <span className="text-sm text-text-muted">
                {completedSessions}/{totalSessions} completed
              </span>
            </div>
            {totalSessions === 0 ? (
              <p className="text-text-muted text-sm text-center py-4">
                No session data available
              </p>
            ) : (
              <div className="space-y-2">
                {student.sessionProgress.slice(0, 10).map((sp: any) => (
                  <div
                    key={sp.id}
                    className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0"
                  >
                    {sp.status === "COMPLETED" ? (
                      <CheckCircle size={16} className="text-green-400 shrink-0" />
                    ) : sp.status === "IN_PROGRESS" ? (
                      <Clock size={16} className="text-yellow-400 shrink-0" />
                    ) : (
                      <XCircle size={16} className="text-text-muted shrink-0" />
                    )}
                    <span className="text-sm text-text-secondary flex-1">
                      {sp.session.title}
                    </span>
                    {sp.session.isMandatory && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">
                        Required
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assessments */}
          <div className="glass-card p-5">
            <h2 className="text-base font-semibold text-text-primary mb-4">
              Assessments
            </h2>
            {student.assessments.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-4">
                No assessments yet
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left px-3 py-2 text-text-muted font-medium">
                        Phase
                      </th>
                      <th className="text-left px-3 py-2 text-text-muted font-medium">
                        Score
                      </th>
                      <th className="text-left px-3 py-2 text-text-muted font-medium">
                        Result
                      </th>
                      <th className="text-left px-3 py-2 text-text-muted font-medium">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {student.assessments.map((a: any) => (
                      <tr
                        key={a.id}
                        className="border-b border-white/[0.04]"
                      >
                        <td className="px-3 py-2 text-text-secondary">
                          Phase {a.phase.number}: {a.phase.name}
                        </td>
                        <td className="px-3 py-2 text-text-secondary">
                          {a.score ?? "-"}/{a.maxScore}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`text-xs font-medium ${a.passed ? "text-green-400" : "text-red-400"}`}
                          >
                            {a.passed ? "Passed" : "Failed"}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-text-muted">
                          {formatDate(a.assessedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Documents */}
          <div className="glass-card p-5">
            <h2 className="text-base font-semibold text-text-primary mb-4">
              Documents
            </h2>
            {student.documents.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-4">
                No documents uploaded
              </p>
            ) : (
              <div className="space-y-2">
                {student.documents.map((doc: any) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0"
                  >
                    <FileText size={16} className="text-text-muted shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-text-secondary">{doc.name}</p>
                      <p className="text-xs text-text-muted">{doc.type}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        doc.status === "VERIFIED"
                          ? "bg-green-500/10 text-green-400"
                          : doc.status === "REJECTED"
                            ? "bg-red-500/10 text-red-400"
                            : "bg-yellow-500/10 text-yellow-400"
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Certificates */}
          <div className="glass-card p-5">
            <h2 className="text-base font-semibold text-text-primary mb-4">
              Certificates
            </h2>
            {student.certificates.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-4">
                No certificates issued
              </p>
            ) : (
              <div className="space-y-2">
                {student.certificates.map((cert: any) => (
                  <div
                    key={cert.id}
                    className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0"
                  >
                    <Award size={16} className="text-neon-blue shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-text-secondary">
                        {cert.type} Certificate
                      </p>
                      <p className="text-xs text-text-muted">
                        {cert.certificateNo}
                      </p>
                    </div>
                    <span className="text-xs text-text-muted">
                      {formatDate(cert.issuedDate)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
