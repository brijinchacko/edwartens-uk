"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ClipboardList, Download, Users, Clock, Coffee, AlertTriangle,
  Filter, ArrowUpDown, MapPin, Briefcase, Timer, ChevronDown, ChevronUp, Search,
} from "lucide-react";

interface DayRecord {
  date: string;
  checkIn: string;
  checkOut: string | null;
  workLocation: string;
  status: string;
  totalMinutes: number;
  activeMinutes: number;
  idleMinutes: number;
  breakMinutes: number;
  summary: string | null;
  isLate: boolean;
}

interface EmployeeRecord {
  employeeId: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  days: DayRecord[];
  totalMinutes: number;
  activeMinutes: number;
  idleMinutes: number;
  breakMinutes: number;
  daysWorked: number;
  lateDays: number;
  avgDailyHours: number;
  autoCheckouts: number;
}

interface ReportData {
  period: string;
  from: string;
  to: string;
  employees: EmployeeRecord[];
  totalSessions: number;
  filters: {
    departments: string[];
    roles: string[];
    employeeList: { id: string; name: string }[];
  };
}

function fmtHours(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  });
}

const STATUS_COLORS: Record<string, string> = {
  CHECKED_IN: "bg-green-500/20 text-green-400",
  CHECKED_OUT: "bg-gray-500/20 text-gray-400",
  IDLE: "bg-yellow-500/20 text-yellow-400",
  ON_BREAK: "bg-blue-500/20 text-blue-400",
};

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  SALES_LEAD: "Sales Lead",
  ADMISSION_COUNSELLOR: "Admission Counsellor",
  TRAINER: "Trainer",
  HR_MANAGER: "HR Manager",
};

export default function AttendanceClient() {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [lateAfter, setLateAfter] = useState("09:30");
  const [showLateOnly, setShowLateOnly] = useState(false);
  const [minHours, setMinHours] = useState("");
  const [maxHours, setMaxHours] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedEmployees, setExpandedEmployees] = useState<Set<string>>(new Set());

  const buildParams = useCallback(() => {
    const params = new URLSearchParams({ period, format: "json", sortBy, sortOrder });
    if (employeeFilter) params.set("employeeId", employeeFilter);
    if (roleFilter) params.set("role", roleFilter);
    if (departmentFilter) params.set("department", departmentFilter);
    if (locationFilter) params.set("workLocation", locationFilter);
    if (statusFilter) params.set("status", statusFilter);
    if (lateAfter) params.set("lateAfter", lateAfter);
    if (minHours) params.set("minHours", minHours);
    if (maxHours) params.set("maxHours", maxHours);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    return params;
  }, [period, employeeFilter, roleFilter, departmentFilter, locationFilter, statusFilter, lateAfter, minHours, maxHours, sortBy, sortOrder, startDate, endDate]);

  const loadReport = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/attendance/report?${buildParams()}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [buildParams]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const downloadCSV = () => {
    const params = buildParams();
    params.set("format", "csv");
    window.open(`/api/admin/attendance/report?${params}`, "_blank");
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedEmployees((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const resetFilters = () => {
    setEmployeeFilter("");
    setRoleFilter("");
    setDepartmentFilter("");
    setLocationFilter("");
    setStatusFilter("");
    setMinHours("");
    setMaxHours("");
    setStartDate("");
    setEndDate("");
    setSearchQuery("");
    setShowLateOnly(false);
  };

  // Client-side search + late filter
  let filteredEmployees = data?.employees || [];
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filteredEmployees = filteredEmployees.filter(
      (e) => e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q)
    );
  }
  if (showLateOnly) {
    filteredEmployees = filteredEmployees.filter((e) => e.lateDays > 0);
  }

  // Summary stats
  const totalEmployees = filteredEmployees.length;
  const totalHours = filteredEmployees.reduce((s, e) => s + e.totalMinutes, 0);
  const totalActive = filteredEmployees.reduce((s, e) => s + e.activeMinutes, 0);
  const totalIdle = filteredEmployees.reduce((s, e) => s + e.idleMinutes, 0);
  const totalBreak = filteredEmployees.reduce((s, e) => s + e.breakMinutes, 0);
  const totalLateDays = filteredEmployees.reduce((s, e) => s + e.lateDays, 0);
  const totalAutoCheckouts = filteredEmployees.reduce((s, e) => s + e.autoCheckouts, 0);

  const activeFilters = [roleFilter, departmentFilter, locationFilter, statusFilter, minHours, maxHours, employeeFilter, startDate].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-neon-green" />
            Attendance Reports
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Employee attendance tracking and salary report generation
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors ${showFilters ? "bg-neon-blue/20 text-neon-blue border-neon-blue/30" : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"}`}
          >
            <Filter className="w-4 h-4" />
            Filters{activeFilters > 0 && ` (${activeFilters})`}
          </button>
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2 bg-neon-green/20 text-neon-green border border-neon-green/30 rounded-lg hover:bg-neon-green/30 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </button>
        </div>
      </div>

      {/* Quick Filters Bar */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <div className="flex flex-wrap gap-3 items-end">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="Search employee name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/30"
              />
            </div>
          </div>

          {/* Period */}
          <div>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as "daily" | "weekly" | "monthly")}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="daily">Today</option>
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
            </select>
          </div>

          {/* Employee */}
          <div>
            <select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="">All Employees</option>
              {data?.filters.employeeList.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>

          {/* Late only toggle */}
          <label className="flex items-center gap-2 px-3 py-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showLateOnly}
              onChange={(e) => setShowLateOnly(e.target.checked)}
              className="rounded border-white/20 bg-white/5 text-neon-green"
            />
            <span className="text-sm text-white/60">Late only</span>
          </label>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-white/70 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Advanced Filters
            </h3>
            <button onClick={resetFilters} className="text-xs text-white/40 hover:text-white transition-colors">
              Reset all
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Role */}
            <div>
              <label className="text-xs text-white/50 mb-1 block">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="">All Roles</option>
                {data?.filters.roles.map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div>
              <label className="text-xs text-white/50 mb-1 block">Department</label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="">All Departments</option>
                {data?.filters.departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Work Location */}
            <div>
              <label className="text-xs text-white/50 mb-1 block flex items-center gap-1"><MapPin className="w-3 h-3" /> Location</label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="">All Locations</option>
                <option value="HOME">Home</option>
                <option value="OFFICE">Office</option>
                <option value="REMOTE">Remote</option>
              </select>
            </div>

            {/* Session Status */}
            <div>
              <label className="text-xs text-white/50 mb-1 block">Session Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="">All Statuses</option>
                <option value="CHECKED_IN">Checked In</option>
                <option value="CHECKED_OUT">Checked Out</option>
                <option value="IDLE">Idle</option>
                <option value="ON_BREAK">On Break</option>
              </select>
            </div>

            {/* Min/Max Hours */}
            <div>
              <label className="text-xs text-white/50 mb-1 block flex items-center gap-1"><Timer className="w-3 h-3" /> Min Hours</label>
              <input
                type="number"
                step="0.5"
                value={minHours}
                onChange={(e) => setMinHours(e.target.value)}
                placeholder="0"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block flex items-center gap-1"><Timer className="w-3 h-3" /> Max Hours</label>
              <input
                type="number"
                step="0.5"
                value={maxHours}
                onChange={(e) => setMaxHours(e.target.value)}
                placeholder="24"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30"
              />
            </div>

            {/* Late Threshold */}
            <div>
              <label className="text-xs text-white/50 mb-1 block">Late After (IST)</label>
              <input
                type="time"
                value={lateAfter}
                onChange={(e) => setLateAfter(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>

            {/* Date Range */}
            <div>
              <label className="text-xs text-white/50 mb-1 block">From Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">To Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <StatCard icon={Users} label="Employees" value={String(totalEmployees)} color="text-neon-blue" />
        <StatCard icon={Clock} label="Total Hours" value={fmtHours(totalHours)} color="text-neon-green" />
        <StatCard icon={Clock} label="Active" value={fmtHours(totalActive)} color="text-green-400" />
        <StatCard icon={AlertTriangle} label="Idle" value={fmtHours(totalIdle)} color="text-yellow-400" />
        <StatCard icon={Coffee} label="Breaks" value={fmtHours(totalBreak)} color="text-blue-400" />
        <StatCard icon={Timer} label="Late Days" value={String(totalLateDays)} color="text-red-400" />
        <StatCard icon={AlertTriangle} label="Auto-Checkouts" value={String(totalAutoCheckouts)} color="text-orange-400" />
      </div>

      {/* Sortable Table Header */}
      <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2">
        <div className="flex flex-wrap gap-2 items-center text-xs text-white/50">
          <span>Sort by:</span>
          {[
            { key: "name", label: "Name" },
            { key: "totalHours", label: "Total Hours" },
            { key: "activeHours", label: "Active Hours" },
            { key: "idleHours", label: "Idle Hours" },
            { key: "daysWorked", label: "Days Worked" },
            { key: "lateDays", label: "Late Days" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => toggleSort(key)}
              className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${sortBy === key ? "bg-neon-blue/20 text-neon-blue" : "hover:bg-white/10 text-white/50"}`}
            >
              {label}
              {sortBy === key && (sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
            </button>
          ))}
        </div>
      </div>

      {/* Employee Attendance Table */}
      {loading ? (
        <div className="text-center py-12 text-white/50">Loading attendance data...</div>
      ) : filteredEmployees.length === 0 ? (
        <div className="text-center py-12 text-white/50">No attendance records found for the selected filters</div>
      ) : (
        <div className="space-y-3">
          {filteredEmployees.map((emp) => {
            const isExpanded = expandedEmployees.has(emp.employeeId);
            return (
              <div key={emp.employeeId} className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                {/* Employee summary row */}
                <button
                  onClick={() => toggleExpand(emp.employeeId)}
                  className="w-full px-4 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 hover:bg-white/[0.02] transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-neon-blue/20 flex items-center justify-center text-xs font-medium text-neon-blue shrink-0">
                      {emp.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <span className="font-semibold text-white">{emp.name}</span>
                      <span className="text-white/30 text-xs ml-2">{ROLE_LABELS[emp.role] || emp.role}</span>
                      {emp.department && <span className="text-white/20 text-xs ml-1">| {emp.department}</span>}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-white/50 items-center">
                    <span className="bg-white/5 px-2 py-0.5 rounded">{emp.daysWorked}d</span>
                    <span className="text-green-400">{fmtHours(emp.activeMinutes)} active</span>
                    <span className="text-yellow-400">{fmtHours(emp.idleMinutes)} idle</span>
                    <span className="text-blue-400">{fmtHours(emp.breakMinutes)} break</span>
                    <span className="text-white font-medium">{fmtHours(emp.totalMinutes)} total</span>
                    <span className="text-white/30">~{emp.avgDailyHours}h/day</span>
                    {emp.lateDays > 0 && <span className="text-red-400 bg-red-500/10 px-2 py-0.5 rounded">{emp.lateDays} late</span>}
                    {emp.autoCheckouts > 0 && <span className="text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">{emp.autoCheckouts} auto</span>}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
                  </div>
                </button>

                {/* Expanded daily rows */}
                {isExpanded && (
                  <div className="border-t border-white/5">
                    {/* Header */}
                    <div className="px-4 py-1.5 grid grid-cols-[90px_60px_60px_70px_80px_60px_60px_60px_1fr] gap-2 text-[10px] text-white/30 uppercase tracking-wider">
                      <span>Date</span>
                      <span>In</span>
                      <span>Out</span>
                      <span>Location</span>
                      <span>Status</span>
                      <span>Total</span>
                      <span>Active</span>
                      <span>Idle</span>
                      <span>Summary</span>
                    </div>
                    <div className="divide-y divide-white/5">
                      {emp.days.map((day, i) => (
                        <div
                          key={i}
                          className={`px-4 py-2 grid grid-cols-[90px_60px_60px_70px_80px_60px_60px_60px_1fr] gap-2 items-center text-sm ${day.isLate ? "bg-red-500/5" : ""}`}
                        >
                          <span className="text-white/70 text-xs">{fmtDate(day.checkIn)}</span>
                          <span className={`text-xs ${day.isLate ? "text-red-400 font-medium" : "text-white/50"}`}>
                            {fmtTime(day.checkIn)}{day.isLate && " !"}
                          </span>
                          <span className="text-white/50 text-xs">{day.checkOut ? fmtTime(day.checkOut) : "—"}</span>
                          <span className="text-xs text-white/40">{day.workLocation}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full text-center ${STATUS_COLORS[day.status] || "bg-gray-500/20 text-gray-400"}`}>
                            {day.status.replace(/_/g, " ")}
                          </span>
                          <span className="text-white/60 text-xs">{fmtHours(day.totalMinutes)}</span>
                          <span className="text-green-400/70 text-xs">{fmtHours(day.activeMinutes)}</span>
                          <span className="text-yellow-400/70 text-xs">{fmtHours(day.idleMinutes)}</span>
                          <span className="text-white/30 text-xs truncate">
                            {(day.summary || "").includes("[Auto-checkout]") ? (
                              <span className="text-orange-400">Auto-checkout</span>
                            ) : (
                              day.summary || ""
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; color: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className={`w-3.5 h-3.5 ${color}`} />
        <span className="text-[10px] text-white/50 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-lg font-semibold text-white">{value}</div>
    </div>
  );
}
