"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Phone,
  FileText,
  CalendarDays,
  CheckCircle,
  AlertTriangle,
  Clock,
  UserPlus,
  Users,
  Target,
  ChevronDown,
  X,
  Loader2,
  Sparkles,
  Copy,
} from "lucide-react";
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS } from "@/lib/utils";

// ─── Types ───
interface LeadItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  courseInterest: string | null;
  followUpDate: string | null;
  lastNote: string | null;
  lastNoteDate: string | null;
  createdAt: string | null;
  source?: string;
}

interface MyDayData {
  greeting: string;
  date: string;
  aiBriefing?: string;
  summary: {
    followUpsToday: number;
    overdue: number;
    uncontacted: number;
    available: number;
  };
  stats: {
    callsToday: number;
    notesToday: number;
    leadsConverted: number;
  };
  todayFollowUps: LeadItem[];
  overdueFollowUps: LeadItem[];
  uncontactedLeads: LeadItem[];
  availableLeads: LeadItem[];
  forecast: { label: string; count: number; isToday: boolean }[];
}

interface MyDayClientProps {
  userName: string;
  userRole: string;
  userId: string;
}

// ─── Toast ───
function Toast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-green-600/90 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg animate-in slide-in-from-bottom-4">
      {message}
    </div>
  );
}

// ─── Status Badge ───
function StatusBadge({ status }: { status: string }) {
  const colors = LEAD_STATUS_COLORS[status] || {
    bg: "bg-white/[0.06]",
    text: "text-text-muted",
    border: "border-white/[0.08]",
  };
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${colors.bg} ${colors.text} border ${colors.border}`}
    >
      {LEAD_STATUS_LABELS[status] || status}
    </span>
  );
}

// ─── Action Popover ───
type ActionType = "call" | "note" | "reschedule" | "done";

function ActionPopover({
  leadId,
  leadName,
  actionType,
  onClose,
  onSuccess,
}: {
  leadId: string;
  leadName: string;
  actionType: ActionType;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}) {
  const [content, setContent] = useState("");
  const [callResult, setCallResult] = useState<string>("ANSWERED");
  const [newDate, setNewDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const submit = async () => {
    setSubmitting(true);
    try {
      const body: Record<string, any> = { action: actionType };
      if (actionType === "call") {
        body.callResult = callResult;
        body.content = content;
      } else if (actionType === "note") {
        body.content = content;
      } else if (actionType === "reschedule") {
        body.newDate = newDate;
      } else if (actionType === "done") {
        body.content = content;
      }

      const res = await fetch(`/api/admin/leads/${leadId}/quick-action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Action failed");
      }

      onSuccess(
        actionType === "call"
          ? `Call logged for ${leadName}`
          : actionType === "note"
          ? `Note added for ${leadName}`
          : actionType === "reschedule"
          ? `Follow-up rescheduled for ${leadName}`
          : `Follow-up completed for ${leadName}`
      );
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      ref={ref}
      className="mt-2 p-3 rounded-lg bg-surface-elevated border border-white/[0.08] space-y-2.5 animate-in slide-in-from-top-1"
    >
      {actionType === "call" && (
        <>
          <div className="flex gap-1.5">
            {(["ANSWERED", "NO_ANSWER", "BUSY"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setCallResult(r)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  callResult === r
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : "bg-white/[0.03] text-text-muted border border-white/[0.06] hover:bg-white/[0.06]"
                }`}
              >
                {r === "ANSWERED"
                  ? "Answered"
                  : r === "NO_ANSWER"
                  ? "No Answer"
                  : "Busy"}
              </button>
            ))}
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Call notes (optional)..."
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-md px-2.5 py-1.5 text-sm text-text-primary placeholder:text-text-muted resize-none h-16 focus:outline-none focus:border-blue-500/30"
          />
        </>
      )}

      {actionType === "note" && (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a note..."
          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-md px-2.5 py-1.5 text-sm text-text-primary placeholder:text-text-muted resize-none h-16 focus:outline-none focus:border-blue-500/30"
          autoFocus
        />
      )}

      {actionType === "reschedule" && (
        <input
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-md px-2.5 py-1.5 text-sm text-text-primary focus:outline-none focus:border-blue-500/30"
          autoFocus
        />
      )}

      {actionType === "done" && (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Completion notes (optional)..."
          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-md px-2.5 py-1.5 text-sm text-text-primary placeholder:text-text-muted resize-none h-16 focus:outline-none focus:border-blue-500/30"
        />
      )}

      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-3 py-1 rounded-md text-xs text-text-muted hover:bg-white/[0.06] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={
            submitting ||
            (actionType === "note" && !content.trim()) ||
            (actionType === "reschedule" && !newDate)
          }
          className="px-3 py-1 rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
        >
          {submitting && <Loader2 size={12} className="animate-spin" />}
          Submit
        </button>
      </div>
    </div>
  );
}

// ─── AI Suggest Popover ───
function AISuggestPopover({
  leadId,
  onClose,
}: {
  leadId: string;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  useEffect(() => {
    async function fetchSuggestion() {
      try {
        const res = await fetch("/api/admin/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "suggest-followup", leadId }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "AI request failed");
        } else {
          setResult(data.result || "");
        }
      } catch {
        setError("Failed to get AI suggestion");
      } finally {
        setLoading(false);
      }
    }
    fetchSuggestion();
  }, [leadId]);

  const parsedResult = (() => {
    if (!result) return null;
    try {
      // Try to extract JSON from the result
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {}
    return null;
  })();

  const copyMessage = () => {
    const text = parsedResult?.message || result;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      ref={ref}
      className="mt-2 p-3 rounded-lg bg-surface-elevated border border-purple-500/20 space-y-2 animate-in slide-in-from-top-1"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-purple-400">
          <Sparkles size={12} />
          <span className="text-xs font-medium">AI Suggestion</span>
        </div>
        <button onClick={onClose} className="text-text-muted hover:text-text-primary">
          <X size={12} />
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 py-2">
          <Loader2 size={14} className="animate-spin text-purple-400" />
          <span className="text-xs text-text-muted">Thinking...</span>
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}

      {parsedResult && (
        <div className="space-y-2">
          <div>
            <p className="text-[10px] text-text-muted uppercase tracking-wider">Approach</p>
            <p className="text-xs text-text-secondary">{parsedResult.approach}</p>
          </div>
          <div>
            <p className="text-[10px] text-text-muted uppercase tracking-wider">Suggested Message</p>
            <p className="text-xs text-text-secondary bg-white/[0.03] rounded p-2 border border-white/[0.06]">
              {parsedResult.message}
            </p>
          </div>
          {parsedResult.nextStatus && (
            <div>
              <p className="text-[10px] text-text-muted uppercase tracking-wider">Next Status</p>
              <p className="text-xs text-text-secondary">{parsedResult.nextStatus}</p>
            </div>
          )}
          <button
            onClick={copyMessage}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors"
          >
            <Copy size={11} />
            {copied ? "Copied!" : "Copy message"}
          </button>
        </div>
      )}

      {!parsedResult && !loading && !error && result && (
        <div className="space-y-2">
          <p className="text-xs text-text-secondary whitespace-pre-wrap">{result}</p>
          <button
            onClick={copyMessage}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors"
          >
            <Copy size={11} />
            {copied ? "Copied!" : "Copy to clipboard"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Lead Row with Actions ───
function LeadRow({
  lead,
  section,
  onActionSuccess,
}: {
  lead: LeadItem;
  section: "today" | "overdue" | "uncontacted";
  onActionSuccess: (msg: string) => void;
}) {
  const [openAction, setOpenAction] = useState<ActionType | null>(null);
  const [hidden, setHidden] = useState(false);
  const [showAI, setShowAI] = useState(false);

  const handleSuccess = (msg: string) => {
    setOpenAction(null);
    setHidden(true);
    onActionSuccess(msg);
  };

  if (hidden) return null;

  const daysOverdue =
    section === "overdue" && lead.followUpDate
      ? Math.floor(
          (Date.now() - new Date(lead.followUpDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

  const daysAgo =
    section === "uncontacted" && lead.createdAt
      ? Math.floor(
          (Date.now() - new Date(lead.createdAt).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

  return (
    <div className="border-b border-white/[0.04] last:border-0">
      <div className="flex items-center gap-3 py-2.5 px-2 group">
        {/* Lead info */}
        <Link
          href={`/admin/leads/${lead.id}`}
          className="min-w-0 flex-1 hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center gap-2">
            <p className="text-sm text-text-primary font-medium truncate">
              {lead.name}
            </p>
            <StatusBadge status={lead.status} />
            {section === "overdue" && daysOverdue > 0 && (
              <span className="text-[10px] text-red-400 font-medium whitespace-nowrap">
                {daysOverdue}d overdue
              </span>
            )}
            {section === "uncontacted" && daysAgo > 0 && (
              <span className="text-[10px] text-orange-400 font-medium whitespace-nowrap">
                Assigned {daysAgo}d ago
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-text-muted">{lead.phone}</span>
            {lead.lastNote && (
              <span className="text-xs text-text-muted truncate max-w-[200px]">
                {lead.lastNote}
              </span>
            )}
          </div>
        </Link>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() =>
              setOpenAction(openAction === "call" ? null : "call")
            }
            title="Log call"
            className="w-7 h-7 flex items-center justify-center rounded-md bg-white/[0.03] hover:bg-white/[0.06] text-text-muted hover:text-blue-400 transition-colors"
          >
            <Phone size={13} />
          </button>
          <button
            onClick={() =>
              setOpenAction(openAction === "note" ? null : "note")
            }
            title="Add note"
            className="w-7 h-7 flex items-center justify-center rounded-md bg-white/[0.03] hover:bg-white/[0.06] text-text-muted hover:text-purple-400 transition-colors"
          >
            <FileText size={13} />
          </button>
          <button
            onClick={() =>
              setOpenAction(
                openAction === "reschedule" ? null : "reschedule"
              )
            }
            title="Reschedule"
            className="w-7 h-7 flex items-center justify-center rounded-md bg-white/[0.03] hover:bg-white/[0.06] text-text-muted hover:text-yellow-400 transition-colors"
          >
            <CalendarDays size={13} />
          </button>
          <button
            onClick={() =>
              setOpenAction(openAction === "done" ? null : "done")
            }
            title="Mark done"
            className="w-7 h-7 flex items-center justify-center rounded-md bg-white/[0.03] hover:bg-white/[0.06] text-text-muted hover:text-green-400 transition-colors"
          >
            <CheckCircle size={13} />
          </button>
          <button
            onClick={() => { setOpenAction(null); setShowAI(!showAI); }}
            title="AI Suggest"
            className="w-7 h-7 flex items-center justify-center rounded-md bg-white/[0.03] hover:bg-white/[0.06] text-text-muted hover:text-purple-400 transition-colors"
          >
            <Sparkles size={13} />
          </button>
        </div>
      </div>

      {/* Action popover */}
      {openAction && (
        <div className="px-2 pb-2">
          <ActionPopover
            leadId={lead.id}
            leadName={lead.name}
            actionType={openAction}
            onClose={() => setOpenAction(null)}
            onSuccess={handleSuccess}
          />
        </div>
      )}

      {/* AI Suggest popover */}
      {showAI && (
        <div className="px-2 pb-2">
          <AISuggestPopover
            leadId={lead.id}
            onClose={() => setShowAI(false)}
          />
        </div>
      )}
    </div>
  );
}

// ─── Claim Button Row ───
function ClaimableRow({
  lead,
  onClaimed,
}: {
  lead: LeadItem;
  onClaimed: (msg: string) => void;
}) {
  const [claiming, setClaiming] = useState(false);
  const [hidden, setHidden] = useState(false);

  const claim = async () => {
    setClaiming(true);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}/claim`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Claim failed");
      }
      setHidden(true);
      onClaimed(`${lead.name} claimed successfully`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setClaiming(false);
    }
  };

  if (hidden) return null;

  return (
    <div className="flex items-center gap-3 py-2.5 px-2 border-b border-white/[0.04] last:border-0">
      <Link
        href={`/admin/leads/${lead.id}`}
        className="min-w-0 flex-1 hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-2">
          <p className="text-sm text-text-primary font-medium truncate">
            {lead.name}
          </p>
          <StatusBadge status={lead.status} />
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs text-text-muted">{lead.phone}</span>
          {lead.source && (
            <span className="text-xs text-text-muted">{lead.source}</span>
          )}
        </div>
      </Link>
      <button
        onClick={claim}
        disabled={claiming}
        className="px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600/80 text-white hover:bg-blue-500 disabled:opacity-50 transition-colors flex items-center gap-1.5 shrink-0"
      >
        {claiming ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <UserPlus size={12} />
        )}
        Claim
      </button>
    </div>
  );
}

// ─── Section wrapper ───
function Section({
  title,
  count,
  badgeColor,
  icon: Icon,
  borderColor,
  children,
  defaultOpen = true,
}: {
  title: string;
  count: number;
  badgeColor: string;
  icon: any;
  borderColor?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  if (count === 0) return null;

  return (
    <div
      className={`glass-card overflow-hidden ${
        borderColor ? `border-l-2 ${borderColor}` : ""
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Icon size={16} className="text-text-muted" />
          <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
          <span
            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeColor}`}
          >
            {count}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-text-muted transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && <div className="px-2 pb-2">{children}</div>}
    </div>
  );
}

// ─── Main Component ───
export default function MyDayClient({
  userName,
  userRole,
  userId,
}: MyDayClientProps) {
  const [data, setData] = useState<MyDayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/dashboard/my-day");
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to load");
      }
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load and polling
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleActionSuccess = (msg: string) => {
    setToast(msg);
    // Refresh data after a short delay to let the DB update
    setTimeout(fetchData, 500);
  };

  if (loading) {
    return (
      <div className="glass-card p-8 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-text-muted" />
        <span className="ml-3 text-text-muted text-sm">
          Loading your day...
        </span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-card p-6">
        <p className="text-red-400 text-sm">
          {error || "Failed to load dashboard data"}
        </p>
        <button
          onClick={() => {
            setLoading(true);
            fetchData();
          }}
          className="mt-2 text-xs text-blue-400 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  const activityScore = Math.min(
    100,
    data.stats.callsToday * 5 +
      data.stats.notesToday * 3 +
      data.stats.leadsConverted * 20
  );

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="glass-card p-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-text-primary">
              {data.greeting}
            </h1>
            <p className="text-sm text-text-muted mt-1">
              You have{" "}
              <span className="text-text-primary font-medium">
                {data.summary.followUpsToday} follow-ups
              </span>{" "}
              today
              {data.summary.overdue > 0 && (
                <>
                  ,{" "}
                  <span className="text-red-400 font-medium">
                    {data.summary.overdue} overdue
                  </span>
                </>
              )}
            </p>
            {data.aiBriefing && (
              <p className="text-xs text-text-muted mt-2 italic leading-relaxed">
                {data.aiBriefing}
              </p>
            )}
          </div>
          <p className="text-sm text-text-muted">{data.date}</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            icon: Phone,
            label: "Calls",
            value: data.stats.callsToday,
            color: "text-blue-400",
          },
          {
            icon: FileText,
            label: "Notes",
            value: data.stats.notesToday,
            color: "text-purple-400",
          },
          {
            icon: Target,
            label: "Converted",
            value: data.stats.leadsConverted,
            color: "text-green-400",
          },
          {
            icon: Clock,
            label: "Score",
            value: activityScore,
            color: "text-yellow-400",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="glass-card p-3 flex items-center gap-2.5"
          >
            <stat.icon size={16} className={stat.color} />
            <div>
              <p className="text-lg font-bold text-text-primary leading-none">
                {stat.value}
              </p>
              <p className="text-[10px] text-text-muted mt-0.5">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Due Follow-ups (Overdue — needs immediate attention) */}
      <Section
        title="DUE FOLLOW-UPS"
        count={data.overdueFollowUps.length}
        badgeColor="bg-red-500/10 text-red-400"
        icon={AlertTriangle}
        borderColor="border-l-red-500"
      >
        {data.overdueFollowUps.map((lead) => (
          <LeadRow
            key={lead.id}
            lead={lead}
            section="overdue"
            onActionSuccess={handleActionSuccess}
          />
        ))}
      </Section>

      {/* Pending Follow-ups (Today's follow-ups) */}
      <Section
        title="PENDING FOLLOW-UPS"
        count={data.todayFollowUps.length}
        badgeColor="bg-yellow-500/10 text-yellow-400"
        icon={Clock}
      >
        {data.todayFollowUps.map((lead) => (
          <LeadRow
            key={lead.id}
            lead={lead}
            section="today"
            onActionSuccess={handleActionSuccess}
          />
        ))}
      </Section>

      {/* Upcoming Follow-ups (Next 7 days — from forecast data) */}
      {data.forecast && (() => {
        const upcomingCount = data.forecast.slice(1).reduce((sum: number, d: any) => sum + (d.count || 0), 0);
        return upcomingCount > 0 ? (
          <Section
            title="UPCOMING FOLLOW-UPS"
            count={upcomingCount}
            badgeColor="bg-neon-blue/10 text-neon-blue"
            icon={CalendarDays}
            borderColor="border-l-neon-blue"
            defaultOpen={false}
          >
            <div className="grid grid-cols-6 gap-2 p-3">
              {data.forecast.slice(1).map((day: any, i: number) => (
                <div
                  key={i}
                  className={`text-center p-2 rounded-lg ${
                    day.count > 0 ? "bg-white/[0.03] border border-white/[0.06]" : "opacity-40"
                  }`}
                >
                  <p className="text-[10px] text-text-muted">{day.label}</p>
                  <p className={`text-sm font-bold font-mono ${day.count > 0 ? "text-text-primary" : "text-text-muted"}`}>{day.count}</p>
                </div>
              ))}
            </div>
          </Section>
        ) : null;
      })()}

      {/* Uncontacted Leads (assigned but never contacted) */}
      <Section
        title="UNCONTACTED LEADS"
        count={data.uncontactedLeads.length}
        badgeColor="bg-orange-500/10 text-orange-400"
        icon={Users}
        borderColor="border-l-orange-500"
        defaultOpen={data.todayFollowUps.length === 0 && data.overdueFollowUps.length === 0}
      >
        {data.uncontactedLeads.map((lead) => (
          <LeadRow
            key={lead.id}
            lead={lead}
            section="uncontacted"
            onActionSuccess={handleActionSuccess}
          />
        ))}
      </Section>

      {/* Available to Claim */}
      <Section
        title="AVAILABLE TO CLAIM"
        count={data.availableLeads.length}
        badgeColor="bg-blue-500/10 text-blue-400"
        icon={UserPlus}
        defaultOpen={false}
      >
        {data.availableLeads.map((lead) => (
          <ClaimableRow
            key={lead.id}
            lead={lead}
            onClaimed={handleActionSuccess}
          />
        ))}
      </Section>

      {/* 7-Day Forecast */}
      {data.forecast &&
        data.forecast.some((d) => d.count > 0) && (
          <div className="glass-card p-4">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
              <CalendarDays size={14} />
              7-Day Forecast
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {data.forecast.map((day, i) => (
                <div
                  key={i}
                  className={`text-center p-2 rounded-lg border transition-all ${
                    day.isToday
                      ? "border-blue-500/30 bg-blue-500/10"
                      : day.count > 0
                      ? "border-white/[0.08] bg-white/[0.03]"
                      : "border-white/[0.04] bg-white/[0.01] opacity-50"
                  }`}
                >
                  <p className="text-[10px] text-text-muted">{day.label}</p>
                  <p
                    className={`text-lg font-bold font-mono ${
                      day.isToday
                        ? "text-blue-400"
                        : day.count > 0
                        ? "text-text-primary"
                        : "text-text-muted"
                    }`}
                  >
                    {day.count}
                  </p>
                  {day.isToday && (
                    <p className="text-[9px] text-blue-400 font-medium">
                      Today
                    </p>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-text-muted mt-2">
              Total this week:{" "}
              {data.forecast.reduce((sum, d) => sum + d.count, 0)} follow-ups
            </p>
          </div>
        )}
    </div>
  );
}
