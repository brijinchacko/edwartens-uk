"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Search, Filter, X, Phone, Mail, MessageCircle,
  ChevronDown, Info, Calendar, Users, TrendingUp,
  AlertTriangle, PoundSterling, Clock, ExternalLink,
  RefreshCw,
} from "lucide-react";

// ---- Types ----

interface StageItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: "lead" | "student";
  status: string;
  assignedTo: string | null;
  followUpDate: string | null;
  lastActivity: string | null;
  daysInStage: number;
  course: string | null;
  source: string | null;
  batchName: string | null;
  isOverdue: boolean;
  isIdle: boolean;
}

interface Stage {
  name: string;
  status: string;
  type: "lead" | "student";
  count: number;
  items: StageItem[];
}

interface Summary {
  total: number;
  conversionRate: number;
  avgDaysToConvert: number;
  atRisk: number;
  revenuePotential: number;
}

interface FilterOptions {
  employees: { id: string; name: string }[];
  sources: { value: string; count: number }[];
  batches: { id: string; name: string }[];
}

interface PipelineData {
  stages: Stage[];
  summary: Summary;
  filterOptions: FilterOptions;
}

// ---- Constants ----

type PipelineView = "full" | "sales" | "training" | "career" | "risk";

const VIEW_TABS: { value: PipelineView; label: string }[] = [
  { value: "full", label: "Full Pipeline" },
  { value: "sales", label: "Sales Pipeline" },
  { value: "training", label: "Training Pipeline" },
  { value: "career", label: "Career Pipeline" },
  { value: "risk", label: "At Risk" },
];

const STAGE_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  // Lead stages
  NEW: { bg: "bg-blue-500/5", border: "border-blue-500/20", text: "text-blue-400", dot: "bg-blue-400" },
  CONTACTED: { bg: "bg-cyan-500/5", border: "border-cyan-500/20", text: "text-cyan-400", dot: "bg-cyan-400" },
  QUALIFIED: { bg: "bg-green-500/5", border: "border-green-500/20", text: "text-green-400", dot: "bg-green-400" },
  ENROLLED: { bg: "bg-purple-500/5", border: "border-purple-500/20", text: "text-purple-400", dot: "bg-purple-400" },
  LOST: { bg: "bg-red-500/5", border: "border-red-500/20", text: "text-red-400", dot: "bg-red-400" },
  // Student stages
  ONBOARDING: { bg: "bg-indigo-500/5", border: "border-indigo-500/20", text: "text-indigo-400", dot: "bg-indigo-400" },
  ACTIVE: { bg: "bg-emerald-500/5", border: "border-emerald-500/20", text: "text-emerald-400", dot: "bg-emerald-400" },
  ON_HOLD: { bg: "bg-amber-500/5", border: "border-amber-500/20", text: "text-amber-400", dot: "bg-amber-400" },
  POST_TRAINING: { bg: "bg-teal-500/5", border: "border-teal-500/20", text: "text-teal-400", dot: "bg-teal-400" },
  CAREER_SUPPORT: { bg: "bg-sky-500/5", border: "border-sky-500/20", text: "text-sky-400", dot: "bg-sky-400" },
  COMPLETED: { bg: "bg-violet-500/5", border: "border-violet-500/20", text: "text-violet-400", dot: "bg-violet-400" },
  ALUMNI: { bg: "bg-fuchsia-500/5", border: "border-fuchsia-500/20", text: "text-fuchsia-400", dot: "bg-fuchsia-400" },
  DROPPED: { bg: "bg-rose-500/5", border: "border-rose-500/20", text: "text-rose-400", dot: "bg-rose-400" },
  OVERDUE_FOLLOWUP: { bg: "bg-orange-500/5", border: "border-orange-500/20", text: "text-orange-400", dot: "bg-orange-400" },
};

const STAGE_LABELS: Record<string, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  ENROLLED: "Enrolled",
  LOST: "Lost",
  ONBOARDING: "Onboarding",
  ACTIVE: "In Training",
  ON_HOLD: "On Hold",
  POST_TRAINING: "Post-Training",
  CAREER_SUPPORT: "Career Support",
  COMPLETED: "Completed",
  ALUMNI: "Alumni",
  DROPPED: "Dropped",
  OVERDUE_FOLLOWUP: "Overdue Follow-ups",
};

const LEAD_STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "ENROLLED", "LOST"];
const STUDENT_STATUSES = [
  "ONBOARDING", "ACTIVE", "ON_HOLD", "POST_TRAINING",
  "CAREER_SUPPORT", "COMPLETED", "ALUMNI", "DROPPED",
];

const COURSE_LABELS: Record<string, string> = {
  PROFESSIONAL_MODULE: "Professional",
  AI_MODULE: "AI Module",
};

const AUTO_UPDATE_RULES = [
  { trigger: "Lead created", action: "Appears in NEW" },
  { trigger: "Call logged", action: "Auto-moves to CONTACTED (if was NEW)" },
  { trigger: "Interest marked YES", action: "Auto-moves to QUALIFIED" },
  { trigger: "Payment received", action: "Auto-moves to ENROLLED" },
  { trigger: "Lead converted to student", action: "Appears in ONBOARDING" },
  { trigger: "Student batch starts", action: "Auto-moves to ACTIVE" },
  { trigger: "Batch completed", action: "Auto-moves to POST_TRAINING" },
  { trigger: "Certificate issued", action: "Auto-moves to COMPLETED" },
  { trigger: "Placement recorded", action: "Auto-moves to ALUMNI" },
];

// ---- Helpers ----

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(new Date(dateStr));
}

function truncate(str: string, len: number): string {
  if (!str) return "";
  return str.length > len ? str.slice(0, len) + "..." : str;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ---- Component ----

export default function PipelineClient() {
  const [data, setData] = useState<PipelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<PipelineView>("full");
  const [showFilters, setShowFilters] = useState(false);
  const [showAutoRules, setShowAutoRules] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [source, setSource] = useState("");
  const [course, setCourse] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [batchFilter, setBatchFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [followUp, setFollowUp] = useState("");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ view });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (source) params.set("source", source);
      if (course) params.set("course", course);
      if (assignedTo) params.set("assignedTo", assignedTo);
      if (batchFilter) params.set("batch", batchFilter);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      if (followUp) params.set("followUp", followUp);

      const res = await fetch(`/api/admin/pipeline?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Pipeline fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [view, debouncedSearch, source, course, assignedTo, batchFilter, dateFrom, dateTo, followUp]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusChange = async (id: string, type: "lead" | "student", newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/pipeline", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type, newStatus }),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setSource("");
    setCourse("");
    setAssignedTo("");
    setBatchFilter("");
    setDateFrom("");
    setDateTo("");
    setFollowUp("");
  };

  const activeFilterCount = [source, course, assignedTo, batchFilter, dateFrom, dateTo, followUp].filter(Boolean).length;

  const summary = data?.summary || {
    total: 0,
    conversionRate: 0,
    avgDaysToConvert: 0,
    atRisk: 0,
    revenuePotential: 0,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Lifecycle Pipeline</h1>
          <p className="text-text-muted mt-1">
            Lead &rarr; Student &rarr; Alumni — full journey view
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAutoRules(!showAutoRules)}
            className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-text-muted hover:bg-white/[0.06] transition-colors"
            title="Auto-update rules"
          >
            <Info size={16} />
          </button>
          <button
            onClick={fetchData}
            className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-text-muted hover:bg-white/[0.06] transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Auto-update rules panel */}
      {showAutoRules && (
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-text-primary">Auto-Update Rules</h3>
            <button onClick={() => setShowAutoRules(false)} className="text-text-muted hover:text-text-primary">
              <X size={14} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {AUTO_UPDATE_RULES.map((rule, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <div className="w-1.5 h-1.5 rounded-full bg-neon-blue mt-1.5 shrink-0" />
                <div>
                  <p className="text-xs text-text-primary font-medium">{rule.trigger}</p>
                  <p className="text-[11px] text-text-muted">{rule.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="glass-card p-3">
          <div className="flex items-center gap-2 mb-1">
            <Users size={14} className="text-text-muted" />
            <span className="text-[11px] text-text-muted uppercase tracking-wide">In Pipeline</span>
          </div>
          <p className="text-lg font-bold text-text-primary">{summary.total.toLocaleString()}</p>
        </div>
        <div className="glass-card p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-green-400" />
            <span className="text-[11px] text-text-muted uppercase tracking-wide">Conversion</span>
          </div>
          <p className="text-lg font-bold text-green-400">{summary.conversionRate}%</p>
        </div>
        <div className="glass-card p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-text-muted" />
            <span className="text-[11px] text-text-muted uppercase tracking-wide">Avg Days</span>
          </div>
          <p className="text-lg font-bold text-text-primary">{summary.avgDaysToConvert}d</p>
        </div>
        <div className="glass-card p-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={14} className="text-amber-400" />
            <span className="text-[11px] text-text-muted uppercase tracking-wide">At Risk</span>
          </div>
          <p className="text-lg font-bold text-amber-400">{summary.atRisk}</p>
        </div>
        <div className="glass-card p-3">
          <div className="flex items-center gap-2 mb-1">
            <PoundSterling size={14} className="text-emerald-400" />
            <span className="text-[11px] text-text-muted uppercase tracking-wide">Revenue Pot.</span>
          </div>
          <p className="text-lg font-bold text-emerald-400">
            {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 0 }).format(summary.revenuePotential)}
          </p>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex flex-wrap gap-2">
        {VIEW_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setView(tab.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              view === tab.value
                ? "bg-neon-blue/10 text-neon-blue border border-neon-blue/20"
                : "bg-white/[0.03] text-text-muted border border-white/[0.06] hover:bg-white/[0.06]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search + Filter Toggle */}
      <div className="glass-card p-3 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:border-neon-blue/50 focus:outline-none"
            />
            {search && (
              <button
                onClick={() => { setSearch(""); setDebouncedSearch(""); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
              showFilters || activeFilterCount > 0
                ? "bg-neon-blue/10 text-neon-blue border-neon-blue/20"
                : "bg-white/[0.03] text-text-muted border-white/[0.06] hover:bg-white/[0.06]"
            }`}
          >
            <Filter size={14} />
            Filters
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-neon-blue/20 text-neon-blue text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-2 border-t border-white/[0.06]">
            {/* Course */}
            <div>
              <label className="text-[11px] text-text-muted mb-1 block">Course</label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-xs text-text-primary focus:border-neon-blue/50 focus:outline-none"
              >
                <option value="">All Courses</option>
                <option value="PROFESSIONAL_MODULE">Professional Module</option>
                <option value="AI_MODULE">AI Module</option>
              </select>
            </div>

            {/* Source */}
            <div>
              <label className="text-[11px] text-text-muted mb-1 block">Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-xs text-text-primary focus:border-neon-blue/50 focus:outline-none"
              >
                <option value="">All Sources</option>
                {data?.filterOptions.sources.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.value} ({s.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Assigned To */}
            <div>
              <label className="text-[11px] text-text-muted mb-1 block">Assigned To</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-xs text-text-primary focus:border-neon-blue/50 focus:outline-none"
              >
                <option value="">All Staff</option>
                {data?.filterOptions.employees.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>

            {/* Batch */}
            <div>
              <label className="text-[11px] text-text-muted mb-1 block">Batch</label>
              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-xs text-text-primary focus:border-neon-blue/50 focus:outline-none"
              >
                <option value="">All Batches</option>
                {data?.filterOptions.batches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Follow-up */}
            <div>
              <label className="text-[11px] text-text-muted mb-1 block">Follow-up</label>
              <select
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-xs text-text-primary focus:border-neon-blue/50 focus:outline-none"
              >
                <option value="">Any</option>
                <option value="yes">Has Follow-up</option>
                <option value="no">No Follow-up</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="text-[11px] text-text-muted mb-1 block">Created From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-xs text-text-primary focus:border-neon-blue/50 focus:outline-none"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="text-[11px] text-text-muted mb-1 block">Created To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-xs text-text-primary focus:border-neon-blue/50 focus:outline-none"
              />
            </div>

            {/* Clear */}
            {activeFilterCount > 0 && (
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs hover:bg-red-500/20 transition-colors"
                >
                  <X size={12} />
                  Clear ({activeFilterCount})
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Kanban Board */}
      {loading && !data ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-text-muted">
            <RefreshCw size={20} className="animate-spin" />
            <span className="text-sm">Loading pipeline...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Lead stages section label */}
          {data && data.stages.some((s) => s.type === "lead") && (
            <div className="flex items-center gap-2 pt-2">
              <span className="text-[10px] uppercase tracking-widest text-text-muted font-semibold">Lead Stages</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>
          )}

          <div className="flex gap-3 overflow-x-auto pb-2" style={{ minHeight: 300 }}>
            {data?.stages
              .filter((s) => s.type === "lead")
              .map((stage) => (
                <StageColumn
                  key={stage.status}
                  stage={stage}
                  onStatusChange={handleStatusChange}
                  updatingId={updatingId}
                />
              ))}
          </div>

          {/* Student stages section label */}
          {data && data.stages.some((s) => s.type === "student") && (
            <div className="flex items-center gap-2 pt-2">
              <span className="text-[10px] uppercase tracking-widest text-text-muted font-semibold">Student Stages</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>
          )}

          <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: 300 }}>
            {data?.stages
              .filter((s) => s.type === "student")
              .map((stage) => (
                <StageColumn
                  key={stage.status}
                  stage={stage}
                  onStatusChange={handleStatusChange}
                  updatingId={updatingId}
                />
              ))}
          </div>
        </>
      )}
    </div>
  );
}

// ---- Stage Column ----

function StageColumn({
  stage,
  onStatusChange,
  updatingId,
}: {
  stage: Stage;
  onStatusChange: (id: string, type: "lead" | "student", newStatus: string) => void;
  updatingId: string | null;
}) {
  const colors = STAGE_COLORS[stage.status] || STAGE_COLORS.NEW;
  const label = STAGE_LABELS[stage.status] || stage.status;

  return (
    <div className="flex-shrink-0 w-72">
      {/* Column header */}
      <div className={`flex items-center justify-between p-3 rounded-t-lg border ${colors.border} ${colors.bg}`}>
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
          <h3 className={`text-xs font-semibold ${colors.text}`}>{label}</h3>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
          {stage.count}
        </span>
      </div>

      {/* Cards container */}
      <div className="space-y-2 p-2 bg-white/[0.01] border border-t-0 border-white/[0.06] rounded-b-lg max-h-[60vh] overflow-y-auto custom-scrollbar">
        {stage.items.length === 0 ? (
          <p className="text-text-muted text-xs text-center py-8">No items</p>
        ) : (
          stage.items.map((item) => (
            <PipelineCard
              key={item.id}
              item={item}
              onStatusChange={onStatusChange}
              isUpdating={updatingId === item.id}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ---- Pipeline Card ----

function PipelineCard({
  item,
  onStatusChange,
  isUpdating,
}: {
  item: StageItem;
  onStatusChange: (id: string, type: "lead" | "student", newStatus: string) => void;
  isUpdating: boolean;
}) {
  const [showActions, setShowActions] = useState(false);
  const detailUrl = item.type === "lead" ? `/admin/leads/${item.id}` : `/admin/students/${item.id}`;

  const borderClass = item.isOverdue
    ? "border-red-500/40 hover:border-red-500/60"
    : item.isIdle
    ? "border-amber-500/30 hover:border-amber-500/50"
    : "border-white/[0.06] hover:border-white/[0.1]";

  const availableStatuses = item.type === "lead" ? LEAD_STATUSES : STUDENT_STATUSES;

  return (
    <div
      className={`relative p-3 rounded-lg bg-white/[0.02] border ${borderClass} hover:bg-white/[0.04] transition-colors group`}
    >
      {isUpdating && (
        <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center z-10">
          <RefreshCw size={14} className="animate-spin text-neon-blue" />
        </div>
      )}

      {/* Top row: avatar + name */}
      <div className="flex items-center gap-2">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium shrink-0 ${
          item.type === "lead"
            ? "bg-neon-blue/10 text-neon-blue"
            : "bg-emerald-500/10 text-emerald-400"
        }`}>
          {getInitials(item.name)}
        </div>
        <div className="min-w-0 flex-1">
          <Link
            href={detailUrl}
            className="text-sm text-text-primary font-medium truncate block hover:text-neon-blue transition-colors"
          >
            {item.name}
          </Link>
          <p className="text-[11px] text-text-muted truncate">{item.email}</p>
        </div>
      </div>

      {/* Phone (truncated) */}
      {item.phone && (
        <p className="text-[10px] text-text-muted mt-1 truncate">{truncate(item.phone, 15)}</p>
      )}

      {/* Badges row */}
      <div className="flex flex-wrap gap-1 mt-2">
        {item.course && (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/15">
            {COURSE_LABELS[item.course] || item.course}
          </span>
        )}
        {item.source && item.type === "lead" && (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-white/[0.05] text-text-muted border border-white/[0.08] capitalize">
            {item.source}
          </span>
        )}
        {item.batchName && (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">
            {item.batchName}
          </span>
        )}
        <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
          item.type === "lead"
            ? "bg-blue-500/10 text-blue-300 border border-blue-500/15"
            : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/15"
        }`}>
          {item.type === "lead" ? "Lead" : "Student"}
        </span>
      </div>

      {/* Meta row */}
      <div className="flex items-center justify-between mt-2 text-[10px] text-text-muted">
        <span>{item.assignedTo || "Unassigned"}</span>
        <span className={item.daysInStage > 7 && !["ENROLLED", "LOST", "COMPLETED", "ALUMNI", "DROPPED"].includes(item.status) ? "text-amber-400 font-medium" : ""}>
          {item.daysInStage}d in stage
        </span>
      </div>

      {/* Follow-up / Last Activity */}
      <div className="flex items-center justify-between mt-1 text-[10px]">
        {item.followUpDate && (
          <span className={`flex items-center gap-1 ${item.isOverdue ? "text-red-400 font-medium" : "text-text-muted"}`}>
            <Calendar size={10} />
            {item.isOverdue && "OVERDUE "}
            {formatDate(item.followUpDate)}
          </span>
        )}
        {item.lastActivity && (
          <span className="text-text-muted">
            Last: {formatDate(item.lastActivity)}
          </span>
        )}
      </div>

      {/* Action buttons row (visible on hover) */}
      <div className="flex items-center gap-1 mt-2 pt-2 border-t border-white/[0.04]">
        {/* Quick actions */}
        {item.phone && (
          <a
            href={`https://wa.me/${item.phone.replace(/[^0-9+]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded hover:bg-green-500/10 text-text-muted hover:text-green-400 transition-colors"
            title="WhatsApp"
          >
            <MessageCircle size={12} />
          </a>
        )}
        {item.phone && (
          <a
            href={`tel:${item.phone}`}
            className="p-1 rounded hover:bg-blue-500/10 text-text-muted hover:text-blue-400 transition-colors"
            title="Call"
          >
            <Phone size={12} />
          </a>
        )}
        <a
          href={`mailto:${item.email}`}
          className="p-1 rounded hover:bg-purple-500/10 text-text-muted hover:text-purple-400 transition-colors"
          title="Email"
        >
          <Mail size={12} />
        </a>
        <Link
          href={detailUrl}
          className="p-1 rounded hover:bg-white/[0.06] text-text-muted hover:text-text-primary transition-colors"
          title="View Details"
        >
          <ExternalLink size={12} />
        </Link>

        {/* Status change dropdown */}
        <div className="relative ml-auto">
          <button
            onClick={() => setShowActions(!showActions)}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-text-muted hover:bg-white/[0.06] hover:text-text-primary transition-colors"
          >
            Move <ChevronDown size={10} />
          </button>
          {showActions && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowActions(false)} />
              <div className="absolute right-0 bottom-full mb-1 w-40 bg-[#1a1a2e] border border-white/[0.1] rounded-lg shadow-xl z-30 py-1 max-h-60 overflow-y-auto">
                {availableStatuses
                  .filter((s) => s !== item.status)
                  .map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        onStatusChange(item.id, item.type, status);
                        setShowActions(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-text-secondary hover:bg-white/[0.06] hover:text-text-primary transition-colors flex items-center gap-2"
                    >
                      <div className={`w-2 h-2 rounded-full ${STAGE_COLORS[status]?.dot || "bg-gray-400"}`} />
                      {STAGE_LABELS[status] || status}
                    </button>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
