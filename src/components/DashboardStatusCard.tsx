"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Clock,
  LogIn,
  Coffee,
  LogOut,
  Target,
  Home,
  Building2,
  Globe,
  Pause,
  Play,
  Timer,
} from "lucide-react";

interface TargetData {
  totalAchieved: number;
  totalTarget: number;
  hardTarget: number;
  hardTargetPercent: number;
  daysRemaining: number;
  hardTargetMet: boolean;
  rollover: number;
}

interface WorkSession {
  status: string;
  checkInAt: string;
  workLocation: string;
}

export function DashboardStatusCard({ userRole }: { userRole: string }) {
  const isSuperAdmin = userRole === "SUPER_ADMIN";

  const [target, setTarget] = useState<TargetData | null>(null);
  const [work, setWork] = useState<WorkSession | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [checkInLocation, setCheckInLocation] = useState("HOME");
  const [checkingIn, setCheckingIn] = useState(false);

  const fetchTarget = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/team-targets");
      if (res.ok) setTarget(await res.json());
    } catch {}
  }, []);

  const fetchWork = useCallback(async () => {
    if (isSuperAdmin) return;
    try {
      const res = await fetch("/api/admin/work-session");
      if (res.ok) {
        const data = await res.json();
        const s = data.activeSession;
        if (s) {
          setWork({ status: s.status, checkInAt: s.checkInAt, workLocation: s.workLocation });
        } else {
          setWork(null);
        }
      }
    } catch {}
  }, [isSuperAdmin]);

  useEffect(() => {
    fetchTarget();
    fetchWork();
  }, [fetchTarget, fetchWork]);

  // Timer
  useEffect(() => {
    if (!work) return;
    const checkIn = new Date(work.checkInAt).getTime();
    const tick = () => {
      if (work.status === "CHECKED_IN") {
        setElapsed(Math.floor((Date.now() - checkIn) / 1000));
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [work]);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const res = await fetch("/api/admin/work-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workLocation: checkInLocation }),
      });
      if (res.ok) {
        const data = await res.json();
        const s = data.session || data;
        setWork({ status: "CHECKED_IN", checkInAt: s.checkInAt, workLocation: s.workLocation });
        setShowCheckIn(false);
      }
    } catch {}
    setCheckingIn(false);
  };

  const handleCheckOut = async () => {
    const summary = prompt("What did you accomplish today?");
    if (!summary) return;
    try {
      await fetch("/api/admin/work-session/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary }),
      });
      setWork(null);
      setElapsed(0);
    } catch {}
  };

  const handleBreak = async () => {
    try {
      await fetch("/api/admin/work-session/break", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: work?.status === "ON_BREAK" ? "end" : "start", reason: "Break" }),
      });
      fetchWork();
    } catch {}
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const locationLabels: Record<string, { icon: typeof Home; label: string; emoji: string }> = {
    HOME: { icon: Home, label: "Home", emoji: "🏠" },
    OFFICE: { icon: Building2, label: "Office", emoji: "🏢" },
    REMOTE: { icon: Globe, label: "Remote", emoji: "🌐" },
  };

  const targetColor = target?.hardTargetMet
    ? "text-neon-green"
    : (target?.hardTargetPercent || 0) < 50
    ? "text-red-400"
    : "text-yellow-400";

  const targetBgColor = target?.hardTargetMet
    ? "from-neon-green/10 to-neon-green/5"
    : (target?.hardTargetPercent || 0) < 50
    ? "from-red-500/10 to-red-500/5"
    : "from-yellow-500/10 to-yellow-500/5";

  const targetBarColor = target?.hardTargetMet
    ? "#7BC142"
    : (target?.hardTargetPercent || 0) >= 75
    ? "#F59E0B"
    : "#EF4444";

  // If super admin and no target, don't render
  if (isSuperAdmin && !target) return null;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Work Session Card */}
        {!isSuperAdmin && (
          <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-br from-[#0f1029] to-[#0a0a18] p-5">
            {/* Subtle glow effect */}
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-neon-blue/10 blur-3xl" />

            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-lg bg-neon-blue/10">
                  <Timer size={14} className="text-neon-blue" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Work Session</span>
                {work && work.status === "CHECKED_IN" && <span className="w-2 h-2 rounded-full bg-green-400" />}
              </div>

              {work ? (
                <div className="space-y-4">
                  {/* Timer Display */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold font-mono tracking-tight text-text-primary tabular-nums">
                        {formatTime(elapsed)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06]">
                      <span className="text-base">{locationLabels[work.workLocation]?.emoji || "📍"}</span>
                      <span className="text-xs text-text-secondary">{locationLabels[work.workLocation]?.label || work.workLocation}</span>
                    </div>
                    {work.status === "ON_BREAK" && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 animate-pulse">
                        On Break
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleBreak}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                        work.status === "ON_BREAK"
                          ? "bg-neon-green/10 border border-neon-green/20 text-neon-green hover:bg-neon-green/20"
                          : "bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20"
                      }`}
                    >
                      {work.status === "ON_BREAK" ? <Play size={12} /> : <Pause size={12} />}
                      {work.status === "ON_BREAK" ? "Resume" : "Break"}
                    </button>
                    <button
                      onClick={handleCheckOut}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                    >
                      <LogOut size={12} /> Check Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-text-muted">You haven&apos;t checked in yet today.</p>
                  <button
                    onClick={() => setShowCheckIn(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-neon-blue/15 border border-neon-blue/25 text-neon-blue text-sm font-medium hover:bg-neon-blue/25 transition-all"
                  >
                    <LogIn size={14} /> Check In Now
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Target Card */}
        {target && (
          <div className={`relative overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-br ${targetBgColor} p-5`}>
            {/* Subtle glow */}
            <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full opacity-30 blur-3xl" style={{ background: targetBarColor }} />

            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-lg" style={{ background: `${targetBarColor}15` }}>
                  <Target size={14} style={{ color: targetBarColor }} />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Sales Target</span>
                <span className="ml-auto text-xs text-text-muted">{target.daysRemaining}d left this month</span>
              </div>

              {/* Main Numbers */}
              <div className="flex items-end gap-6 mb-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-text-muted mb-0.5">Monthly</p>
                  <span className={`text-3xl font-bold font-mono tracking-tight ${targetColor}`}>
                    {target.totalAchieved}
                  </span>
                  <span className="text-lg text-text-muted font-mono">/{target.totalTarget}</span>
                </div>
                <div className="pb-1">
                  <p className="text-[10px] uppercase tracking-wider text-text-muted mb-0.5">Hard Target</p>
                  <span className={`text-xl font-bold font-mono ${targetColor}`}>
                    {target.totalAchieved}
                  </span>
                  <span className="text-sm text-text-muted font-mono">/{target.hardTarget}</span>
                </div>
                {target.rollover > 0 && (
                  <div className="pb-1">
                    <p className="text-[10px] uppercase tracking-wider text-red-400/70 mb-0.5">Rollover</p>
                    <span className="text-xl font-bold font-mono text-red-400">+{target.rollover}</span>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(target.hardTargetPercent, 100)}%`,
                    background: `linear-gradient(90deg, ${targetBarColor}CC, ${targetBarColor})`,
                    boxShadow: `0 0 12px ${targetBarColor}40`,
                  }}
                />
              </div>
              <p className="text-[11px] text-text-muted mt-1.5">
                {target.hardTargetPercent}% of hard target
                {target.hardTargetMet && <span className="text-neon-green ml-2">✓ Target Met!</span>}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Check-in Modal */}
      {showCheckIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCheckIn(false)} />
          <div className="relative w-full max-w-xs mx-4 rounded-xl border border-white/[0.06] bg-[#0a0a14]/95 backdrop-blur-xl shadow-2xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white">Where are you working from?</h2>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "HOME", label: "Home", emoji: "🏠" },
                { value: "OFFICE", label: "Office", emoji: "🏢" },
                { value: "REMOTE", label: "Remote", emoji: "🌐" },
              ].map((loc) => (
                <button
                  key={loc.value}
                  onClick={() => setCheckInLocation(loc.value)}
                  className={`p-3 rounded-lg text-center text-xs border transition-colors ${
                    checkInLocation === loc.value
                      ? "border-neon-blue/30 bg-neon-blue/10 text-neon-blue"
                      : "border-white/[0.06] bg-white/[0.02] text-text-muted hover:bg-white/[0.04]"
                  }`}
                >
                  <span className="text-lg">{loc.emoji}</span>
                  <p className="mt-1">{loc.label}</p>
                </button>
              ))}
            </div>
            <button
              onClick={handleCheckIn}
              disabled={checkingIn}
              className="w-full py-2.5 rounded-lg bg-neon-blue/20 text-neon-blue text-sm font-medium hover:bg-neon-blue/30 transition-colors disabled:opacity-50"
            >
              {checkingIn ? "Checking in..." : "Check In"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
