"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Target, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Clock, Users, Loader2 } from "lucide-react";

interface TargetSummary {
  monthName: string;
  totalTarget: number;
  hardTarget: number;
  totalAchieved: number;
  totalLeadsGenerated: number;
  rollover: number;
  hardTargetMet: boolean;
  fullTargetMet: boolean;
  hardTargetShortfall: number;
  daysRemaining: number;
  dailyRunRate: number;
  projectedTotal: number;
  progressPercent: number;
  hardTargetPercent: number;
  employeeBreakdown: { name: string; role: string; achieved: number; leads: number }[];
}

export function TeamTargetWidget() {
  const pathname = usePathname();
  const isDashboard = pathname === "/admin/dashboard" || pathname === "/admin";
  const [data, setData] = useState<TargetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch("/api/admin/team-targets")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="glass-card p-4 animate-pulse">
        <div className="flex items-center gap-3">
          <Loader2 size={16} className="animate-spin text-text-muted" />
          <span className="text-xs text-text-muted">Loading targets...</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const isOnTrack = data.projectedTotal >= data.hardTarget;
  const isCritical = data.hardTargetPercent < 50 && data.daysRemaining < 15;

  // Compact mode for non-dashboard pages
  if (!isDashboard) {
    return (
      <div className={`flex items-center justify-between px-4 py-2 mb-4 rounded-lg border text-xs ${
        data.fullTargetMet ? "border-neon-green/20 bg-neon-green/[0.02]"
        : isCritical ? "border-red-500/20 bg-red-500/[0.02]"
        : "border-white/[0.06] bg-white/[0.01]"
      }`}>
        <div className="flex items-center gap-3">
          <Target size={14} className={data.fullTargetMet ? "text-neon-green" : isCritical ? "text-red-400" : "text-neon-blue"} />
          <span className="text-text-muted">
            Target: <span className={`font-semibold ${data.fullTargetMet ? "text-neon-green" : isCritical ? "text-red-400" : "text-text-primary"}`}>{data.totalAchieved}/{data.totalTarget}</span>
            {" · "}Hard: {data.totalAchieved}/{data.hardTarget}
            {!data.hardTargetMet && ` (${data.hardTargetShortfall} needed)`}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-text-muted">{data.daysRemaining}d left</span>
          <div className="w-20 h-1.5 bg-dark-primary rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{
              width: `${Math.min(data.hardTargetPercent, 100)}%`,
              background: data.hardTargetMet ? "#7BC142" : data.hardTargetPercent >= 75 ? "#F59E0B" : "#EF4444",
            }} />
          </div>
          {isCritical && <AlertTriangle size={12} className="text-red-400" />}
        </div>
      </div>
    );
  }

  return (
    <div className={`glass-card p-4 mb-6 border ${
      data.fullTargetMet
        ? "border-neon-green/20"
        : data.hardTargetMet
        ? "border-neon-blue/20"
        : isCritical
        ? "border-red-500/30 bg-red-500/[0.02]"
        : "border-yellow-500/20"
    }`}>
      {/* Header */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            data.fullTargetMet
              ? "bg-neon-green/10"
              : data.hardTargetMet
              ? "bg-neon-blue/10"
              : isCritical
              ? "bg-red-500/10"
              : "bg-yellow-500/10"
          }`}>
            <Target size={20} className={
              data.fullTargetMet
                ? "text-neon-green"
                : data.hardTargetMet
                ? "text-neon-blue"
                : isCritical
                ? "text-red-400"
                : "text-yellow-400"
            } />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-text-primary">
                Monthly Target — {data.monthName}
              </h3>
              {data.rollover > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                  +{data.rollover} rollover
                </span>
              )}
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              {data.totalAchieved} of {data.totalTarget} enrollments
              {" · "}
              Hard target: {data.totalAchieved}/{data.hardTarget}
              {data.hardTargetMet ? " ✓" : ` (${data.hardTargetShortfall} more needed)`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Big number */}
          <div className="text-right">
            <p className={`text-2xl font-bold ${
              data.fullTargetMet
                ? "text-neon-green"
                : data.hardTargetMet
                ? "text-neon-blue"
                : isCritical
                ? "text-red-400"
                : "text-yellow-400"
            }`}>
              {data.totalAchieved}
              <span className="text-sm text-text-muted font-normal">/{data.totalTarget}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="mt-3 space-y-2">
        {/* Hard Target Bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-text-muted flex items-center gap-1">
              {data.hardTargetMet ? (
                <CheckCircle2 size={10} className="text-neon-green" />
              ) : (
                <AlertTriangle size={10} className="text-red-400" />
              )}
              Hard Target ({data.hardTarget})
            </span>
            <span className="text-[10px] text-text-muted">{data.hardTargetPercent}%</span>
          </div>
          <div className="h-2 bg-dark-primary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(data.hardTargetPercent, 100)}%`,
                background: data.hardTargetMet ? "#7BC142" : data.hardTargetPercent >= 75 ? "#F59E0B" : "#EF4444",
              }}
            />
          </div>
        </div>

        {/* Full Target Bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-text-muted flex items-center gap-1">
              <Target size={10} />
              Full Target ({data.totalTarget})
            </span>
            <span className="text-[10px] text-text-muted">{data.progressPercent}%</span>
          </div>
          <div className="h-1.5 bg-dark-primary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(data.progressPercent, 100)}%`,
                background: data.fullTargetMet ? "#7BC142" : "linear-gradient(90deg, #2891FF, #7BC142)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3 mt-3">
        <div className="text-center">
          <p className="text-lg font-bold text-text-primary">{data.daysRemaining}</p>
          <p className="text-[10px] text-text-muted flex items-center justify-center gap-1">
            <Clock size={9} /> Days Left
          </p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-text-primary">{data.dailyRunRate}</p>
          <p className="text-[10px] text-text-muted flex items-center justify-center gap-1">
            <TrendingUp size={9} /> Daily Rate
          </p>
        </div>
        <div className="text-center">
          <p className={`text-lg font-bold ${isOnTrack ? "text-neon-green" : "text-red-400"}`}>{data.projectedTotal}</p>
          <p className="text-[10px] text-text-muted flex items-center justify-center gap-1">
            {isOnTrack ? <TrendingUp size={9} /> : <TrendingDown size={9} />} Projected
          </p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-text-primary">{data.totalLeadsGenerated}</p>
          <p className="text-[10px] text-text-muted flex items-center justify-center gap-1">
            <Users size={9} /> Leads
          </p>
        </div>
      </div>

      {/* Warning Banner */}
      {!data.hardTargetMet && isCritical && (
        <div className="mt-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
          <AlertTriangle size={14} className="text-red-400 shrink-0" />
          <p className="text-xs text-red-300">
            Hard target at risk! {data.hardTargetShortfall} more enrollment{data.hardTargetShortfall !== 1 ? "s" : ""} needed
            with {data.daysRemaining} days remaining. Shortfall will roll over to next month.
          </p>
        </div>
      )}

      {data.rollover > 0 && (
        <div className="mt-2 p-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-2">
          <AlertTriangle size={14} className="text-yellow-400 shrink-0" />
          <p className="text-xs text-yellow-300">
            {data.rollover} enrollment{data.rollover !== 1 ? "s" : ""} rolled over from last month.
            This month&apos;s hard target is {data.hardTarget} (base {data.hardTarget - data.rollover} + {data.rollover} rollover).
          </p>
        </div>
      )}

      {/* Expanded: Employee Breakdown */}
      {expanded && data.employeeBreakdown.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/[0.06]">
          <p className="text-xs font-medium text-text-muted mb-2">Team Breakdown</p>
          <div className="space-y-1.5">
            {data.employeeBreakdown.map((emp) => (
              <div key={emp.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-primary">{emp.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-text-muted">{emp.role}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-text-secondary">{emp.achieved} sales</span>
                  <span className="text-[10px] text-text-muted">{emp.leads} leads</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
