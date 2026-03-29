"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus, ArrowDown } from "lucide-react";

interface FunnelData {
  funnel: {
    totalLeads: number;
    contacted: number;
    qualified: number;
    enrolled: number;
    lost: number;
    rates: {
      leadToContacted: number;
      contactedToQualified: number;
      qualifiedToEnrolled: number;
      overall: number;
    };
  };
  thisMonth: { totalLeads: number; contacted: number; qualified: number; enrolled: number };
  lastMonth: { totalLeads: number; contacted: number; qualified: number; enrolled: number };
  sourceBreakdown: {
    source: string;
    total: number;
    contacted: number;
    qualified: number;
    enrolled: number;
    conversionRate: number;
  }[];
}

function MonthComparison({
  label,
  thisMonth,
  lastMonth,
}: {
  label: string;
  thisMonth: number;
  lastMonth: number;
}) {
  const diff = thisMonth - lastMonth;
  const pct = lastMonth > 0 ? Math.round((diff / lastMonth) * 100) : thisMonth > 0 ? 100 : 0;

  return (
    <div className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
      <span className="text-sm text-text-secondary">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-text-primary">{thisMonth}</span>
        <span className="text-xs text-text-muted">vs {lastMonth}</span>
        {diff > 0 ? (
          <span className="flex items-center gap-0.5 text-xs text-green-400">
            <TrendingUp size={12} />+{pct}%
          </span>
        ) : diff < 0 ? (
          <span className="flex items-center gap-0.5 text-xs text-red-400">
            <TrendingDown size={12} />{pct}%
          </span>
        ) : (
          <span className="flex items-center gap-0.5 text-xs text-text-muted">
            <Minus size={12} />0%
          </span>
        )}
      </div>
    </div>
  );
}

export default function ConversionFunnel() {
  const [data, setData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard/funnel")
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="glass-card p-5 animate-pulse">
        <div className="h-6 bg-white/[0.06] rounded w-48 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-white/[0.04] rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { funnel, thisMonth, lastMonth, sourceBreakdown } = data;
  const maxWidth = 100;

  const stages = [
    {
      label: "Total Leads",
      count: funnel.totalLeads,
      width: maxWidth,
      color: "bg-blue-500",
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-400",
    },
    {
      label: "Contacted",
      count: funnel.contacted + funnel.qualified + funnel.enrolled,
      width: funnel.totalLeads > 0
        ? Math.max(20, ((funnel.contacted + funnel.qualified + funnel.enrolled) / funnel.totalLeads) * maxWidth)
        : 20,
      color: "bg-cyan-500",
      bgColor: "bg-cyan-500/10",
      textColor: "text-cyan-400",
      rate: funnel.rates.leadToContacted,
    },
    {
      label: "Qualified",
      count: funnel.qualified + funnel.enrolled,
      width: funnel.totalLeads > 0
        ? Math.max(15, ((funnel.qualified + funnel.enrolled) / funnel.totalLeads) * maxWidth)
        : 15,
      color: "bg-yellow-500",
      bgColor: "bg-yellow-500/10",
      textColor: "text-yellow-400",
      rate: funnel.rates.contactedToQualified,
    },
    {
      label: "Enrolled",
      count: funnel.enrolled,
      width: funnel.totalLeads > 0
        ? Math.max(10, (funnel.enrolled / funnel.totalLeads) * maxWidth)
        : 10,
      color: "bg-green-500",
      bgColor: "bg-green-500/10",
      textColor: "text-green-400",
      rate: funnel.rates.qualifiedToEnrolled,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Funnel Visualization */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-text-primary">Conversion Funnel</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Overall:</span>
            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
              {funnel.rates.overall}% conversion
            </span>
          </div>
        </div>

        <div className="space-y-1">
          {stages.map((stage, i) => (
            <div key={stage.label}>
              {/* Conversion rate arrow between stages */}
              {i > 0 && stage.rate !== undefined && (
                <div className="flex items-center justify-center gap-1.5 py-1">
                  <ArrowDown size={12} className="text-text-muted" />
                  <span className="text-xs font-medium text-text-muted">
                    {stage.rate}% conversion
                  </span>
                </div>
              )}
              <div className="flex items-center gap-4">
                <div className="w-24 shrink-0 text-right">
                  <p className={`text-sm font-medium ${stage.textColor}`}>{stage.label}</p>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div
                    className={`${stage.color} h-10 rounded-lg flex items-center justify-center transition-all duration-500 relative`}
                    style={{ width: `${stage.width}%` }}
                  >
                    <span className="text-sm font-bold text-white drop-shadow-sm">
                      {stage.count}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lost leads indicator */}
        {funnel.lost > 0 && (
          <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center gap-2">
            <span className="text-xs text-text-muted">Lost leads:</span>
            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400">
              {funnel.lost}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Comparison */}
        <div className="glass-card p-5">
          <h3 className="text-base font-semibold text-text-primary mb-4">This Month vs Last Month</h3>
          <div className="space-y-0">
            <MonthComparison label="Total Leads" thisMonth={thisMonth.totalLeads} lastMonth={lastMonth.totalLeads} />
            <MonthComparison label="Contacted" thisMonth={thisMonth.contacted} lastMonth={lastMonth.contacted} />
            <MonthComparison label="Qualified" thisMonth={thisMonth.qualified} lastMonth={lastMonth.qualified} />
            <MonthComparison label="Enrolled" thisMonth={thisMonth.enrolled} lastMonth={lastMonth.enrolled} />
          </div>
        </div>

        {/* Source Breakdown */}
        <div className="glass-card p-5">
          <h3 className="text-base font-semibold text-text-primary mb-4">Source Conversion Rates</h3>
          {sourceBreakdown.length === 0 ? (
            <p className="text-sm text-text-muted">No lead data available</p>
          ) : (
            <div className="space-y-3">
              {sourceBreakdown.slice(0, 8).map((src) => (
                <div key={src.source} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-text-secondary capitalize truncate">
                        {src.source.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs text-text-muted shrink-0 ml-2">
                        {src.enrolled}/{src.total} enrolled
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-neon-blue rounded-full transition-all duration-500"
                        style={{ width: `${src.conversionRate}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-medium text-neon-blue ml-3 shrink-0 w-10 text-right">
                    {src.conversionRate}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
