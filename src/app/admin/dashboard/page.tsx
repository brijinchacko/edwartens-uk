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
import MyDayClient from "./MyDayClient";
import WeeklySummaryCard from "./WeeklySummaryCard";

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
        take: 5,
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

    // 7-day follow-up forecast (all leads)
    const forecastDays: { date: Date; label: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(todayStart);
      d.setDate(d.getDate() + i);
      forecastDays.push({ date: d, label: d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "Europe/London" }) });
    }
    const forecastCounts = await Promise.all(
      forecastDays.map((fd) => {
        const dayEnd = new Date(fd.date); dayEnd.setHours(23, 59, 59, 999);
        return prisma.lead.count({
          where: { followUpDate: { gte: fd.date, lte: dayEnd }, status: { notIn: ["ENROLLED", "LOST"] } },
        });
      })
    );
    const followUpForecast = forecastDays.map((fd, i) => ({
      label: fd.label, count: forecastCounts[i], isToday: i === 0,
    }));

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
      followUpForecast,
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
      followUpForecast: [],
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

    // 7-day follow-up forecast dates
    const forecastDays: { date: Date; label: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(todayStart);
      d.setDate(d.getDate() + i);
      const end = new Date(d);
      end.setHours(23, 59, 59, 999);
      forecastDays.push({ date: d, label: d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "Europe/London" }) });
    }

    const [
      leadCounts,
      followUpsDueToday,
      overdueFollowUps,
      recentLeads,
      // 7-day forecast counts
      ...forecastCounts
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
      // Forecast: count follow-ups for each of the next 7 days
      ...forecastDays.map((fd) => {
        const dayEnd = new Date(fd.date);
        dayEnd.setHours(23, 59, 59, 999);
        return prisma.lead.count({
          where: {
            assignedToId: emp.id,
            followUpDate: { gte: fd.date, lte: dayEnd },
            status: { notIn: ["ENROLLED", "LOST"] },
          },
        });
      }),
    ]);

    const followUpForecast = forecastDays.map((fd, i) => ({
      label: fd.label,
      count: forecastCounts[i] as number,
      isToday: i === 0,
    }));

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
      followUpForecast,
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

    // 7-day follow-up forecast
    const forecastDays: { date: Date; label: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(todayStart);
      d.setDate(d.getDate() + i);
      forecastDays.push({ date: d, label: d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "Europe/London" }) });
    }

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
      // Upcoming batches
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

    // Forecast counts
    const forecastCounts = await Promise.all(
      forecastDays.map((fd) => {
        const dayEnd = new Date(fd.date);
        dayEnd.setHours(23, 59, 59, 999);
        return prisma.lead.count({
          where: {
            assignedToId: emp.id,
            followUpDate: { gte: fd.date, lte: dayEnd },
            status: { notIn: ["ENROLLED", "LOST"] },
          },
        });
      })
    );
    const followUpForecast = forecastDays.map((fd, i) => ({
      label: fd.label,
      count: forecastCounts[i],
      isToday: i === 0,
    }));

    return {
      myStudents,
      onboardingPending,
      documentsToReview,
      studentsNeedingAttention,
      pendingDocsList,
      followUpsDue,
      upcomingBatches,
      followUpForecast,
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
      <div className="space-y-4">
        {/* Monthly Targets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Sales Target */}
          <Link href="/admin/reports" className="glass-card p-4 hover:border-white/[0.12] transition-colors">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-text-muted">Monthly Sales</p>
              <Target size={14} className="text-neon-blue" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-text-primary">{data.salesAchieved}</span>
              <span className="text-sm text-text-muted">/ {data.salesTargetCount}</span>
            </div>
            <div className="w-full h-2 bg-white/[0.06] rounded-full mt-2 overflow-hidden">
              <div className={`h-full rounded-full ${salesColor} transition-all`} style={{ width: `${Math.min(salesPct, 100)}%` }} />
            </div>
            <p className="text-[10px] text-text-muted mt-1">{salesPct}% · Hard target: {data.salesTargetCount > 12 ? 12 : data.salesTargetCount}</p>
          </Link>

          {/* Lead Target */}
          <Link href="/admin/leads" className="glass-card p-4 hover:border-white/[0.12] transition-colors">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-text-muted">Leads Generated</p>
              <Users size={14} className="text-cyan" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-text-primary">{data.leadsGenerated}</span>
              <span className="text-sm text-text-muted">/ {data.leadTargetCount}</span>
            </div>
            <div className="w-full h-2 bg-white/[0.06] rounded-full mt-2 overflow-hidden">
              <div className={`h-full rounded-full ${leadColor} transition-all`} style={{ width: `${Math.min(leadPct, 100)}%` }} />
            </div>
            <p className="text-[10px] text-text-muted mt-1">{leadPct}% achieved</p>
          </Link>

          {/* Incentive */}
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-text-muted">Incentive Earned</p>
              <DollarSign size={14} className="text-neon-green" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-neon-green">{"\u00a3"}{data.incentiveEarned.toFixed(0)}</span>
            </div>
            <p className="text-[10px] text-text-muted mt-2">
              {eligibleSales} eligible × {"\u00a3"}{perSaleIncentive} = {"\u00a3"}{(eligibleSales * perSaleIncentive).toFixed(0)}
            </p>
            {remaining > 0 && <p className="text-[10px] text-yellow-400 mt-0.5">{"\u00a3"}{remaining.toFixed(0)} pending distribution</p>}
          </div>
        </div>

        {/* WeeklySummaryCard removed per user request */}
        <MyDayClient userName={session?.user?.name || ""} userRole={role} userId={userId} />
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  // ADMISSION_COUNSELLOR Dashboard
  // ═══════════════════════════════════════════════════
  if (role === "ADMISSION_COUNSELLOR") {
    return (
      <div className="space-y-4">
        {/* WeeklySummaryCard removed per user request */}
        <MyDayClient userName={session?.user?.name || ""} userRole={role} userId={userId} />
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

        {/* WeeklySummaryCard removed per user request */}

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

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const kpis = [
    {
      label: "Active Students",
      value: data.activeStudents,
      subtext: `${data.totalStudents} total`,
      icon: Users,
      color: "text-neon-blue",
      bgColor: "bg-neon-blue/10",
      href: "/admin/students?status=ACTIVE",
    },
    {
      label: "Leads This Week",
      value: data.leadsThisWeek,
      icon: Target,
      color: "text-neon-green",
      bgColor: "bg-neon-green/10",
      href: `/admin/leads?dateFrom=${weekStart.toISOString().split("T")[0]}`,
    },
    {
      label: "Leads This Month",
      value: data.leadsThisMonth,
      icon: Target,
      color: "text-cyan",
      bgColor: "bg-cyan/10",
      href: `/admin/leads?dateFrom=${monthStart.toISOString().split("T")[0]}`,
    },
    {
      label: "Career Transitions",
      value: `${data.placementRate}%`,
      icon: TrendingUp,
      color: "text-neon-green",
      bgColor: "bg-neon-green/10",
      href: "/admin/students?status=COMPLETED",
    },
    {
      label: "Upcoming Batches",
      value: data.upcomingBatches,
      icon: Layers,
      color: "text-purple",
      bgColor: "bg-purple/10",
      href: "/admin/batches?status=UPCOMING",
    },
    {
      label: "Follow-ups Due",
      value: data.followUpsDueTodayCount,
      subtext: "Today",
      icon: PhoneCall,
      color: data.followUpsDueTodayCount > 0 ? "text-red-400" : "text-text-muted",
      bgColor:
        data.followUpsDueTodayCount > 0 ? "bg-red-400/10" : "bg-white/[0.03]",
      href: "/admin/leads?followUp=today",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-muted mt-1">
          Overview of your CRM and training operations
        </p>
      </div>

      {/* Team Monthly Target — Weekly breakdown: 5/week, 20/month, 12 hard */}
      {data.salesTeamPerformance && data.salesTeamPerformance.length > 0 && (() => {
        const teamTotal = data.salesTeamPerformance.reduce((sum: number, t: any) => sum + (t.salesAchieved || 0), 0);
        const monthlyTarget = 20;
        const hardTarget = 12;
        const weeklyTarget = 5;

        const now = new Date();
        const dayOfMonth = now.getDate();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const daysLeft = daysInMonth - dayOfMonth;
        const currentWeek = Math.min(Math.ceil(dayOfMonth / 7), 4);
        const expectedByNow = currentWeek * weeklyTarget;

        // Status
        const isHardMet = teamTotal >= hardTarget;
        const isMonthlyMet = teamTotal >= monthlyTarget;
        const isOnPace = teamTotal >= expectedByNow;
        const isBehindHard = teamTotal < hardTarget && currentWeek >= 3;
        const isCritical = teamTotal < hardTarget && daysLeft <= 7;

        // Color logic
        const mainColor = isMonthlyMet ? "text-green-400" : isHardMet ? "text-[#7BC142]" : isCritical ? "text-red-400" : isBehindHard ? "text-red-400" : isOnPace ? "text-[#7BC142]" : "text-yellow-400";
        const barColor = isMonthlyMet ? "bg-green-500" : isHardMet ? "bg-[#7BC142]" : isCritical ? "bg-red-500" : isBehindHard ? "bg-red-500" : isOnPace ? "bg-[#7BC142]" : "bg-yellow-500";
        const borderColor = isCritical ? "border-l-red-500" : isBehindHard ? "border-l-yellow-500" : isHardMet ? "border-l-[#7BC142]" : "";
        const teamPct = Math.round((teamTotal / monthlyTarget) * 100);

        // Weekly milestones
        const weeks = [
          { label: "Week 1", target: 5, achieved: Math.min(teamTotal, 5) },
          { label: "Week 2", target: 5, achieved: Math.max(0, Math.min(teamTotal - 5, 5)) },
          { label: "Week 3", target: 5, achieved: Math.max(0, Math.min(teamTotal - 10, 5)) },
          { label: "Week 4", target: 5, achieved: Math.max(0, Math.min(teamTotal - 15, 5)) },
        ];

        return (
          <div className={`glass-card p-5 ${borderColor ? `border-l-4 ${borderColor}` : ""}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <Target size={14} className={mainColor} />
                Team Sales Target
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-text-muted">Week {currentWeek} of 4</span>
                <span className="text-[10px] text-text-muted">·</span>
                <span className="text-[10px] text-text-muted">{daysLeft}d left</span>
              </div>
            </div>

            {/* Main stats row */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="p-3 rounded-lg bg-white/[0.03] text-center">
                <p className="text-[9px] uppercase tracking-wider text-text-muted mb-1">Total</p>
                <p className={`text-2xl font-bold font-mono ${mainColor}`}>{teamTotal}</p>
                <p className="text-[10px] text-text-muted">/ {monthlyTarget}</p>
              </div>
              <div className={`p-3 rounded-lg text-center ${isHardMet ? "bg-green-500/5 border border-green-500/10" : isBehindHard ? "bg-red-500/5 border border-red-500/10" : "bg-white/[0.03]"}`}>
                <p className="text-[9px] uppercase tracking-wider text-text-muted mb-1">Hard Target</p>
                <p className={`text-2xl font-bold font-mono ${isHardMet ? "text-green-400" : isBehindHard ? "text-red-400" : "text-text-primary"}`}>{teamTotal}</p>
                <p className="text-[10px] text-text-muted">/ {hardTarget}</p>
              </div>
              <div className={`p-3 rounded-lg text-center ${isOnPace ? "bg-[#7BC142]/5" : "bg-yellow-500/5"}`}>
                <p className="text-[9px] uppercase tracking-wider text-text-muted mb-1">This Week</p>
                <p className={`text-2xl font-bold font-mono ${isOnPace ? "text-[#7BC142]" : "text-yellow-400"}`}>{weeks[currentWeek - 1]?.achieved || 0}</p>
                <p className="text-[10px] text-text-muted">/ {weeklyTarget}</p>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.03] text-center">
                <p className="text-[9px] uppercase tracking-wider text-text-muted mb-1">Remaining</p>
                <p className={`text-2xl font-bold font-mono ${monthlyTarget - teamTotal <= 0 ? "text-green-400" : "text-text-primary"}`}>{Math.max(0, monthlyTarget - teamTotal)}</p>
                <p className="text-[10px] text-text-muted">to go</p>
              </div>
            </div>

            {/* Weekly milestone bars */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {weeks.map((w, i) => {
                const wPct = Math.round((w.achieved / w.target) * 100);
                const isCurrent = i + 1 === currentWeek;
                const isPast = i + 1 < currentWeek;
                const wColor = w.achieved >= w.target ? "bg-green-500" : isPast && w.achieved < w.target ? "bg-red-500" : isCurrent ? "bg-yellow-500" : "bg-white/[0.08]";
                return (
                  <div key={w.label} className={`rounded-lg p-2 ${isCurrent ? "border border-white/[0.1] bg-white/[0.02]" : ""}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] ${isCurrent ? "text-text-primary font-medium" : "text-text-muted"}`}>{w.label}</span>
                      <span className="text-[10px] font-mono text-text-muted">{w.achieved}/{w.target}</span>
                    </div>
                    <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${wColor}`} style={{ width: `${Math.min(wPct, 100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Overall progress bar */}
            <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden mb-2 relative">
              <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${Math.min(teamPct, 100)}%` }} />
              {/* Hard target marker at 60% */}
              <div className="absolute top-0 h-full border-r-2 border-dashed border-white/20" style={{ left: "60%" }} />
            </div>
            <div className="flex items-center justify-between text-[10px] text-text-muted">
              <span>{teamPct}% of monthly target</span>
              <span className="flex items-center gap-1">
                <span className="w-1 h-3 border-r border-dashed border-white/20" /> Hard target (60%)
              </span>
            </div>

            {/* Status message */}
            {isCritical && !isHardMet && (
              <div className="flex items-center gap-2 mt-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertTriangle size={14} className="text-red-400 shrink-0" />
                <p className="text-[11px] text-red-400 font-medium">
                  CRITICAL: {hardTarget - teamTotal} more sales needed in {daysLeft} days to meet hard target. This affects everyone&apos;s performance.
                </p>
              </div>
            )}
            {isBehindHard && !isCritical && !isHardMet && (
              <div className="flex items-center gap-2 mt-3 p-2 rounded-lg bg-yellow-500/5 border border-yellow-500/15">
                <AlertTriangle size={14} className="text-yellow-400 shrink-0" />
                <p className="text-[11px] text-yellow-400">Behind pace — expected {expectedByNow} by week {currentWeek}, currently at {teamTotal}.</p>
              </div>
            )}
            {isOnPace && !isMonthlyMet && isHardMet && (
              <p className="text-[11px] text-[#7BC142] mt-2">✓ Hard target met! On pace for full target — keep going.</p>
            )}
            {isMonthlyMet && (
              <p className="text-[11px] text-green-400 mt-2">🎯 Monthly target achieved! Outstanding work.</p>
            )}

            {/* Individual breakdown removed — team target only */}
          </div>
        );
      })()}

      {/* Notification Banner */}
      <NotificationBanner
        items={[
          { label: "follow-ups due today", count: data.followUpsDueToday.length, type: "warning" },
          { label: "overdue follow-ups", count: data.overdueFollowUps.length, type: "danger" },
          { label: "documents pending review", count: data.pendingDocs, type: "warning" },
          { label: "ungraded projects", count: data.pendingProjects, type: "warning" },
        ]}
      />

      {/* 7-Day Follow-Up Forecast */}
      {data.followUpForecast && data.followUpForecast.some((d: any) => d.count > 0) && (
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Calendar size={16} className="text-neon-blue" />
            Follow-Up Forecast (Next 7 Days)
          </h2>
          <div className="grid grid-cols-7 gap-2">
            {data.followUpForecast.map((day: any, i: number) => (
              <div
                key={i}
                className={`text-center p-2.5 rounded-lg border transition-all ${
                  day.isToday ? "border-neon-blue/30 bg-neon-blue/10"
                    : day.count > 0 ? "border-white/[0.08] bg-white/[0.03]"
                    : "border-white/[0.04] bg-white/[0.01] opacity-50"
                }`}
              >
                <p className="text-[10px] text-text-muted">{day.label}</p>
                <p className={`text-lg font-bold font-mono ${day.isToday ? "text-neon-blue" : day.count > 0 ? "text-text-primary" : "text-text-muted"}`}>
                  {day.count}
                </p>
                {day.isToday && <p className="text-[9px] text-neon-blue font-medium">Today</p>}
              </div>
            ))}
          </div>
          <p className="text-[11px] text-text-muted mt-2">
            Total this week: {data.followUpForecast.reduce((sum: number, d: any) => sum + d.count, 0)} follow-ups across all counsellors
          </p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Link key={kpi.label} href={kpi.href} className="glass-card p-5 hover:border-neon-blue/20 transition-all cursor-pointer">
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
            </Link>
          );
        })}
      </div>

      {/* Pending Actions */}
      <div className="glass-card p-5">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Pending Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link href="/admin/students?status=ONBOARDING" className="flex flex-col items-center p-4 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] transition-colors border border-white/[0.04] hover:border-neon-blue/20">
            <ClipboardCheck size={24} className="text-yellow-400 mb-2" />
            <p className="text-2xl font-bold text-text-primary">{data.onboardingStudents}</p>
            <p className="text-xs text-text-muted text-center mt-1">Students Onboarding</p>
          </Link>
          <Link href="/admin/students" className="flex flex-col items-center p-4 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] transition-colors border border-white/[0.04] hover:border-neon-blue/20">
            <FileCheck size={24} className="text-cyan mb-2" />
            <p className="text-2xl font-bold text-text-primary">{data.pendingDocs}</p>
            <p className="text-xs text-text-muted text-center mt-1">Docs Pending Review</p>
          </Link>
          <Link href="/admin/assessments" className="flex flex-col items-center p-4 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] transition-colors border border-white/[0.04] hover:border-neon-blue/20">
            <Code size={24} className="text-neon-green mb-2" />
            <p className="text-2xl font-bold text-text-primary">{data.pendingProjects}</p>
            <p className="text-xs text-text-muted text-center mt-1">Ungraded Projects</p>
          </Link>
          <Link href="/admin/assessments" className="flex flex-col items-center p-4 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] transition-colors border border-white/[0.04] hover:border-neon-blue/20">
            <BookOpen size={24} className="text-purple mb-2" />
            <p className="text-2xl font-bold text-text-primary">{data.ungradedAssessments}</p>
            <p className="text-xs text-text-muted text-center mt-1">Assessment Attempts</p>
          </Link>
        </div>
      </div>

      {/* Follow-ups Due Today & Overdue - Combined 2-column grid */}
      {(data.followUpsDueToday.length > 0 || data.overdueFollowUps.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data.followUpsDueToday.length > 0 && (
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                  <Clock size={18} className="text-yellow-400" />
                  Follow-ups Due Today
                </h2>
                <Link href="/admin/leads?followUp=today" className="text-xs text-neon-blue hover:underline">View all</Link>
              </div>
              <div className="space-y-0">
                {data.followUpsDueToday.map((lead: any) => (
                  <LeadRow key={lead.id} lead={lead} />
                ))}
              </div>
            </div>
          )}

          {data.overdueFollowUps.length > 0 && (
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                  <AlertTriangle size={18} className="text-red-400" />
                  Overdue Follow-ups
                </h2>
                <Link href="/admin/leads?followUp=overdue" className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                  {data.overdueFollowUps.length} &rarr;
                </Link>
              </div>
              <div className="space-y-0">
                {data.overdueFollowUps.map((lead: any) => (
                  <LeadRow key={lead.id} lead={lead} overdue />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Activity */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">
            Recent Activity
          </h2>
          <Link href="/admin/audit" className="text-xs text-neon-blue hover:underline">
            View all &rarr;
          </Link>
        </div>
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
