import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import ConversionFunnel from "@/components/ConversionFunnel";
import {
  Users,
  Target,
  TrendingUp,
  Layers,
  PhoneCall,
  Plus,
  Send,
  AlertTriangle,
  DollarSign,
  FileCheck,
  BookOpen,
  ClipboardCheck,
  Monitor,
  Clock,
  CheckCircle,
  Eye,
  Bell,
  ArrowRight,
  Calendar,
  FileText,
  Code,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard | EDWartens Admin",
  description: "Admin dashboard overview",
};

// ─── Shared date helpers ───
function getTodayRange() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  return { todayStart, todayEnd };
}

// ─── SUPER_ADMIN / ADMIN data fetcher ───
async function getAdminDashboardData() {
  try {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const { todayStart, todayEnd } = getTodayRange();

    const [
      activeStudents,
      totalStudents,
      leadsThisWeek,
      leadsThisMonth,
      placedStudents,
      completedStudents,
      upcomingBatches,
      followUpsDueTodayCount,
      recentActivity,
      // Pending actions
      followUpsDueToday,
      overdueFollowUps,
      pendingDocs,
      onboardingStudents,
      pendingProjects,
      ungradedAssessments,
    ] = await Promise.all([
      prisma.student.count({ where: { status: "ACTIVE" } }),
      prisma.student.count(),
      prisma.lead.count({ where: { createdAt: { gte: startOfWeek } } }),
      prisma.lead.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.placement.count({ where: { status: "CONFIRMED" } }),
      prisma.student.count({ where: { status: "COMPLETED" } }),
      prisma.batch.count({ where: { status: "UPCOMING" } }),
      prisma.lead.count({
        where: {
          followUpDate: { gte: todayStart, lte: todayEnd },
          status: { notIn: ["ENROLLED", "LOST"] },
        },
      }),
      prisma.activityLog.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      }),
      // Follow-ups due today (with details)
      prisma.lead.findMany({
        where: {
          followUpDate: { gte: todayStart, lte: todayEnd },
          status: { notIn: ["ENROLLED", "LOST"] },
        },
        select: { id: true, name: true, email: true, phone: true, courseInterest: true, followUpDate: true, status: true },
        take: 10,
      }),
      // Overdue follow-ups
      prisma.lead.findMany({
        where: {
          followUpDate: { lt: todayStart },
          status: { notIn: ["ENROLLED", "LOST"] },
        },
        select: { id: true, name: true, email: true, followUpDate: true, status: true },
        take: 10,
        orderBy: { followUpDate: "asc" },
      }),
      // Documents pending review
      prisma.document.count({ where: { status: "UPLOADED" } }),
      // Onboarding students
      prisma.student.count({ where: { status: "ONBOARDING" } }),
      // Ungraded projects
      prisma.projectSubmission.count({ where: { status: "SUBMITTED" } }),
      // Ungraded assessments (attempts that have no feedback / haven't been reviewed)
      prisma.assessmentAttempt.count({
        where: { completedAt: { not: null } },
      }),
    ]);

    const placementRate =
      completedStudents > 0
        ? Math.round((placedStudents / completedStudents) * 100)
        : 0;

    // Sales team performance
    let salesTeamPerformance: any[] = [];
    try {
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      salesTeamPerformance = await prisma.salesTarget.findMany({
        where: { month, year },
        include: { employee: { include: { user: { select: { name: true, email: true } } } } },
      });
    } catch {
      // salesTarget model may not exist yet
    }

    return {
      activeStudents,
      totalStudents,
      leadsThisWeek,
      leadsThisMonth,
      placementRate,
      upcomingBatches,
      followUpsDueTodayCount,
      recentActivity,
      salesTeamPerformance,
      followUpsDueToday,
      overdueFollowUps,
      pendingDocs,
      onboardingStudents,
      pendingProjects,
      ungradedAssessments,
    };
  } catch {
    return {
      activeStudents: 0,
      totalStudents: 0,
      leadsThisWeek: 0,
      leadsThisMonth: 0,
      placementRate: 0,
      upcomingBatches: 0,
      followUpsDueTodayCount: 0,
      recentActivity: [],
      salesTeamPerformance: [],
      followUpsDueToday: [],
      overdueFollowUps: [],
      pendingDocs: 0,
      onboardingStudents: 0,
      pendingProjects: 0,
      ungradedAssessments: 0,
    };
  }
}

// ─── SALES_LEAD data fetcher ───
async function getSalesLeadDashboardData(userId: string) {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const { todayStart, todayEnd } = getTodayRange();

    const emp = await prisma.employee.findUnique({ where: { userId } });
    if (!emp) return null;

    let salesTarget: any = null;
    let incentive: any = null;
    try {
      salesTarget = await prisma.salesTarget.findUnique({
        where: { employeeId_month_year: { employeeId: emp.id, month, year } },
      });
    } catch { /* model may not exist */ }

    try {
      incentive = await prisma.salesIncentive.findUnique({
        where: { employeeId_month_year: { employeeId: emp.id, month, year } },
      });
    } catch { /* model may not exist */ }

    const [
      leadCounts,
      followUpsDueToday,
      overdueFollowUps,
      recentLeads,
    ] = await Promise.all([
      prisma.lead.groupBy({
        by: ["status"],
        where: { assignedToId: emp.id },
        _count: true,
      }),
      prisma.lead.findMany({
        where: {
          assignedToId: emp.id,
          followUpDate: { gte: todayStart, lte: todayEnd },
          status: { notIn: ["ENROLLED", "LOST"] },
        },
        select: { id: true, name: true, email: true, phone: true, courseInterest: true, followUpDate: true, status: true },
        take: 10,
      }),
      prisma.lead.findMany({
        where: {
          assignedToId: emp.id,
          followUpDate: { lt: todayStart },
          status: { notIn: ["ENROLLED", "LOST"] },
        },
        select: { id: true, name: true, email: true, followUpDate: true, status: true },
        take: 10,
        orderBy: { followUpDate: "asc" },
      }),
      prisma.lead.findMany({
        where: { assignedToId: emp.id },
        select: { id: true, name: true, email: true, status: true, courseInterest: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    const leadPipeline: Record<string, number> = {};
    leadCounts.forEach((lc: any) => {
      leadPipeline[lc.status] = lc._count;
    });

    return {
      employeeId: emp.id,
      salesAchieved: salesTarget?.salesAchieved || 0,
      salesTargetCount: salesTarget?.salesTarget || 15,
      leadsGenerated: salesTarget?.leadsGenerated || 0,
      leadTargetCount: salesTarget?.leadTarget || 50,
      incentiveEarned: incentive?.totalEarned || 0,
      incentiveDistributed: incentive?.distributed || 0,
      totalSales: incentive?.totalSales || 0,
      leadPipeline,
      followUpsDueToday,
      overdueFollowUps,
      recentLeads,
    };
  } catch {
    return null;
  }
}

// ─── ADMISSION_COUNSELLOR data fetcher ───
async function getAdmissionCounsellorData(userId: string) {
  try {
    const { todayStart, todayEnd } = getTodayRange();
    const emp = await prisma.employee.findUnique({ where: { userId } });
    if (!emp) return null;

    const [
      myStudents,
      onboardingPending,
      documentsToReview,
      studentsNeedingAttention,
      pendingDocsList,
      followUpsDue,
      upcomingBatches,
    ] = await Promise.all([
      prisma.student.count({ where: { counsellorId: emp.id } }),
      prisma.student.count({ where: { counsellorId: emp.id, status: "ONBOARDING" } }),
      prisma.document.count({
        where: { status: "UPLOADED", student: { counsellorId: emp.id } },
      }),
      // Students in ONBOARDING with incomplete checklist
      prisma.student.findMany({
        where: {
          counsellorId: emp.id,
          status: "ONBOARDING",
        },
        select: {
          id: true,
          user: { select: { name: true, email: true } },
          paymentStatus: true,
          softwareChecklist: { select: { allVerified: true } },
          documents: { where: { status: "UPLOADED" }, select: { id: true } },
        },
        take: 10,
      }),
      // Documents pending from counselled students
      prisma.document.findMany({
        where: { status: "UPLOADED", student: { counsellorId: emp.id } },
        select: {
          id: true,
          name: true,
          type: true,
          uploadedAt: true,
          student: { select: { id: true, user: { select: { name: true } } } },
        },
        take: 10,
        orderBy: { uploadedAt: "desc" },
      }),
      // Follow-ups due (leads assigned to this counsellor)
      prisma.lead.findMany({
        where: {
          assignedToId: emp.id,
          followUpDate: { lte: todayEnd },
          status: { notIn: ["ENROLLED", "LOST"] },
        },
        select: { id: true, name: true, email: true, followUpDate: true, status: true },
        take: 10,
        orderBy: { followUpDate: "asc" },
      }),
      // Upcoming batches with students needing readiness
      prisma.batch.findMany({
        where: { status: "UPCOMING" },
        select: {
          id: true,
          name: true,
          startDate: true,
          students: {
            where: { counsellorId: emp.id },
            select: {
              id: true,
              user: { select: { name: true } },
              paymentStatus: true,
              documents: { select: { status: true } },
              softwareChecklist: { select: { allVerified: true } },
            },
          },
        },
        orderBy: { startDate: "asc" },
        take: 5,
      }),
    ]);

    return {
      myStudents,
      onboardingPending,
      documentsToReview,
      studentsNeedingAttention,
      pendingDocsList,
      followUpsDue,
      upcomingBatches,
    };
  } catch {
    return null;
  }
}

// ─── TRAINER data fetcher ───
async function getTrainerData(userId: string) {
  try {
    const emp = await prisma.employee.findUnique({ where: { userId } });
    if (!emp) return null;

    const [
      upcomingBatches,
      upcomingBatchList,
      ungradedAssessments,
      projectsToReview,
      softwareToVerify,
    ] = await Promise.all([
      prisma.batch.count({ where: { instructorId: emp.id, status: "UPCOMING" } }),
      prisma.batch.findMany({
        where: { instructorId: emp.id, status: { in: ["UPCOMING", "ACTIVE"] } },
        orderBy: { startDate: "asc" },
        take: 3,
        include: {
          students: {
            select: { id: true, user: { select: { name: true } }, status: true },
          },
        },
      }),
      // Ungraded assessment attempts
      prisma.assessmentAttempt.findMany({
        where: { completedAt: { not: null } },
        select: {
          id: true,
          course: true,
          score: true,
          totalQuestions: true,
          passed: true,
          completedAt: true,
          student: { select: { id: true, user: { select: { name: true } } } },
        },
        orderBy: { completedAt: "desc" },
        take: 10,
      }),
      // Projects to review
      prisma.projectSubmission.findMany({
        where: { status: "SUBMITTED" },
        select: {
          id: true,
          title: true,
          submittedAt: true,
          student: { select: { id: true, user: { select: { name: true } } } },
        },
        orderBy: { submittedAt: "desc" },
        take: 10,
      }),
      // Software checklists not verified
      prisma.softwareChecklist.findMany({
        where: { allVerified: false },
        select: {
          id: true,
          student: { select: { id: true, user: { select: { name: true } } } },
          updatedAt: true,
        },
        take: 10,
      }),
    ]);

    return {
      upcomingBatches,
      upcomingBatchList,
      ungradedAssessments,
      projectsToReview,
      softwareToVerify,
    };
  } catch {
    return null;
  }
}

// ─── Notification Banner component ───
function NotificationBanner({ items }: { items: { label: string; count: number; type: "warning" | "danger" }[] }) {
  const activeItems = items.filter((i) => i.count > 0);
  if (activeItems.length === 0) return null;

  const parts = activeItems.map((i) => `${i.count} ${i.label}`);
  const hasDanger = activeItems.some((i) => i.type === "danger");
  const borderColor = hasDanger ? "border-red-500" : "border-yellow-500";
  const bgColor = hasDanger ? "bg-red-500/5" : "bg-yellow-500/5";
  const textColor = hasDanger ? "text-red-400" : "text-yellow-400";
  const iconColor = hasDanger ? "text-red-400" : "text-yellow-400";

  return (
    <div className={`glass-card p-4 border-l-4 ${borderColor} ${bgColor}`}>
      <div className="flex items-center gap-2">
        <Bell size={20} className={iconColor} />
        <p className={`${textColor} font-medium text-sm`}>
          You have {parts.join(" and ")}
        </p>
      </div>
    </div>
  );
}

// ─── Lead list row component ───
function LeadRow({ lead, overdue = false }: { lead: any; overdue?: boolean }) {
  return (
    <Link
      href={`/admin/leads/${lead.id}`}
      className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white/[0.03] transition-colors border-b border-white/[0.04] last:border-0"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm text-text-primary font-medium truncate">{lead.name}</p>
        <p className="text-xs text-text-muted truncate">{lead.email}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-3">
        {lead.courseInterest && (
          <span className="text-xs text-text-muted hidden sm:inline">
            {lead.courseInterest === "PROFESSIONAL_MODULE" ? "Prof" : "AI"}
          </span>
        )}
        {overdue ? (
          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400">
            Overdue
          </span>
        ) : (
          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400">
            Due today
          </span>
        )}
        <ArrowRight size={14} className="text-text-muted" />
      </div>
    </Link>
  );
}

export default async function AdminDashboard() {
  const session = await auth();
  const role = session?.user?.role || "ADMIN";
  const userId = session?.user?.id || "";

  // ═══════════════════════════════════════════════════
  // SALES_LEAD Dashboard
  // ═══════════════════════════════════════════════════
  if (role === "SALES_LEAD") {
    const data = await getSalesLeadDashboardData(userId);
    if (!data) {
      return (
        <div className="space-y-8">
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-muted">Employee record not found. Please contact admin.</p>
        </div>
      );
    }

    const salesPct = Math.round((data.salesAchieved / data.salesTargetCount) * 100);
    const leadPct = Math.round((data.leadsGenerated / data.leadTargetCount) * 100);
    const salesColor = data.salesAchieved >= 15 ? "bg-green-500" : data.salesAchieved >= 10 ? "bg-yellow-500" : "bg-red-500";
    const leadColor = data.leadsGenerated >= 50 ? "bg-green-500" : data.leadsGenerated >= 30 ? "bg-yellow-500" : "bg-red-500";

    const mandatoryThreshold = 5;
    const eligibleSales = Math.max(0, data.totalSales - mandatoryThreshold);
    const perSaleIncentive = 107;
    const remaining = data.incentiveEarned - data.incentiveDistributed;

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Sales Dashboard</h1>
          <p className="text-text-muted mt-1">Your sales performance this month</p>
        </div>

        {/* Notification Banner */}
        <NotificationBanner
          items={[
            { label: "follow-ups due today", count: data.followUpsDueToday.length, type: "warning" },
            { label: "overdue follow-ups", count: data.overdueFollowUps.length, type: "danger" },
          ]}
        />

        {data.salesAchieved < data.salesTargetCount && (
          <div className="glass-card p-4 border-l-4 border-red-500 bg-red-500/5">
            <div className="flex items-center gap-2">
              <AlertTriangle size={20} className="text-red-400" />
              <p className="text-red-400 font-medium">
                You are below your monthly sales target. Consequences may apply.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sales Target */}
          <div className="glass-card p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-text-muted text-sm">My Sales Target</p>
                <p className="text-2xl font-bold text-text-primary mt-1">
                  {data.salesAchieved}/{data.salesTargetCount}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-neon-blue/10">
                <Target size={20} className="text-neon-blue" />
              </div>
            </div>
            <div className="w-full bg-white/[0.06] rounded-full h-3">
              <div
                className={`h-3 rounded-full ${salesColor} transition-all`}
                style={{ width: `${Math.min(salesPct, 100)}%` }}
              />
            </div>
            <p className="text-xs text-text-muted mt-1">{salesPct}% achieved</p>
          </div>

          {/* Lead Target */}
          <div className="glass-card p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-text-muted text-sm">My Lead Target</p>
                <p className="text-2xl font-bold text-text-primary mt-1">
                  {data.leadsGenerated}/{data.leadTargetCount}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-cyan/10">
                <Users size={20} className="text-cyan" />
              </div>
            </div>
            <div className="w-full bg-white/[0.06] rounded-full h-3">
              <div
                className={`h-3 rounded-full ${leadColor} transition-all`}
                style={{ width: `${Math.min(leadPct, 100)}%` }}
              />
            </div>
            <p className="text-xs text-text-muted mt-1">{leadPct}% achieved</p>
          </div>
        </div>

        {/* Incentive */}
        <div className="glass-card p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-text-muted text-sm">My Incentive This Month</p>
              <p className="text-2xl font-bold text-neon-green mt-1">
                {"\u00a3"}{data.incentiveEarned.toFixed(2)}
              </p>
              {data.totalSales < mandatoryThreshold && (
                <p className="text-xs text-text-muted mt-1">
                  {"\u00a3"}0 (under mandatory {mandatoryThreshold} sales)
                </p>
              )}
            </div>
            <div className="p-2.5 rounded-lg bg-neon-green/10">
              <DollarSign size={20} className="text-neon-green" />
            </div>
          </div>
          <div className="space-y-1 text-sm text-text-secondary">
            <p>Eligible sales: {eligibleSales} x {"\u00a3"}{perSaleIncentive} = {"\u00a3"}{(eligibleSales * perSaleIncentive).toFixed(2)}</p>
            <p>Distributed: {"\u00a3"}{data.incentiveDistributed.toFixed(2)}</p>
            <p>Remaining to distribute: {"\u00a3"}{remaining.toFixed(2)}</p>
          </div>
        </div>

        {/* Lead Pipeline */}
        <div className="glass-card p-5">
          <h2 className="text-lg font-semibold text-text-primary mb-4">My Leads Pipeline</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "NEW", count: data.leadPipeline["NEW"] || 0, color: "text-cyan" },
              { label: "CONTACTED", count: data.leadPipeline["CONTACTED"] || 0, color: "text-neon-blue" },
              { label: "QUALIFIED", count: data.leadPipeline["QUALIFIED"] || 0, color: "text-neon-green" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className={`text-2xl font-bold ${item.color}`}>{item.count}</p>
                <p className="text-xs text-text-muted mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* My Follow-ups Due Today */}
        {data.followUpsDueToday.length > 0 && (
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <Clock size={18} className="text-yellow-400" />
                My Follow-ups Due Today
              </h2>
              <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400">
                {data.followUpsDueToday.length}
              </span>
            </div>
            <div className="space-y-0">
              {data.followUpsDueToday.map((lead: any) => (
                <LeadRow key={lead.id} lead={lead} />
              ))}
            </div>
          </div>
        )}

        {/* My Overdue Follow-ups */}
        {data.overdueFollowUps.length > 0 && (
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-400" />
                My Overdue Follow-ups
              </h2>
              <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400">
                {data.overdueFollowUps.length}
              </span>
            </div>
            <div className="space-y-0">
              {data.overdueFollowUps.map((lead: any) => (
                <LeadRow key={lead.id} lead={lead} overdue />
              ))}
            </div>
          </div>
        )}

        {/* Recent Leads */}
        {data.recentLeads.length > 0 && (
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <Users size={18} className="text-cyan" />
                Recent Leads
              </h2>
              <Link href="/admin/leads" className="text-xs text-neon-blue hover:underline">View all</Link>
            </div>
            <div className="space-y-0">
              {data.recentLeads.map((lead: any) => (
                <Link
                  key={lead.id}
                  href={`/admin/leads/${lead.id}`}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white/[0.03] transition-colors border-b border-white/[0.04] last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-text-primary font-medium truncate">{lead.name}</p>
                    <p className="text-xs text-text-muted truncate">{lead.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      lead.status === "NEW" ? "bg-cyan/10 text-cyan" :
                      lead.status === "CONTACTED" ? "bg-neon-blue/10 text-neon-blue" :
                      lead.status === "QUALIFIED" ? "bg-neon-green/10 text-neon-green" :
                      "bg-white/[0.06] text-text-muted"
                    }`}>
                      {lead.status}
                    </span>
                    <ArrowRight size={14} className="text-text-muted" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  // ADMISSION_COUNSELLOR Dashboard
  // ═══════════════════════════════════════════════════
  if (role === "ADMISSION_COUNSELLOR") {
    const data = await getAdmissionCounsellorData(userId);
    if (!data) {
      return (
        <div className="space-y-8">
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-muted">Employee record not found. Please contact admin.</p>
        </div>
      );
    }

    const kpis = [
      { label: "My Students", value: data.myStudents, icon: Users, color: "text-neon-blue", bgColor: "bg-neon-blue/10" },
      { label: "Onboarding Pending", value: data.onboardingPending, icon: ClipboardCheck, color: "text-yellow-400", bgColor: "bg-yellow-400/10" },
      { label: "Documents to Review", value: data.documentsToReview, icon: FileCheck, color: "text-cyan", bgColor: "bg-cyan/10" },
    ];

    const overdueFollowUps = data.followUpsDue.filter((l: any) => {
      const d = new Date(l.followUpDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return d < today;
    });
    const todayFollowUps = data.followUpsDue.filter((l: any) => {
      const d = new Date(l.followUpDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return d >= today && d < tomorrow;
    });

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Admissions Dashboard</h1>
          <p className="text-text-muted mt-1">Student onboarding and document management</p>
        </div>

        {/* Notification Banner */}
        <NotificationBanner
          items={[
            { label: "students needing attention", count: data.studentsNeedingAttention.length, type: "warning" },
            { label: "documents pending review", count: data.documentsToReview, type: "warning" },
            { label: "overdue follow-ups", count: overdueFollowUps.length, type: "danger" },
            { label: "follow-ups due today", count: todayFollowUps.length, type: "warning" },
          ]}
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="glass-card p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-text-muted text-sm">{kpi.label}</p>
                    <p className="text-2xl font-bold text-text-primary mt-1">{kpi.value}</p>
                  </div>
                  <div className={`p-2.5 rounded-lg ${kpi.bgColor}`}>
                    <Icon size={20} className={kpi.color} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Students Needing Attention */}
        {data.studentsNeedingAttention.length > 0 && (
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <AlertTriangle size={18} className="text-yellow-400" />
                My Students Needing Attention
              </h2>
              <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400">
                {data.studentsNeedingAttention.length}
              </span>
            </div>
            <div className="space-y-0">
              {data.studentsNeedingAttention.map((student: any) => {
                const needsDocs = student.documents.length > 0;
                const needsSoftware = !student.softwareChecklist?.allVerified;
                const needsPayment = student.paymentStatus !== "PAID";
                return (
                  <Link
                    key={student.id}
                    href={`/admin/students/${student.id}`}
                    className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white/[0.03] transition-colors border-b border-white/[0.04] last:border-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-text-primary font-medium truncate">{student.user.name}</p>
                      <p className="text-xs text-text-muted truncate">{student.user.email}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-3">
                      {needsPayment && (
                        <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-500/10 text-red-400">Payment</span>
                      )}
                      {needsDocs && (
                        <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-yellow-500/10 text-yellow-400">Docs</span>
                      )}
                      {needsSoftware && (
                        <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-cyan/10 text-cyan">Software</span>
                      )}
                      <ArrowRight size={14} className="text-text-muted" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Documents Pending My Review */}
        {data.pendingDocsList.length > 0 && (
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <FileText size={18} className="text-cyan" />
                Documents Pending My Review
              </h2>
              <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-cyan/10 text-cyan">
                {data.pendingDocsList.length}
              </span>
            </div>
            <div className="space-y-0">
              {data.pendingDocsList.map((doc: any) => (
                <Link
                  key={doc.id}
                  href={`/admin/students/${doc.student.id}`}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white/[0.03] transition-colors border-b border-white/[0.04] last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-text-primary font-medium truncate">{doc.name}</p>
                    <p className="text-xs text-text-muted truncate">{doc.student.user.name} - {doc.type}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400">
                      Pending
                    </span>
                    <ArrowRight size={14} className="text-text-muted" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Follow-ups Due */}
        {data.followUpsDue.length > 0 && (
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <PhoneCall size={18} className="text-yellow-400" />
                Follow-ups Due
              </h2>
              <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400">
                {data.followUpsDue.length}
              </span>
            </div>
            <div className="space-y-0">
              {data.followUpsDue.map((lead: any) => {
                const isOverdue = new Date(lead.followUpDate) < new Date(new Date().setHours(0, 0, 0, 0));
                return <LeadRow key={lead.id} lead={lead} overdue={isOverdue} />;
              })}
            </div>
          </div>
        )}

        {/* Pre-Batch Readiness */}
        {data.upcomingBatches.filter((b: any) => b.students.length > 0).length > 0 && (
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <Calendar size={18} className="text-neon-blue" />
                Pre-Batch Readiness
              </h2>
            </div>
            {data.upcomingBatches
              .filter((batch: any) => batch.students.length > 0)
              .map((batch: any) => (
                <div key={batch.id} className="mb-4 last:mb-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-text-primary">{batch.name}</p>
                    <p className="text-xs text-text-muted">{formatDate(batch.startDate)}</p>
                  </div>
                  <div className="space-y-0">
                    {batch.students.map((student: any) => {
                      const needsPayment = student.paymentStatus !== "PAID";
                      const needsDocs = student.documents.some((d: any) => d.status === "UPLOADED");
                      const needsSoftware = !student.softwareChecklist?.allVerified;
                      const isReady = !needsPayment && !needsDocs && !needsSoftware;
                      return (
                        <Link
                          key={student.id}
                          href={`/admin/students/${student.id}`}
                          className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/[0.03] transition-colors border-b border-white/[0.04] last:border-0"
                        >
                          <p className="text-sm text-text-secondary truncate">{student.user.name}</p>
                          <div className="flex items-center gap-1.5 shrink-0 ml-3">
                            {isReady ? (
                              <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-500/10 text-green-400">Ready</span>
                            ) : (
                              <>
                                {needsPayment && <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-500/10 text-red-400">Payment</span>}
                                {needsDocs && <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-yellow-500/10 text-yellow-400">Docs</span>}
                                {needsSoftware && <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-cyan/10 text-cyan">Software</span>}
                              </>
                            )}
                          </div>
                        </Link>
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

  // ═══════════════════════════════════════════════════
  // TRAINER Dashboard
  // ═══════════════════════════════════════════════════
  if (role === "TRAINER") {
    const data = await getTrainerData(userId);
    if (!data) {
      return (
        <div className="space-y-8">
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-muted">Employee record not found. Please contact admin.</p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Trainer Dashboard</h1>
          <p className="text-text-muted mt-1">Your batches and assessments</p>
        </div>

        {/* Notification Banner */}
        <NotificationBanner
          items={[
            { label: "assessments to grade", count: data.ungradedAssessments.length, type: "warning" },
            { label: "projects to review", count: data.projectsToReview.length, type: "warning" },
            { label: "software verifications pending", count: data.softwareToVerify.length, type: "warning" },
          ]}
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-text-muted text-sm">My Upcoming Batches</p>
                <p className="text-2xl font-bold text-text-primary mt-1">{data.upcomingBatches}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-purple/10">
                <Layers size={20} className="text-purple" />
              </div>
            </div>
          </div>
          <div className="glass-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-text-muted text-sm">Assessments to Grade</p>
                <p className="text-2xl font-bold text-text-primary mt-1">{data.ungradedAssessments.length}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-yellow-400/10">
                <BookOpen size={20} className="text-yellow-400" />
              </div>
            </div>
          </div>
          <div className="glass-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-text-muted text-sm">Projects to Review</p>
                <p className="text-2xl font-bold text-text-primary mt-1">{data.projectsToReview.length}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-cyan/10">
                <Code size={20} className="text-cyan" />
              </div>
            </div>
          </div>
          <div className="glass-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-text-muted text-sm">Software to Verify</p>
                <p className="text-2xl font-bold text-text-primary mt-1">{data.softwareToVerify.length}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-neon-green/10">
                <Monitor size={20} className="text-neon-green" />
              </div>
            </div>
          </div>
        </div>

        {/* Assessments to Grade */}
        {data.ungradedAssessments.length > 0 && (
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <BookOpen size={18} className="text-yellow-400" />
                Assessments to Grade
              </h2>
              <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400">
                {data.ungradedAssessments.length}
              </span>
            </div>
            <div className="space-y-0">
              {data.ungradedAssessments.map((attempt: any) => (
                <Link
                  key={attempt.id}
                  href={`/admin/students/${attempt.student.id}`}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white/[0.03] transition-colors border-b border-white/[0.04] last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-text-primary font-medium truncate">{attempt.student.user.name}</p>
                    <p className="text-xs text-text-muted">
                      {attempt.course === "PROFESSIONAL_MODULE" ? "Professional" : "AI"} - Score: {attempt.score}/{attempt.totalQuestions}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${attempt.passed ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                      {attempt.passed ? "Passed" : "Failed"}
                    </span>
                    <ArrowRight size={14} className="text-text-muted" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Projects to Review */}
        {data.projectsToReview.length > 0 && (
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <Code size={18} className="text-cyan" />
                Projects to Review
              </h2>
              <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-cyan/10 text-cyan">
                {data.projectsToReview.length}
              </span>
            </div>
            <div className="space-y-0">
              {data.projectsToReview.map((project: any) => (
                <Link
                  key={project.id}
                  href={`/admin/students/${project.student.id}`}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white/[0.03] transition-colors border-b border-white/[0.04] last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-text-primary font-medium truncate">{project.title}</p>
                    <p className="text-xs text-text-muted truncate">
                      {project.student.user.name} - Submitted {formatDate(project.submittedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400">
                      Pending
                    </span>
                    <ArrowRight size={14} className="text-text-muted" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Software to Verify */}
        {data.softwareToVerify.length > 0 && (
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <Monitor size={18} className="text-neon-green" />
                Software to Verify
              </h2>
              <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-neon-green/10 text-neon-green">
                {data.softwareToVerify.length}
              </span>
            </div>
            <div className="space-y-0">
              {data.softwareToVerify.map((checklist: any) => (
                <Link
                  key={checklist.id}
                  href={`/admin/students/${checklist.student.id}`}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white/[0.03] transition-colors border-b border-white/[0.04] last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-text-primary font-medium truncate">{checklist.student.user.name}</p>
                    <p className="text-xs text-text-muted">Not yet verified</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400">
                      Unverified
                    </span>
                    <ArrowRight size={14} className="text-text-muted" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* My Upcoming Batches with Student Lists */}
        {data.upcomingBatchList.length > 0 && (
          <div className="glass-card p-5">
            <h2 className="text-lg font-semibold text-text-primary mb-4">My Upcoming Batches</h2>
            <div className="space-y-5">
              {data.upcomingBatchList.map((batch: any) => (
                <div key={batch.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm text-text-primary font-medium">{batch.name}</p>
                      <p className="text-xs text-text-muted">{batch.course === "PROFESSIONAL_MODULE" ? "Professional Module" : "AI Module"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-text-secondary">{formatDate(batch.startDate)}</p>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${batch.status === "ACTIVE" ? "bg-green-500/10 text-green-400" : "bg-cyan/10 text-cyan"}`}>
                        {batch.status}
                      </span>
                    </div>
                  </div>
                  {batch.students.length > 0 ? (
                    <div className="ml-3 border-l-2 border-white/[0.06] pl-3 space-y-1">
                      {batch.students.map((student: any) => (
                        <Link
                          key={student.id}
                          href={`/admin/students/${student.id}`}
                          className="flex items-center justify-between py-1.5 hover:bg-white/[0.03] rounded px-2 transition-colors"
                        >
                          <p className="text-xs text-text-secondary">{student.user.name}</p>
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            student.status === "ACTIVE" ? "bg-green-500/10 text-green-400" :
                            student.status === "ONBOARDING" ? "bg-yellow-500/10 text-yellow-400" :
                            "bg-white/[0.06] text-text-muted"
                          }`}>
                            {student.status}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-text-muted ml-3">No students assigned</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  // SUPER_ADMIN / ADMIN Default Dashboard
  // ═══════════════════════════════════════════════════
  const data = await getAdminDashboardData();

  const kpis = [
    {
      label: "Active Students",
      value: data.activeStudents,
      subtext: `${data.totalStudents} total`,
      icon: Users,
      color: "text-neon-blue",
      bgColor: "bg-neon-blue/10",
    },
    {
      label: "Leads This Week",
      value: data.leadsThisWeek,
      icon: Target,
      color: "text-neon-green",
      bgColor: "bg-neon-green/10",
    },
    {
      label: "Leads This Month",
      value: data.leadsThisMonth,
      icon: Target,
      color: "text-cyan",
      bgColor: "bg-cyan/10",
    },
    {
      label: "Career Transitions",
      value: `${data.placementRate}%`,
      icon: TrendingUp,
      color: "text-neon-green",
      bgColor: "bg-neon-green/10",
    },
    {
      label: "Upcoming Batches",
      value: data.upcomingBatches,
      icon: Layers,
      color: "text-purple",
      bgColor: "bg-purple/10",
    },
    {
      label: "Follow-ups Due",
      value: data.followUpsDueTodayCount,
      subtext: "Today",
      icon: PhoneCall,
      color: data.followUpsDueTodayCount > 0 ? "text-red-400" : "text-text-muted",
      bgColor:
        data.followUpsDueTodayCount > 0 ? "bg-red-400/10" : "bg-white/[0.03]",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-muted mt-1">
          Overview of your CRM and training operations
        </p>
      </div>

      {/* Notification Banner */}
      <NotificationBanner
        items={[
          { label: "follow-ups due today", count: data.followUpsDueToday.length, type: "warning" },
          { label: "overdue follow-ups", count: data.overdueFollowUps.length, type: "danger" },
          { label: "documents pending review", count: data.pendingDocs, type: "warning" },
          { label: "ungraded projects", count: data.pendingProjects, type: "warning" },
        ]}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="glass-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-text-muted text-sm">{kpi.label}</p>
                  <p className="text-2xl font-bold text-text-primary mt-1">
                    {kpi.value}
                  </p>
                  {kpi.subtext && (
                    <p className="text-xs text-text-muted mt-0.5">
                      {kpi.subtext}
                    </p>
                  )}
                </div>
                <div className={`p-2.5 rounded-lg ${kpi.bgColor}`}>
                  <Icon size={20} className={kpi.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Conversion Funnel */}
      <ConversionFunnel />

      {/* Pending Actions */}
      <div className="glass-card p-5">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Pending Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link href="/admin/students?status=ONBOARDING" className="flex flex-col items-center p-4 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] transition-colors border border-white/[0.04]">
            <ClipboardCheck size={24} className="text-yellow-400 mb-2" />
            <p className="text-2xl font-bold text-text-primary">{data.onboardingStudents}</p>
            <p className="text-xs text-text-muted text-center mt-1">Students Onboarding</p>
          </Link>
          <Link href="/admin/students" className="flex flex-col items-center p-4 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] transition-colors border border-white/[0.04]">
            <FileCheck size={24} className="text-cyan mb-2" />
            <p className="text-2xl font-bold text-text-primary">{data.pendingDocs}</p>
            <p className="text-xs text-text-muted text-center mt-1">Docs Pending Review</p>
          </Link>
          <Link href="/admin/students" className="flex flex-col items-center p-4 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] transition-colors border border-white/[0.04]">
            <Code size={24} className="text-neon-green mb-2" />
            <p className="text-2xl font-bold text-text-primary">{data.pendingProjects}</p>
            <p className="text-xs text-text-muted text-center mt-1">Ungraded Projects</p>
          </Link>
          <Link href="/admin/students" className="flex flex-col items-center p-4 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] transition-colors border border-white/[0.04]">
            <BookOpen size={24} className="text-purple mb-2" />
            <p className="text-2xl font-bold text-text-primary">{data.ungradedAssessments}</p>
            <p className="text-xs text-text-muted text-center mt-1">Assessment Attempts</p>
          </Link>
        </div>
      </div>

      {/* Follow-ups Due Today */}
      {data.followUpsDueToday.length > 0 && (
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <Clock size={18} className="text-yellow-400" />
              Follow-ups Due Today
            </h2>
            <Link href="/admin/leads" className="text-xs text-neon-blue hover:underline">View all leads</Link>
          </div>
          <div className="space-y-0">
            {data.followUpsDueToday.map((lead: any) => (
              <LeadRow key={lead.id} lead={lead} />
            ))}
          </div>
        </div>
      )}

      {/* Overdue Follow-ups */}
      {data.overdueFollowUps.length > 0 && (
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-400" />
              Overdue Follow-ups
            </h2>
            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400">
              {data.overdueFollowUps.length}
            </span>
          </div>
          <div className="space-y-0">
            {data.overdueFollowUps.map((lead: any) => (
              <LeadRow key={lead.id} lead={lead} overdue />
            ))}
          </div>
        </div>
      )}

      {/* Sales Team Performance */}
      {data.salesTeamPerformance.length > 0 && (
        <div className="glass-card p-5">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Sales Team Performance
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-4 py-2 text-text-muted font-medium">Name</th>
                  <th className="text-left px-4 py-2 text-text-muted font-medium">Sales Target</th>
                  <th className="text-left px-4 py-2 text-text-muted font-medium">Achieved</th>
                  <th className="text-left px-4 py-2 text-text-muted font-medium">Lead Target</th>
                  <th className="text-left px-4 py-2 text-text-muted font-medium">Leads</th>
                </tr>
              </thead>
              <tbody>
                {data.salesTeamPerformance.map((st: any) => (
                  <tr key={st.id} className="border-b border-white/[0.04]">
                    <td className="px-4 py-2 text-text-primary">{st.employee?.user?.name || "Unknown"}</td>
                    <td className="px-4 py-2 text-text-secondary">{st.salesTarget || 15}</td>
                    <td className="px-4 py-2">
                      <span className={st.salesAchieved >= (st.salesTarget || 15) ? "text-green-400" : "text-red-400"}>
                        {st.salesAchieved || 0}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-text-secondary">{st.leadTarget || 50}</td>
                    <td className="px-4 py-2 text-text-secondary">{st.leadsGenerated || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="glass-card p-5">
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/leads?action=add"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20 transition-colors text-sm font-medium"
          >
            <Plus size={16} />
            Add Lead
          </Link>
          <Link
            href="/admin/batches?action=create"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neon-green/10 text-neon-green border border-neon-green/20 hover:bg-neon-green/20 transition-colors text-sm font-medium"
          >
            <Layers size={16} />
            Create Batch
          </Link>
          <Link
            href="/admin/jobs?action=send"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-purple/10 text-purple border border-purple/20 hover:bg-purple/20 transition-colors text-sm font-medium"
          >
            <Send size={16} />
            Send Job Alert
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-5">
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          Recent Activity
        </h2>
        {data.recentActivity.length === 0 ? (
          <p className="text-text-muted text-sm">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {data.recentActivity.map(
              (log: {
                id: string;
                action: string;
                createdAt: Date;
                user: { name: string };
              }) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 py-2 border-b border-white/[0.04] last:border-0"
                >
                  <div className="w-2 h-2 rounded-full bg-neon-blue mt-2 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-secondary">
                      <span className="text-text-primary font-medium">
                        {log.user.name}
                      </span>{" "}
                      {log.action}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {formatDate(log.createdAt)}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
