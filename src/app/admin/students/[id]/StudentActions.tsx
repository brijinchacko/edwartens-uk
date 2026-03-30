"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const STUDENT_STATUSES = [
  "ONBOARDING",
  "ACTIVE",
  "ON_HOLD",
  "POST_TRAINING",
  "CAREER_SUPPORT",
  "COMPLETED",
  "ALUMNI_PLACED",
  "ALUMNI_NOT_PLACED",
  "DROPPED",
] as const;

const STATUS_LABELS: Record<string, string> = {
  ONBOARDING: "Onboarding",
  ACTIVE: "Active",
  ON_HOLD: "On Hold",
  POST_TRAINING: "Post Training",
  CAREER_SUPPORT: "Career Support",
  COMPLETED: "Completed",
  ALUMNI_PLACED: "Alumni (Placed)",
  ALUMNI_NOT_PLACED: "Alumni (Not Placed)",
  DROPPED: "Dropped",
};

interface StudentActionsProps {
  studentId: string;
  currentStatus: string;
  currentPhase: number;
  currentBatchId: string | null;
}

export default function StudentActions({
  studentId,
  currentStatus,
  currentPhase,
  currentBatchId,
}: StudentActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(currentStatus);
  const [phase, setPhase] = useState(currentPhase);

  async function updateField(data: Record<string, unknown>) {
    try {
      const res = await fetch(`/api/admin/students/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        console.error("Update failed:", err);
        return;
      }
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      console.error("Update error:", err);
    }
  }

  function handleStatusChange(newStatus: string) {
    setStatus(newStatus);
    updateField({ status: newStatus });
  }

  function handlePhaseChange(newPhase: number) {
    setPhase(newPhase);
    updateField({ currentPhase: newPhase });
  }

  return (
    <div className="glass-card p-5">
      <h2 className="text-base font-semibold text-text-primary mb-4">
        Quick Actions
      </h2>
      <div className="space-y-4">
        {/* Status Dropdown */}
        <div>
          <label className="block text-xs text-text-muted mb-1.5">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={isPending}
            className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-secondary text-sm focus:outline-none focus:border-neon-blue/40 transition-colors disabled:opacity-50"
          >
            {STUDENT_STATUSES.map((s) => (
              <option key={s} value={s} className="bg-dark-secondary">
                {STATUS_LABELS[s] || s}
              </option>
            ))}
          </select>
        </div>

        {/* Phase Selector */}
        <div>
          <label className="block text-xs text-text-muted mb-1.5">
            Current Phase
          </label>
          <div className="flex gap-1.5">
            {[0, 1, 2, 3, 4, 5].map((p) => (
              <button
                key={p}
                onClick={() => handlePhaseChange(p)}
                disabled={isPending}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-50 ${
                  phase === p
                    ? "bg-neon-blue/20 text-neon-blue border border-neon-blue/30"
                    : "bg-white/[0.04] text-text-muted border border-white/[0.08] hover:bg-white/[0.06]"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
