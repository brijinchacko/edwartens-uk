"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  Bell,
  Target,
  Clock,
  LogIn,
  Coffee,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  X,
  Home,
  Building2,
  Globe,
  ChevronDown,
} from "lucide-react";

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link: string | null;
  createdAt: string;
}

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

// ═══════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════

export function StickyHeader({ userRole }: { userRole: string }) {
  const pathname = usePathname();
  const isSuperAdmin = userRole === "SUPER_ADMIN";

  // Notification state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Target state
  const [target, setTarget] = useState<TargetData | null>(null);

  // Work session state
  const [work, setWork] = useState<WorkSession | null>(null);
  const [elapsed, setElapsed] = useState(0);

  // Check-in modal
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [checkInLocation, setCheckInLocation] = useState("HOME");
  const [checkingIn, setCheckingIn] = useState(false);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      if (res.ok) {
        const data = await res.json();
        const notifs = data.notifications || [];
        setNotifications(notifs.slice(0, 20));
        setUnreadCount(notifs.filter((n: Notification) => !n.read).length);
      }
    } catch {}
  }, []);

  // Fetch target
  const fetchTarget = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/team-targets");
      if (res.ok) {
        const data = await res.json();
        setTarget(data);
      }
    } catch {}
  }, []);

  // Fetch work session
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
    fetchNotifications();
    fetchTarget();
    fetchWork();
    // Poll notifications every 60s
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications, fetchTarget, fetchWork]);

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

  // Close notif dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Mark notification as read
  const markRead = async (id: string) => {
    try {
      await fetch(`/api/admin/notifications?id=${id}`, { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  // Check in
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

  // Check out
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

  // Break
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

  const targetColor = target?.hardTargetMet ? "text-neon-green" : (target?.hardTargetPercent || 0) < 50 ? "text-red-400" : "text-yellow-400";
  const locationIcons: Record<string, string> = { HOME: "🏠", OFFICE: "🏢", REMOTE: "🌐" };
  const statusEmoji = work?.status === "CHECKED_IN" ? "🟢" : work?.status === "ON_BREAK" ? "🟡" : "🔴";

  return (
    <>
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-2 mb-4 rounded-lg border border-white/[0.06] bg-[#0a0a14]/95 backdrop-blur-xl shadow-lg">
        {/* Left: Work session */}
        <div className="flex items-center gap-4 text-xs">
          {!isSuperAdmin && (
            <>
              {work ? (
                <div className="flex items-center gap-3">
                  <span>{statusEmoji}</span>
                  <span className="font-mono font-semibold text-text-primary">{formatTime(elapsed)}</span>
                  <span className="text-text-muted">{locationIcons[work.workLocation] || ""}</span>
                  <button onClick={handleBreak} className={`px-2 py-0.5 rounded text-[10px] ${work.status === "ON_BREAK" ? "bg-neon-green/10 text-neon-green" : "bg-yellow-500/10 text-yellow-400"}`}>
                    {work.status === "ON_BREAK" ? "End Break" : "Break"}
                  </button>
                  <button onClick={handleCheckOut} className="px-2 py-0.5 rounded text-[10px] bg-red-500/10 text-red-400">
                    Out
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowCheckIn(true)} className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neon-blue/10 text-neon-blue text-[11px] font-medium hover:bg-neon-blue/20 transition-colors">
                  <LogIn size={12} /> Check In
                </button>
              )}
            </>
          )}

          {/* Center: Target */}
          {target && (
            <div className="flex items-center gap-2 text-text-muted">
              <span className="hidden sm:inline">|</span>
              <Target size={12} className={targetColor} />
              <span>
                <span className={`font-semibold ${targetColor}`}>{target.totalAchieved}/{target.totalTarget}</span>
                <span className="hidden sm:inline"> · Hard: {target.totalAchieved}/{target.hardTarget}</span>
              </span>
              <span className="hidden md:inline text-text-muted">{target.daysRemaining}d left</span>
              {target.rollover > 0 && <span className="text-[10px] text-red-400">+{target.rollover}</span>}
              <div className="w-16 h-1.5 bg-dark-primary rounded-full overflow-hidden hidden sm:block">
                <div className="h-full rounded-full" style={{
                  width: `${Math.min(target.hardTargetPercent, 100)}%`,
                  background: target.hardTargetMet ? "#92E02C" : target.hardTargetPercent >= 75 ? "#F59E0B" : "#EF4444",
                }} />
              </div>
            </div>
          )}
        </div>

        {/* Right: Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 rounded-lg hover:bg-white/[0.05] transition-colors"
          >
            <Bell size={18} className="text-text-muted" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifs && (
            <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border border-white/[0.08] bg-[#0a0a14] shadow-2xl z-50">
              <div className="p-3 border-b border-white/[0.06] flex items-center justify-between sticky top-0 bg-[#0a0a14]">
                <h3 className="text-sm font-semibold text-text-primary">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] text-neon-blue">{unreadCount} unread</span>
                )}
              </div>
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-text-muted text-xs">No notifications</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (!n.read) markRead(n.id);
                      if (n.link) window.location.href = n.link;
                    }}
                    className={`p-3 border-b border-white/[0.04] cursor-pointer hover:bg-white/[0.03] transition-colors ${
                      !n.read ? "bg-neon-blue/[0.03] border-l-2 border-l-neon-blue" : ""
                    }`}
                  >
                    <p className="text-xs text-text-primary font-medium">{n.title}</p>
                    <p className="text-[11px] text-text-muted mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-text-muted mt-1">
                      {new Date(n.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Check-in Modal */}
      {showCheckIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCheckIn(false)} />
          <div className="relative w-full max-w-xs mx-4 rounded-xl border border-white/[0.06] bg-[#0a0a14]/95 backdrop-blur-xl shadow-2xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white">Where are you working from?</h2>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "HOME", label: "Home", icon: "🏠" },
                { value: "OFFICE", label: "Office", icon: "🏢" },
                { value: "REMOTE", label: "Remote", icon: "🌐" },
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
                  <span className="text-lg">{loc.icon}</span>
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
