"use client";

import { useState, useEffect } from "react";
import { Clock, TrendingUp, Coffee, AlertTriangle, CheckCircle, BarChart3 } from "lucide-react";

interface DayData {
  date: string;
  activeHours: number;
  breakHours: number;
  idleHours: number;
  checkIn: string | null;
  checkOut: string | null;
}

interface Totals {
  totalHours: number;
  avgHoursPerDay: number;
  totalBreakHours: number;
  totalIdleHours: number;
  daysWorked: number;
  onTimeRate: number;
}

interface WeeklySummary {
  days: DayData[];
  totals: Totals;
}

export default function WeeklySummaryCard() {
  const [data, setData] = useState<WeeklySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch("/api/admin/dashboard/weekly-summary");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-4 border border-white/[0.06] animate-pulse">
        <div className="h-5 bg-white/[0.04] rounded w-40 mb-4" />
        <div className="grid grid-cols-4 gap-3 mb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-white/[0.03] rounded-lg" />
          ))}
        </div>
        <div className="h-24 bg-white/[0.03] rounded-lg" />
      </div>
    );
  }

  if (!data || data.totals.daysWorked === 0) {
    return (
      <div className="glass-card rounded-xl p-4 border border-white/[0.06]">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 size={16} className="text-text-muted" />
          <h3 className="text-sm font-semibold text-text-primary">Weekly Summary</h3>
        </div>
        <p className="text-xs text-text-muted">No work sessions recorded in the past 7 days.</p>
      </div>
    );
  }

  const { days, totals } = data;
  const maxHours = Math.max(...days.map((d) => d.activeHours + d.breakHours + d.idleHours), 1);

  return (
    <div className="glass-card rounded-xl p-4 border border-white/[0.06]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} className="text-neon-blue" />
          <h3 className="text-sm font-semibold text-text-primary">Weekly Summary</h3>
        </div>
        <span className="text-[10px] text-text-muted">Last 7 days</span>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-white/[0.03] text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Clock size={12} className="text-neon-blue" />
            <p className="text-[10px] text-text-muted">Total Hours</p>
          </div>
          <p className="text-lg font-mono font-bold text-text-primary">{totals.totalHours}h</p>
        </div>
        <div className="p-3 rounded-lg bg-white/[0.03] text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp size={12} className="text-green-400" />
            <p className="text-[10px] text-text-muted">Avg/Day</p>
          </div>
          <p className="text-lg font-mono font-bold text-green-400">{totals.avgHoursPerDay}h</p>
        </div>
        <div className="p-3 rounded-lg bg-white/[0.03] text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Coffee size={12} className="text-yellow-400" />
            <p className="text-[10px] text-text-muted">Breaks</p>
          </div>
          <p className="text-lg font-mono font-bold text-yellow-400">{totals.totalBreakHours}h</p>
        </div>
        <div className="p-3 rounded-lg bg-white/[0.03] text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <CheckCircle size={12} className="text-emerald-400" />
            <p className="text-[10px] text-text-muted">On-Time</p>
          </div>
          <p className="text-lg font-mono font-bold text-emerald-400">{totals.onTimeRate}%</p>
        </div>
      </div>

      {/* Day-by-day bar chart */}
      <div className="flex items-end gap-1.5 h-24 mb-2">
        {days.map((day, i) => {
          const totalH = day.activeHours + day.breakHours + day.idleHours;
          const heightPct = totalH > 0 ? (totalH / maxHours) * 100 : 0;
          const activePct = totalH > 0 ? (day.activeHours / totalH) * 100 : 0;
          const breakPct = totalH > 0 ? (day.breakHours / totalH) * 100 : 0;

          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full">
              <div className="flex-1 w-full flex flex-col justify-end">
                {totalH > 0 ? (
                  <div
                    className="w-full rounded-t-sm overflow-hidden flex flex-col-reverse"
                    style={{ height: `${Math.max(heightPct, 8)}%` }}
                  >
                    <div
                      className="w-full bg-green-500/40"
                      style={{ height: `${activePct}%` }}
                    />
                    <div
                      className="w-full bg-yellow-500/40"
                      style={{ height: `${breakPct}%` }}
                    />
                    <div
                      className="w-full bg-red-500/30"
                      style={{ height: `${100 - activePct - breakPct}%` }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-[4px] bg-white/[0.04] rounded-t-sm" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Day labels */}
      <div className="flex gap-1.5">
        {days.map((day, i) => {
          const label = day.date.split(" ")[0]; // "Mon", "Tue" etc.
          const totalH = day.activeHours + day.breakHours + day.idleHours;
          return (
            <div key={i} className="flex-1 text-center">
              <p className={`text-[9px] ${totalH > 0 ? "text-text-secondary" : "text-text-muted"}`}>
                {label}
              </p>
              {totalH > 0 && (
                <p className="text-[9px] text-text-muted font-mono">{totalH.toFixed(1)}h</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3 text-[9px] text-text-muted">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-green-500/40" /> Active
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-yellow-500/40" /> Break
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-red-500/30" /> Idle
        </span>
      </div>

      {/* Additional info */}
      <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-text-muted">
        <span>Days worked: <span className="text-text-secondary font-medium">{totals.daysWorked}/7</span></span>
        <span>Idle: <span className="text-red-400 font-medium">{totals.totalIdleHours}h</span></span>
      </div>
    </div>
  );
}
