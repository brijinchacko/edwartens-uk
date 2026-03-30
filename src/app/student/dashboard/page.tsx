import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  PlayCircle,
  TrendingUp,
  ClipboardCheck,
  Briefcase,
  BookOpen,
  ChevronRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Circle,
} from "lucide-react";

export default async function StudentDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  let student = null;
  let batch = null;
  let nextSession = null;
  let overallProgress = 0;
  let currentPhaseName = "";
  let upcomingAssessments: Array<{
    id: string;
    phase: { name: string; number: number };
    assessedAt: Date;
  }> = [];
  let recentJobs: Array<{
    id: string;
    company: string;
    role: string;
    location: string | null;
    salaryRange: string | null;
    sentAt: Date;
  }> = [];
  let totalSessions = 0;
  let completedSessions = 0;

  // Mandatory checklist state
  let termsAccepted = false;
  let hasIdProof = false;
  let hasQualification = false;
  let hasCv = false;
  let fullPaymentDone = false;
  let softwareVerified = false;

  try {
    student = await prisma.student.findUnique({
      where: { userId: session?.user?.id },
      include: {
        batch: true,
        sessionProgress: {
          include: { session: { include: { phase: true } } },
        },
      },
    });

    if (student) {
      batch = student.batch;

      // Fetch mandatory checklist data
      const user = await prisma.user.findUnique({
        where: { id: session?.user?.id },
        select: { termsAccepted: true },
      });
      termsAccepted = user?.termsAccepted || false;

      const documents = await prisma.document.findMany({
        where: { studentId: student.id },
        select: { type: true, status: true },
      });
      hasIdProof = documents.some(
        (d) => d.type === "ID Proof" && (d.status === "UPLOADED" || d.status === "VERIFIED")
      );
      hasQualification = documents.some(
        (d) => d.type === "Qualification" && (d.status === "UPLOADED" || d.status === "VERIFIED")
      );
      hasCv = documents.some(
        (d) => d.type === "CV" && (d.status === "UPLOADED" || d.status === "VERIFIED")
      );

      fullPaymentDone = student.paymentStatus === "PAID";

      const swChecklist = await prisma.softwareChecklist.findUnique({
        where: { studentId: student.id },
        select: { allVerified: true },
      });
      softwareVerified = swChecklist?.allVerified || false;

      // Calculate progress
      if (batch) {
        const allSessions = await prisma.session.findMany({
          where: { batchId: batch.id },
        });
        totalSessions = allSessions.length;
        completedSessions = student.sessionProgress.filter(
          (sp) => sp.status === "COMPLETED"
        ).length;
        overallProgress =
          totalSessions > 0
            ? Math.round((completedSessions / totalSessions) * 100)
            : 0;
      }

      // Current phase
      const currentPhase = await prisma.phase.findFirst({
        where: {
          number: student.currentPhase,
          course: student.course,
        },
      });
      currentPhaseName = currentPhase?.name || `Phase ${student.currentPhase}`;

      // Next unwatched session
      if (batch) {
        const completedIds = student.sessionProgress
          .filter((sp) => sp.status === "COMPLETED")
          .map((sp) => sp.sessionId);

        nextSession = await prisma.session.findFirst({
          where: {
            batchId: batch.id,
            id: { notIn: completedIds.length > 0 ? completedIds : ["_none_"] },
          },
          include: { phase: true },
          orderBy: [{ phase: { order: "asc" } }, { order: "asc" }],
        });
      }

      // Upcoming assessments (not yet graded)
      upcomingAssessments = await prisma.assessment.findMany({
        where: { studentId: student.id, score: null },
        include: { phase: true },
        orderBy: { assessedAt: "asc" },
        take: 3,
      });

      // Recent job notifications
      recentJobs = await prisma.jobNotification.findMany({
        where: {
          OR: [
            { targetCourse: student.course },
            { targetBatchId: batch?.id },
          ],
        },
        orderBy: { sentAt: "desc" },
        take: 3,
      });
    }
  } catch (error) {
    console.error("Dashboard data error:", error);
  }

  const courseLabel =
    student?.course === "PROFESSIONAL_MODULE"
      ? "Professional Module"
      : student?.course === "AI_MODULE"
        ? "AI Module"
        : "N/A";

  const checklistItems = [
    { label: "Terms & Conditions accepted", done: termsAccepted, href: "/student/sign" },
    { label: "ID Proof uploaded", done: hasIdProof, href: "/student/documents" },
    { label: "Qualification Certificate uploaded", done: hasQualification, href: "/student/documents" },
    { label: "CV uploaded", done: hasCv, href: "/student/documents" },
    { label: "Full payment completed", done: fullPaymentDone, href: "/student/payments" },
    { label: "Software installed & verified", done: softwareVerified, href: "/student/software" },
  ];
  const incompleteCount = checklistItems.filter((c) => !c.done).length;

  return (
    <div className="space-y-6">
      {/* Mandatory Checklist */}
      {incompleteCount > 0 && (
        <div className="glass-card border-yellow-500/20 p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-yellow-400" />
            <h3 className="text-sm font-semibold text-yellow-400">
              {incompleteCount} mandatory item{incompleteCount !== 1 ? "s" : ""} incomplete
            </h3>
          </div>
          <p className="text-xs text-text-muted mb-4">
            Please complete all mandatory items to proceed with your training.
          </p>
          <div className="space-y-2">
            {checklistItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-dark-primary/50 transition-colors"
              >
                {item.done ? (
                  <CheckCircle2 size={18} className="text-neon-green shrink-0" />
                ) : (
                  <Circle size={18} className="text-text-muted shrink-0" />
                )}
                <span
                  className={`text-sm ${
                    item.done ? "text-text-muted line-through" : "text-text-primary"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {incompleteCount === 0 && (
        <div className="p-4 bg-neon-green/10 border border-neon-green/20 rounded-xl flex items-center gap-3">
          <CheckCircle2 size={20} className="text-neon-green" />
          <p className="text-sm font-medium text-neon-green">
            All mandatory items are complete. You are all set!
          </p>
        </div>
      )}

      {/* Welcome Card */}
      <div className="glass-card gradient-border p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary mb-1">
              Hello, {session?.user?.name}!
            </h1>
            <p className="text-text-secondary text-sm">
              {courseLabel} &bull; {batch?.name || "No batch assigned"} &bull;
              Phase {student?.currentPhase || 0}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold gradient-text">
                {overallProgress}%
              </p>
              <p className="text-xs text-text-muted">Overall Progress</p>
            </div>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="mt-4 h-2 bg-dark-primary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${overallProgress}%`,
              background: "linear-gradient(90deg, #2891FF, #92E02C)",
            }}
          />
        </div>
        <p className="text-xs text-text-muted mt-2">
          {completedSessions} of {totalSessions} sessions completed
        </p>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Current Phase */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple/10 flex items-center justify-center">
              <BookOpen size={20} className="text-purple" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Current Phase</p>
              <p className="text-sm font-semibold text-text-primary">
                {currentPhaseName}
              </p>
            </div>
          </div>
          <Link
            href="/student/progress"
            className="text-xs text-neon-blue hover:underline inline-flex items-center gap-1"
          >
            View Progress <ChevronRight size={12} />
          </Link>
        </div>

        {/* Next Session */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-neon-blue/10 flex items-center justify-center">
              <PlayCircle size={20} className="text-neon-blue" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Next Session</p>
              <p className="text-sm font-semibold text-text-primary truncate max-w-[180px]">
                {nextSession?.title || "All caught up!"}
              </p>
            </div>
          </div>
          {nextSession ? (
            <Link
              href={`/student/sessions/${nextSession.id}`}
              className="text-xs text-neon-blue hover:underline inline-flex items-center gap-1"
            >
              Watch Now <ChevronRight size={12} />
            </Link>
          ) : (
            <p className="text-xs text-text-muted">No pending sessions</p>
          )}
        </div>

        {/* Overall Stats */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-neon-green/10 flex items-center justify-center">
              <TrendingUp size={20} className="text-neon-green" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Sessions Done</p>
              <p className="text-sm font-semibold text-text-primary">
                {completedSessions} / {totalSessions}
              </p>
            </div>
          </div>
          <Link
            href="/student/sessions"
            className="text-xs text-neon-blue hover:underline inline-flex items-center gap-1"
          >
            View Sessions <ChevronRight size={12} />
          </Link>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming Assessments */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <ClipboardCheck size={16} className="text-cyan" />
              Upcoming Assessments
            </h3>
            <Link
              href="/student/assessments"
              className="text-xs text-neon-blue hover:underline"
            >
              View All
            </Link>
          </div>
          {upcomingAssessments.length > 0 ? (
            <div className="space-y-3">
              {upcomingAssessments.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between p-3 bg-dark-primary/50 rounded-lg"
                >
                  <div>
                    <p className="text-sm text-text-primary">
                      {a.phase.name}
                    </p>
                    <p className="text-xs text-text-muted">
                      Phase {a.phase.number}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-text-muted">
                    <Clock size={12} />
                    {a.assessedAt.toLocaleDateString("en-GB")}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted">No upcoming assessments</p>
          )}
        </div>

        {/* Recent Jobs */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <Briefcase size={16} className="text-neon-green" />
              Recent Job Notifications
            </h3>
            <Link
              href="/student/jobs"
              className="text-xs text-neon-blue hover:underline"
            >
              View All
            </Link>
          </div>
          {recentJobs.length > 0 ? (
            <div className="space-y-3">
              {recentJobs.map((j) => (
                <div
                  key={j.id}
                  className="flex items-center justify-between p-3 bg-dark-primary/50 rounded-lg"
                >
                  <div>
                    <p className="text-sm text-text-primary">{j.role}</p>
                    <p className="text-xs text-text-muted">
                      {j.company} &bull; {j.location || "Remote"}
                    </p>
                  </div>
                  {j.salaryRange && (
                    <span className="text-xs text-neon-green">
                      {j.salaryRange}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted">
              No job notifications yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
