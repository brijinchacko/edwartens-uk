import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  Clock,
  TrendingUp,
  Users,
  FileText,
} from "lucide-react";
import EmployeeDocuments from "../EmployeeDocuments";

export const metadata: Metadata = {
  title: "Employee Details | EDWartens Admin",
};

async function getEmployee(id: string) {
  return prisma.employee.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          avatar: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          assignedLeads: true,
          batches: true,
          workSessions: true,
        },
      },
      documents: {
        select: { id: true },
      },
    },
  });
}

async function getEmployeeStats(employeeId: string) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);
  weekStart.setHours(0, 0, 0, 0);

  const [
    monthSessions,
    weekSessions,
    recentSessions,
    salesTarget,
    kpiRecords,
  ] = await Promise.all([
    prisma.employeeWorkSession.findMany({
      where: { employeeId, date: { gte: monthStart } },
      select: { totalMinutes: true, checkInAt: true, checkOutAt: true, status: true, date: true },
      orderBy: { date: "desc" },
    }),
    prisma.employeeWorkSession.findMany({
      where: { employeeId, date: { gte: weekStart } },
      select: { totalMinutes: true, activeMinutes: true, idleMinutes: true, breakMinutes: true },
    }),
    prisma.employeeWorkSession.findMany({
      where: { employeeId },
      select: {
        date: true,
        checkInAt: true,
        checkOutAt: true,
        totalMinutes: true,
        activeMinutes: true,
        idleMinutes: true,
        breakMinutes: true,
        status: true,
        workLocation: true,
      },
      orderBy: { date: "desc" },
      take: 15,
    }),
    prisma.salesTarget.findFirst({
      where: {
        employeeId,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
    }).catch(() => null),
    prisma.employeeKPI.findMany({
      where: { employeeId, date: { gte: weekStart } },
      orderBy: { date: "desc" },
    }).catch(() => []),
  ]);

  // Calculate stats
  const completedMonth = monthSessions.filter((s) => s.totalMinutes && s.totalMinutes > 0);
  const totalMonthMinutes = completedMonth.reduce((acc, s) => acc + (s.totalMinutes || 0), 0);
  const avgDailyHours = completedMonth.length > 0
    ? Math.round((totalMonthMinutes / completedMonth.length / 60) * 10) / 10
    : 0;

  const lateDays = monthSessions.filter((s) => {
    const checkIn = new Date(s.checkInAt);
    return checkIn.getHours() > 9 || (checkIn.getHours() === 9 && checkIn.getMinutes() > 30);
  }).length;

  const totalWeekActive = weekSessions.reduce((acc, s) => acc + (s.activeMinutes || 0), 0);
  const totalWeekIdle = weekSessions.reduce((acc, s) => acc + (s.idleMinutes || 0), 0);
  const totalWeekBreak = weekSessions.reduce((acc, s) => acc + (s.breakMinutes || 0), 0);

  const avgKpiScore = kpiRecords.length > 0
    ? Math.round(kpiRecords.reduce((acc, k) => acc + k.productivityScore, 0) / kpiRecords.length)
    : 0;

  return {
    daysWorkedThisMonth: completedMonth.length,
    avgDailyHours,
    lateDaysThisMonth: lateDays,
    weeklyActiveMinutes: totalWeekActive,
    weeklyIdleMinutes: totalWeekIdle,
    weeklyBreakMinutes: totalWeekBreak,
    avgKpiScore,
    salesTarget,
    recentSessions,
  };
}

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role;
  if (!["SUPER_ADMIN", "ADMIN", "HR_MANAGER"].includes(role)) {
    redirect("/admin/dashboard");
  }

  const { id } = await params;
  const employee = await getEmployee(id);
  if (!employee) notFound();

  const stats = await getEmployeeStats(id);

  const ROLE_COLORS: Record<string, string> = {
    ADMIN: "bg-red-500/10 text-red-400 border-red-500/20",
    STAFF: "bg-neon-blue/10 text-neon-blue border-neon-blue/20",
    INSTRUCTOR: "bg-purple/10 text-purple border-purple/20",
    SUPER_ADMIN: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    SALES_LEAD: "bg-green-500/10 text-green-400 border-green-500/20",
    ADMISSION_COUNSELLOR: "bg-neon-blue/10 text-neon-blue border-neon-blue/20",
    TRAINER: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    HR_MANAGER: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  };

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/employees" className="p-2 rounded-lg hover:bg-white/[0.05] transition-colors">
          <ArrowLeft size={20} className="text-text-muted" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            {employee.user.avatar ? (
              <img src={employee.user.avatar} alt={employee.user.name} className="w-12 h-12 rounded-full" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-neon-blue/20 flex items-center justify-center text-lg font-medium text-neon-blue shrink-0">
                {employee.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-text-primary">{employee.user.name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${ROLE_COLORS[employee.user.role] || "bg-white/[0.05] text-text-muted"}`}>
                  {employee.user.role.replace(/_/g, " ")}
                </span>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${employee.user.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                  {employee.user.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Contact Info */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Contact Information</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail size={14} className="text-text-muted shrink-0" />
              <span className="text-text-secondary truncate">{employee.user.email}</span>
            </div>
            {employee.user.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone size={14} className="text-text-muted shrink-0" />
                <span className="text-text-secondary">{employee.user.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={14} className="text-text-muted shrink-0" />
              <span className="text-text-secondary">Joined {formatDate(employee.hireDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={14} className="text-text-muted shrink-0" />
              <span className="text-text-secondary">Registered {formatDate(employee.user.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Work Details */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Work Details</h2>
          <div className="space-y-3">
            {employee.department && (
              <div className="flex items-center gap-2 text-sm">
                <Briefcase size={14} className="text-text-muted shrink-0" />
                <span className="text-text-secondary">Department: {employee.department}</span>
              </div>
            )}
            {employee.designation && (
              <div className="flex items-center gap-2 text-sm">
                <Briefcase size={14} className="text-text-muted shrink-0" />
                <span className="text-text-secondary">Designation: {employee.designation}</span>
              </div>
            )}
            {employee.specialization && (
              <div className="flex items-center gap-2 text-sm">
                <Briefcase size={14} className="text-text-muted shrink-0" />
                <span className="text-text-secondary">Specialization: {employee.specialization}</span>
              </div>
            )}
            {employee.weekOff && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={14} className="text-text-muted shrink-0" />
                <span className="text-text-secondary">Week Off: {employee.weekOff}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Users size={14} className="text-text-muted shrink-0" />
              <span className="text-text-secondary">{employee._count.assignedLeads} leads · {employee._count.batches} batches</span>
            </div>
          </div>
        </div>

        {/* Monthly Summary */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-3">This Month</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Days Worked</span>
              <span className="text-text-primary font-medium">{stats.daysWorkedThisMonth}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Avg Daily Hours</span>
              <span className="text-text-primary font-medium">{stats.avgDailyHours}h</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Late Arrivals</span>
              <span className={`font-medium ${stats.lateDaysThisMonth > 0 ? "text-red-400" : "text-green-400"}`}>
                {stats.lateDaysThisMonth}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">KPI Score (Avg)</span>
              <span className={`font-medium ${stats.avgKpiScore >= 80 ? "text-green-400" : stats.avgKpiScore >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                {stats.avgKpiScore || "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Breakdown */}
      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          <Clock size={16} className="text-neon-blue" />
          Weekly Time Breakdown
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg bg-green-500/5 border border-green-500/10">
            <p className="text-2xl font-bold text-green-400">{Math.round(stats.weeklyActiveMinutes / 60 * 10) / 10}h</p>
            <p className="text-xs text-text-muted mt-1">Active Time</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
            <p className="text-2xl font-bold text-yellow-400">{Math.round(stats.weeklyIdleMinutes / 60 * 10) / 10}h</p>
            <p className="text-xs text-text-muted mt-1">Idle Time</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
            <p className="text-2xl font-bold text-blue-400">{Math.round(stats.weeklyBreakMinutes / 60 * 10) / 10}h</p>
            <p className="text-xs text-text-muted mt-1">Break Time</p>
          </div>
        </div>
      </div>

      {/* Sales Target (if exists) */}
      {stats.salesTarget && (
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-neon-green" />
            Sales Target (This Month)
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-text-muted">Sales Target</p>
              <p className="text-lg font-bold text-text-primary">
                {(stats.salesTarget as any).salesAchieved || 0} / {(stats.salesTarget as any).salesTarget}
              </p>
              <div className="mt-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full bg-neon-green"
                  style={{ width: `${Math.min(100, (((stats.salesTarget as any).salesAchieved || 0) / (stats.salesTarget as any).salesTarget) * 100)}%` }}
                />
              </div>
            </div>
            <div>
              <p className="text-xs text-text-muted">Lead Target</p>
              <p className="text-lg font-bold text-text-primary">
                {(stats.salesTarget as any).leadsGenerated || 0} / {(stats.salesTarget as any).leadTarget}
              </p>
              <div className="mt-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full bg-neon-blue"
                  style={{ width: `${Math.min(100, (((stats.salesTarget as any).leadsGenerated || 0) / (stats.salesTarget as any).leadTarget) * 100)}%` }}
                />
              </div>
            </div>
            <div>
              <p className="text-xs text-text-muted">Hard Target</p>
              <p className="text-lg font-bold text-text-primary">
                {(stats.salesTarget as any).hardAchieved || 0} / {(stats.salesTarget as any).hardTarget}
              </p>
              <div className="mt-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full bg-purple-500"
                  style={{ width: `${Math.min(100, (((stats.salesTarget as any).hardAchieved || 0) / (stats.salesTarget as any).hardTarget) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Attendance */}
      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          <Clock size={16} className="text-neon-blue" />
          Recent Attendance (Last 15 Sessions)
        </h2>
        {stats.recentSessions.length === 0 ? (
          <p className="text-sm text-text-muted">No attendance records found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-text-muted border-b border-white/[0.06]">
                  <th className="text-left py-2 px-3">Date</th>
                  <th className="text-left py-2 px-3">Check In</th>
                  <th className="text-left py-2 px-3">Check Out</th>
                  <th className="text-left py-2 px-3">Total</th>
                  <th className="text-left py-2 px-3">Active</th>
                  <th className="text-left py-2 px-3">Idle</th>
                  <th className="text-left py-2 px-3">Break</th>
                  <th className="text-left py-2 px-3">Location</th>
                  <th className="text-left py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentSessions.map((s, i) => {
                  const checkIn = new Date(s.checkInAt);
                  const isLate = checkIn.getHours() > 9 || (checkIn.getHours() === 9 && checkIn.getMinutes() > 30);
                  return (
                    <tr key={i} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                      <td className="py-2 px-3 text-text-secondary">
                        {new Date(s.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </td>
                      <td className={`py-2 px-3 ${isLate ? "text-red-400" : "text-text-secondary"}`}>
                        {checkIn.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })}
                        {isLate && " (Late)"}
                      </td>
                      <td className="py-2 px-3 text-text-secondary">
                        {s.checkOutAt
                          ? new Date(s.checkOutAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
                          : "—"}
                      </td>
                      <td className="py-2 px-3 text-text-secondary">{s.totalMinutes ? `${Math.round(s.totalMinutes / 60 * 10) / 10}h` : "—"}</td>
                      <td className="py-2 px-3 text-green-400">{s.activeMinutes ? `${Math.round(s.activeMinutes / 60 * 10) / 10}h` : "—"}</td>
                      <td className="py-2 px-3 text-yellow-400">{s.idleMinutes ? `${Math.round(s.idleMinutes / 60 * 10) / 10}h` : "—"}</td>
                      <td className="py-2 px-3 text-blue-400">{s.breakMinutes ? `${Math.round(s.breakMinutes / 60 * 10) / 10}h` : "—"}</td>
                      <td className="py-2 px-3 text-text-muted">{s.workLocation}</td>
                      <td className="py-2 px-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          s.status === "CHECKED_OUT" ? "bg-white/10 text-white/50" :
                          s.status === "CHECKED_IN" || s.status === "ACTIVE" ? "bg-green-500/20 text-green-400" :
                          s.status === "IDLE" ? "bg-yellow-500/20 text-yellow-400" :
                          "bg-blue-500/20 text-blue-400"
                        }`}>{s.status.replace(/_/g, " ")}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Documents Section */}
      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          <FileText size={16} className="text-neon-blue" />
          Documents ({employee.documents.length})
        </h2>
        <EmployeeDocuments employeeId={employee.id} employeeName={employee.user.name} />
      </div>
    </div>
  );
}
