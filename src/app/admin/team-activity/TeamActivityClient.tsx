"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Clock,
  Coffee,
  Wifi,
  WifiOff,
  AlertTriangle,
  Home,
  Building2,
  Globe,
  Filter,
  X,
  Phone,
  MessageSquare,
  FileText,
  ChevronRight,
  Activity,
  User,
  Send,
  CalendarDays,
  BarChart3,
  CheckCircle2,
  Plus,
} from "lucide-react";

/* ────────────────────────────────────────────── Types */
interface TeamMember {
  id: string;
  name: string;
  role: string;
  image?: string;
  status: "ACTIVE" | "BREAK" | "IDLE" | "OFFLINE";
  location?: "HOME" | "OFFICE" | "REMOTE";
  checkInTime?: string;
  activeSeconds: number;
  breakCount: number;
  totalBreakSeconds: number;
  idleMinutes: number;
}

interface TimelineEntry {
  type: string;
  startedAt: string;
  endedAt: string | null;
  durationMin: number;
  description: string | null;
  reason?: string | null;
}

interface LeadInteraction {
  id: string;
  leadId: string;
  leadName: string;
  leadEmail: string;
  leadStatus: string;
  content: string;
  createdAt: string;
}

interface WorkLogEntry {
  id: string;
  type: string;
  description: string | null;
  startedAt: string;
  endedAt: string | null;
  sessionId: string;
}

interface DaySummary {
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  activeMin: number;
  breakMin: number;
  idleMin: number;
  location: string | null;
}

interface TotalStats {
  avgHoursPerDay: number;
  totalDaysWorked: number;
  onTimeRate: number;
  rangeDays: number;
}

interface EmployeeDetail {
  employee: {
    id: string;
    userId: string;
    name: string;
    email: string;
    role: string;
    avatar: string | null;
    currentStatus: string;
    checkInTime: string | null;
    workLocation: string | null;
  };
  timeline: TimelineEntry[];
  breaks: Array<{
    id: string;
    startedAt: string;
    endedAt: string | null;
    reason: string | null;
    durationMin: number;
  }>;
  leadInteractions: LeadInteraction[];
  workLogs: WorkLogEntry[];
  daySummary: DaySummary[];
  stats: {
    totalActiveSeconds: number;
    totalBreakSeconds: number;
    totalIdleSeconds: number;
    breakCount: number;
    totalCallsMade: number;
    uniqueLeadsContacted: number;
    totalNotesAdded: number;
  };
  totalStats: TotalStats;
}

type StatusFilter = "ALL" | "ACTIVE" | "BREAK" | "IDLE" | "OFFLINE";

const STATUS_CONFIG: Record<
  string,
  { emoji: string; label: string; bg: string; text: string; dot: string }
> = {
  ACTIVE: {
    emoji: "\uD83D\uDFE2",
    label: "Active",
    bg: "bg-green-500/10",
    text: "text-green-400",
    dot: "bg-green-400",
  },
  BREAK: {
    emoji: "\uD83D\uDFE1",
    label: "On Break",
    bg: "bg-yellow-500/10",
    text: "text-yellow-400",
    dot: "bg-yellow-400",
  },
  IDLE: {
    emoji: "\uD83D\uDD34",
    label: "Idle",
    bg: "bg-red-500/10",
    text: "text-red-400",
    dot: "bg-red-400",
  },
  OFFLINE: {
    emoji: "\u26AB",
    label: "Offline",
    bg: "bg-white/[0.04]",
    text: "text-text-muted",
    dot: "bg-gray-500",
  },
};

const LOCATION_CONFIG: Record<
  string,
  { icon: React.ReactNode; label: string }
> = {
  HOME: { icon: <Home size={12} />, label: "Home" },
  OFFICE: { icon: <Building2 size={12} />, label: "Office" },
  REMOTE: { icon: <Globe size={12} />, label: "Remote" },
};

const TIMELINE_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  CHECK_IN: { icon: <Wifi size={12} />, color: "text-green-400", label: "Checked In" },
  ACTIVE: { icon: <Activity size={12} />, color: "text-green-400", label: "Active" },
  BREAK: { icon: <Coffee size={12} />, color: "text-yellow-400", label: "Break" },
  IDLE: { icon: <AlertTriangle size={12} />, color: "text-red-400", label: "Idle" },
  AWAY: { icon: <WifiOff size={12} />, color: "text-text-muted", label: "Away" },
  CHECK_OUT: { icon: <WifiOff size={12} />, color: "text-text-muted", label: "Checked Out" },
};

const LOG_TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  TASK: { icon: <CheckCircle2 size={12} />, color: "text-neon-blue", label: "Task" },
  CALL: { icon: <Phone size={12} />, color: "text-green-400", label: "Call" },
  MEETING: { icon: <Users size={12} />, color: "text-purple-400", label: "Meeting" },
  NOTE: { icon: <FileText size={12} />, color: "text-yellow-400", label: "Note" },
};

/* ────────────────────────────────────────────── Helpers */
function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/** Extract log type from description like "[TASK] Fixed the bug" */
function parseLogType(description: string | null): { logType: string; text: string } {
  if (!description) return { logType: "TASK", text: "" };
  const match = description.match(/^\[(TASK|CALL|MEETING|NOTE)\]\s*(.*)/);
  if (match) return { logType: match[1], text: match[2] };
  return { logType: "TASK", text: description };
}

/* ────────────────────────────────────────────── Component */
export default function TeamActivityClient() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [loading, setLoading] = useState(true);

  // Slide-out panel state
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [detail, setDetail] = useState<EmployeeDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Work log form state
  const [logDescription, setLogDescription] = useState("");
  const [logType, setLogType] = useState<"TASK" | "CALL" | "MEETING" | "NOTE">("TASK");
  const [logSubmitting, setLogSubmitting] = useState(false);
  const [logSuccess, setLogSuccess] = useState(false);

  // Panel active tab
  const [panelTab, setPanelTab] = useState<"today" | "history" | "logs">("today");

  const fetchTeam = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/work-session/team");
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members ?? data.team ?? []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeam();
    const interval = setInterval(fetchTeam, 30_000);
    return () => clearInterval(interval);
  }, [fetchTeam]);

  // Fetch employee detail when selected
  const fetchEmployeeDetail = useCallback(async (employeeId: string) => {
    setDetailLoading(true);
    setDetail(null);
    try {
      const res = await fetch(`/api/admin/work-session/${employeeId}?days=7`);
      if (res.ok) {
        const data = await res.json();
        setDetail(data);
      }
    } catch {
      // silent
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleMemberClick = (memberId: string) => {
    if (selectedMemberId === memberId) {
      setSelectedMemberId(null);
      setDetail(null);
      return;
    }
    setSelectedMemberId(memberId);
    setPanelTab("today");
    setLogDescription("");
    setLogType("TASK");
    setLogSuccess(false);
    fetchEmployeeDetail(memberId);
  };

  const closePanel = () => {
    setSelectedMemberId(null);
    setDetail(null);
  };

  const handleSubmitLog = async () => {
    if (!selectedMemberId || !logDescription.trim() || logSubmitting) return;
    setLogSubmitting(true);
    setLogSuccess(false);
    try {
      const res = await fetch(`/api/admin/work-session/${selectedMemberId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: logDescription.trim(), type: logType }),
      });
      if (res.ok) {
        setLogDescription("");
        setLogSuccess(true);
        // Refresh detail to show new entry
        fetchEmployeeDetail(selectedMemberId);
        setTimeout(() => setLogSuccess(false), 3000);
      }
    } catch {
      // silent
    } finally {
      setLogSubmitting(false);
    }
  };

  /* ── Filter ── */
  const filtered =
    filter === "ALL" ? members : members.filter((m) => m.status === filter);

  /* ── Summary counts ── */
  const counts = {
    ACTIVE: members.filter((m) => m.status === "ACTIVE").length,
    BREAK: members.filter((m) => m.status === "BREAK").length,
    IDLE: members.filter((m) => m.status === "IDLE").length,
    OFFLINE: members.filter((m) => m.status === "OFFLINE").length,
  };

  /* ═══════════════════════════════════════════ RENDER ═══ */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Team Activity</h1>
        <p className="text-sm text-text-muted mt-1">
          Real-time overview of team work sessions
        </p>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(
          [
            {
              key: "ACTIVE",
              icon: <Wifi size={18} />,
              label: "Active",
              color: "text-green-400",
              bg: "bg-green-500/10",
            },
            {
              key: "BREAK",
              icon: <Coffee size={18} />,
              label: "On Break",
              color: "text-yellow-400",
              bg: "bg-yellow-500/10",
            },
            {
              key: "IDLE",
              icon: <AlertTriangle size={18} />,
              label: "Idle",
              color: "text-red-400",
              bg: "bg-red-500/10",
            },
            {
              key: "OFFLINE",
              icon: <WifiOff size={18} />,
              label: "Offline",
              color: "text-text-muted",
              bg: "bg-white/[0.04]",
            },
          ] as const
        ).map((item) => (
          <div
            key={item.key}
            className="glass-card rounded-xl p-4 border border-white/[0.06]"
          >
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${item.bg}`}>
                <span className={item.color}>{item.icon}</span>
              </div>
              <span className={`text-2xl font-bold ${item.color}`}>
                {counts[item.key]}
              </span>
            </div>
            <p className="text-xs text-text-muted mt-2">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2">
        <Filter size={14} className="text-text-muted" />
        {(["ALL", "ACTIVE", "BREAK", "IDLE", "OFFLINE"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === f
                ? "bg-neon-blue/20 text-neon-blue"
                : "bg-white/[0.03] text-text-muted hover:bg-white/[0.06]"
            }`}
          >
            {f === "ALL" ? "All" : STATUS_CONFIG[f].label}
            {f !== "ALL" && (
              <span className="ml-1 opacity-70">({counts[f]})</span>
            )}
          </button>
        ))}
      </div>

      {/* Team grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="glass-card rounded-xl p-5 border border-white/[0.06] animate-pulse h-40"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-xl p-8 border border-white/[0.06] text-center">
          <Users size={32} className="text-text-muted mx-auto mb-3" />
          <p className="text-text-muted text-sm">
            No team members match this filter
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((member) => {
            const cfg = STATUS_CONFIG[member.status];
            const isSelected = selectedMemberId === member.id;
            return (
              <div
                key={member.id}
                onClick={() => handleMemberClick(member.id)}
                className={`glass-card rounded-xl p-5 border transition-all cursor-pointer ${
                  isSelected
                    ? "border-neon-blue/30 ring-1 ring-neon-blue/20"
                    : "border-white/[0.06] hover:border-white/[0.12]"
                }`}
              >
                {/* Top: Avatar + Name + Status */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative">
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-neon-blue/20 flex items-center justify-center text-xs font-semibold text-neon-blue">
                          {getInitials(member.name)}
                        </div>
                      )}
                      {/* Status dot */}
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${cfg.dot} border-2 border-[#111921]`}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {member.name}
                      </p>
                      <p className="text-[11px] text-text-muted">
                        {member.role}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status badge */}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.bg} ${cfg.text}`}
                    >
                      {cfg.emoji} {cfg.label}
                    </span>
                    <ChevronRight
                      size={14}
                      className={`text-text-muted transition-transform ${
                        isSelected ? "rotate-90" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Info rows */}
                {member.status !== "OFFLINE" && (
                  <div className="space-y-2 text-xs">
                    {/* Location + Check-in */}
                    <div className="flex items-center justify-between">
                      {member.location && (
                        <span className="flex items-center gap-1 text-text-muted">
                          {LOCATION_CONFIG[member.location].icon}
                          {LOCATION_CONFIG[member.location].label}
                        </span>
                      )}
                      {member.checkInTime && (
                        <span className="flex items-center gap-1 text-text-muted">
                          <Clock size={11} />
                          In at {formatTime(member.checkInTime)}
                        </span>
                      )}
                    </div>

                    {/* Active time + Breaks */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                      <span className="text-text-muted">
                        Active:{" "}
                        <span className="text-green-400 font-medium">
                          {formatDuration(member.activeSeconds)}
                        </span>
                      </span>
                      <span className="text-text-muted">
                        Breaks:{" "}
                        <span className="text-yellow-400 font-medium">
                          {formatDuration(member.totalBreakSeconds)}
                        </span>{" "}
                        ({member.breakCount})
                      </span>
                    </div>

                    {/* Idle warning */}
                    {member.status === "IDLE" && member.idleMinutes >= 20 && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-[11px] font-medium mt-1">
                        <AlertTriangle size={12} />
                        Idle for {member.idleMinutes} minutes
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════════ Employee Detail Slide-Out Panel ═══════════ */}
      {selectedMemberId && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closePanel}
          />

          {/* Panel */}
          <div className="relative w-full max-w-2xl bg-[#0a0a14] border-l border-white/[0.06] overflow-y-auto animate-in slide-in-from-right duration-200">
            {detailLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-pulse text-text-muted text-sm">
                  Loading employee details...
                </div>
              </div>
            ) : detail ? (
              <div className="p-6 space-y-6">
                {/* Panel header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {detail.employee.avatar ? (
                      <img
                        src={detail.employee.avatar}
                        alt={detail.employee.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-neon-blue/20 flex items-center justify-center text-sm font-semibold text-neon-blue">
                        {getInitials(detail.employee.name)}
                      </div>
                    )}
                    <div>
                      <h2 className="text-lg font-bold text-text-primary">
                        {detail.employee.name}
                      </h2>
                      <p className="text-xs text-text-muted">
                        {detail.employee.role} &middot; {detail.employee.email}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            STATUS_CONFIG[detail.employee.currentStatus]?.bg || "bg-white/[0.04]"
                          } ${STATUS_CONFIG[detail.employee.currentStatus]?.text || "text-text-muted"}`}
                        >
                          {STATUS_CONFIG[detail.employee.currentStatus]?.emoji || ""}{" "}
                          {STATUS_CONFIG[detail.employee.currentStatus]?.label || detail.employee.currentStatus}
                        </span>
                        {detail.employee.workLocation && (
                          <span className="flex items-center gap-1 text-[10px] text-text-muted">
                            {LOCATION_CONFIG[detail.employee.workLocation]?.icon}
                            {LOCATION_CONFIG[detail.employee.workLocation]?.label}
                          </span>
                        )}
                        {detail.employee.checkInTime && (
                          <span className="text-[10px] text-text-muted">
                            In at {formatTime(detail.employee.checkInTime)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={closePanel}
                    className="p-2 rounded-lg hover:bg-white/[0.06] text-text-muted hover:text-text-primary transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Today stats grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="glass-card rounded-lg p-3 border border-white/[0.06] text-center">
                    <p className="text-lg font-bold text-green-400">
                      {formatDuration(detail.stats.totalActiveSeconds)}
                    </p>
                    <p className="text-[10px] text-text-muted mt-1">Active Time</p>
                  </div>
                  <div className="glass-card rounded-lg p-3 border border-white/[0.06] text-center">
                    <p className="text-lg font-bold text-yellow-400">
                      {formatDuration(detail.stats.totalBreakSeconds)}
                    </p>
                    <p className="text-[10px] text-text-muted mt-1">
                      Break ({detail.stats.breakCount})
                    </p>
                  </div>
                  <div className="glass-card rounded-lg p-3 border border-white/[0.06] text-center">
                    <p className="text-lg font-bold text-red-400">
                      {formatDuration(detail.stats.totalIdleSeconds)}
                    </p>
                    <p className="text-[10px] text-text-muted mt-1">Idle Time</p>
                  </div>
                </div>

                {/* Activity stats row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="glass-card rounded-lg p-3 border border-white/[0.06] text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <Phone size={12} className="text-neon-blue" />
                    </div>
                    <p className="text-lg font-bold text-neon-blue">
                      {detail.stats.totalCallsMade}
                    </p>
                    <p className="text-[10px] text-text-muted">Calls Made</p>
                  </div>
                  <div className="glass-card rounded-lg p-3 border border-white/[0.06] text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <Users size={12} className="text-neon-green" />
                    </div>
                    <p className="text-lg font-bold text-neon-green">
                      {detail.stats.uniqueLeadsContacted}
                    </p>
                    <p className="text-[10px] text-text-muted">Leads Contacted</p>
                  </div>
                  <div className="glass-card rounded-lg p-3 border border-white/[0.06] text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <MessageSquare size={12} className="text-purple-400" />
                    </div>
                    <p className="text-lg font-bold text-purple-400">
                      {detail.stats.totalNotesAdded}
                    </p>
                    <p className="text-[10px] text-text-muted">Notes Added</p>
                  </div>
                </div>

                {/* Tab switcher */}
                <div className="flex gap-1 bg-white/[0.03] rounded-lg p-1">
                  {(
                    [
                      { key: "today", label: "Today", icon: <Clock size={13} /> },
                      { key: "history", label: "Past 7 Days", icon: <CalendarDays size={13} /> },
                      { key: "logs", label: "Work Logs", icon: <FileText size={13} /> },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setPanelTab(tab.key)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                        panelTab === tab.key
                          ? "bg-neon-blue/20 text-neon-blue"
                          : "text-text-muted hover:text-text-primary hover:bg-white/[0.04]"
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* ──── TAB: Today ──── */}
                {panelTab === "today" && (
                  <div className="space-y-6">
                    {/* Work Timeline */}
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                        <Clock size={14} className="text-neon-blue" />
                        Work Timeline (Today)
                      </h3>
                      {detail.timeline.length === 0 ? (
                        <p className="text-xs text-text-muted text-center py-4">
                          No activity recorded today
                        </p>
                      ) : (
                        <div className="space-y-1">
                          {detail.timeline.map((entry, i) => {
                            const cfg = TIMELINE_CONFIG[entry.type] || {
                              icon: <Activity size={12} />,
                              color: "text-text-muted",
                              label: entry.type,
                            };
                            return (
                              <div
                                key={i}
                                className="flex items-start gap-3 py-2 px-3 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                              >
                                <div className={`mt-0.5 ${cfg.color}`}>
                                  {cfg.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <span className={`text-xs font-medium ${cfg.color}`}>
                                      {cfg.label}
                                    </span>
                                    <span className="text-[10px] text-text-muted">
                                      {formatTime(entry.startedAt)}
                                      {entry.endedAt && ` - ${formatTime(entry.endedAt)}`}
                                    </span>
                                  </div>
                                  {entry.durationMin > 0 && (
                                    <span className="text-[10px] text-text-muted">
                                      {entry.durationMin}m
                                    </span>
                                  )}
                                  {(entry.description || entry.reason) && (
                                    <p className="text-[11px] text-text-muted mt-0.5 truncate">
                                      {entry.description || entry.reason}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Lead Interactions */}
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                        <FileText size={14} className="text-neon-green" />
                        Lead Interactions (Today)
                      </h3>
                      {detail.leadInteractions.length === 0 ? (
                        <p className="text-xs text-text-muted text-center py-4">
                          No lead interactions today
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {detail.leadInteractions.map((interaction) => (
                            <Link
                              key={interaction.id}
                              href={`/admin/leads/${interaction.leadId}`}
                              className="block p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-text-primary">
                                  {interaction.leadName}
                                </span>
                                <span className="text-[10px] text-text-muted">
                                  {formatTime(interaction.createdAt)}
                                </span>
                              </div>
                              <p className="text-[11px] text-text-muted line-clamp-2">
                                {interaction.content}
                              </p>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ──── TAB: Past 7 Days ──── */}
                {panelTab === "history" && (
                  <div className="space-y-5">
                    {/* Total stats summary */}
                    {detail.totalStats && (
                      <div className="grid grid-cols-3 gap-3">
                        <div className="glass-card rounded-lg p-3 border border-white/[0.06] text-center">
                          <p className="text-lg font-bold text-neon-blue">
                            {detail.totalStats.avgHoursPerDay}h
                          </p>
                          <p className="text-[10px] text-text-muted mt-1">Avg Hours/Day</p>
                        </div>
                        <div className="glass-card rounded-lg p-3 border border-white/[0.06] text-center">
                          <p className="text-lg font-bold text-neon-green">
                            {detail.totalStats.totalDaysWorked}
                          </p>
                          <p className="text-[10px] text-text-muted mt-1">Days Worked</p>
                        </div>
                        <div className="glass-card rounded-lg p-3 border border-white/[0.06] text-center">
                          <p className="text-lg font-bold text-purple-400">
                            {detail.totalStats.onTimeRate}%
                          </p>
                          <p className="text-[10px] text-text-muted mt-1">On-Time Rate</p>
                        </div>
                      </div>
                    )}

                    {/* Per-day table */}
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                        <CalendarDays size={14} className="text-neon-blue" />
                        Daily Summary (Past {detail.totalStats?.rangeDays || 7} Days)
                      </h3>
                      {(!detail.daySummary || detail.daySummary.length === 0) ? (
                        <p className="text-xs text-text-muted text-center py-4">
                          No work history found for this period
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-white/[0.06]">
                                <th className="text-left py-2 px-2 text-text-muted font-medium">Date</th>
                                <th className="text-left py-2 px-2 text-text-muted font-medium">Check In</th>
                                <th className="text-left py-2 px-2 text-text-muted font-medium">Check Out</th>
                                <th className="text-right py-2 px-2 text-text-muted font-medium">Active</th>
                                <th className="text-right py-2 px-2 text-text-muted font-medium">Break</th>
                                <th className="text-left py-2 px-2 text-text-muted font-medium">Location</th>
                              </tr>
                            </thead>
                            <tbody>
                              {detail.daySummary.map((day) => (
                                <tr
                                  key={day.date}
                                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                                >
                                  <td className="py-2.5 px-2 text-text-primary font-medium">
                                    {formatDate(day.date)}
                                  </td>
                                  <td className="py-2.5 px-2 text-text-muted">
                                    {day.checkIn ? formatTime(day.checkIn) : "-"}
                                  </td>
                                  <td className="py-2.5 px-2 text-text-muted">
                                    {day.checkOut ? formatTime(day.checkOut) : (
                                      <span className="text-green-400 text-[10px] font-medium">Active</span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-2 text-right text-green-400 font-medium">
                                    {formatMinutes(day.activeMin)}
                                  </td>
                                  <td className="py-2.5 px-2 text-right text-yellow-400">
                                    {formatMinutes(day.breakMin)}
                                  </td>
                                  <td className="py-2.5 px-2">
                                    {day.location ? (
                                      <span className="flex items-center gap-1 text-text-muted">
                                        {LOCATION_CONFIG[day.location]?.icon}
                                        {LOCATION_CONFIG[day.location]?.label || day.location}
                                      </span>
                                    ) : (
                                      <span className="text-text-muted">-</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ──── TAB: Work Logs ──── */}
                {panelTab === "logs" && (
                  <div className="space-y-5">
                    {/* Add Work Log form */}
                    <div className="glass-card rounded-xl p-4 border border-white/[0.06]">
                      <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                        <Plus size={14} className="text-neon-blue" />
                        Add Work Log
                      </h3>
                      <div className="space-y-3">
                        {/* Type selector */}
                        <div className="flex gap-2">
                          {(["TASK", "CALL", "MEETING", "NOTE"] as const).map((t) => {
                            const cfg = LOG_TYPE_CONFIG[t];
                            return (
                              <button
                                key={t}
                                onClick={() => setLogType(t)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                  logType === t
                                    ? `bg-white/[0.08] ${cfg.color} border border-white/[0.12]`
                                    : "bg-white/[0.03] text-text-muted hover:bg-white/[0.06] border border-transparent"
                                }`}
                              >
                                {cfg.icon}
                                {cfg.label}
                              </button>
                            );
                          })}
                        </div>
                        {/* Description textarea */}
                        <textarea
                          value={logDescription}
                          onChange={(e) => setLogDescription(e.target.value)}
                          placeholder="Describe the work activity..."
                          rows={3}
                          className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-neon-blue/40 focus:ring-1 focus:ring-neon-blue/20 resize-none transition-all"
                        />
                        {/* Submit */}
                        <div className="flex items-center justify-between">
                          {logSuccess && (
                            <span className="flex items-center gap-1.5 text-green-400 text-xs">
                              <CheckCircle2 size={13} />
                              Log added successfully
                            </span>
                          )}
                          {!logSuccess && <span />}
                          <button
                            onClick={handleSubmitLog}
                            disabled={logSubmitting || !logDescription.trim()}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-blue/20 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-medium"
                          >
                            <Send size={13} />
                            {logSubmitting ? "Submitting..." : "Add Log"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Existing work logs */}
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                        <BarChart3 size={14} className="text-neon-green" />
                        Logged Activities
                        {detail.workLogs && detail.workLogs.length > 0 && (
                          <span className="text-[10px] text-text-muted font-normal ml-1">
                            ({detail.workLogs.length})
                          </span>
                        )}
                      </h3>
                      {(!detail.workLogs || detail.workLogs.length === 0) ? (
                        <p className="text-xs text-text-muted text-center py-4">
                          No work logs recorded yet
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {detail.workLogs.map((log) => {
                            const { logType: lt, text } = parseLogType(log.description);
                            const ltCfg = LOG_TYPE_CONFIG[lt] || LOG_TYPE_CONFIG.TASK;
                            return (
                              <div
                                key={log.id}
                                className="flex items-start gap-3 py-2.5 px-3 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                              >
                                <div className={`mt-0.5 ${ltCfg.color}`}>
                                  {ltCfg.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-0.5">
                                    <span className={`text-[10px] font-medium ${ltCfg.color} uppercase`}>
                                      {ltCfg.label}
                                    </span>
                                    <span className="text-[10px] text-text-muted">
                                      {formatTime(log.startedAt)}
                                      {" "}&middot;{" "}
                                      {formatDate(log.startedAt.slice(0, 10))}
                                    </span>
                                  </div>
                                  <p className="text-xs text-text-primary">
                                    {text}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Quick link */}
                <div className="pt-2">
                  <Link
                    href={`/admin/employees/${detail.employee.userId}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20 transition-colors text-xs font-medium w-full justify-center"
                  >
                    <User size={14} />
                    View Full Profile
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-text-muted text-sm">
                  Failed to load employee details
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
