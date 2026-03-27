"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Monitor,
  CheckCircle2,
  Circle,
  Loader2,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";

interface ChecklistItem {
  id: string;
  name: string;
  description: string;
  installed: boolean;
  verified: boolean;
}

interface ChecklistData {
  id: string;
  items: ChecklistItem[];
  allVerified: boolean;
}

export default function SoftwareChecklistPage() {
  const [checklist, setChecklist] = useState<ChecklistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadChecklist = useCallback(async () => {
    try {
      const res = await fetch("/api/student/software-checklist");
      if (res.ok) {
        const data = await res.json();
        setChecklist(data);
      } else {
        setError("Failed to load software checklist");
      }
    } catch {
      setError("Failed to load software checklist");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChecklist();
  }, [loadChecklist]);

  const toggleInstalled = async (itemId: string, installed: boolean) => {
    if (!checklist) return;
    setSaving(itemId);
    setError("");

    try {
      const res = await fetch("/api/student/software-checklist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, installed }),
      });

      if (res.ok) {
        const data = await res.json();
        setChecklist(data);
      } else {
        setError("Failed to update checklist");
      }
    } catch {
      setError("Failed to update checklist");
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-neon-blue" />
      </div>
    );
  }

  const allInstalled = checklist?.items.every((item) => item.installed) || false;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-text-primary">
          Software Checklist
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Install the required software before training begins. Mark each as
          installed once ready. Your trainer will verify the installations.
        </p>
      </div>

      {/* Status Banner */}
      {checklist?.allVerified ? (
        <div className="p-4 bg-neon-green/10 border border-neon-green/20 rounded-xl flex items-center gap-3">
          <ShieldCheck size={20} className="text-neon-green" />
          <div>
            <p className="text-sm font-medium text-neon-green">
              All Software Verified
            </p>
            <p className="text-xs text-text-muted">
              Your trainer has verified all software installations.
            </p>
          </div>
        </div>
      ) : allInstalled ? (
        <div className="p-4 bg-neon-blue/10 border border-neon-blue/20 rounded-xl flex items-center gap-3">
          <Monitor size={20} className="text-neon-blue" />
          <div>
            <p className="text-sm font-medium text-neon-blue">
              All Marked as Installed
            </p>
            <p className="text-xs text-text-muted">
              Waiting for trainer verification.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center gap-3">
          <AlertTriangle size={20} className="text-yellow-400" />
          <div>
            <p className="text-sm font-medium text-yellow-400">
              Software Installation Required
            </p>
            <p className="text-xs text-text-muted">
              Please install all required software and mark them as installed.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Checklist Items */}
      <div className="space-y-3">
        {checklist?.items.map((item) => (
          <div
            key={item.id}
            className="glass-card p-4 flex items-center gap-4"
          >
            <button
              onClick={() => toggleInstalled(item.id, !item.installed)}
              disabled={item.verified || saving === item.id}
              className="shrink-0"
            >
              {saving === item.id ? (
                <Loader2
                  size={22}
                  className="animate-spin text-text-muted"
                />
              ) : item.verified ? (
                <CheckCircle2 size={22} className="text-neon-green" />
              ) : item.installed ? (
                <CheckCircle2 size={22} className="text-neon-blue" />
              ) : (
                <Circle
                  size={22}
                  className="text-text-muted hover:text-neon-blue transition-colors"
                />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium ${
                  item.verified
                    ? "text-neon-green"
                    : item.installed
                      ? "text-text-primary"
                      : "text-text-secondary"
                }`}
              >
                {item.name}
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                {item.description}
              </p>
            </div>

            <div className="shrink-0">
              {item.verified ? (
                <span className="text-xs font-medium text-neon-green bg-neon-green/10 px-2 py-1 rounded">
                  Verified
                </span>
              ) : item.installed ? (
                <span className="text-xs font-medium text-neon-blue bg-neon-blue/10 px-2 py-1 rounded">
                  Installed
                </span>
              ) : (
                <span className="text-xs font-medium text-text-muted bg-dark-tertiary px-2 py-1 rounded">
                  Not Installed
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
