"use client";

import { useState, useEffect, useCallback } from "react";
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

/* ────────────────────────────────────────────── Helpers */
function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
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

/* ────────────────────────────────────────────── Component */
export default function TeamActivityClient() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [loading, setLoading] = useState(true);

  const fetchTeam = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/work-session/team");
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members ?? []);
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
            return (
              <div
                key={member.id}
                className="glass-card rounded-xl p-5 border border-white/[0.06] hover:border-white/[0.12] transition-colors"
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

                  {/* Status badge */}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.bg} ${cfg.text}`}
                  >
                    {cfg.emoji} {cfg.label}
                  </span>
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
    </div>
  );
}
