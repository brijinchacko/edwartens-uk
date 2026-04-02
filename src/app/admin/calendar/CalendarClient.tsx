"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Clock,
  MapPin,
  Users,
  Phone,
  Layers,
  Wrench,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface CalendarEvent {
  id: string;
  subject: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  location?: { displayName: string };
  body?: { contentType: string; content: string };
  attendees?: { emailAddress: { name: string; address: string }; type: string }[];
  isAllDay?: boolean;
  webLink?: string;
}

type EventType = "follow-up" | "batch" | "practical" | "meeting" | "other";

const EVENT_COLORS: Record<EventType, string> = {
  "follow-up": "bg-blue-500/20 border-blue-500/50 text-blue-300",
  batch: "bg-purple-500/20 border-purple-500/50 text-purple-300",
  practical: "bg-amber-500/20 border-amber-500/50 text-amber-300",
  meeting: "bg-emerald-500/20 border-emerald-500/50 text-emerald-300",
  other: "bg-gray-500/20 border-gray-500/50 text-gray-300",
};

const EVENT_DOT_COLORS: Record<EventType, string> = {
  "follow-up": "bg-blue-400",
  batch: "bg-purple-400",
  practical: "bg-amber-400",
  meeting: "bg-emerald-400",
  other: "bg-gray-400",
};

function classifyEvent(subject: string): EventType {
  const s = subject.toLowerCase();
  if (s.includes("follow-up") || s.includes("follow up") || s.includes("call")) return "follow-up";
  if (s.includes("batch") || s.includes("training") || s.includes("session")) return "batch";
  if (s.includes("practical") || s.includes("hands-on") || s.includes("lab")) return "practical";
  if (s.includes("meeting") || s.includes("standup") || s.includes("review") || s.includes("sync")) return "meeting";
  return "other";
}

function getWeekDates(baseDate: Date): Date[] {
  const dates: Date[] = [];
  const day = baseDate.getDay();
  const monday = new Date(baseDate);
  monday.setDate(baseDate.getDate() - ((day + 6) % 7));
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" });
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "Europe/London" });
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7am to 8pm

export default function CalendarClient() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [quickAction, setQuickAction] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formSubject, setFormSubject] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formStartTime, setFormStartTime] = useState("09:00");
  const [formDuration, setFormDuration] = useState("60");
  const [formLocation, setFormLocation] = useState("");
  const [formAttendees, setFormAttendees] = useState("");
  const [formBody, setFormBody] = useState("");

  const weekDates = getWeekDates(currentDate);
  const weekStart = weekDates[0];
  const weekEnd = new Date(weekDates[6]);
  weekEnd.setHours(23, 59, 59, 999);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const start = weekStart.toISOString();
      const end = weekEnd.toISOString();
      const res = await fetch(`/api/admin/calendar?startDate=${start}&endDate=${end}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch");
      setEvents(data.events || []);
      setConnected(data.connected);
      setEmail(data.email);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load calendar");
    } finally {
      setLoading(false);
    }
  }, [weekStart.toISOString(), weekEnd.toISOString()]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const navigateWeek = (direction: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + direction * 7);
    setCurrentDate(d);
  };

  const goToToday = () => setCurrentDate(new Date());

  const openQuickAction = (type: string) => {
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];
    setFormDate(dateStr);
    setFormStartTime("10:00");

    switch (type) {
      case "follow-up":
        setFormSubject("Follow-up Call");
        setFormDuration("30");
        setFormLocation("");
        setFormBody("Follow-up call with lead regarding course enrollment.");
        break;
      case "batch":
        setFormSubject("Batch Training Session");
        setFormDuration("120");
        setFormLocation("Online - Microsoft Teams");
        setFormBody("Scheduled batch training session.");
        break;
      case "practical":
        setFormSubject("Practical Session - Milton Keynes");
        setFormDuration("240");
        setFormLocation("8 Lyon Road, Milton Keynes, MK1 1EX");
        setFormBody("Hands-on practical session at Milton Keynes office.");
        break;
      default:
        setFormSubject("");
        setFormDuration("60");
        setFormLocation("");
        setFormBody("");
    }

    setFormAttendees("");
    setQuickAction(type);
    setShowAddForm(true);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    try {
      const startDT = new Date(`${formDate}T${formStartTime}:00`).toISOString();
      const endDT = new Date(
        new Date(`${formDate}T${formStartTime}:00`).getTime() + parseInt(formDuration) * 60000
      ).toISOString();

      const attendees = formAttendees
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);

      const res = await fetch("/api/admin/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: formSubject,
          start: startDT,
          end: endDT,
          location: formLocation || undefined,
          bodyText: formBody || undefined,
          attendees: attendees.length > 0 ? attendees : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create event");

      setShowAddForm(false);
      setQuickAction(null);
      resetForm();
      fetchEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setFormSubject("");
    setFormDate("");
    setFormStartTime("09:00");
    setFormDuration("60");
    setFormLocation("");
    setFormAttendees("");
    setFormBody("");
  };

  const getEventsForDay = (date: Date): CalendarEvent[] => {
    const dayStr = date.toISOString().split("T")[0];
    return events.filter((ev) => {
      const evDate = new Date(ev.start.dateTime).toISOString().split("T")[0];
      return evDate === dayStr;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
            <CalendarIcon className="text-neon-blue" size={28} />
            Calendar
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Manage your schedule and appointments
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Sync indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-card text-xs">
            {connected ? (
              <>
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span className="text-text-secondary">Outlook: {email}</span>
              </>
            ) : (
              <>
                <AlertCircle size={14} className="text-amber-400" />
                <span className="text-text-secondary">Outlook not connected</span>
              </>
            )}
          </div>
          <button
            onClick={fetchEvents}
            disabled={loading}
            className="p-2 rounded-lg glass-card text-text-secondary hover:text-text-primary transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => {
              resetForm();
              setQuickAction(null);
              setShowAddForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-blue/20 text-neon-blue hover:bg-neon-blue/30 transition-colors text-sm font-medium"
          >
            <Plus size={16} />
            Add Event
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => openQuickAction("follow-up")}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 hover:bg-blue-500/20 transition-colors text-xs"
        >
          <Phone size={14} />
          Schedule Follow-up Call
        </button>
        <button
          onClick={() => openQuickAction("batch")}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 transition-colors text-xs"
        >
          <Layers size={14} />
          Schedule Batch
        </button>
        <button
          onClick={() => openQuickAction("practical")}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20 transition-colors text-xs"
        >
          <Wrench size={14} />
          Schedule Practical
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Week navigation */}
      <div className="flex items-center justify-between glass-card rounded-xl p-4">
        <button
          onClick={() => navigateWeek(-1)}
          className="p-2 rounded-lg hover:bg-white/[0.05] text-text-secondary hover:text-text-primary transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-text-primary">
            {weekDates[0].toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Europe/London" })}
            {" - "}
            {weekDates[6].toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/London" })}
          </h2>
          <button
            onClick={goToToday}
            className="px-3 py-1 rounded-md text-xs bg-white/[0.05] text-text-secondary hover:text-text-primary transition-colors"
          >
            Today
          </button>
        </div>
        <button
          onClick={() => navigateWeek(1)}
          className="p-2 rounded-lg hover:bg-white/[0.05] text-text-secondary hover:text-text-primary transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-neon-blue" size={32} />
        </div>
      ) : (
        <div className="glass-card rounded-xl overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-white/[0.06]">
            {weekDates.map((date, i) => (
              <div
                key={i}
                className={`p-3 text-center border-r border-white/[0.06] last:border-r-0 ${
                  isToday(date) ? "bg-neon-blue/10" : ""
                }`}
              >
                <p className="text-xs text-text-muted">
                  {date.toLocaleDateString("en-GB", { weekday: "short", timeZone: "Europe/London" })}
                </p>
                <p
                  className={`text-lg font-semibold mt-0.5 ${
                    isToday(date) ? "text-neon-blue" : "text-text-primary"
                  }`}
                >
                  {date.getDate()}
                </p>
              </div>
            ))}
          </div>

          {/* Events grid */}
          <div className="grid grid-cols-7 min-h-[400px]">
            {weekDates.map((date, i) => {
              const dayEvents = getEventsForDay(date);
              return (
                <div
                  key={i}
                  className={`border-r border-white/[0.06] last:border-r-0 p-2 space-y-1.5 ${
                    isToday(date) ? "bg-neon-blue/5" : ""
                  }`}
                >
                  {dayEvents.length === 0 && (
                    <p className="text-xs text-text-muted/50 text-center pt-4">
                      No events
                    </p>
                  )}
                  {dayEvents.map((ev) => {
                    const type = classifyEvent(ev.subject);
                    return (
                      <div
                        key={ev.id}
                        className={`p-2 rounded-lg border text-xs cursor-default ${EVENT_COLORS[type]}`}
                        title={`${ev.subject}\n${formatTime(ev.start.dateTime)} - ${formatTime(ev.end.dateTime)}${ev.location?.displayName ? `\n${ev.location.displayName}` : ""}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${EVENT_DOT_COLORS[type]}`} />
                          <span className="font-medium truncate">{ev.subject}</span>
                        </div>
                        <p className="text-[10px] opacity-70 mt-0.5 flex items-center gap-1">
                          <Clock size={10} />
                          {formatTime(ev.start.dateTime)} - {formatTime(ev.end.dateTime)}
                        </p>
                        {ev.location?.displayName && (
                          <p className="text-[10px] opacity-70 flex items-center gap-1 mt-0.5">
                            <MapPin size={10} />
                            <span className="truncate">{ev.location.displayName}</span>
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-text-muted">
        {(Object.entries(EVENT_DOT_COLORS) as [EventType, string][]).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${color}`} />
            <span className="capitalize">{type.replace("-", " ")}</span>
          </div>
        ))}
      </div>

      {/* Add Event Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg glass-card rounded-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">
                {quickAction ? `Schedule ${quickAction.replace("-", " ")}` : "Add Event"}
              </h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setQuickAction(null);
                  resetForm();
                }}
                className="p-1.5 rounded-lg hover:bg-white/[0.05] text-text-muted"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Subject *
                </label>
                <input
                  type="text"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-text-primary text-sm focus:outline-none focus:border-neon-blue/50"
                  placeholder="Event subject"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-text-primary text-sm focus:outline-none focus:border-neon-blue/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-text-primary text-sm focus:outline-none focus:border-neon-blue/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Duration (minutes)
                </label>
                <select
                  value={formDuration}
                  onChange={(e) => setFormDuration(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-text-primary text-sm focus:outline-none focus:border-neon-blue/50"
                >
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                  <option value="180">3 hours</option>
                  <option value="240">4 hours</option>
                  <option value="480">Full day</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Location
                </label>
                <input
                  type="text"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-text-primary text-sm focus:outline-none focus:border-neon-blue/50"
                  placeholder="e.g., Microsoft Teams, Milton Keynes Office"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Attendees (comma-separated emails)
                </label>
                <input
                  type="text"
                  value={formAttendees}
                  onChange={(e) => setFormAttendees(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-text-primary text-sm focus:outline-none focus:border-neon-blue/50"
                  placeholder="email1@example.com, email2@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Description
                </label>
                <textarea
                  value={formBody}
                  onChange={(e) => setFormBody(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-text-primary text-sm focus:outline-none focus:border-neon-blue/50 resize-none"
                  placeholder="Event details..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setQuickAction(null);
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !connected}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-neon-blue text-white text-sm font-medium hover:bg-neon-blue/90 transition-colors disabled:opacity-50"
                >
                  {creating ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Event"
                  )}
                </button>
              </div>

              {!connected && (
                <p className="text-xs text-amber-400 text-center">
                  Connect your Outlook account in Settings to create events.
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
