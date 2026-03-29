"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Loader2,
  Phone,
  AlertTriangle,
  Calendar,
  ChevronDown,
} from "lucide-react";

type CallOutcome =
  | "CONNECTED"
  | "NO_ANSWER"
  | "VOICEMAIL"
  | "WRONG_NUMBER"
  | "CALLBACK_REQUESTED";

type Interest = "YES" | "MAYBE" | "NO";

const CALL_OUTCOMES: { value: CallOutcome; label: string; color: string }[] = [
  { value: "CONNECTED", label: "Connected", color: "text-green-400" },
  { value: "NO_ANSWER", label: "No Answer", color: "text-text-muted" },
  { value: "VOICEMAIL", label: "Voicemail", color: "text-yellow-400" },
  { value: "WRONG_NUMBER", label: "Wrong Number", color: "text-red-400" },
  {
    value: "CALLBACK_REQUESTED",
    label: "Callback Requested",
    color: "text-blue-400",
  },
];

const FOLLOW_UP_MEDIUMS = [
  { value: "Call", label: "Call" },
  { value: "WhatsApp", label: "WhatsApp" },
  { value: "Email", label: "Email" },
  { value: "Teams", label: "Teams" },
  { value: "In-Person", label: "In-Person" },
];

interface CallLogModalProps {
  leadId: string;
  leadName: string;
  currentStatus: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CallLogModal({
  leadId,
  leadName,
  currentStatus,
  isOpen,
  onClose,
}: CallLogModalProps) {
  const router = useRouter();

  const [outcome, setOutcome] = useState<CallOutcome | "">("");
  const [duration, setDuration] = useState("");
  const [feedback, setFeedback] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpTime, setFollowUpTime] = useState("");
  const [followUpMedium, setFollowUpMedium] = useState("Call");
  const [interest, setInterest] = useState<Interest | "">("");
  const [dropConfirmed, setDropConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setOutcome("");
    setDuration("");
    setFeedback("");
    setFollowUpDate("");
    setFollowUpTime("");
    setFollowUpMedium("Call");
    setInterest("");
    setDropConfirmed(false);
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!outcome) {
      setError("Please select a call outcome");
      return;
    }
    if (!feedback.trim()) {
      setError("Feedback/Notes is required");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Build follow-up ISO date
      let followUpISO: string | null = null;
      if (followUpDate) {
        const timeStr = followUpTime || "09:00";
        followUpISO = new Date(`${followUpDate}T${timeStr}`).toISOString();
      }

      // Build formatted note content
      const outcomeLabel =
        CALL_OUTCOMES.find((o) => o.value === outcome)?.label || outcome;
      const durationStr = duration ? `${duration}min` : "N/A";
      const interestStr = interest || "N/A";
      const followUpStr = followUpDate
        ? `${followUpDate}${followUpTime ? " " + followUpTime : ""} via ${followUpMedium}`
        : "None";

      const noteContent = `\u{1F4DE} Call Report | Outcome: ${outcomeLabel} | Duration: ${durationStr} | Feedback: ${feedback.trim()} | Next Follow-up: ${followUpStr} | Interest: ${interestStr}`;

      // 1. POST note
      const noteRes = await fetch(`/api/admin/leads/${leadId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: noteContent }),
      });
      if (!noteRes.ok) throw new Error("Failed to save call report note");

      // 2. PATCH lead (status + followUpDate)
      const patchData: Record<string, unknown> = {};

      if (followUpISO) {
        patchData.followUpDate = followUpISO;
      }

      // Status logic
      if (interest === "NO" && dropConfirmed) {
        patchData.status = "LOST";
      } else if (
        interest === "YES" &&
        (currentStatus === "NEW" || currentStatus === "CONTACTED")
      ) {
        patchData.status = "QUALIFIED";
      } else if (
        currentStatus === "NEW" &&
        (outcome === "CONNECTED" ||
          outcome === "VOICEMAIL" ||
          outcome === "CALLBACK_REQUESTED")
      ) {
        patchData.status = "CONTACTED";
      }

      if (Object.keys(patchData).length > 0) {
        const patchRes = await fetch(`/api/admin/leads/${leadId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patchData),
        });
        if (!patchRes.ok) throw new Error("Failed to update lead");
      }

      handleClose();
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-card p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-neon-blue/10">
                <Phone size={18} className="text-neon-blue" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">
                  Log Call
                </h3>
                <p className="text-xs text-text-muted">{leadName}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-1 rounded-lg hover:bg-white/[0.03] text-text-muted hover:text-text-primary transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertTriangle size={14} />
              {error}
            </div>
          )}

          {/* Call Outcome */}
          <div>
            <label className="block text-xs text-text-muted mb-2">
              Call Outcome <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CALL_OUTCOMES.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setOutcome(o.value)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                    outcome === o.value
                      ? "bg-neon-blue/20 text-neon-blue border-neon-blue/30 ring-1 ring-neon-blue/30"
                      : "bg-white/[0.03] text-text-muted border-white/[0.06] hover:bg-white/[0.06]"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Call Duration */}
          <div>
            <label className="block text-xs text-text-muted mb-1">
              Call Duration (minutes)
            </label>
            <input
              type="number"
              min={0}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 5"
              className="w-full rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-sm text-text-secondary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-neon-blue/50 focus:border-neon-blue/50 [color-scheme:dark]"
            />
          </div>

          {/* Feedback / Notes */}
          <div>
            <label className="block text-xs text-text-muted mb-1">
              Feedback / Notes <span className="text-red-400">*</span>
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              placeholder="Summarize the call conversation..."
              className="w-full rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-sm text-text-secondary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-neon-blue/50 focus:border-neon-blue/50 resize-none"
            />
          </div>

          {/* Next Follow-up */}
          <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-3">
            <h4 className="text-xs font-semibold text-text-primary flex items-center gap-2">
              <Calendar size={14} className="text-neon-blue" />
              Next Follow-up
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-text-muted mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-sm text-text-secondary focus:outline-none focus:ring-1 focus:ring-neon-blue/50 focus:border-neon-blue/50 [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={followUpTime}
                  onChange={(e) => setFollowUpTime(e.target.value)}
                  className="w-full rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-sm text-text-secondary focus:outline-none focus:ring-1 focus:ring-neon-blue/50 focus:border-neon-blue/50 [color-scheme:dark]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">
                Follow-up Medium
              </label>
              <div className="relative">
                <select
                  value={followUpMedium}
                  onChange={(e) => setFollowUpMedium(e.target.value)}
                  className="w-full appearance-none rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2 pr-8 text-sm text-text-secondary focus:outline-none focus:ring-1 focus:ring-neon-blue/50 focus:border-neon-blue/50"
                >
                  {FOLLOW_UP_MEDIUMS.map((m) => (
                    <option
                      key={m.value}
                      value={m.value}
                      className="bg-gray-900"
                    >
                      {m.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Interested? */}
          <div>
            <label className="block text-xs text-text-muted mb-2">
              Interested?
            </label>
            <div className="flex gap-3">
              {(["YES", "MAYBE", "NO"] as Interest[]).map((val) => {
                const colors: Record<Interest, string> = {
                  YES: interest === "YES"
                    ? "bg-green-500/20 text-green-400 border-green-500/30 ring-1 ring-green-500/30"
                    : "bg-white/[0.03] text-text-muted border-white/[0.06] hover:bg-white/[0.06]",
                  MAYBE: interest === "MAYBE"
                    ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 ring-1 ring-yellow-500/30"
                    : "bg-white/[0.03] text-text-muted border-white/[0.06] hover:bg-white/[0.06]",
                  NO: interest === "NO"
                    ? "bg-red-500/20 text-red-400 border-red-500/30 ring-1 ring-red-500/30"
                    : "bg-white/[0.03] text-text-muted border-white/[0.06] hover:bg-white/[0.06]",
                };
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      setInterest(val);
                      if (val !== "NO") setDropConfirmed(false);
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${colors[val]}`}
                  >
                    {val === "YES" ? "Yes" : val === "MAYBE" ? "Maybe" : "No"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Drop Lead Checkbox (shown when interest = NO) */}
          {interest === "NO" && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dropConfirmed}
                  onChange={(e) => setDropConfirmed(e.target.checked)}
                  className="w-4 h-4 rounded border-red-500/30 bg-white/[0.03] text-red-500 focus:ring-red-500/30 accent-red-500"
                />
                <div>
                  <span className="text-sm font-medium text-red-400">
                    Drop this lead
                  </span>
                  <p className="text-xs text-red-400/70 mt-0.5">
                    This will mark the lead status as LOST
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-text-muted hover:text-text-secondary border border-white/[0.06] hover:bg-white/[0.03] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !outcome || !feedback.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              <Phone size={14} />
              Save Call Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
