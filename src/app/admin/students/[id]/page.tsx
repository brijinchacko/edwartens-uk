import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  COURSE_LABELS,
  STUDENT_STATUS_LABELS,
  formatDate,
  formatCurrency,
  getInitials,
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
  User,
  MapPin,
  AlertCircle,
  GraduationCap,
  Download,
  ExternalLink,
  MessageSquare,
  UserPlus,
  RefreshCw,
  ClipboardCheck,
  Hash,
  Shield,
} from "lucide-react";
import StudentActions from "./StudentActions";
import StudentNotes from "./StudentNotes";

export const metadata: Metadata = {
  title: "Student Detail | EDWartens Admin",
};

const STATUS_COLORS: Record<string, string> = {
  ONBOARDING: "bg-cyan/10 text-cyan border-cyan/20",
  ACTIVE: "bg-green-500/10 text-green-400 border-green-500/20",
  ON_HOLD: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  POST_TRAINING: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  CAREER_SUPPORT: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  COMPLETED: "bg-neon-blue/10 text-neon-blue border-neon-blue/20",
  ALUMNI: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  DROPPED: "bg-red-500/10 text-red-400 border-red-500/20",
};

const PAYMENT_COLORS: Record<string, string> = {
  PENDING: "text-yellow-400",
  PAID: "text-green-400",
  PARTIAL: "text-orange-400",
  REFUNDED: "text-red-400",
};

const INVOICE_STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-white/[0.06] text-text-muted",
  ISSUED: "bg-blue-500/10 text-blue-400",
  PAID: "bg-green-500/10 text-green-400",
  CANCELLED: "bg-red-500/10 text-red-400",
};

const DOC_STATUS_COLORS: Record<string, string> = {
  VERIFIED: "bg-green-500/10 text-green-400",
  REJECTED: "bg-red-500/10 text-red-400",
  UPLOADED: "bg-yellow-500/10 text-yellow-400",
};

/* ---- Event type icon map ---- */
function JourneyIcon({
  eventType,
  size = 16,
}: {
  eventType: string;
  size?: number;
}) {
  const cls = "shrink-0";
  switch (eventType) {
    case "NOTE_ADDED":
      return <MessageSquare size={size} className={`${cls} text-blue-400`} />;
    case "STUDENT_CREATED":
      return <UserPlus size={size} className={`${cls} text-neon-green`} />;
    case "FULL_PAYMENT":
    case "DEPOSIT_PAID":
      return <CreditCard size={size} className={`${cls} text-green-400`} />;
    case "DOCUMENT_UPLOADED":
    case "DOCUMENT_VERIFIED":
      return <FileText size={size} className={`${cls} text-purple-400`} />;
    case "CERTIFICATE_ISSUED":
      return <Award size={size} className={`${cls} text-neon-blue`} />;
    case "STATUS_CHANGE":
      return <RefreshCw size={size} className={`${cls} text-yellow-400`} />;
    case "ASSESSMENT_COMPLETED":
      return (
        <ClipboardCheck size={size} className={`${cls} text-orange-400`} />
      );
    default:
      return <Clock size={size} className={`${cls} text-text-muted`} />;
  }
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  NOTE_ADDED: "border-l-blue-400",
  STUDENT_CREATED: "border-l-green-400",
  FULL_PAYMENT: "border-l-green-400",
  DEPOSIT_PAID: "border-l-green-400",
  DOCUMENT_UPLOADED: "border-l-purple-400",
  DOCUMENT_VERIFIED: "border-l-purple-400",
  CERTIFICATE_ISSUED: "border-l-neon-blue",
  STATUS_CHANGE: "border-l-yellow-400",
  ASSESSMENT_COMPLETED: "border-l-orange-400",
};

/* ---- Data fetching ---- */
async function getStudent(id: string) {
  try {
    return await prisma.student.findUnique({
      where: { id },
      include: {
        user: true,
        batch: { select: { name: true, course: true, startDate: true, endDate: true } },
        counsellor: {
          include: { user: { select: { name: true, email: true } } },
        },
        assessments: {
          include: { phase: { select: { name: true, number: true } } },
          orderBy: { assessedAt: "desc" },
        },
        certificates: {
          orderBy: { issuedDate: "desc" },
        },
        sessionProgress: {
          include: {
            session: { select: { title: true, isMandatory: true, duration: true } },
          },
          orderBy: { lastAccessedAt: "desc" },
          take: 30,
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

async function getInvoices(studentId: string) {
  return prisma.invoice.findMany({
    where: { studentId },
    orderBy: { date: "desc" },
  });
}

async function getJourneyEvents(studentId: string) {
  return prisma.studentJourney.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
  });
}

async function getLeadNotes(studentId: string) {
  // Find the lead that was converted to this student
  const lead = await prisma.lead.findFirst({
    where: { convertedToStudentId: studentId },
    include: {
      notes: { orderBy: { createdAt: "desc" } },
    },
  });
  return lead;
}

/* ---- Section nav ---- */
const SECTIONS = [
  { id: "profile", label: "Profile" },
  { id: "invoices", label: "Invoices" },
  { id: "documents", label: "Documents" },
  { id: "certificates", label: "Certificates" },
  { id: "sessions", label: "Sessions" },
  { id: "assessments", label: "Assessments" },
  { id: "timeline", label: "Timeline" },
  { id: "communication", label: "Communication" },
];

function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatSeconds(secs: number): string {
  if (secs < 60) return `${secs}s`;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  if (m < 60) return `${m}m ${s}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

/* ---- Page ---- */
export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userRole = (session?.user as { role?: string })?.role || "";
  const canSeeRevenue = ["SUPER_ADMIN", "ADMIN"].includes(userRole);

  const [student, invoices, journeyEvents, leadData] = await Promise.all([
    getStudent(id),
    getInvoices(id),
    getJourneyEvents(id),
    getLeadNotes(id),
  ]);

  if (!student) {
    notFound();
  }

  const completedSessions = student.sessionProgress.filter(
    (sp: any) => sp.status === "COMPLETED"
  ).length;
  const totalSessions = student.sessionProgress.length;

  // Build combined timeline
  type TimelineItem = {
    id: string;
    type: string;
    title: string;
    description: string | null;
    createdBy: string | null;
    createdAt: Date;
    source: "journey" | "lead";
  };
  const timeline: TimelineItem[] = [];

  for (const ev of journeyEvents) {
    timeline.push({
      id: ev.id,
      type: ev.eventType,
      title: ev.title,
      description: ev.description,
      createdBy: ev.createdBy,
      createdAt: ev.createdAt,
      source: "journey",
    });
  }

  if (leadData?.notes) {
    for (const note of leadData.notes) {
      timeline.push({
        id: note.id,
        type: "NOTE_ADDED",
        title: `Lead Note`,
        description: note.content,
        createdBy: note.createdBy,
        createdAt: note.createdAt,
        source: "lead",
      });
    }
  }

  timeline.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const initials = getInitials(student.user.name);

  return (
    <div className="space-y-6">
      {/* ====== HEADER ====== */}
      <div className="glass-card p-5">
        <div className="flex items-start gap-4">
          <Link
            href="/admin/students"
            className="p-2 rounded-lg hover:bg-white/[0.03] text-text-muted hover:text-text-primary transition-colors mt-1"
          >
            <ArrowLeft size={20} />
          </Link>

          {/* Avatar */}
          <div className="shrink-0">
            {student.user.avatar ? (
              <img
                src={student.user.avatar}
                alt={student.user.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-white/[0.08]"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-neon-blue/20 border-2 border-neon-blue/30 flex items-center justify-center">
                <span className="text-neon-blue font-bold text-lg">
                  {initials}
                </span>
              </div>
            )}
          </div>

          {/* Name + meta */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-text-primary truncate">
              {student.user.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span
                className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[student.status] || "bg-white/[0.06] text-text-muted border-white/[0.08]"}`}
              >
                {STUDENT_STATUS_LABELS[student.status] || student.status}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neon-blue/10 text-neon-blue border border-neon-blue/20">
                Phase {student.currentPhase}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/[0.04] text-text-muted border border-white/[0.06]">
                <Shield size={10} />
                {student.user.role}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-text-muted">
              {student.user.email && (
                <span className="flex items-center gap-1.5">
                  <Mail size={13} /> {student.user.email}
                </span>
              )}
              {student.user.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone size={13} /> {student.user.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ====== SECTION NAV ====== */}
      <div className="glass-card px-4 py-2 overflow-x-auto">
        <div className="flex items-center gap-1">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-text-muted hover:text-text-primary hover:bg-white/[0.04] transition-colors whitespace-nowrap"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>

      {/* ====== MAIN GRID ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ============ LEFT COLUMN ============ */}
        <div className="space-y-6">
          {/* --- Profile & Status --- */}
          <div id="profile" className="glass-card p-5 scroll-mt-24">
            <h2 className="text-base font-semibold text-text-primary mb-4">
              Profile Information
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
              {student.user.dateOfBirth && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar size={16} className="text-text-muted shrink-0" />
                  <span className="text-text-secondary">
                    DOB: {formatDate(student.user.dateOfBirth)}
                  </span>
                </div>
              )}
              {student.user.address && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin size={16} className="text-text-muted shrink-0" />
                  <span className="text-text-secondary">
                    {student.user.address}
                  </span>
                </div>
              )}
              {(student.user.emergencyName || student.user.emergencyPhone) && (
                <div className="flex items-center gap-3 text-sm">
                  <AlertCircle size={16} className="text-text-muted shrink-0" />
                  <span className="text-text-secondary">
                    Emergency: {student.user.emergencyName || "-"}{" "}
                    {student.user.emergencyPhone
                      ? `(${student.user.emergencyPhone})`
                      : ""}
                  </span>
                </div>
              )}
              {student.qualification && (
                <div className="flex items-center gap-3 text-sm">
                  <GraduationCap
                    size={16}
                    className="text-text-muted shrink-0"
                  />
                  <span className="text-text-secondary">
                    {student.qualification}
                    {student.passoutYear ? ` (${student.passoutYear})` : ""}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Calendar size={16} className="text-text-muted shrink-0" />
                <span className="text-text-secondary">
                  Enrolled: {formatDate(student.enrollmentDate)}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <BookOpen size={16} className="text-text-muted shrink-0" />
                <span className="text-text-secondary">
                  {COURSE_LABELS[student.course] || student.course}
                </span>
              </div>
            </div>

            {/* Batch info */}
            {student.batch && (
              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                  Batch
                </h3>
                <div className="space-y-1.5 text-sm">
                  <p className="text-text-secondary">
                    {student.batch.name}
                  </p>
                  <p className="text-text-muted text-xs">
                    {COURSE_LABELS[student.batch.course] || student.batch.course}{" "}
                    &middot; Started{" "}
                    {formatDate(student.batch.startDate)}
                    {student.batch.endDate
                      ? ` - ${formatDate(student.batch.endDate)}`
                      : ""}
                  </p>
                </div>
              </div>
            )}

            {/* Counsellor */}
            {student.counsellor && (
              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                  Counsellor
                </h3>
                <div className="flex items-center gap-2 text-sm">
                  <User size={14} className="text-text-muted" />
                  <span className="text-text-secondary">
                    {student.counsellor.user.name}
                  </span>
                  <span className="text-text-muted text-xs">
                    ({student.counsellor.user.email})
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* --- Payment Card (hidden for non-admin roles) --- */}
          {canSeeRevenue && <div className="glass-card p-5">
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
                  <span className="text-text-muted">Paid Amount</span>
                  <span className="text-text-secondary">
                    {formatCurrency(student.paidAmount)}
                  </span>
                </div>
              )}
              {student.stripePaymentId && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Stripe Ref</span>
                  <span className="text-text-muted text-xs font-mono truncate ml-2 max-w-[160px]">
                    {student.stripePaymentId}
                  </span>
                </div>
              )}
            </div>
          </div>}

          {/* --- Quick Actions --- */}
          <StudentActions
            studentId={student.id}
            currentStatus={student.status}
            currentPhase={student.currentPhase}
            currentBatchId={student.batchId}
          />
        </div>

        {/* ============ RIGHT COLUMN ============ */}
        <div className="lg:col-span-2 space-y-6">
          {/* ====== INVOICES (admin only) ====== */}
          {canSeeRevenue && <div id="invoices" className="glass-card p-5 scroll-mt-24">
            <h2 className="text-base font-semibold text-text-primary mb-4">
              Invoices
            </h2>
            {invoices.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-4">
                No invoices generated
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left px-3 py-2 text-text-muted font-medium">
                        Invoice #
                      </th>
                      <th className="text-left px-3 py-2 text-text-muted font-medium">
                        Date
                      </th>
                      <th className="text-right px-3 py-2 text-text-muted font-medium">
                        Amount
                      </th>
                      <th className="text-left px-3 py-2 text-text-muted font-medium">
                        Status
                      </th>
                      <th className="text-right px-3 py-2 text-text-muted font-medium">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv: any) => (
                      <tr
                        key={inv.id}
                        className="border-b border-white/[0.04]"
                      >
                        <td className="px-3 py-2.5 text-text-secondary font-mono text-xs">
                          {inv.invoiceNumber}
                        </td>
                        <td className="px-3 py-2.5 text-text-muted">
                          {formatDate(inv.date)}
                        </td>
                        <td className="px-3 py-2.5 text-text-secondary text-right">
                          {formatCurrency(inv.total / 100)}
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${INVOICE_STATUS_COLORS[inv.status] || "bg-white/[0.06] text-text-muted"}`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          {inv.pdfUrl && (
                            <a
                              href={inv.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-neon-blue hover:text-neon-blue/80 transition-colors"
                            >
                              <Download size={14} />
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>}

          {/* ====== DOCUMENTS ====== */}
          <div id="documents" className="glass-card p-5 scroll-mt-24">
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
                    className="flex items-center gap-3 py-2.5 border-b border-white/[0.04] last:border-0"
                  >
                    <FileText size={16} className="text-text-muted shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-secondary truncate">
                        {doc.name}
                      </p>
                      <p className="text-xs text-text-muted">
                        {doc.type} &middot; Uploaded{" "}
                        {formatDate(doc.uploadedAt)}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${DOC_STATUS_COLORS[doc.status] || "bg-white/[0.06] text-text-muted"}`}
                    >
                      {doc.status}
                    </span>
                    {doc.fileUrl && (
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neon-blue hover:text-neon-blue/80 transition-colors"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ====== CERTIFICATES ====== */}
          <div id="certificates" className="glass-card p-5 scroll-mt-24">
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
                    className="flex items-center gap-3 py-2.5 border-b border-white/[0.04] last:border-0"
                  >
                    <Award size={16} className="text-neon-blue shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-secondary">
                        {cert.type} Certificate
                      </p>
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        <span className="font-mono">{cert.certificateNo}</span>
                        <span>&middot;</span>
                        <span>Issued {formatDate(cert.issuedDate)}</span>
                        {cert.expiryDate && (
                          <>
                            <span>&middot;</span>
                            <span>
                              Expires {formatDate(cert.expiryDate)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${cert.isValid ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}
                    >
                      {cert.isValid ? "Valid" : "Revoked"}
                    </span>
                    {cert.pdfUrl && (
                      <a
                        href={cert.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neon-blue hover:text-neon-blue/80 transition-colors"
                      >
                        <Download size={14} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ====== SESSION PROGRESS ====== */}
          <div id="sessions" className="glass-card p-5 scroll-mt-24">
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
              <div className="space-y-1">
                {student.sessionProgress.map((sp: any) => (
                  <div
                    key={sp.id}
                    className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0"
                  >
                    {sp.status === "COMPLETED" ? (
                      <CheckCircle
                        size={16}
                        className="text-green-400 shrink-0"
                      />
                    ) : sp.status === "IN_PROGRESS" ? (
                      <Clock
                        size={16}
                        className="text-yellow-400 shrink-0"
                      />
                    ) : (
                      <XCircle
                        size={16}
                        className="text-text-muted shrink-0"
                      />
                    )}
                    <span className="text-sm text-text-secondary flex-1 truncate">
                      {sp.session.title}
                    </span>
                    {sp.watchedSeconds > 0 && (
                      <span className="text-[10px] text-text-muted">
                        {formatSeconds(sp.watchedSeconds)}
                        {sp.session.duration
                          ? ` / ${formatSeconds(sp.session.duration)}`
                          : ""}
                      </span>
                    )}
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

          {/* ====== ASSESSMENTS ====== */}
          <div id="assessments" className="glass-card p-5 scroll-mt-24">
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
                        Feedback
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
                        <td className="px-3 py-2.5 text-text-secondary">
                          Phase {a.phase.number}: {a.phase.name}
                        </td>
                        <td className="px-3 py-2.5 text-text-secondary">
                          {a.score ?? "-"}/{a.maxScore}
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={`text-xs font-medium ${a.passed ? "text-green-400" : "text-red-400"}`}
                          >
                            {a.passed ? "Passed" : "Failed"}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-text-muted text-xs max-w-[200px] truncate">
                          {a.feedback || "-"}
                        </td>
                        <td className="px-3 py-2.5 text-text-muted">
                          {formatDate(a.assessedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ====== COMMUNICATION (Add Notes) ====== */}
          <div id="communication" className="glass-card p-5 scroll-mt-24">
            <h2 className="text-base font-semibold text-text-primary mb-4">
              Add Communication
            </h2>
            <StudentNotes studentId={student.id} />
          </div>

          {/* ====== ACTIVITY TIMELINE ====== */}
          <div id="timeline" className="glass-card p-5 scroll-mt-24">
            <h2 className="text-base font-semibold text-text-primary mb-4">
              Activity Timeline
            </h2>
            {timeline.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-4">
                No activity recorded
              </p>
            ) : (
              <div className="space-y-0">
                {timeline.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`relative flex gap-3 py-3 border-l-2 pl-4 ${EVENT_TYPE_COLORS[item.type] || "border-l-white/10"} ${idx < timeline.length - 1 ? "border-b border-b-white/[0.04]" : ""}`}
                  >
                    <div className="mt-0.5">
                      <JourneyIcon eventType={item.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-text-primary">
                          {item.title}
                        </span>
                        {item.source === "lead" && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 font-medium">
                            LEAD
                          </span>
                        )}
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-text-muted font-mono">
                          {item.type.replace(/_/g, " ")}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-sm text-text-muted mt-0.5 whitespace-pre-wrap">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-text-muted">
                        {item.createdBy && (
                          <span className="flex items-center gap-1">
                            <User size={10} /> {item.createdBy}
                          </span>
                        )}
                        <span>{formatDateTime(item.createdAt)}</span>
                      </div>
                    </div>
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
