"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Loader2,
  Plus,
  ExternalLink,
  Calendar,
  Target,
} from "lucide-react";

interface ApplicationLog {
  id: string;
  platform: string;
  count: number;
  date: string;
  notes: string | null;
}

interface WeeklyShare {
  id: string;
  weekStarting: string;
  links: { url: string; title: string }[];
  sharedBy: string;
}

interface TrackerData {
  logs: ApplicationLog[];
  weeklyShares: WeeklyShare[];
  totals: {
    CV_LIBRARY: number;
    LINKEDIN: number;
    INDEED: number;
    OTHER: number;
  };
}

const TARGETS: Record<string, { label: string; target: number; color: string }> = {
  CV_LIBRARY: { label: "CV Library", target: 40, color: "bg-neon-blue" },
  LINKEDIN: { label: "LinkedIn", target: 20, color: "bg-purple" },
  INDEED: { label: "Indeed", target: 50, color: "bg-neon-green" },
};

const PLATFORMS = ["CV_LIBRARY", "LINKEDIN", "INDEED", "OTHER"];
const PLATFORM_LABELS: Record<string, string> = {
  CV_LIBRARY: "CV Library",
  LINKEDIN: "LinkedIn",
  INDEED: "Indeed",
  OTHER: "Other",
};

export default function JobTrackerPage() {
  const [data, setData] = useState<TrackerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [platform, setPlatform] = useState("CV_LIBRARY");
  const [count, setCount] = useState("1");
  const [notes, setNotes] = useState("");

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/student/job-applications");
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const countNum = parseInt(count, 10);
    if (!countNum || countNum < 1) {
      setError("Count must be at least 1");
      return;
    }

    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/student/job-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, count: countNum, notes: notes.trim() || null }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to log applications");
      }

      setSuccess("Applications logged successfully!");
      setCount("1");
      setNotes("");
      setShowForm(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-neon-blue" />
      </div>
    );
  }

  const totals = data?.totals || { CV_LIBRARY: 0, LINKEDIN: 0, INDEED: 0, OTHER: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">
            Job Application Tracker
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Track your job applications across platforms and meet your targets.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-neon-blue/10 text-neon-blue border border-neon-blue/20 rounded-lg text-sm font-medium hover:bg-neon-blue/20 transition-colors"
        >
          <Plus size={16} />
          Log Applications
        </button>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(TARGETS).map(([key, cfg]) => {
          const current = totals[key as keyof typeof totals] || 0;
          const pct = Math.min(Math.round((current / cfg.target) * 100), 100);
          return (
            <div key={key} className="glass-card p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-text-primary">
                  {cfg.label}
                </p>
                <span className="text-xs text-text-muted flex items-center gap-1">
                  <Target size={12} />
                  {current}/{cfg.target}
                </span>
              </div>
              <div className="h-2 bg-dark-primary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${cfg.color}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs text-text-muted mt-1">{pct}% complete</p>
            </div>
          );
        })}
      </div>

      {/* Log Form */}
      {showForm && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Plus size={16} className="text-neon-blue" />
            Log New Applications
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-text-muted mb-1.5">
                  Platform *
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-primary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-neon-blue/50"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {PLATFORM_LABELS[p]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1.5">
                  Number of Applications *
                </label>
                <input
                  type="number"
                  min="1"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-primary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-neon-blue/50"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1.5">
                Notes (optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Applied to automation engineer roles in London"
                className="w-full px-3 py-2 bg-dark-primary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-blue/50"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-neon-green/10 border border-neon-green/20 rounded-lg text-sm text-neon-green">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-neon-blue/10 text-neon-blue border border-neon-blue/20 rounded-lg text-sm font-medium hover:bg-neon-blue/20 transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              {submitting ? "Saving..." : "Log Applications"}
            </button>
          </form>
        </div>
      )}

      {/* Weekly Job Shares */}
      {data?.weeklyShares && data.weeklyShares.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Calendar size={16} className="text-purple" />
            Weekly Job Links from Staff
          </h3>
          <div className="space-y-3">
            {data.weeklyShares.map((share) => (
              <div key={share.id} className="p-3 bg-dark-primary/50 rounded-lg">
                <p className="text-xs text-text-muted mb-2">
                  Week of{" "}
                  {new Date(share.weekStarting).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    timeZone: "Europe/London",
                  })}
                </p>
                <div className="space-y-1">
                  {(share.links as { url: string; title: string }[]).map(
                    (link, i) => (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-neon-blue hover:underline inline-flex items-center gap-1"
                      >
                        {link.title || link.url}
                        <ExternalLink size={12} />
                      </a>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Application History */}
      {data?.logs && data.logs.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
            <BarChart size={16} className="text-neon-green" />
            Application History
          </h3>
          <div className="space-y-2">
            {data.logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 bg-dark-primary/50 rounded-lg"
              >
                <div>
                  <p className="text-sm text-text-primary">
                    {PLATFORM_LABELS[log.platform] || log.platform}
                  </p>
                  {log.notes && (
                    <p className="text-xs text-text-muted">{log.notes}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-text-primary">
                    {log.count} application{log.count !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-text-muted">
                    {new Date(log.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      timeZone: "Europe/London",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
