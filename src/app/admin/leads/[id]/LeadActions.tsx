"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  UserPlus,
  X,
  Loader2,
  Phone,
  PhoneOff,
  MessageCircle,
  Video,
  Mail,
  Calendar,
  ChevronDown,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { LEAD_STATUS_LABELS, COURSE_LABELS, formatDate } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  CONTACTED: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  QUALIFIED: "bg-green-500/10 text-green-400 border-green-500/20",
  ENROLLED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  LOST: "bg-red-500/10 text-red-400 border-red-500/20",
};

const NOTE_TYPES = [
  { value: "NOTE", label: "Note", emoji: "📝" },
  { value: "CALL_LOG", label: "Call Log", emoji: "📞" },
  { value: "EMAIL_SENT", label: "Email Sent", emoji: "📧" },
  { value: "WHATSAPP", label: "WhatsApp Message", emoji: "💬" },
  { value: "FOLLOW_UP", label: "Follow-up", emoji: "🔄" },
  { value: "MEETING", label: "Meeting", emoji: "🤝" },
  { value: "INTERNAL", label: "Internal", emoji: "🔒" },
];

const DROP_REASONS = [
  { value: "Not Interested", label: "Not Interested" },
  { value: "Budget Issue", label: "Budget Issue" },
  { value: "Wrong Contact", label: "Wrong Contact" },
  { value: "Duplicate", label: "Duplicate" },
  { value: "No Response", label: "No Response" },
  { value: "Other", label: "Other" },
];

interface LeadActionsProps {
  leadId: string;
  currentStatus: string;
  isConverted: boolean;
  courseInterest: string | null;
  phone: string | null;
  email: string;
  followUpDate: string | null;
  onLogCall?: () => void;
}

export default function LeadActions({
  leadId,
  currentStatus,
  isConverted,
  courseInterest,
  phone,
  email,
  followUpDate: followUpDateProp,
  onLogCall,
}: LeadActionsProps) {
  const router = useRouter();

  // Status change state
  const [statusLoading, setStatusLoading] = useState<string | null>(null);

  // Drop lead state
  const [showDropForm, setShowDropForm] = useState(false);
  const [dropReason, setDropReason] = useState("Not Interested");
  const [dropLoading, setDropLoading] = useState(false);

  // Reschedule follow-up state
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  // Note form state
  const [noteContent, setNoteContent] = useState("");
  const [noteType, setNoteType] = useState("NOTE");
  const [noteLoading, setNoteLoading] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);

  // Schedule call state
  const [showScheduleCall, setShowScheduleCall] = useState(false);
  const [callDate, setCallDate] = useState("");
  const [callTime, setCallTime] = useState("");
  const [callNote, setCallNote] = useState("");
  const [scheduleLoading, setScheduleLoading] = useState(false);

  // Convert modal state
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(
    courseInterest || "PROFESSIONAL_MODULE"
  );
  const [convertLoading, setConvertLoading] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [convertedStudentId, setConvertedStudentId] = useState<string | null>(
    null
  );

  const handleStatusChange = async (status: string) => {
    if (status === currentStatus) return;
    setStatusLoading(status);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      router.refresh();
    } catch (err) {
      console.error("Status update failed:", err);
    } finally {
      setStatusLoading(null);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    setNoteLoading(true);

    const selectedType = NOTE_TYPES.find((t) => t.value === noteType);
    const prefix =
      noteType === "NOTE"
        ? ""
        : `${selectedType?.emoji} ${selectedType?.label}: `;
    const fullContent = `${prefix}${noteContent}`;

    try {
      const res = await fetch(`/api/admin/leads/${leadId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: fullContent }),
      });
      if (!res.ok) throw new Error("Failed to add note");
      setNoteContent("");
      setNoteType("NOTE");
      setShowNoteForm(false);
      router.refresh();
    } catch (err) {
      console.error("Add note failed:", err);
    } finally {
      setNoteLoading(false);
    }
  };

  const handleScheduleCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!callDate || !callTime) return;
    setScheduleLoading(true);

    const content = `\u{1F4DE} Call scheduled for ${callDate} at ${callTime}.${callNote ? ` Note: ${callNote}` : ""}`;

    try {
      const res = await fetch(`/api/admin/leads/${leadId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, type: "CALL_SCHEDULED" }),
      });
      if (!res.ok) throw new Error("Failed to schedule call");
      setCallDate("");
      setCallTime("");
      setCallNote("");
      setShowScheduleCall(false);
      router.refresh();
    } catch (err) {
      console.error("Schedule call failed:", err);
    } finally {
      setScheduleLoading(false);
    }
  };

  const handleDropLead = async () => {
    setDropLoading(true);
    try {
      // Add note about dropping
      const noteRes = await fetch(`/api/admin/leads/${leadId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `\u{274C} Lead dropped \u2014 Reason: ${dropReason}`,
        }),
      });
      if (!noteRes.ok) throw new Error("Failed to add drop note");

      // Update status to LOST
      const patchRes = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "LOST" }),
      });
      if (!patchRes.ok) throw new Error("Failed to update lead status");

      setShowDropForm(false);
      setDropReason("Not Interested");
      router.refresh();
    } catch (err) {
      console.error("Drop lead failed:", err);
    } finally {
      setDropLoading(false);
    }
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleDate) return;
    setRescheduleLoading(true);
    try {
      const timeStr = rescheduleTime || "09:00";
      const followUpISO = new Date(
        `${rescheduleDate}T${timeStr}`
      ).toISOString();

      const patchRes = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followUpDate: followUpISO }),
      });
      if (!patchRes.ok) throw new Error("Failed to reschedule");

      // Add note
      await fetch(`/api/admin/leads/${leadId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `\u{1F4C5} Follow-up rescheduled to ${rescheduleDate}${rescheduleTime ? " at " + rescheduleTime : ""}`,
        }),
      });

      setShowReschedule(false);
      setRescheduleDate("");
      setRescheduleTime("");
      router.refresh();
    } catch (err) {
      console.error("Reschedule failed:", err);
    } finally {
      setRescheduleLoading(false);
    }
  };

  // Follow-up date display helpers
  const followUpInfo = (() => {
    if (!followUpDateProp) return null;
    const now = new Date();
    const followUp = new Date(followUpDateProp);
    const diffMs = followUp.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const isOverdue = diffDays < 0;
    const isToday = diffDays === 0;
    return { followUp, diffDays, isOverdue, isToday };
  })();

  const formatPhoneForWhatsApp = (rawPhone: string) => {
    let cleaned = rawPhone.replace(/[\s\-()]/g, "");
    if (!cleaned.startsWith("+")) {
      cleaned = cleaned.startsWith("0") ? "+44" + cleaned.slice(1) : "+" + cleaned;
    }
    return cleaned.replace("+", "");
  };

  const handleWhatsApp = () => {
    if (!phone) return;
    const formatted = formatPhoneForWhatsApp(phone);
    window.open(`https://wa.me/${formatted}`, "_blank");
  };

  const handleTeamsCall = () => {
    window.open(
      `https://teams.microsoft.com/l/call/0/0?users=${encodeURIComponent(email)}`,
      "_blank"
    );
  };

  const handleEmail = () => {
    window.open(`mailto:${email}`, "_blank");
  };

  const handleConvert = async () => {
    setConvertLoading(true);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course: selectedCourse }),
      });
      if (!res.ok) throw new Error("Failed to convert lead");
      const data = await res.json();
      if (data.tempPassword) {
        setTempPassword(data.tempPassword);
        setConvertedStudentId(data.studentId || data.id || null);
      } else {
        setShowConvertModal(false);
        router.refresh();
      }
    } catch (err) {
      console.error("Conversion failed:", err);
    } finally {
      setConvertLoading(false);
    }
  };

  return (
    <>
      {/* Communication Section */}
      <div className="glass-card p-5">
        <h2 className="text-base font-semibold text-text-primary mb-4">
          Communication
        </h2>
        <div className="flex flex-wrap gap-2">
          {/* WhatsApp Message */}
          <button
            onClick={handleWhatsApp}
            disabled={!phone}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <MessageCircle size={14} />
            WhatsApp Message
          </button>

          {/* Schedule Call */}
          <button
            onClick={() => setShowScheduleCall(!showScheduleCall)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors text-xs font-medium"
          >
            <Phone size={14} />
            Schedule Call
          </button>

          {/* Teams Call */}
          <button
            onClick={handleTeamsCall}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-colors text-xs font-medium"
          >
            <Video size={14} />
            Teams Call
          </button>

          {/* Email */}
          <button
            onClick={handleEmail}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 transition-colors text-xs font-medium"
          >
            <Mail size={14} />
            Email
          </button>

          {/* Log Call */}
          {onLogCall && (
            <button
              onClick={onLogCall}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20 transition-colors text-xs font-medium"
            >
              <Phone size={14} />
              Log Call
            </button>
          )}
        </div>

        {/* Schedule Call Inline Form */}
        {showScheduleCall && (
          <form
            onSubmit={handleScheduleCall}
            className="mt-4 p-4 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-text-muted mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={callDate}
                  onChange={(e) => setCallDate(e.target.value)}
                  required
                  className="w-full rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-sm text-text-secondary focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={callTime}
                  onChange={(e) => setCallTime(e.target.value)}
                  required
                  className="w-full rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-sm text-text-secondary focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 [color-scheme:dark]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">
                Note (optional)
              </label>
              <input
                type="text"
                value={callNote}
                onChange={(e) => setCallNote(e.target.value)}
                placeholder="Add a note about this call..."
                className="w-full rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-sm text-text-secondary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowScheduleCall(false);
                  setCallDate("");
                  setCallTime("");
                  setCallNote("");
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-text-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={scheduleLoading || !callDate || !callTime}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {scheduleLoading && (
                  <Loader2 size={12} className="animate-spin" />
                )}
                <Calendar size={12} />
                Schedule
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Follow-up Display */}
      {followUpInfo && (
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
              <Calendar size={16} className="text-neon-blue" />
              Follow-up
            </h2>
            <button
              onClick={() => setShowReschedule(!showReschedule)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20 transition-colors text-xs font-medium"
            >
              <Calendar size={12} />
              Reschedule
            </button>
          </div>
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${
              followUpInfo.isOverdue
                ? "bg-red-500/10 border-red-500/20 text-red-400"
                : followUpInfo.isToday
                  ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                  : "bg-neon-blue/10 border-neon-blue/20 text-neon-blue"
            }`}
          >
            <Calendar size={14} />
            <span>
              {formatDate(followUpDateProp!)}
              {followUpInfo.isOverdue &&
                ` (overdue by ${Math.abs(followUpInfo.diffDays)} day${Math.abs(followUpInfo.diffDays) !== 1 ? "s" : ""})`}
              {followUpInfo.isToday && " (today)"}
            </span>
          </div>

          {/* Reschedule inline form */}
          {showReschedule && (
            <form
              onSubmit={handleReschedule}
              className="mt-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-text-muted mb-1">
                    New Date
                  </label>
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    required
                    className="w-full rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-sm text-text-secondary focus:outline-none focus:ring-1 focus:ring-neon-blue/50 focus:border-neon-blue/50 [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-sm text-text-secondary focus:outline-none focus:ring-1 focus:ring-neon-blue/50 focus:border-neon-blue/50 [color-scheme:dark]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowReschedule(false);
                    setRescheduleDate("");
                    setRescheduleTime("");
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-text-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rescheduleLoading || !rescheduleDate}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {rescheduleLoading && (
                    <Loader2 size={12} className="animate-spin" />
                  )}
                  Update
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Status Change Section */}
      <div className="glass-card p-5">
        <h2 className="text-base font-semibold text-text-primary mb-4">
          Update Status
        </h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(LEAD_STATUS_LABELS).map(([key, label]) => (
            <button
              key={key}
              disabled={currentStatus === key || statusLoading !== null}
              onClick={() => handleStatusChange(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                currentStatus === key
                  ? "ring-2 ring-neon-blue ring-offset-1 ring-offset-transparent " +
                    STATUS_COLORS[key]
                  : STATUS_COLORS[key] + " hover:opacity-80 cursor-pointer"
              } ${statusLoading === key ? "opacity-50" : ""}`}
            >
              {statusLoading === key ? (
                <span className="flex items-center gap-1">
                  <Loader2 size={12} className="animate-spin" />
                  {label}
                </span>
              ) : (
                label
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Convert to Student Button */}
      {!isConverted && (
        <div className="glass-card p-5">
          <button
            onClick={() => setShowConvertModal(true)}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-neon-green/10 text-neon-green border border-neon-green/20 hover:bg-neon-green/20 transition-colors text-sm font-medium"
          >
            <UserPlus size={16} />
            Convert to Student
          </button>
        </div>
      )}

      {/* Drop Lead */}
      {currentStatus !== "LOST" && currentStatus !== "ENROLLED" && (
        <div className="glass-card p-5">
          {!showDropForm ? (
            <button
              onClick={() => setShowDropForm(true)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors text-sm font-medium"
            >
              <XCircle size={16} />
              Drop Lead
            </button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-red-400 text-sm font-medium">
                <AlertTriangle size={16} />
                Are you sure you want to drop this lead?
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">
                  Reason
                </label>
                <div className="relative">
                  <select
                    value={dropReason}
                    onChange={(e) => setDropReason(e.target.value)}
                    className="w-full appearance-none rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2 pr-8 text-sm text-text-secondary focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50"
                  >
                    {DROP_REASONS.map((r) => (
                      <option
                        key={r.value}
                        value={r.value}
                        className="bg-gray-900"
                      >
                        {r.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDropForm(false);
                    setDropReason("Not Interested");
                  }}
                  className="flex-1 px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text-secondary border border-white/[0.06] hover:bg-white/[0.03] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDropLead}
                  disabled={dropLoading}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors text-xs font-medium disabled:opacity-50"
                >
                  {dropLoading && (
                    <Loader2 size={12} className="animate-spin" />
                  )}
                  <PhoneOff size={12} />
                  Confirm Drop
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Note Form */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-text-primary">
            Notes & Activity
          </h2>
          <button
            onClick={() => setShowNoteForm(!showNoteForm)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20 transition-colors text-xs font-medium"
          >
            <MessageSquare size={14} />
            Add Note
          </button>
        </div>

        {showNoteForm && (
          <form onSubmit={handleAddNote} className="space-y-3">
            {/* Note Type Selector */}
            <div className="relative">
              <label className="block text-xs text-text-muted mb-1">
                Note Type
              </label>
              <div className="relative">
                <select
                  value={noteType}
                  onChange={(e) => setNoteType(e.target.value)}
                  className="w-full appearance-none rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2 pr-8 text-sm text-text-secondary focus:outline-none focus:ring-1 focus:ring-neon-blue/50 focus:border-neon-blue/50"
                >
                  {NOTE_TYPES.map((type) => (
                    <option
                      key={type.value}
                      value={type.value}
                      className="bg-gray-900"
                    >
                      {type.emoji} {type.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                />
              </div>
            </div>

            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Write a note about this lead..."
              rows={3}
              className="w-full rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-sm text-text-secondary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-neon-blue/50 focus:border-neon-blue/50 resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowNoteForm(false);
                  setNoteContent("");
                  setNoteType("NOTE");
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-text-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={noteLoading || !noteContent.trim()}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {noteLoading && <Loader2 size={12} className="animate-spin" />}
                Save Note
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Convert to Student Modal */}
      {showConvertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-card p-6 w-full max-w-md mx-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">
                Convert to Student
              </h3>
              <button
                onClick={() => {
                  setShowConvertModal(false);
                  setTempPassword(null);
                  setConvertedStudentId(null);
                }}
                className="p-1 rounded-lg hover:bg-white/[0.03] text-text-muted hover:text-text-primary transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {tempPassword ? (
              <div className="space-y-4">
                <div className="bg-neon-green/10 border border-neon-green/20 rounded-lg p-4">
                  <p className="text-sm text-neon-green font-medium mb-2">
                    Student created successfully!
                  </p>
                  <p className="text-xs text-text-secondary mb-1">
                    Temporary Password:
                  </p>
                  <code className="block bg-black/30 rounded px-3 py-2 text-sm text-neon-green font-mono select-all">
                    {tempPassword}
                  </code>
                  <p className="text-xs text-text-muted mt-2">
                    Please save this password. It will not be shown again.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowConvertModal(false);
                    if (convertedStudentId) {
                      router.push(`/admin/students/${convertedStudentId}`);
                    } else {
                      router.refresh();
                    }
                  }}
                  className="w-full px-4 py-2.5 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20 transition-colors text-sm font-medium"
                >
                  {convertedStudentId ? "Go to Student Page" : "Close"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-2">
                    Select Course
                  </label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-sm text-text-secondary focus:outline-none focus:ring-1 focus:ring-neon-blue/50 focus:border-neon-blue/50"
                  >
                    {Object.entries(COURSE_LABELS).map(([key, label]) => (
                      <option key={key} value={key} className="bg-gray-900">
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConvertModal(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:text-text-secondary border border-white/[0.06] hover:bg-white/[0.03] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConvert}
                    disabled={convertLoading}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-neon-green/10 text-neon-green border border-neon-green/20 hover:bg-neon-green/20 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    {convertLoading && (
                      <Loader2 size={14} className="animate-spin" />
                    )}
                    Convert
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
