"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Monitor,
  Users,
  GraduationCap,
  Briefcase,
  Clock,
  Database,
  Server,
  ExternalLink,
  RefreshCw,
  Activity,
  HardDrive,
  Cpu,
  Globe,
  BarChart3,
} from "lucide-react";

interface MonitoringData {
  stats: {
    users: number;
    leads: number;
    students: number;
    employees: number;
    activeWorkSessions: number;
    uptime: string;
    serverTime: string;
    totalRows: number;
  };
  tables: { name: string; count: number }[];
  recentAudit: {
    id: string;
    userName: string;
    action: string;
    entity: string;
    entityName: string | null;
    details: string | null;
    createdAt: string;
  }[];
  system: {
    nodeVersion: string;
    platform: string;
    memoryUsage: {
      rss: number;
      heapUsed: number;
      heapTotal: number;
    };
    uptimeSeconds: number;
    pid: number;
  };
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: "text-emerald-400",
  UPDATE: "text-blue-400",
  DELETE: "text-red-400",
  LOGIN: "text-yellow-400",
  LOGOUT: "text-yellow-400",
  SEND_EMAIL: "text-purple-400",
  STATUS_CHANGE: "text-orange-400",
  CHECK_IN: "text-teal-400",
  CHECK_OUT: "text-teal-400",
};

const QUICK_LINKS = [
  {
    label: "Google Analytics",
    url: "https://analytics.google.com",
    icon: BarChart3,
    color: "text-orange-400",
  },
  {
    label: "Meta Business",
    url: "https://business.facebook.com",
    icon: Globe,
    color: "text-blue-400",
  },
  {
    label: "Server (SSH)",
    url: "ssh://72.62.230.223",
    icon: Server,
    color: "text-emerald-400",
    display: "72.62.230.223",
  },
  {
    label: "Stripe Dashboard",
    url: "https://dashboard.stripe.com",
    icon: HardDrive,
    color: "text-purple-400",
  },
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
  });
}

function formatUptime(seconds: number) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function MonitoringClient() {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [countdown, setCountdown] = useState(30);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/monitoring");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
      setError(null);
      setLastRefresh(new Date());
      setCountdown(30);
    } catch {
      setError("Failed to load monitoring data");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + auto-refresh every 30s
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 30 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastRefresh]);

  if (loading && !data) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <RefreshCw size={24} className="animate-spin mx-auto text-neon-blue" />
          <p className="text-sm text-text-muted">Loading monitoring data...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-6">
        <div className="glass-card rounded-xl p-8 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 text-sm rounded-lg bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const statCards = [
    {
      label: "Total Users",
      value: data.stats.users,
      icon: Users,
      color: "text-blue-400",
    },
    {
      label: "Total Leads",
      value: data.stats.leads,
      icon: Activity,
      color: "text-emerald-400",
    },
    {
      label: "Total Students",
      value: data.stats.students,
      icon: GraduationCap,
      color: "text-purple-400",
    },
    {
      label: "Active Sessions",
      value: data.stats.activeWorkSessions,
      icon: Briefcase,
      color: "text-yellow-400",
    },
    {
      label: "Server Uptime",
      value: formatUptime(data.system.uptimeSeconds),
      icon: Clock,
      color: "text-teal-400",
    },
    {
      label: "Database Rows",
      value: data.stats.totalRows.toLocaleString(),
      icon: Database,
      color: "text-orange-400",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Monitor className="text-neon-blue" size={24} />
          <div>
            <h1 className="text-xl font-bold text-text-primary">
              Site Monitoring
            </h1>
            <p className="text-sm text-text-muted">
              Super Admin Control Panel
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-muted tabular-nums">
            Refresh in {countdown}s
          </span>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg glass-card hover:bg-white/[0.04] transition-colors"
          >
            <RefreshCw size={12} />
            Refresh
          </button>
        </div>
      </div>

      {/* Section 1: Live Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="glass-card rounded-xl p-3 space-y-2"
            >
              <div className="flex items-center gap-2">
                <Icon size={14} className={card.color} />
                <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
                  {card.label}
                </span>
              </div>
              <p className="text-lg font-bold text-text-primary tabular-nums">
                {typeof card.value === "number"
                  ? card.value.toLocaleString()
                  : card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Section 2: Google Analytics */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-orange-400" />
            <h2 className="text-sm font-semibold text-text-primary">
              Google Analytics
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-muted font-mono">
              G-3NJTPRY5QX
            </span>
            <a
              href="https://analytics.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 transition-colors"
            >
              Open Google Analytics
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 3: Database Stats */}
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Database size={16} className="text-neon-blue" />
            <h2 className="text-sm font-semibold text-text-primary">
              Database Tables
            </h2>
          </div>
          <div className="space-y-1">
            {data.tables.map((table) => {
              const maxCount = Math.max(...data.tables.map((t) => t.count), 1);
              const pct = (table.count / maxCount) * 100;
              return (
                <div key={table.name} className="flex items-center gap-3">
                  <span className="text-xs text-text-muted w-24 shrink-0 truncate">
                    {table.name}
                  </span>
                  <div className="flex-1 h-4 bg-white/[0.03] rounded-sm overflow-hidden">
                    <div
                      className="h-full bg-neon-blue/30 rounded-sm transition-all duration-500"
                      style={{ width: `${Math.max(pct, 1)}%` }}
                    />
                  </div>
                  <span className="text-xs text-text-secondary tabular-nums w-16 text-right font-mono">
                    {table.count.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: Recent Audit Log */}
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={16} className="text-emerald-400" />
            <h2 className="text-sm font-semibold text-text-primary">
              Recent Audit Log
            </h2>
          </div>
          <div className="space-y-1">
            {data.recentAudit.length === 0 ? (
              <p className="text-xs text-text-muted py-4 text-center">
                No audit entries
              </p>
            ) : (
              data.recentAudit.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-2 py-1.5 border-b border-white/[0.03] last:border-0"
                >
                  <span className="text-[10px] text-text-muted whitespace-nowrap mt-0.5 tabular-nums">
                    {formatDate(entry.createdAt)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-text-primary font-medium">
                        {entry.userName}
                      </span>
                      <span
                        className={`text-[10px] font-mono ${
                          ACTION_COLORS[entry.action] || "text-text-muted"
                        }`}
                      >
                        {entry.action}
                      </span>
                      <span className="text-[10px] text-text-muted">
                        {entry.entity}
                      </span>
                    </div>
                    {entry.details && (
                      <p className="text-[10px] text-text-muted truncate">
                        {entry.details}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 5: System Info */}
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Cpu size={16} className="text-purple-400" />
            <h2 className="text-sm font-semibold text-text-primary">
              System Info
            </h2>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-text-muted">Node.js</span>
              <span className="text-text-primary font-mono">
                {data.system.nodeVersion}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Next.js</span>
              <span className="text-text-primary font-mono">16.2.1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Server Time (UK)</span>
              <span className="text-text-primary font-mono">
                {data.stats.serverTime}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Process ID</span>
              <span className="text-text-primary font-mono">
                {data.system.pid}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Platform</span>
              <span className="text-text-primary font-mono">
                {data.system.platform}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Memory (RSS)</span>
              <span className="text-text-primary font-mono">
                {data.system.memoryUsage.rss} MB
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Heap Used</span>
              <span className="text-text-primary font-mono">
                {data.system.memoryUsage.heapUsed} /{" "}
                {data.system.memoryUsage.heapTotal} MB
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Uptime</span>
              <span className="text-text-primary font-mono">
                {formatUptime(data.system.uptimeSeconds)}
              </span>
            </div>
            {/* Memory bar */}
            <div className="pt-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-text-muted">Memory Usage</span>
                <span className="text-text-secondary font-mono">
                  {Math.round(
                    (data.system.memoryUsage.heapUsed /
                      data.system.memoryUsage.heapTotal) *
                      100
                  )}
                  %
                </span>
              </div>
              <div className="h-2 bg-white/[0.03] rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500/50 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.round(
                      (data.system.memoryUsage.heapUsed /
                        data.system.memoryUsage.heapTotal) *
                        100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 6: Quick Links */}
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <ExternalLink size={16} className="text-yellow-400" />
            <h2 className="text-sm font-semibold text-text-primary">
              Quick Links
            </h2>
          </div>
          <div className="space-y-2">
            {QUICK_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors group"
                >
                  <Icon size={16} className={link.color} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text-primary">
                      {link.label}
                    </p>
                    <p className="text-[10px] text-text-muted font-mono truncate">
                      {link.display || link.url.replace("https://", "")}
                    </p>
                  </div>
                  <ExternalLink
                    size={12}
                    className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer status */}
      <div className="flex items-center justify-center gap-2 py-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[10px] text-text-muted">
          Last updated:{" "}
          {lastRefresh.toLocaleTimeString("en-GB", {
            timeZone: "Europe/London",
          })}
        </span>
      </div>
    </div>
  );
}
