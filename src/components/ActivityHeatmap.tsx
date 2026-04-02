"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Loader2 } from "lucide-react";

/* ────────────────────────────────── Types */
interface DayData {
  date: string; // YYYY-MM-DD
  activeHours: number;
  score: number;
}

interface ActivityHeatmapProps {
  employeeId?: string;
}

/* ────────────────────────────────── Helpers */
const DAYS_LABEL = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function getIntensityClass(hours: number): string {
  if (hours <= 0) return "fill-white/[0.04]";
  if (hours <= 2) return "fill-[#7BC142]/20";
  if (hours <= 4) return "fill-[#7BC142]/40";
  if (hours <= 6) return "fill-[#7BC142]/60";
  if (hours <= 8) return "fill-[#7BC142]/80";
  return "fill-[#7BC142]";
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* ────────────────────────────────── Component */
export default function ActivityHeatmap({ employeeId }: ActivityHeatmapProps) {
  const [data, setData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    date: string;
    hours: number;
    score: number;
  } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 83); // 84 days = 12 weeks

      const params = new URLSearchParams({
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        groupBy: "day",
      });
      if (employeeId) params.set("employeeId", employeeId);

      const res = await fetch(`/api/admin/kpi?${params}`);
      if (res.ok) {
        const json = await res.json();
        // Normalize: API may return different shapes
        const items = json.data ?? json ?? [];
        setData(
          items.map((d: Record<string, unknown>) => ({
            date: (d.date as string) ?? "",
            activeHours: Number(d.activeHours ?? d.active_hours ?? 0),
            score: Number(d.score ?? d.productivityScore ?? 0),
          }))
        );
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* Build the grid: 12 weeks x 7 days */
  const { grid, monthLabels } = useMemo(() => {
    const dataMap = new Map<string, DayData>();
    data.forEach((d) => dataMap.set(d.date, d));

    const today = new Date();
    // Find the start: 12 weeks ago, aligned to Monday
    const start = new Date(today);
    start.setDate(start.getDate() - 83);
    // Align to Monday (1=Mon)
    const dayOfWeek = start.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    start.setDate(start.getDate() + mondayOffset);

    const weeks: { date: Date; data: DayData | null }[][] = [];
    const labels: { label: string; col: number }[] = [];
    let lastMonth = -1;

    const cursor = new Date(start);
    for (let week = 0; week < 12; week++) {
      const weekDays: { date: Date; data: DayData | null }[] = [];
      for (let day = 0; day < 7; day++) {
        const key = formatDate(cursor);
        const entry = dataMap.get(key) ?? null;
        weekDays.push({ date: new Date(cursor), data: entry });

        if (day === 0 && cursor.getMonth() !== lastMonth) {
          labels.push({ label: MONTHS_SHORT[cursor.getMonth()], col: week });
          lastMonth = cursor.getMonth();
        }
        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push(weekDays);
    }

    return { grid: weeks, monthLabels: labels };
  }, [data]);

  const cellSize = 14;
  const cellGap = 3;
  const leftPad = 28;
  const topPad = 18;
  const svgW = leftPad + 12 * (cellSize + cellGap);
  const svgH = topPad + 7 * (cellSize + cellGap);

  if (loading) {
    return (
      <div className="glass-card p-5 animate-slideUp">
        <h3 className="text-sm font-semibold text-text-primary mb-4">
          Activity Heatmap
        </h3>
        <div className="flex items-center justify-center py-12">
          <Loader2 size={20} className="animate-spin text-text-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-5 animate-slideUp">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">
          Activity Heatmap
        </h3>
        {/* Legend */}
        <div className="flex items-center gap-1 text-[10px] text-text-muted">
          <span>Less</span>
          {[0, 2, 4, 6, 8, 9].map((h) => (
            <div
              key={h}
              className="w-3 h-3 rounded-[2px]"
              style={{
                backgroundColor:
                  h === 0
                    ? "rgba(255,255,255,0.04)"
                    : `rgba(146,224,44,${h <= 2 ? 0.2 : h <= 4 ? 0.4 : h <= 6 ? 0.6 : h <= 8 ? 0.8 : 1})`,
              }}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="relative overflow-x-auto">
        <svg
          width={svgW}
          height={svgH}
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="block"
        >
          {/* Month labels */}
          {monthLabels.map((m, i) => (
            <text
              key={i}
              x={leftPad + m.col * (cellSize + cellGap)}
              y={12}
              className="fill-text-muted"
              fontSize={10}
            >
              {m.label}
            </text>
          ))}

          {/* Day labels */}
          {DAYS_LABEL.map((d, i) =>
            i % 2 === 0 ? (
              <text
                key={d}
                x={0}
                y={topPad + i * (cellSize + cellGap) + cellSize - 2}
                className="fill-text-muted"
                fontSize={9}
              >
                {d}
              </text>
            ) : null
          )}

          {/* Cells */}
          {grid.map((week, wIdx) =>
            week.map((cell, dIdx) => {
              const x = leftPad + wIdx * (cellSize + cellGap);
              const y = topPad + dIdx * (cellSize + cellGap);
              const hours = cell.data?.activeHours ?? 0;
              const isFuture = cell.date > new Date();

              return (
                <rect
                  key={`${wIdx}-${dIdx}`}
                  x={x}
                  y={y}
                  width={cellSize}
                  height={cellSize}
                  rx={2}
                  className={
                    isFuture
                      ? "fill-transparent"
                      : getIntensityClass(hours)
                  }
                  style={{ cursor: isFuture ? "default" : "pointer" }}
                  onMouseEnter={(e) => {
                    if (isFuture) return;
                    const rect = (e.target as SVGRectElement).getBoundingClientRect();
                    setTooltip({
                      x: rect.left + rect.width / 2,
                      y: rect.top - 8,
                      date: formatDate(cell.date),
                      hours,
                      score: cell.data?.score ?? 0,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })
          )}
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed z-50 px-2.5 py-1.5 rounded-lg bg-[#0c1018] border border-white/[0.1] shadow-xl text-[11px] pointer-events-none"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: "translate(-50%, -100%)",
            }}
          >
            <p className="text-text-primary font-medium">{tooltip.date}</p>
            <p className="text-text-muted">
              {tooltip.hours.toFixed(1)}h active | Score: {tooltip.score}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
