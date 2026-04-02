"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  Users,
  Target,
  GraduationCap,
  Layers,
  DollarSign,
  TrendingUp,
  Download,
  Calendar,
  ClipboardCheck,
  Award,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Briefcase,
  Clock,
  MapPin,
} from "lucide-react";

// ─── Types ───
type TabType = "leads" | "students" | "sales" | "batches" | "attendance" | "employee";
type DateRange = "this_month" | "last_3_months" | "this_year" | "all";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
  subtext?: string;
}

// ─── Stat Card ───
function StatCard({ label, value, icon, color = "neon-blue", subtext }: StatCardProps) {
  const colorMap: Record<string, string> = {
    "neon-blue": "from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400",
    "neon-green": "from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400",
    "neon-purple": "from-purple-500/20 to-purple-600/5 border-purple-500/20 text-purple-400",
    "neon-orange": "from-orange-500/20 to-orange-600/5 border-orange-500/20 text-orange-400",
    "neon-red": "from-red-500/20 to-red-600/5 border-red-500/20 text-red-400",
    "neon-cyan": "from-cyan-500/20 to-cyan-600/5 border-cyan-500/20 text-cyan-400",
    "neon-yellow": "from-yellow-500/20 to-yellow-600/5 border-yellow-500/20 text-yellow-400",
    "neon-pink": "from-pink-500/20 to-pink-600/5 border-pink-500/20 text-pink-400",
  };
  const cls = colorMap[color] || colorMap["neon-blue"];
  return (
    <div className={`rounded-xl border bg-gradient-to-br p-5 ${cls}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-text-muted uppercase tracking-wider">{label}</span>
        {icon && <span className="opacity-60">{icon}</span>}
      </div>
      <p className="text-3xl font-bold text-text-primary">{value}</p>
      {subtext && <p className="text-xs text-text-muted mt-1">{subtext}</p>}
    </div>
  );
}

// ─── CSS Bar Chart ───
function BarChart({
  data,
  labelKey,
  valueKey,
  color = "#3b82f6",
  formatValue,
}: {
  data: Record<string, unknown>[];
  labelKey: string;
  valueKey: string;
  color?: string;
  formatValue?: (v: number) => string;
}) {
  if (!data || data.length === 0) {
    return <p className="text-text-muted text-sm py-4">No data available</p>;
  }
  const max = Math.max(...data.map((d) => Number(d[valueKey]) || 0), 1);
  return (
    <div className="space-y-2.5">
      {data.map((item, i) => {
        const val = Number(item[valueKey]) || 0;
        const pct = (val / max) * 100;
        const display = formatValue ? formatValue(val) : val.toLocaleString();
        return (
          <div key={i} className="group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-text-secondary truncate max-w-[60%]">
                {String(item[labelKey])}
              </span>
              <span className="text-sm font-semibold text-text-primary">{display}</span>
            </div>
            <div className="w-full h-6 bg-white/[0.04] rounded-md overflow-hidden">
              <div
                className="h-full rounded-md transition-all duration-500 ease-out"
                style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Status Color Map ───
const STATUS_COLORS: Record<string, string> = {
  NEW: "#64748b",
  CONTACTED: "#3b82f6",
  FIRST_CALL: "#06b6d4",
  CONSULTATION_ARRANGED: "#a855f7",
  CONSULTATION_COMPLETED: "#6366f1",
  QUALIFIED: "#f59e0b",
  REGISTERED: "#84cc16",
  ENROLLED: "#10b981",
  LOST: "#ef4444",
  ONBOARDING: "#f59e0b",
  ACTIVE: "#10b981",
  ON_HOLD: "#f97316",
  POST_TRAINING: "#8b5cf6",
  CAREER_SUPPORT: "#06b6d4",
  COMPLETED: "#22c55e",
  ALUMNI_PLACED: "#3b82f6",
  ALUMNI_NOT_PLACED: "#6366f1",
  DROPPED: "#ef4444",
  UPCOMING: "#3b82f6",
  CANCELLED: "#ef4444",
  PAID: "#10b981",
  PARTIAL: "#f59e0b",
  PENDING: "#f97316",
  REFUNDED: "#ef4444",
  completed: "#10b981",
  pending: "#f59e0b",
  failed: "#ef4444",
};

// ─── Data Table ───
function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | number)[][];
}) {
  if (rows.length === 0) {
    return <p className="text-text-muted text-sm py-4">No data available</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.06]">
            {headers.map((h, i) => (
              <th key={i} className="text-left py-2.5 px-3 text-xs font-medium text-text-muted uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="py-2.5 px-3 text-text-secondary">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Section Wrapper ───
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-dark-secondary/50 p-6">
      <h3 className="text-base font-semibold text-text-primary mb-4">{title}</h3>
      {children}
    </div>
  );
}

// ─── CSV Export ───
function exportCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ─── Format currency (pence to GBP) ───
function formatGBP(pence: number) {
  return `\u00A3${(pence / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ─── Status Badge ───
function StatusBadge({ status, count }: { status: string; count: number }) {
  const bg = STATUS_COLORS[status] || "#6b7280";
  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: bg }} />
      <span className="text-sm text-text-secondary flex-1">{status.replace(/_/g, " ")}</span>
      <span className="text-sm font-semibold text-text-primary">{count}</span>
    </div>
  );
}

// ═══════════════════════════════════════
// TAB: Lead Reports
// ═══════════════════════════════════════
function LeadReports({ data }: { data: Record<string, unknown> | null }) {
  if (!data) return null;
  const d = data as {
    totalLeads: number;
    leadsByStatus: { status: string; count: number }[];
    leadsBySource: { source: string; count: number }[];
    leadsByMonth: { month: string; count: number }[];
    leadsByCounsellor: { name: string; count: number }[];
    conversionRate: number;
    enrolledCount: number;
  };

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Leads" value={d.totalLeads} icon={<Target size={20} />} color="neon-blue" />
        <StatCard label="Enrolled" value={d.enrolledCount} icon={<CheckCircle size={20} />} color="neon-green" />
        <StatCard label="Conversion Rate" value={`${d.conversionRate}%`} icon={<TrendingUp size={20} />} color="neon-purple" />
        <StatCard label="Sources" value={d.leadsBySource.length} icon={<BarChart3 size={20} />} color="neon-cyan" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <Section title="Leads by Status">
          {d.leadsByStatus.map((s) => (
            <StatusBadge key={s.status} status={s.status} count={s.count} />
          ))}
        </Section>

        {/* Source Breakdown */}
        <Section title="Leads by Source">
          <BarChart data={d.leadsBySource} labelKey="source" valueKey="count" color="#8b5cf6" />
        </Section>

        {/* Monthly Trend */}
        <Section title="Leads by Month (Last 12 Months)">
          <BarChart data={d.leadsByMonth} labelKey="month" valueKey="count" color="#3b82f6" />
        </Section>

        {/* Counsellor Breakdown */}
        <Section title="Leads by Counsellor">
          <BarChart data={d.leadsByCounsellor} labelKey="name" valueKey="count" color="#10b981" />
        </Section>
      </div>

      {/* Export */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            const headers = ["Status", "Count"];
            const rows = d.leadsByStatus.map((s) => [s.status, s.count] as (string | number)[]);
            exportCSV("lead-report", headers, rows);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20 border border-neon-blue/20 transition-colors text-sm font-medium"
        >
          <Download size={16} />
          Export Lead Report CSV
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// TAB: Student Reports
// ═══════════════════════════════════════
function StudentReports({ data }: { data: Record<string, unknown> | null }) {
  if (!data) return null;
  const d = data as {
    totalStudents: number;
    studentsByStatus: { status: string; count: number }[];
    studentsByCourse: { course: string; count: number }[];
    studentsByBatch: { name: string; count: number }[];
    completionRate: number;
    completedStudents: number;
    paymentBreakdown: { status: string; count: number }[];
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={d.totalStudents} icon={<GraduationCap size={20} />} color="neon-blue" />
        <StatCard label="Completed" value={d.completedStudents} icon={<Award size={20} />} color="neon-green" />
        <StatCard label="Completion Rate" value={`${d.completionRate}%`} icon={<TrendingUp size={20} />} color="neon-purple" />
        <StatCard label="Course Types" value={d.studentsByCourse.length} icon={<Layers size={20} />} color="neon-cyan" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Section title="Students by Status">
          {d.studentsByStatus.map((s) => (
            <StatusBadge key={s.status} status={s.status} count={s.count} />
          ))}
        </Section>

        <Section title="Payment Status">
          {d.paymentBreakdown.map((p) => (
            <StatusBadge key={p.status} status={p.status} count={p.count} />
          ))}
        </Section>

        <Section title="Students by Course">
          <BarChart data={d.studentsByCourse} labelKey="course" valueKey="count" color="#8b5cf6" />
        </Section>

        <Section title="Students by Batch">
          <BarChart data={d.studentsByBatch.slice(0, 10)} labelKey="name" valueKey="count" color="#f59e0b" />
        </Section>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => {
            const headers = ["Status", "Count"];
            const rows = d.studentsByStatus.map((s) => [s.status, s.count] as (string | number)[]);
            exportCSV("student-report", headers, rows);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20 border border-neon-blue/20 transition-colors text-sm font-medium"
        >
          <Download size={16} />
          Export Student Report CSV
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// TAB: Sales Reports
// ═══════════════════════════════════════
function SalesReports({ data }: { data: Record<string, unknown> | null }) {
  if (!data) return null;
  const d = data as {
    totalRevenue: number;
    totalPayments: number;
    avgDealSize: number;
    paymentsByStatus: { status: string; count: number }[];
    revenueByMonth: { month: string; revenue: number }[];
    topSalesPeople: { name: string; count: number }[];
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={formatGBP(d.totalRevenue)}
          icon={<DollarSign size={20} />}
          color="neon-green"
          subtext="From completed payments"
        />
        <StatCard label="Total Payments" value={d.totalPayments} icon={<ClipboardCheck size={20} />} color="neon-blue" />
        <StatCard
          label="Avg Deal Size"
          value={formatGBP(d.avgDealSize)}
          icon={<TrendingUp size={20} />}
          color="neon-purple"
        />
        <StatCard label="Top Performers" value={d.topSalesPeople.length} icon={<Users size={20} />} color="neon-orange" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Section title="Payment Status Breakdown">
          {d.paymentsByStatus.map((p) => (
            <StatusBadge key={p.status} status={p.status} count={p.count} />
          ))}
        </Section>

        <Section title="Top Performing Counsellors">
          <BarChart data={d.topSalesPeople} labelKey="name" valueKey="count" color="#10b981" />
        </Section>

        <Section title="Revenue by Month (Last 12 Months)">
          <BarChart
            data={d.revenueByMonth}
            labelKey="month"
            valueKey="revenue"
            color="#f59e0b"
            formatValue={formatGBP}
          />
        </Section>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => {
            const headers = ["Month", "Revenue (GBP)"];
            const rows = d.revenueByMonth.map((m) => [m.month, formatGBP(m.revenue)] as (string | number)[]);
            exportCSV("sales-report", headers, rows);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20 border border-neon-blue/20 transition-colors text-sm font-medium"
        >
          <Download size={16} />
          Export Sales Report CSV
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// TAB: Batch Reports
// ═══════════════════════════════════════
function BatchReports({ data }: { data: Record<string, unknown> | null }) {
  if (!data) return null;
  const d = data as {
    totalBatches: number;
    batchesByStatus: { status: string; count: number }[];
    batchesByCourse: { course: string; count: number }[];
    upcomingBatches: number;
    avgBatchSize: number;
    batchCompletionRate: number;
    completedBatches: number;
    trainerWorkload: { name: string; count: number }[];
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Batches" value={d.totalBatches} icon={<Layers size={20} />} color="neon-blue" />
        <StatCard label="Upcoming" value={d.upcomingBatches} icon={<Calendar size={20} />} color="neon-orange" />
        <StatCard label="Avg Batch Size" value={d.avgBatchSize} icon={<Users size={20} />} color="neon-purple" subtext="students per batch" />
        <StatCard label="Completion Rate" value={`${d.batchCompletionRate}%`} icon={<TrendingUp size={20} />} color="neon-green" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Section title="Batches by Status">
          {d.batchesByStatus.map((s) => (
            <StatusBadge key={s.status} status={s.status} count={s.count} />
          ))}
        </Section>

        <Section title="Batches by Course">
          <BarChart data={d.batchesByCourse} labelKey="course" valueKey="count" color="#8b5cf6" />
        </Section>

        <Section title="Trainer Workload (Batches per Trainer)">
          <BarChart data={d.trainerWorkload} labelKey="name" valueKey="count" color="#06b6d4" />
        </Section>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => {
            const headers = ["Status", "Count"];
            const rows = d.batchesByStatus.map((s) => [s.status, s.count] as (string | number)[]);
            exportCSV("batch-report", headers, rows);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20 border border-neon-blue/20 transition-colors text-sm font-medium"
        >
          <Download size={16} />
          Export Batch Report CSV
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// TAB: Attendance Reports
// ═══════════════════════════════════════
function AttendanceReports({ data }: { data: Record<string, unknown> | null }) {
  if (!data) return null;
  const d = data as {
    overallRate: number;
    totalRecords: number;
    presentRecords: number;
    attendanceByBatch: { batchName: string; total: number; present: number; rate: number }[];
    lowAttendanceStudents: { studentName: string; total: number; present: number; rate: number }[];
    perfectAttendanceStudents: { studentName: string; total: number; present: number; rate: number }[];
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Overall Attendance" value={`${d.overallRate}%`} icon={<ClipboardCheck size={20} />} color="neon-green" />
        <StatCard label="Total Records" value={d.totalRecords} icon={<BarChart3 size={20} />} color="neon-blue" />
        <StatCard label="Low Attendance" value={d.lowAttendanceStudents.length} icon={<AlertTriangle size={20} />} color="neon-red" subtext="< 80% attendance" />
        <StatCard label="Perfect Attendance" value={d.perfectAttendanceStudents.length} icon={<Award size={20} />} color="neon-yellow" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Section title="Attendance by Batch">
          <BarChart
            data={d.attendanceByBatch.map((b) => ({ ...b, label: b.batchName }))}
            labelKey="batchName"
            valueKey="rate"
            color="#10b981"
            formatValue={(v) => `${v}%`}
          />
        </Section>

        <Section title="Students with Low Attendance (&lt; 80%)">
          {d.lowAttendanceStudents.length > 0 ? (
            <DataTable
              headers={["Student", "Present", "Total", "Rate"]}
              rows={d.lowAttendanceStudents.map((s) => [
                s.studentName,
                s.present,
                s.total,
                `${s.rate}%`,
              ])}
            />
          ) : (
            <p className="text-text-muted text-sm py-4">No students with low attendance</p>
          )}
        </Section>

        <Section title="Perfect Attendance Students">
          {d.perfectAttendanceStudents.length > 0 ? (
            <DataTable
              headers={["Student", "Sessions Attended"]}
              rows={d.perfectAttendanceStudents.map((s) => [
                s.studentName,
                s.total,
              ])}
            />
          ) : (
            <p className="text-text-muted text-sm py-4">No perfect attendance records yet</p>
          )}
        </Section>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => {
            const headers = ["Batch", "Present", "Total", "Rate (%)"];
            const rows = d.attendanceByBatch.map((b) => [
              b.batchName,
              b.present,
              b.total,
              `${b.rate}%`,
            ] as (string | number)[]);
            exportCSV("attendance-report", headers, rows);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20 border border-neon-blue/20 transition-colors text-sm font-medium"
        >
          <Download size={16} />
          Export Attendance Report CSV
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// TAB: Employee Reports
// ═══════════════════════════════════════
function EmployeeReports({ data }: { data: Record<string, unknown> | null }) {
  if (!data) return null;
  const d = data as {
    totalEmployees: number;
    avgDailyHours: number;
    checkInsThisMonth: number;
    mostActiveEmployees: { name: string; totalHours: number; sessions: number }[];
    employeeAttendance: {
      name: string;
      daysWorked: number;
      avgHoursPerDay: number;
      totalBreaks: number;
      avgBreakMinutes: number;
      idleMinutes: number;
      onTimeRate: number;
    }[];
    workLocationBreakdown: { location: string; count: number }[];
    dailyActivity: {
      date: string;
      employeesActive: number;
      avgStartTime: string;
      avgEndTime: string;
      totalHours: number;
    }[];
  };

  const locationColors: Record<string, string> = {
    HOME: "#8b5cf6",
    OFFICE: "#10b981",
    REMOTE: "#f59e0b",
  };

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Employees"
          value={d.totalEmployees}
          icon={<Briefcase size={20} />}
          color="neon-blue"
        />
        <StatCard
          label="Avg Daily Hours"
          value={`${d.avgDailyHours}h`}
          icon={<Clock size={20} />}
          color="neon-green"
          subtext="Per work session"
        />
        <StatCard
          label="Check-ins This Month"
          value={d.checkInsThisMonth}
          icon={<CheckCircle size={20} />}
          color="neon-purple"
        />
        <StatCard
          label="Most Active"
          value={d.mostActiveEmployees[0]?.name || "N/A"}
          icon={<Award size={20} />}
          color="neon-orange"
          subtext={d.mostActiveEmployees[0] ? `${d.mostActiveEmployees[0].totalHours}h total` : undefined}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Most Active Employees */}
        <Section title="Most Active Employees (by Total Hours)">
          <BarChart
            data={d.mostActiveEmployees}
            labelKey="name"
            valueKey="totalHours"
            color="#10b981"
            formatValue={(v) => `${v}h`}
          />
        </Section>

        {/* Work Location Breakdown */}
        <Section title="Work Location Breakdown">
          {d.workLocationBreakdown.length > 0 ? (
            <div className="space-y-3">
              {d.workLocationBreakdown.map((loc) => {
                const total = d.workLocationBreakdown.reduce((s, l) => s + l.count, 0);
                const pct = total > 0 ? ((loc.count / total) * 100).toFixed(1) : "0";
                const barColor = locationColors[loc.location] || "#6b7280";
                return (
                  <div key={loc.location} className="group">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} style={{ color: barColor }} />
                        <span className="text-sm text-text-secondary">{loc.location}</span>
                      </div>
                      <span className="text-sm font-semibold text-text-primary">
                        {loc.count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-6 bg-white/[0.04] rounded-md overflow-hidden">
                      <div
                        className="h-full rounded-md transition-all duration-500 ease-out"
                        style={{
                          width: `${Math.max(parseFloat(pct), 2)}%`,
                          backgroundColor: barColor,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-text-muted text-sm py-4">No location data available</p>
          )}
        </Section>
      </div>

      {/* Employee Attendance Table */}
      <Section title="Employee Attendance Summary">
        {d.employeeAttendance.length > 0 ? (
          <DataTable
            headers={["Employee", "Days Worked", "Avg Hrs/Day", "Total Breaks", "Avg Break (min)", "Idle (min)", "On-Time Rate"]}
            rows={d.employeeAttendance.map((e) => [
              e.name,
              e.daysWorked,
              `${e.avgHoursPerDay}h`,
              e.totalBreaks,
              `${e.avgBreakMinutes}m`,
              `${e.idleMinutes}m`,
              `${e.onTimeRate}%`,
            ])}
          />
        ) : (
          <p className="text-text-muted text-sm py-4">No employee attendance data</p>
        )}
      </Section>

      {/* Daily Activity Summary */}
      <Section title="Daily Activity Summary (Last 30 Days)">
        {d.dailyActivity.length > 0 ? (
          <DataTable
            headers={["Date", "Employees Active", "Avg Start Time", "Avg End Time", "Total Hours"]}
            rows={d.dailyActivity.map((day) => [
              day.date,
              day.employeesActive,
              day.avgStartTime,
              day.avgEndTime,
              `${day.totalHours}h`,
            ])}
          />
        ) : (
          <p className="text-text-muted text-sm py-4">No daily activity data</p>
        )}
      </Section>

      {/* Export Buttons */}
      <div className="flex flex-wrap justify-end gap-3">
        <button
          onClick={() => {
            const headers = ["Employee", "Days Worked", "Avg Hrs/Day", "Total Breaks", "Avg Break (min)", "Idle (min)", "On-Time Rate"];
            const rows = d.employeeAttendance.map((e) => [
              e.name,
              e.daysWorked,
              e.avgHoursPerDay,
              e.totalBreaks,
              e.avgBreakMinutes,
              e.idleMinutes,
              `${e.onTimeRate}%`,
            ] as (string | number)[]);
            exportCSV("employee-attendance-report", headers, rows);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20 border border-neon-blue/20 transition-colors text-sm font-medium"
        >
          <Download size={16} />
          Export Attendance CSV
        </button>
        <button
          onClick={() => {
            const headers = ["Date", "Employees Active", "Avg Start Time", "Avg End Time", "Total Hours"];
            const rows = d.dailyActivity.map((day) => [
              day.date,
              day.employeesActive,
              day.avgStartTime,
              day.avgEndTime,
              day.totalHours,
            ] as (string | number)[]);
            exportCSV("employee-daily-activity", headers, rows);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20 border border-neon-blue/20 transition-colors text-sm font-medium"
        >
          <Download size={16} />
          Export Daily Activity CSV
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// MAIN: Reports Client
// ═══════════════════════════════════════
const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: "leads", label: "Lead Reports", icon: <Target size={16} /> },
  { id: "students", label: "Student Reports", icon: <GraduationCap size={16} /> },
  { id: "sales", label: "Sales Reports", icon: <DollarSign size={16} /> },
  { id: "batches", label: "Batch Reports", icon: <Layers size={16} /> },
  { id: "attendance", label: "Attendance Reports", icon: <ClipboardCheck size={16} /> },
  { id: "employee", label: "Employee Reports", icon: <Briefcase size={16} /> },
];

const DATE_RANGES: { value: DateRange; label: string }[] = [
  { value: "this_month", label: "This Month" },
  { value: "last_3_months", label: "Last 3 Months" },
  { value: "this_year", label: "This Year" },
  { value: "all", label: "All Time" },
];

export function ReportsClient({ userRole = "ADMIN" }: { userRole?: string }) {
  const canSeeRevenue = userRole === "SUPER_ADMIN";
  const visibleTabs = canSeeRevenue ? TABS : TABS.filter((t) => t.id !== "sales");
  const [activeTab, setActiveTab] = useState<TabType>("leads");
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reports?type=${activeTab}&range=${dateRange}`);
      if (!res.ok) throw new Error("Failed to fetch report data");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [activeTab, dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Reports</h1>
          <p className="text-sm text-text-muted mt-1">Comprehensive CRM analytics and reporting</p>
        </div>

        {/* Date Range Filter */}
        {activeTab !== "attendance" && (
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-text-muted" />
            <div className="flex rounded-lg border border-white/[0.06] overflow-hidden">
              {DATE_RANGES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setDateRange(r.value)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    dateRange === r.value
                      ? "bg-neon-blue/20 text-neon-blue"
                      : "text-text-muted hover:text-text-secondary hover:bg-white/[0.03]"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-white/[0.06] bg-dark-secondary/50 p-1 overflow-x-auto">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-neon-blue/15 text-neon-blue border border-neon-blue/20"
                : "text-text-muted hover:text-text-secondary hover:bg-white/[0.03] border border-transparent"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-neon-blue" size={32} />
          <span className="ml-3 text-text-muted">Loading report data...</span>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <AlertTriangle className="mx-auto mb-2 text-red-400" size={28} />
          <p className="text-red-400 font-medium">{error}</p>
          <button
            onClick={fetchData}
            className="mt-3 text-sm text-text-muted hover:text-text-secondary underline"
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          {activeTab === "leads" && <LeadReports data={data} />}
          {activeTab === "students" && <StudentReports data={data} />}
          {activeTab === "sales" && <SalesReports data={data} />}
          {activeTab === "batches" && <BatchReports data={data} />}
          {activeTab === "attendance" && <AttendanceReports data={data} />}
          {activeTab === "employee" && <EmployeeReports data={data} />}
        </>
      )}
    </div>
  );
}
