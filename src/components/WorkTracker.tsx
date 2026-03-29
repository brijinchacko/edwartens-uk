"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Clock,
  MapPin,
  Coffee,
  LogOut,
  LogIn,
  Pause,
  Play,
  Home,
  Building2,
  Globe,
  X,
  Send,
  Activity,
} from "lucide-react";

/* ────────────────────────────────────────────── Types */
interface WorkSession {
  id: string;
  checkInTime: string;
  location: "HOME" | "OFFICE" | "REMOTE";
  status: "ACTIVE" | "BREAK" | "IDLE";
  note?: string;
  breaks: { id: string; reason: string; startTime: string; endTime?: string }[];
  totalActiveSeconds: number;
  totalBreakSeconds: number;
}

type BreakReason = "Tea/Coffee" | "Lunch" | "Prayer" | "Personal" | "Other";

const LOCATION_META: Record<
  string,
  { icon: React.ReactNode; label: string; color: string }
> = {
  HOME: { icon: <Home size={14} />, label: "Home", color: "text-purple-400" },
  OFFICE: {
    icon: <Building2 size={14} />,
    label: "Office",
    color: "text-neon-blue",
  },
  REMOTE: {
    icon: <Globe size={14} />,
    label: "Remote",
    color: "text-emerald-400",
  },
};

const STATUS_META: Record<
  string,
  { emoji: string; label: string; color: string }
> = {
  ACTIVE: { emoji: "\uD83D\uDFE2", label: "Active", color: "text-green-400" },
  BREAK: { emoji: "\uD83D\uDFE1", label: "On Break", color: "text-yellow-400" },
  IDLE: { emoji: "\uD83D\uDD34", label: "Idle", color: "text-red-400" },
};

const BREAK_REASONS: BreakReason[] = [
  "Tea/Coffee",
  "Lunch",
  "Prayer",
  "Personal",
  "Other",
];

/* ────────────────────────────────────────────── Helpers */
function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/* ────────────────────────────────────────────── Component */
export function WorkTracker() {
  const [session, setSession] = useState<WorkSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [breakElapsed, setBreakElapsed] = useState(0);

  // Modals
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showBreak, setShowBreak] = useState(false);
  const [showCheckOut, setShowCheckOut] = useState(false);

  // Form state
  const [selectedLocation, setSelectedLocation] = useState<
    "HOME" | "OFFICE" | "REMOTE"
  >("HOME");
  const [checkInNote, setCheckInNote] = useState("");
  const [breakReason, setBreakReason] = useState<BreakReason>("Tea/Coffee");
  const [checkOutSummary, setCheckOutSummary] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Activity tracking refs
  const lastActivity = useRef(Date.now());
  const isUserActive = useRef(true);

  /* ── Fetch current session on mount ── */
  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/admin/work-session");
        if (res.ok) {
          const data = await res.json();
          const s = data.activeSession || data.session;
          if (s) {
            // Map API shape to component shape
            const breaks = (s.breaks || []).map((b: any) => ({
              id: b.id,
              reason: b.reason || "Break",
              startTime: b.startedAt,
              endTime: b.endedAt || undefined,
            }));
            const activeSeconds = (s.activities || [])
              .filter((a: any) => a.type === "ACTIVE")
              .reduce((sum: number, a: any) => {
                const start = new Date(a.startedAt).getTime();
                const end = a.endedAt ? new Date(a.endedAt).getTime() : Date.now();
                return sum + Math.floor((end - start) / 1000);
              }, 0);
            const breakSeconds = breaks.reduce((sum: number, b: any) => {
              const start = new Date(b.startTime).getTime();
              const end = b.endTime ? new Date(b.endTime).getTime() : Date.now();
              return sum + Math.floor((end - start) / 1000);
            }, 0);

            const statusMap: Record<string, string> = {
              CHECKED_IN: "ACTIVE",
              ON_BREAK: "BREAK",
              IDLE: "IDLE",
            };

            setSession({
              id: s.id,
              checkInTime: s.checkInAt,
              location: s.workLocation,
              status: (statusMap[s.status] || "ACTIVE") as "ACTIVE" | "BREAK" | "IDLE",
              note: s.checkInNote || undefined,
              breaks,
              totalActiveSeconds: activeSeconds,
              totalBreakSeconds: breakSeconds,
            });
          }
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, []);

  /* ── Live timer ── */
  useEffect(() => {
    if (!session) return;
    const checkIn = new Date(session.checkInTime).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      setElapsed(Math.floor((now - checkIn) / 1000));

      // Break timer
      const currentBreak = session.breaks.find((b) => !b.endTime);
      if (currentBreak) {
        const breakStart = new Date(currentBreak.startTime).getTime();
        setBreakElapsed(Math.floor((now - breakStart) / 1000));
      } else {
        setBreakElapsed(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

  /* ── Activity tracking (heartbeat) ── */
  useEffect(() => {
    if (!session) return;

    function onActivity() {
      lastActivity.current = Date.now();
      if (!isUserActive.current) {
        isUserActive.current = true;
      }
    }

    const events = ["mousemove", "keypress", "click", "scroll"];
    events.forEach((e) => document.addEventListener(e, onActivity));

    // Heartbeat every 60s
    const heartbeat = setInterval(async () => {
      const idleMs = Date.now() - lastActivity.current;
      const active = idleMs < 5 * 60 * 1000; // 5 min threshold
      isUserActive.current = active;

      try {
        await fetch("/api/admin/work-session/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: active }),
        });
      } catch {
        // ignore
      }
    }, 60_000);

    return () => {
      events.forEach((e) => document.removeEventListener(e, onActivity));
      clearInterval(heartbeat);
    };
  }, [session]);

  /* ── Check In ── */
  const handleCheckIn = useCallback(async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/work-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workLocation: selectedLocation,
          note: checkInNote || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSession({
          id: data.id,
          checkInTime: data.checkInAt,
          location: data.workLocation,
          status: "ACTIVE",
          note: data.checkInNote || undefined,
          breaks: [],
          totalActiveSeconds: 0,
          totalBreakSeconds: 0,
        });
        setShowCheckIn(false);
        setCheckInNote("");
      }
    } catch {
      // handle error
    } finally {
      setSubmitting(false);
    }
  }, [selectedLocation, checkInNote]);

  /* ── Take Break ── */
  const handleTakeBreak = useCallback(async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/work-session/break", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", reason: breakReason }),
      });
      if (res.ok) {
        setSession((prev) =>
          prev
            ? {
                ...prev,
                status: "BREAK",
                breaks: [
                  ...prev.breaks,
                  {
                    id: Date.now().toString(),
                    reason: breakReason,
                    startTime: new Date().toISOString(),
                  },
                ],
              }
            : prev
        );
        setShowBreak(false);
      }
    } catch {
      // handle error
    } finally {
      setSubmitting(false);
    }
  }, [breakReason]);

  /* ── End Break ── */
  const handleEndBreak = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/work-session/break", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "end" }),
      });
      if (res.ok) {
        setSession((prev) =>
          prev
            ? {
                ...prev,
                status: "ACTIVE",
                breaks: prev.breaks.map((b, i) =>
                  i === prev.breaks.length - 1 && !b.endTime
                    ? { ...b, endTime: new Date().toISOString() }
                    : b
                ),
              }
            : prev
        );
      }
    } catch {
      // handle error
    }
  }, []);

  /* ── Check Out ── */
  const handleCheckOut = useCallback(async () => {
    if (!checkOutSummary.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/work-session/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary: checkOutSummary }),
      });
      if (res.ok) {
        setSession(null);
        setShowCheckOut(false);
        setCheckOutSummary("");
        setElapsed(0);
      }
    } catch {
      // handle error
    } finally {
      setSubmitting(false);
    }
  }, [checkOutSummary]);

  /* ── Derived values ── */
  const onBreak = session?.status === "BREAK";
  const currentBreakCount = session?.breaks.length ?? 0;
  const totalBreakSec =
    (session?.totalBreakSeconds ?? 0) + (onBreak ? breakElapsed : 0);
  const activeSec = elapsed - totalBreakSec;

  if (loading) return null;

  /* ═══════════════════════════════════════════ RENDER ═══ */
  return (
    <>
      {/* ─── Main Card ─── */}
      <div className="glass-card rounded-xl p-4 mb-6 border border-white/[0.06]">
        {!session ? (
          /* ── Not checked in ── */
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/[0.04] flex items-center justify-center">
                <Clock size={20} className="text-text-muted" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">
                  You&apos;re not checked in
                </p>
                <p className="text-xs text-text-muted">
                  Start your work session to track activity
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCheckIn(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-blue/20 text-neon-blue hover:bg-neon-blue/30 transition-colors text-sm font-medium"
            >
              <LogIn size={16} />
              Check In
            </button>
          </div>
        ) : (
          /* ── Checked in ── */
          <div className="space-y-3">
            {/* Top row: timer + status + location */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4">
                {/* Live timer */}
                <div className="flex items-center gap-2">
                  <Activity size={18} className="text-neon-green" />
                  <span className="text-2xl font-mono font-bold text-text-primary tracking-wider">
                    {formatDuration(elapsed)}
                  </span>
                </div>

                {/* Status badge */}
                <span
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    session.status === "ACTIVE"
                      ? "bg-green-500/10 text-green-400"
                      : session.status === "BREAK"
                        ? "bg-yellow-500/10 text-yellow-400"
                        : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {STATUS_META[session.status].emoji}{" "}
                  {STATUS_META[session.status].label}
                </span>

                {/* Location badge */}
                <span
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-white/[0.04] ${LOCATION_META[session.location].color}`}
                >
                  {LOCATION_META[session.location].icon}
                  {LOCATION_META[session.location].label}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                {onBreak ? (
                  <button
                    onClick={handleEndBreak}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors text-xs font-medium"
                  >
                    <Play size={14} />
                    End Break ({formatDuration(breakElapsed)})
                  </button>
                ) : (
                  <button
                    onClick={() => setShowBreak(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] text-text-secondary hover:bg-white/[0.08] transition-colors text-xs font-medium"
                  >
                    <Pause size={14} />
                    Take Break
                  </button>
                )}
                <button
                  onClick={() => setShowCheckOut(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-xs font-medium"
                >
                  <LogOut size={14} />
                  Check Out
                </button>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-6 text-xs text-text-muted pt-1 border-t border-white/[0.04]">
              <span>
                Active:{" "}
                <span className="text-green-400 font-medium">
                  {formatDuration(Math.max(0, activeSec))}
                </span>
              </span>
              <span>
                Breaks:{" "}
                <span className="text-yellow-400 font-medium">
                  {formatDuration(totalBreakSec)}
                </span>{" "}
                ({currentBreakCount})
              </span>
              <span>
                Total:{" "}
                <span className="text-text-secondary font-medium">
                  {formatDuration(elapsed)}
                </span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ─── Check-In Modal ─── */}
      {showCheckIn && (
        <ModalOverlay onClose={() => setShowCheckIn(false)}>
          <div className="glass-card rounded-2xl p-6 w-full max-w-md border border-white/[0.08]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-text-primary">
                Where are you working from?
              </h3>
              <button
                onClick={() => setShowCheckIn(false)}
                className="text-text-muted hover:text-text-primary"
              >
                <X size={18} />
              </button>
            </div>

            {/* Location options */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {(["HOME", "OFFICE", "REMOTE"] as const).map((loc) => {
                const meta = LOCATION_META[loc];
                const selected = selectedLocation === loc;
                return (
                  <button
                    key={loc}
                    onClick={() => setSelectedLocation(loc)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                      selected
                        ? "border-neon-blue bg-neon-blue/10"
                        : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className="text-2xl">
                      {loc === "HOME"
                        ? "\uD83C\uDFE0"
                        : loc === "OFFICE"
                          ? "\uD83C\uDFE2"
                          : "\uD83C\uDF10"}
                    </span>
                    <span
                      className={`text-xs font-medium ${selected ? "text-neon-blue" : "text-text-secondary"}`}
                    >
                      {meta.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Optional note */}
            <textarea
              placeholder="Optional note (e.g., working on leads today)..."
              value={checkInNote}
              onChange={(e) => setCheckInNote(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-blue/40 resize-none"
              rows={2}
            />

            <button
              onClick={handleCheckIn}
              disabled={submitting}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-neon-blue text-white font-medium text-sm hover:bg-neon-blue/90 transition-colors disabled:opacity-50"
            >
              <LogIn size={16} />
              {submitting ? "Checking in..." : "Check In"}
            </button>
          </div>
        </ModalOverlay>
      )}

      {/* ─── Break Modal ─── */}
      {showBreak && (
        <ModalOverlay onClose={() => setShowBreak(false)}>
          <div className="glass-card rounded-2xl p-6 w-full max-w-sm border border-white/[0.08]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-text-primary">
                Take a Break
              </h3>
              <button
                onClick={() => setShowBreak(false)}
                className="text-text-muted hover:text-text-primary"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              {BREAK_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setBreakReason(reason)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${
                    breakReason === reason
                      ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30"
                      : "bg-white/[0.02] text-text-secondary border border-white/[0.06] hover:bg-white/[0.04]"
                  }`}
                >
                  {reason === "Tea/Coffee"
                    ? "\u2615"
                    : reason === "Lunch"
                      ? "\uD83C\uDF5C"
                      : reason === "Prayer"
                        ? "\uD83D\uDE4F"
                        : reason === "Personal"
                          ? "\uD83D\uDC64"
                          : "\uD83D\uDCCC"}{" "}
                  {reason}
                </button>
              ))}
            </div>

            <button
              onClick={handleTakeBreak}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-yellow-500/20 text-yellow-400 font-medium text-sm hover:bg-yellow-500/30 transition-colors disabled:opacity-50"
            >
              <Coffee size={16} />
              {submitting ? "Starting break..." : "Start Break"}
            </button>
          </div>
        </ModalOverlay>
      )}

      {/* ─── Check-Out Modal ─── */}
      {showCheckOut && (
        <ModalOverlay onClose={() => setShowCheckOut(false)}>
          <div className="glass-card rounded-2xl p-6 w-full max-w-md border border-white/[0.08]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-text-primary">
                End Work Session
              </h3>
              <button
                onClick={() => setShowCheckOut(false)}
                className="text-text-muted hover:text-text-primary"
              >
                <X size={18} />
              </button>
            </div>

            {/* Session summary */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="p-3 rounded-lg bg-white/[0.03] text-center">
                <p className="text-xs text-text-muted mb-1">Active</p>
                <p className="text-sm font-mono font-semibold text-green-400">
                  {formatDuration(Math.max(0, activeSec))}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.03] text-center">
                <p className="text-xs text-text-muted mb-1">
                  Breaks ({currentBreakCount})
                </p>
                <p className="text-sm font-mono font-semibold text-yellow-400">
                  {formatDuration(totalBreakSec)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.03] text-center">
                <p className="text-xs text-text-muted mb-1">Total</p>
                <p className="text-sm font-mono font-semibold text-text-secondary">
                  {formatDuration(elapsed)}
                </p>
              </div>
            </div>

            <textarea
              placeholder="What did you accomplish today? (required)"
              value={checkOutSummary}
              onChange={(e) => setCheckOutSummary(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-blue/40 resize-none"
              rows={4}
            />

            <button
              onClick={handleCheckOut}
              disabled={submitting || !checkOutSummary.trim()}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/80 text-white font-medium text-sm hover:bg-red-500/90 transition-colors disabled:opacity-50"
            >
              <Send size={16} />
              {submitting ? "Submitting..." : "Check Out"}
            </button>
          </div>
        </ModalOverlay>
      )}
    </>
  );
}

/* ────────────────────────────────────────────── Modal Overlay */
function ModalOverlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
