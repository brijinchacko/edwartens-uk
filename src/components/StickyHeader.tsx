"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { Bell, Clock, LogIn, LogOut, Coffee, Play, Pause, Home, Building2, Globe, X, Send } from "lucide-react";
import GlobalSearch from "./GlobalSearch";
import StickyNotes from "./StickyNotes";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link: string | null;
  createdAt: string;
}

interface WorkSession {
  status: string;
  checkInAt: string;
  workLocation: string;
}

export function StickyHeader({ userRole }: { userRole: string }) {
  const pathname = usePathname();
  const isSuperAdmin = userRole === "SUPER_ADMIN";

  // UK Clock
  const [ukTime, setUkTime] = useState("");
  useEffect(() => {
    const tick = () => {
      setUkTime(new Date().toLocaleString("en-GB", {
        weekday: "short", day: "numeric", month: "short",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        timeZone: "Europe/London",
      }));
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, []);

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Work session
  const [work, setWork] = useState<WorkSession | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [showWorkPopup, setShowWorkPopup] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [checkInLocation, setCheckInLocation] = useState<string>("HOME");
  const [checkOutSummary, setCheckOutSummary] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const workRef = useRef<HTMLDivElement>(null);

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
    fetchWork();
    const i1 = setInterval(fetchNotifications, 60000);
    const i2 = setInterval(fetchWork, 30000); // Refresh session every 30s
    return () => { clearInterval(i1); clearInterval(i2); };
  }, [fetchNotifications, fetchWork]);

  // Timer
  useEffect(() => {
    if (!work) return;
    const checkIn = new Date(work.checkInAt).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - checkIn) / 1000));
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, [work]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
      if (workRef.current && !workRef.current.contains(e.target as Node)) setShowWorkPopup(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markRead = async (id: string) => {
    try {
      await fetch(`/api/admin/notifications?id=${id}`, { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  const fmt = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  // Check in
  const handleCheckIn = async () => {
    setSubmitting(true);
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
    setSubmitting(false);
  };

  // Check out
  const handleCheckOut = async () => {
    if (!checkOutSummary.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/work-session/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary: checkOutSummary }),
      });
      if (res.ok) {
        setWork(null);
        setElapsed(0);
        setShowWorkPopup(false);
        setCheckOutSummary("");
      }
    } catch {}
    setSubmitting(false);
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

  const locEmoji: Record<string, string> = { HOME: "🏠", OFFICE: "🏢", REMOTE: "🌐" };
  const statusDot = work?.status === "CHECKED_IN" ? "bg-green-400" : work?.status === "ON_BREAK" ? "bg-yellow-400" : "bg-red-400";

  return (
    <>
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 lg:px-6 py-2 bg-[#111921] border-b border-white/[0.08]">
        {/* Left: Search + Quick Add */}
        <div className="flex items-center gap-2 flex-1 max-w-2xl">
          <div className="flex-1 max-w-xl">
            <GlobalSearch />
          </div>
          {userRole !== "HR_MANAGER" && (
            <a
              href="/admin/leads?addLead=true"
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#7BC142]/10 border border-[#7BC142]/20 text-[#7BC142] text-[11px] font-medium hover:bg-[#7BC142]/20 transition-colors"
            >
              <span className="text-sm">+</span> Lead
            </a>
          )}
          {userRole !== "HR_MANAGER" && (
            <a
              href="/admin/students"
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neon-blue/10 border border-neon-blue/20 text-neon-blue text-[11px] font-medium hover:bg-neon-blue/20 transition-colors"
            >
              <span className="text-sm">+</span> Student
            </a>
          )}
        </div>

        {/* Right: UK Clock + Timer + StickyNotes + Bell */}
        <div className="flex items-center gap-3 ml-4">
          {/* UK Clock */}
          {ukTime && (
            <span className="hidden lg:flex items-center gap-1 text-[11px] text-text-muted font-mono">
              🇬🇧 {ukTime}
            </span>
          )}

          {/* Work Timer (clickable → popup) */}
          {!isSuperAdmin && (
            <div className="relative" ref={workRef}>
              {work ? (
                <button
                  onClick={() => setShowWorkPopup(!showWorkPopup)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-xs hover:bg-white/[0.06] transition-colors"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${statusDot} animate-pulse`} />
                  <span className="font-mono font-semibold text-text-primary">{fmt(elapsed)}</span>
                  <span className="text-text-muted text-[10px]">{locEmoji[work.workLocation] || ""}</span>
                  {work.status === "ON_BREAK" && <span className="text-yellow-400 text-[10px]">Break</span>}
                </button>
              ) : (
                <button
                  onClick={() => setShowCheckIn(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#7BC142]/10 border border-[#7BC142]/20 text-[#7BC142] text-[11px] font-medium hover:bg-[#7BC142]/20 transition-colors"
                >
                  <LogIn size={12} /> Check In
                </button>
              )}

              {/* Work Popup — Break / Check Out */}
              {showWorkPopup && work && (
                <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-white/[0.08] bg-[#0a0a14] shadow-2xl z-50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-text-primary">Work Session</h3>
                    <button onClick={() => setShowWorkPopup(false)} className="text-text-muted hover:text-text-primary"><X size={14} /></button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-white/[0.03]">
                      <p className="text-[10px] text-text-muted">Timer</p>
                      <p className="text-sm font-mono font-bold text-text-primary">{fmt(elapsed)}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-white/[0.03]">
                      <p className="text-[10px] text-text-muted">Location</p>
                      <p className="text-sm">{locEmoji[work.workLocation]} {work.workLocation}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-white/[0.03]">
                      <p className="text-[10px] text-text-muted">Status</p>
                      <p className={`text-sm font-medium ${work.status === "CHECKED_IN" ? "text-green-400" : work.status === "ON_BREAK" ? "text-yellow-400" : "text-red-400"}`}>
                        {work.status === "CHECKED_IN" ? "Active" : work.status === "ON_BREAK" ? "Break" : "Idle"}
                      </p>
                    </div>
                  </div>

                  {/* Break button */}
                  <button
                    onClick={handleBreak}
                    className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      work.status === "ON_BREAK"
                        ? "bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20"
                        : "bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20"
                    }`}
                  >
                    {work.status === "ON_BREAK" ? <><Play size={12} /> End Break</> : <><Pause size={12} /> Take Break</>}
                  </button>

                  {/* Check Out */}
                  <div className="space-y-2">
                    <textarea
                      value={checkOutSummary}
                      onChange={(e) => setCheckOutSummary(e.target.value)}
                      placeholder="What did you accomplish? (required)"
                      className="w-full p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-red-500/30 resize-none"
                      rows={2}
                    />
                    <button
                      onClick={handleCheckOut}
                      disabled={!checkOutSummary.trim() || submitting}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors disabled:opacity-40"
                    >
                      <LogOut size={12} /> {submitting ? "Checking out..." : "Check Out"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <StickyNotes />

          {/* Notification bell */}
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

            {showNotifs && (
              <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border border-white/[0.08] bg-[#0a0a14] shadow-2xl z-50">
                <div className="p-3 border-b border-white/[0.06] flex items-center justify-between sticky top-0 bg-[#0a0a14]">
                  <h3 className="text-sm font-semibold text-text-primary">Notifications</h3>
                  {unreadCount > 0 && <span className="text-[10px] text-neon-blue">{unreadCount} unread</span>}
                </div>
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-text-muted text-xs">No notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => { if (!n.read) markRead(n.id); if (n.link) window.location.href = n.link; }}
                      className={`p-3 border-b border-white/[0.04] cursor-pointer hover:bg-white/[0.03] transition-colors ${!n.read ? "bg-neon-blue/[0.03] border-l-2 border-l-neon-blue" : ""}`}
                    >
                      <p className="text-xs text-text-primary font-medium">{n.title}</p>
                      <p className="text-[11px] text-text-muted mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-text-muted mt-1">
                        {new Date(n.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" })}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
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
                { value: "HOME", label: "Home", emoji: "🏠" },
                { value: "OFFICE", label: "Office", emoji: "🏢" },
                { value: "REMOTE", label: "Remote", emoji: "🌐" },
              ].map((loc) => (
                <button
                  key={loc.value}
                  onClick={() => setCheckInLocation(loc.value)}
                  className={`p-3 rounded-lg text-center text-xs border transition-colors ${
                    checkInLocation === loc.value
                      ? "border-[#7BC142]/30 bg-[#7BC142]/10 text-[#7BC142]"
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
              disabled={submitting}
              className="w-full py-2.5 rounded-lg bg-[#7BC142]/20 text-[#7BC142] text-sm font-medium hover:bg-[#7BC142]/30 transition-colors disabled:opacity-50"
            >
              {submitting ? "Checking in..." : "Check In"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
