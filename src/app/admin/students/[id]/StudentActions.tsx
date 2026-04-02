"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { X, Loader2 } from "lucide-react";

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

  // Status change note modal state
  const [showStatusNoteModal, setShowStatusNoteModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState("");
  const [statusNoteLoading, setStatusNoteLoading] = useState(false);

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
    if (newStatus === currentStatus) {
      setStatus(newStatus);
      return;
    }
    setPendingStatus(newStatus);
    setStatusNote("");
    setShowStatusNoteModal(true);
    // Reset the select back to currentStatus until confirmed
    setStatus(currentStatus);
  }

  async function handleStatusNoteSubmit() {
    if (!pendingStatus || !statusNote.trim()) return;
    setStatusNoteLoading(true);
    try {
      const res = await fetch(`/api/admin/students/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: pendingStatus,
          statusNote: statusNote.trim(),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        console.error("Update failed:", err);
        return;
      }
      setStatus(pendingStatus);
      setShowStatusNoteModal(false);
      setPendingStatus(null);
      setStatusNote("");
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setStatusNoteLoading(false);
    }
  }

  function handlePhaseChange(newPhase: number) {
    setPhase(newPhase);
    updateField({ currentPhase: newPhase });
  }

  return (
    <>
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
              disabled={isPending || statusNoteLoading}
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

      {/* Status Change Note Modal */}
      {showStatusNoteModal && pendingStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-card p-6 w-full max-w-md mx-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">
                Status Change Note
              </h3>
              <button
                onClick={() => {
                  setShowStatusNoteModal(false);
                  setPendingStatus(null);
                  setStatusNote("");
                }}
                className="p-1 rounded-lg hover:bg-white/[0.03] text-text-muted hover:text-text-primary transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-text-secondary">
              Why are you changing status to{" "}
              <span className="font-semibold text-neon-blue">
                {STATUS_LABELS[pendingStatus] || pendingStatus}
              </span>
              ?
            </p>
            <textarea
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="Enter reason for status change (required)..."
              rows={4}
              autoFocus
              className="w-full rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-sm text-text-secondary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-neon-blue/50 focus:border-neon-blue/50 resize-none"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowStatusNoteModal(false);
                  setPendingStatus(null);
                  setStatusNote("");
                }}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:text-text-secondary border border-white/[0.06] hover:bg-white/[0.03] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStatusNoteSubmit}
                disabled={statusNoteLoading || !statusNote.trim()}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {statusNoteLoading && (
                  <Loader2 size={14} className="animate-spin" />
                )}
                Save & Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
