"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Activity,
  Clock,
  TrendingUp,
  Timer,
  AlertTriangle,
  Loader2,
  ChevronDown,
  Edit3,
  Save,
  X,
  Target,
} from "lucide-react";
import Leaderboard from "@/components/Leaderboard";
import ActivityHeatmap from "@/components/ActivityHeatmap";

/* ────────────────────────────────── Types */
interface KPIDashboardClientProps {
  userId: string;
  userRole: string;
  userName: string;
}

type PeriodKey = "today" | "week" | "month";

interface KPIStats {
  avgProductivity: number;
  activeHoursToday: number;
  leadsConverted: number;
  avgResponseTime: number;
}

interface TrendPoint {
  date: string;
  calls: number;
  emails: number;
  notes: number;
  score: number;
}

interface AlertItem {
  id: string;
  type: "late_arrival" | "excess_break" | "low_activity" | string;
  employeeName: string;
  message: string;
  timestamp: string;
}

interface Employee {
  id: string;
  name: string;
}

/* ────────────────────────────────── Helpers */
const PERIODS: { key: PeriodKey; label: string; days: number }[] = [
  { key: "today", label: "Today", days: 1 },
  { key: "week", label: "This Week", days: 7 },
  { key: "month", label: "This Month", days: 30 },
];

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-yellow-400";
  return "text-red-400";
}

function scoreBg(score: number) {
  if (score >= 80) return "from-emerald-500/20 to-emerald-600/5 border-emerald-500/20";
  if (score >= 60) return "from-yellow-500/20 to-yellow-600/5 border-yellow-500/20";
  return "from-red-500/20 to-red-600/5 border-red-500/20";
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function alertTypeIcon(type: string) {
  switch (type) {
    case "late_arrival":
      return <Clock size={14} className="text-yellow-400 shrink-0" />;
    case "excess_break":
      return <Timer size={14} className="text-orange-400 shrink-0" />;
    case "low_activity":
      return <AlertTriangle size={14} className="text-red-400 shrink-0" />;
    default:
      return <AlertTriangle size={14} className="text-text-muted shrink-0" />;
  }
}

/* ────────────────────────────────── Skeleton */
function StatSkeleton() {
  return (
    <div className="stat-card animate-pulse">
      <div className="h-3 w-24 bg-white/[0.06] rounded mb-3" />
      <div className="h-8 w-16 bg-white/[0.08] rounded" />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="glass-card p-5 animate-pulse">
      <div className="h-4 w-32 bg-white/[0.06] rounded mb-4" />
      <div className="h-48 bg-white/[0.04] rounded-lg" />
    </div>
  );
}

/* ────────────────────────────────── Recharts tooltip */
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-[#0c1018] border border-white/[0.1] px-3 py-2 shadow-xl">
      <p className="text-[11px] text-text-muted mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-xs text-text-primary" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

/* ────────────────────────────────── Main Component */
export default function KPIDashboardClient({
  userId,
  userRole,
  userName,
}: KPIDashboardClientProps) {
  const isAdmin = ["SUPER_ADMIN", "ADMIN", "HR_MANAGER"].includes(userRole);

  const [period, setPeriod] = useState<PeriodKey>("today");
  const [selectedEmployee, setSelectedEmployee] = useState<string>(
    isAdmin ? "" : userId
  );
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<KPIStats | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTrend, setLoadingTrend] = useState(true);
  const [loadingAlerts, setLoadingAlerts] = useState(true);

  // Sales targets state
  const [targets, setTargets] = useState<any[]>([]);
  const [loadingTargets, setLoadingTargets] = useState(false);
  const [editingTarget, setEditingTarget] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ salesTarget: 0, leadTarget: 0, hardTarget: 0 });
  const [savingTarget, setSavingTarget] = useState(false);

  /* Fetch employee list for admins */
  useEffect(() => {
    if (!isAdmin) return;
    fetch("/api/admin/employees?limit=200")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json) {
          const list = (json.data ?? json ?? []).map(
            (e: { id: string; name: string }) => ({ id: e.id, name: e.name })
          );
          setEmployees(list);
        }
      })
      .catch(() => {});
  }, [isAdmin]);

  /* Build query params */
  const buildParams = useCallback(() => {
    const endDate = new Date();
    const startDate = new Date();
    const days = PERIODS.find((p) => p.key === period)?.days ?? 1;
    startDate.setDate(startDate.getDate() - (days - 1));

    const params = new URLSearchParams({
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      groupBy: "day",
    });
    const empId = selectedEmployee || (isAdmin ? "" : userId);
    if (empId) params.set("employeeId", empId);
    return params;
  }, [period, selectedEmployee, isAdmin, userId]);

  /* Fetch KPI stats + trend */
  const fetchKPI = useCallback(async () => {
    setLoadingStats(true);
    setLoadingTrend(true);
    try {
      const params = buildParams();
      const res = await fetch(`/api/admin/kpi?${params}`);
      if (res.ok) {
        const json = await res.json();
        const items = json.data ?? json ?? [];

        // Compute aggregated stats from daily data
        if (Array.isArray(items) && items.length > 0) {
          const scores = items
            .map((d: Record<string, unknown>) => Number(d.productivityScore ?? d.score ?? 0))
            .filter((s: number) => s > 0);
          const avgScore =
            scores.length > 0
              ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
              : 0;

          const totalHours = items.reduce(
            (acc: number, d: Record<string, unknown>) =>
              acc + Number(d.activeMinutes ?? d.activeHours ?? 0) / (d.activeMinutes ? 60 : 1),
            0
          );
          const totalLeads = items.reduce(
            (acc: number, d: Record<string, unknown>) =>
              acc + Number(d.leadsConverted ?? d.leads_converted ?? 0),
            0
          );
          const responseTimes = items
            .map((d: Record<string, unknown>) => Number(d.responseTimeAvg ?? d.avgResponseTime ?? 0))
            .filter((t: number) => t > 0);
          const avgResponse =
            responseTimes.length > 0
              ? Math.round(
                  responseTimes.reduce((a: number, b: number) => a + b, 0) /
                    responseTimes.length
                )
              : 0;

          setStats({
            avgProductivity: avgScore,
            activeHoursToday: Math.round(totalHours * 10) / 10,
            leadsConverted: totalLeads,
            avgResponseTime: avgResponse,
          });

          // Trend data
          setTrend(
            items.map((d: Record<string, unknown>) => ({
              date: typeof d.date === "string" ? d.date.slice(0, 10).slice(5) : "",
              calls: Number(d.callsMade ?? d.calls ?? 0),
              emails: Number(d.emailsSent ?? d.emails ?? 0),
              notes: Number(d.notesAdded ?? d.notes ?? 0),
              score: Number(d.productivityScore ?? d.score ?? 0),
            }))
          );
        } else {
          setStats({ avgProductivity: 0, activeHoursToday: 0, leadsConverted: 0, avgResponseTime: 0 });
          setTrend([]);
        }
      }
    } catch {
      // silent
    } finally {
      setLoadingStats(false);
      setLoadingTrend(false);
    }
  }, [buildParams]);

  /* Fetch alerts */
  const fetchAlerts = useCallback(async () => {
    setLoadingAlerts(true);
    try {
      const res = await fetch("/api/admin/kpi/alerts");
      if (res.ok) {
        const json = await res.json();
        setAlerts(Array.isArray(json.alerts) ? json.alerts : Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : []);
      }
    } catch {
      // silent
    } finally {
      setLoadingAlerts(false);
    }
  }, []);

  useEffect(() => {
    fetchKPI();
  }, [fetchKPI]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  /* Fetch sales targets (admins only) */
  const fetchTargets = useCallback(async () => {
    if (!isAdmin) return;
    setLoadingTargets(true);
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const params = new URLSearchParams({ month: String(month), year: String(year) });
      if (selectedEmployee) params.set("employeeId", selectedEmployee);
      const res = await fetch(`/api/admin/sales-targets?${params}`);
      if (res.ok) {
        const json = await res.json();
        setTargets(json.targets ?? []);
      }
    } catch {
      // silent
    } finally {
      setLoadingTargets(false);
    }
  }, [isAdmin, selectedEmployee]);

  useEffect(() => {
    fetchTargets();
  }, [fetchTargets]);

  const handleEditTarget = (t: any) => {
    setEditingTarget(t.employeeId);
    setEditForm({
      salesTarget: t.salesTarget,
      leadTarget: t.leadTarget,
      hardTarget: t.hardTarget,
    });
  };

  const handleSaveTarget = async (employeeId: string) => {
    setSavingTarget(true);
    try {
      const now = new Date();
      const res = await fetch("/api/admin/sales-targets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          ...editForm,
        }),
      });
      if (res.ok) {
        setEditingTarget(null);
        fetchTargets();
      }
    } catch {
      // silent
    } finally {
      setSavingTarget(false);
    }
  };

  /* ────────────── Render */
  return (
    <div className="space-y-6 p-6 animate-fadeIn">
      {/* ─── Header Row ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-text-primary">KPI Dashboard</h1>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Period selector */}
          <div className="flex gap-1 bg-white/[0.03] rounded-lg p-1 border border-white/[0.06]">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  period === p.key
                    ? "bg-neon-blue/20 text-neon-blue"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Employee filter (admins only) */}
          {isAdmin && (
            <div className="relative">
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="appearance-none bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-1.5 pr-8 text-xs text-text-primary focus:outline-none focus:border-neon-blue/40"
              >
                <option value="">All Employees</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* ─── Stats Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loadingStats ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            {/* Avg Productivity */}
            <div className={`stat-card animate-slideUp border bg-gradient-to-br ${scoreBg(stats?.avgProductivity ?? 0)}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                  Avg Productivity
                </span>
                <Activity size={16} className="opacity-60 text-text-muted" />
              </div>
              <p className={`text-3xl font-bold ${scoreColor(stats?.avgProductivity ?? 0)}`}>
                {stats?.avgProductivity ?? 0}
              </p>
              <p className="text-[11px] text-text-muted mt-1">out of 100</p>
            </div>

            {/* Active Hours */}
            <div className="stat-card animate-slideUp border bg-gradient-to-br from-blue-500/20 to-blue-600/5 border-blue-500/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                  Active Hours
                </span>
                <Clock size={16} className="opacity-60 text-text-muted" />
              </div>
              <p className="text-3xl font-bold text-text-primary">
                {stats?.activeHoursToday ?? 0}
                <span className="text-sm font-normal text-text-muted ml-1">h</span>
              </p>
              <p className="text-[11px] text-text-muted mt-1">
                {period === "today" ? "today" : `this ${period}`}
              </p>
            </div>

            {/* Leads Converted */}
            <div className="stat-card animate-slideUp border bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border-emerald-500/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                  Leads Converted
                </span>
                <TrendingUp size={16} className="opacity-60 text-text-muted" />
              </div>
              <p className="text-3xl font-bold text-emerald-400">
                {stats?.leadsConverted ?? 0}
              </p>
              <p className="text-[11px] text-text-muted mt-1">this period</p>
            </div>

            {/* Avg Response Time */}
            <div className="stat-card animate-slideUp border bg-gradient-to-br from-purple-500/20 to-purple-600/5 border-purple-500/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                  Avg Response Time
                </span>
                <Timer size={16} className="opacity-60 text-text-muted" />
              </div>
              <p className="text-3xl font-bold text-purple-400">
                {stats?.avgResponseTime ?? 0}
                <span className="text-sm font-normal text-text-muted ml-1">min</span>
              </p>
              <p className="text-[11px] text-text-muted mt-1">lead response avg</p>
            </div>
          </>
        )}
      </div>

      {/* ─── Charts Row ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {loadingTrend ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : trend.length === 0 ? (
          <>
            <div className="glass-card p-5 animate-slideUp">
              <h3 className="text-sm font-semibold text-text-primary mb-4">
                Activity Trend
              </h3>
              <div className="flex items-center justify-center h-48 text-sm text-text-muted">
                No data yet
              </div>
            </div>
            <div className="glass-card p-5 animate-slideUp">
              <h3 className="text-sm font-semibold text-text-primary mb-4">
                Productivity Score
              </h3>
              <div className="flex items-center justify-center h-48 text-sm text-text-muted">
                No data yet
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Activity Trend - Line Chart */}
            <div className="glass-card p-5 animate-slideUp">
              <h3 className="text-sm font-semibold text-text-primary mb-4">
                Activity Trend
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="calls"
                    name="Calls"
                    stroke="#2891FF"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "#2891FF" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="emails"
                    name="Emails"
                    stroke="#7BC142"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "#7BC142" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="notes"
                    name="Notes"
                    stroke="#7C3AED"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "#7C3AED" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Productivity Score - Area Chart */}
            <div className="glass-card p-5 animate-slideUp">
              <h3 className="text-sm font-semibold text-text-primary mb-4">
                Productivity Score
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2891FF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2891FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="score"
                    name="Score"
                    stroke="#2891FF"
                    strokeWidth={2}
                    fill="url(#scoreGradient)"
                    activeDot={{ r: 4, fill: "#2891FF" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>

      {/* ─── Heatmap Row ─── */}
      <ActivityHeatmap employeeId={selectedEmployee || (isAdmin ? undefined : userId)} />

      {/* ─── Sales Targets (Admins) ─── */}
      {isAdmin && (
        <div className="glass-card p-5 animate-slideUp">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <Target size={16} className="text-neon-green" />
              Sales Targets ({new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" })})
            </h3>
          </div>
          {loadingTargets ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="animate-spin text-text-muted" />
            </div>
          ) : targets.length === 0 ? (
            <div className="text-center py-8 text-text-muted text-sm">
              No targets set for this month
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-text-muted border-b border-white/[0.06]">
                    <th className="text-left py-2 px-3">Employee</th>
                    <th className="text-center py-2 px-3">Sales Target</th>
                    <th className="text-center py-2 px-3">Achieved</th>
                    <th className="text-center py-2 px-3">Lead Target</th>
                    <th className="text-center py-2 px-3">Leads Gen.</th>
                    <th className="text-center py-2 px-3">Hard Target</th>
                    <th className="text-center py-2 px-3">Hard Achieved</th>
                    <th className="text-center py-2 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {targets.map((t: any) => (
                    <tr key={t.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                      <td className="py-2 px-3 text-text-primary font-medium">
                        {t.employee?.user?.name || "Unknown"}
                      </td>
                      {editingTarget === t.employeeId ? (
                        <>
                          <td className="py-2 px-3 text-center">
                            <input
                              type="number"
                              value={editForm.salesTarget}
                              onChange={(e) => setEditForm({ ...editForm, salesTarget: parseInt(e.target.value) || 0 })}
                              className="w-16 bg-white/[0.05] border border-white/[0.1] rounded px-2 py-1 text-center text-xs text-text-primary focus:outline-none focus:border-neon-blue/40"
                            />
                          </td>
                          <td className="py-2 px-3 text-center text-text-muted">{t.salesAchieved || 0}</td>
                          <td className="py-2 px-3 text-center">
                            <input
                              type="number"
                              value={editForm.leadTarget}
                              onChange={(e) => setEditForm({ ...editForm, leadTarget: parseInt(e.target.value) || 0 })}
                              className="w-16 bg-white/[0.05] border border-white/[0.1] rounded px-2 py-1 text-center text-xs text-text-primary focus:outline-none focus:border-neon-blue/40"
                            />
                          </td>
                          <td className="py-2 px-3 text-center text-text-muted">{t.leadsGenerated || 0}</td>
                          <td className="py-2 px-3 text-center">
                            <input
                              type="number"
                              value={editForm.hardTarget}
                              onChange={(e) => setEditForm({ ...editForm, hardTarget: parseInt(e.target.value) || 0 })}
                              className="w-16 bg-white/[0.05] border border-white/[0.1] rounded px-2 py-1 text-center text-xs text-text-primary focus:outline-none focus:border-neon-blue/40"
                            />
                          </td>
                          <td className="py-2 px-3 text-center text-text-muted">{t.hardAchieved || 0}</td>
                          <td className="py-2 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleSaveTarget(t.employeeId)}
                                disabled={savingTarget}
                                className="p-1 rounded hover:bg-green-500/20 text-green-400 transition-colors"
                              >
                                {savingTarget ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                              </button>
                              <button
                                onClick={() => setEditingTarget(null)}
                                className="p-1 rounded hover:bg-red-500/20 text-red-400 transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-2 px-3 text-center text-text-secondary">{t.salesTarget}</td>
                          <td className="py-2 px-3 text-center">
                            <span className={t.salesAchieved >= t.salesTarget ? "text-green-400" : "text-text-muted"}>
                              {t.salesAchieved || 0}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center text-text-secondary">{t.leadTarget}</td>
                          <td className="py-2 px-3 text-center">
                            <span className={t.leadsGenerated >= t.leadTarget ? "text-green-400" : "text-text-muted"}>
                              {t.leadsGenerated || 0}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center text-text-secondary">{t.hardTarget}</td>
                          <td className="py-2 px-3 text-center">
                            <span className={t.hardAchieved >= t.hardTarget ? "text-green-400" : "text-text-muted"}>
                              {t.hardAchieved || 0}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              onClick={() => handleEditTarget(t)}
                              className="p-1 rounded hover:bg-neon-blue/20 text-neon-blue transition-colors"
                              title="Edit target"
                            >
                              <Edit3 size={14} />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── Bottom Row ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Leaderboard */}
        <Leaderboard />

        {/* Alerts Panel */}
        <div className="glass-card p-5 animate-slideUp">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-orange-400" />
            <h3 className="text-sm font-semibold text-text-primary">Alerts</h3>
          </div>
          {loadingAlerts ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={20} className="animate-spin text-text-muted" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-12 text-text-muted text-sm">
              No alerts
            </div>
          ) : (
            <div className="space-y-1 max-h-[320px] overflow-y-auto">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-2.5 px-3 py-2 rounded-lg hover:bg-white/[0.03] transition-colors"
                >
                  {alertTypeIcon(alert.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-primary leading-tight">
                      <span className="font-medium">{alert.employeeName}</span>{" "}
                      <span className="text-text-muted">{alert.message}</span>
                    </p>
                    <p className="text-[10px] text-text-muted mt-0.5">
                      {new Date(alert.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
