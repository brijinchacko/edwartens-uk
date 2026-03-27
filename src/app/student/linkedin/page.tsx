"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Globe,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Send,
} from "lucide-react";

interface LinkedInData {
  id: string | null;
  profileUrl: string | null;
  isVerified: boolean;
  feedback: string | null;
  status: "NOT_SUBMITTED" | "PENDING" | "VERIFIED" | "REJECTED";
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  NOT_SUBMITTED: { label: "Not Submitted", color: "text-text-muted", bg: "bg-dark-tertiary", icon: Clock },
  PENDING: { label: "Pending Verification", color: "text-yellow-400", bg: "bg-yellow-500/10", icon: Clock },
  VERIFIED: { label: "Verified", color: "text-neon-green", bg: "bg-neon-green/10", icon: CheckCircle2 },
  REJECTED: { label: "Needs Changes", color: "text-red-400", bg: "bg-red-500/10", icon: XCircle },
};

export default function LinkedInPage() {
  const [data, setData] = useState<LinkedInData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileUrl, setProfileUrl] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/student/linkedin");
      if (res.ok) {
        const d = await res.json();
        setData(d);
        setProfileUrl(d.profileUrl || "");
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
    if (!profileUrl.trim()) {
      setError("LinkedIn profile URL is required");
      return;
    }

    if (!profileUrl.includes("linkedin.com/in/")) {
      setError("Please enter a valid LinkedIn profile URL (e.g., https://www.linkedin.com/in/your-name)");
      return;
    }

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const res = await fetch("/api/student/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileUrl: profileUrl.trim() }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to save");
      }

      setSuccess("LinkedIn profile submitted for verification!");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-neon-blue" />
      </div>
    );
  }

  const status = data?.status || "NOT_SUBMITTED";
  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.NOT_SUBMITTED;
  const StatusIcon = statusCfg.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-text-primary">
          LinkedIn Profile
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Submit your LinkedIn profile URL for verification. A verified LinkedIn
          profile is required for career support.
        </p>
      </div>

      {/* Status Card */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Globe size={16} className="text-neon-blue" />
            Verification Status
          </h3>
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded ${statusCfg.color} ${statusCfg.bg}`}>
            <StatusIcon size={12} />
            {statusCfg.label}
          </span>
        </div>

        {data?.profileUrl && data.isVerified && (
          <div className="mt-3 p-3 bg-neon-green/5 border border-neon-green/10 rounded-lg">
            <a
              href={data.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-neon-blue hover:underline inline-flex items-center gap-1"
            >
              {data.profileUrl}
              <ExternalLink size={12} />
            </a>
          </div>
        )}

        {data?.feedback && (
          <div className="mt-3 p-3 bg-dark-primary/50 rounded-lg">
            <p className="text-xs text-text-muted">Feedback from verifier:</p>
            <p className="text-sm text-text-secondary mt-1">{data.feedback}</p>
          </div>
        )}
      </div>

      {/* Submit/Update Form */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">
          {data?.profileUrl ? "Update LinkedIn Profile URL" : "Submit LinkedIn Profile URL"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-text-muted mb-1.5">
              LinkedIn Profile URL *
            </label>
            <input
              type="url"
              value={profileUrl}
              onChange={(e) => setProfileUrl(e.target.value)}
              placeholder="https://www.linkedin.com/in/your-name"
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
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-neon-blue/10 text-neon-blue border border-neon-blue/20 rounded-lg text-sm font-medium hover:bg-neon-blue/20 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            {saving ? "Saving..." : data?.profileUrl ? "Update Profile" : "Submit Profile"}
          </button>
        </form>
      </div>

      {/* Tips */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-3">
          LinkedIn Profile Tips
        </h3>
        <ul className="space-y-2 text-xs text-text-secondary">
          <li>- Use a professional headshot as your profile photo</li>
          <li>- Write a compelling headline mentioning your automation/AI skills</li>
          <li>- Add your EDWartens training under Education</li>
          <li>- List relevant technical skills (PLC, SCADA, Python, etc.)</li>
          <li>- Request recommendations from trainers and peers</li>
          <li>- Set your profile to &quot;Open to Work&quot;</li>
        </ul>
      </div>
    </div>
  );
}
