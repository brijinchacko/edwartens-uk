"use client";

import { useState, useEffect, useCallback } from "react";
import { Trophy, Loader2 } from "lucide-react";

/* ────────────────────────────────── Types */
interface LeaderboardEntry {
  employeeId: string;
  name: string;
  role: string;
  image?: string | null;
  score: number;
  totalActivities: number;
}

type Period = "daily" | "weekly" | "monthly";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-yellow-400";
  return "text-red-400";
}

const RANK_BORDERS: Record<number, string> = {
  1: "border-l-4 border-yellow-400",
  2: "border-l-4 border-gray-300",
  3: "border-l-4 border-amber-600",
};

const RANK_BADGE_BG: Record<number, string> = {
  1: "bg-yellow-400/20 text-yellow-300",
  2: "bg-gray-300/20 text-gray-300",
  3: "bg-amber-600/20 text-amber-400",
};

/* ────────────────────────────────── Component */
export default function Leaderboard() {
  const [period, setPeriod] = useState<Period>("daily");
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/kpi/leaderboard?period=${period}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.data ?? json ?? []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const periods: { value: Period; label: string }[] = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
  ];

  return (
    <div className="glass-card p-5 animate-slideUp">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-yellow-400" />
          <h3 className="text-sm font-semibold text-text-primary">Leaderboard</h3>
        </div>
        <div className="flex gap-1">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                period === p.value
                  ? "bg-neon-blue/20 text-neon-blue border border-neon-blue/30"
                  : "text-text-muted hover:text-text-secondary hover:bg-white/[0.04]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={20} className="animate-spin text-text-muted" />
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-12 text-text-muted text-sm">
          No data yet
        </div>
      ) : (
        <div className="space-y-1">
          {data.map((entry, idx) => {
            const rank = idx + 1;
            const borderClass = RANK_BORDERS[rank] ?? "";
            const badgeBg = RANK_BADGE_BG[rank] ?? "bg-white/[0.06] text-text-muted";

            return (
              <div
                key={entry.employeeId}
                className={`flex items-center gap-3 px-3 rounded-lg hover:bg-white/[0.03] transition-colors ${borderClass}`}
                style={{ height: 36 }}
              >
                {/* Rank */}
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${badgeBg}`}
                >
                  {rank}
                </span>

                {/* Avatar */}
                {entry.image ? (
                  <img
                    src={entry.image}
                    alt={entry.name}
                    className="w-6 h-6 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-neon-blue/20 flex items-center justify-center text-[9px] font-medium text-neon-blue shrink-0">
                    {getInitials(entry.name)}
                  </div>
                )}

                {/* Name + Role */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-primary truncate leading-tight">
                    {entry.name}
                  </p>
                  <p className="text-[10px] text-text-muted leading-tight">
                    {entry.role?.replace(/_/g, " ")}
                  </p>
                </div>

                {/* Score */}
                <span className={`text-xs font-semibold tabular-nums ${scoreColor(entry.score)}`}>
                  {entry.score}
                </span>

                {/* Activities */}
                <span className="text-[10px] text-text-muted tabular-nums w-10 text-right">
                  {entry.totalActivities} act
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
