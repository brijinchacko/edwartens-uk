"use client";

import { useState, useCallback } from "react";
import {
  Users,
  CheckCircle,
  Calendar,
  ClipboardList,
  BarChart3,
  MessageSquare,
  Play,
  Square,
  Coffee,
  Save,
  Plus,
  RefreshCw,
  Mail,
  Phone,
  User,
  MapPin,
  Clock,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface BatchTabsProps {
  batchId: string;
  batch: any;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(date: string | Date | null) {
  if (!date) return "-";
  return new Date(date).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const TABS = [
  { id: "overview", label: "Overview", icon: Users },
  { id: "readiness", label: "Readiness", icon: CheckCircle },
  { id: "daily", label: "Daily Sessions", icon: Calendar },
  { id: "attendance", label: "Attendance", icon: BarChart3 },
  { id: "practical", label: "Practical", icon: ClipboardList },
  { id: "feedback", label: "Feedback", icon: MessageSquare },
];

const STATUS_COLORS: Record<string, string> = {
  ONBOARDING: "bg-cyan/10 text-cyan",
  ACTIVE: "bg-green-500/10 text-green-400",
  ON_HOLD: "bg-yellow-500/10 text-yellow-400",
  COMPLETED: "bg-neon-blue/10 text-neon-blue",
  DROPPED: "bg-red-500/10 text-red-400",
};

const ATT_COLORS: Record<string, string> = {
  PRESENT: "bg-green-500/20 text-green-400 border-green-500/30",
  ABSENT: "bg-red-500/20 text-red-400 border-red-500/30",
  LATE: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  EXCUSED: "bg-white/[0.06] text-text-muted border-white/[0.08]",
};

const ATT_BG: Record<string, string> = {
  PRESENT: "bg-green-500/20",
  ABSENT: "bg-red-500/20",
  LATE: "bg-yellow-500/20",
  EXCUSED: "bg-white/[0.06]",
};

const DAY_STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "bg-white/[0.06] text-text-muted border-white/[0.08]",
  IN_PROGRESS: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  COMPLETED: "bg-green-500/10 text-green-400 border-green-500/20",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
};

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function BatchTabs({ batchId, batch }: BatchTabsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [batchData, setBatchData] = useState(batch);
  const [saving, setSaving] = useState(false);

  const refreshBatch = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/batches/${batchId}`);
      const data = await res.json();
      if (data.batch) setBatchData(data.batch);
    } catch (e) {
      console.error("Failed to refresh batch:", e);
    }
  }, [batchId]);

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="glass-card px-4 py-2 overflow-x-auto">
        <div className="flex items-center gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-neon-blue/10 text-neon-blue"
                    : "text-text-muted hover:text-text-primary hover:bg-white/[0.04]"
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <OverviewTab batch={batchData} />
      )}
      {activeTab === "readiness" && (
        <ReadinessTab
          batchId={batchId}
          batch={batchData}
          onRefresh={refreshBatch}
        />
      )}
      {activeTab === "daily" && (
        <DailySessionsTab
          batchId={batchId}
          batch={batchData}
          onRefresh={refreshBatch}
        />
      )}
      {activeTab === "attendance" && (
        <AttendanceTab batch={batchData} />
      )}
      {activeTab === "practical" && (
        <PracticalTab
          batchId={batchId}
          batch={batchData}
          onRefresh={refreshBatch}
        />
      )}
      {activeTab === "feedback" && (
        <FeedbackTab
          batchId={batchId}
          batch={batchData}
          onRefresh={refreshBatch}
        />
      )}
    </div>
  );
}

/* ================================================================== */
/*  OVERVIEW TAB                                                       */
/* ================================================================== */

function OverviewTab({ batch }: { batch: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Students list */}
      <div className="glass-card p-5">
        <h2 className="text-base font-semibold text-text-primary mb-4">
          Enrolled Students ({batch.students?.length || 0})
        </h2>
        {(!batch.students || batch.students.length === 0) ? (
          <p className="text-text-muted text-sm text-center py-4">
            No students enrolled
          </p>
        ) : (
          <div className="space-y-2">
            {batch.students.map((student: any) => (
              <div
                key={student.id}
                className="flex items-center gap-3 py-2.5 border-b border-white/[0.04] last:border-0"
              >
                <div className="w-8 h-8 rounded-full bg-neon-blue/20 border border-neon-blue/30 flex items-center justify-center shrink-0">
                  <span className="text-neon-blue text-xs font-bold">
                    {student.user.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary font-medium truncate">
                    {student.user.name}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    {student.user.email && (
                      <span className="flex items-center gap-1">
                        <Mail size={10} /> {student.user.email}
                      </span>
                    )}
                    {student.user.phone && (
                      <span className="flex items-center gap-1">
                        <Phone size={10} /> {student.user.phone}
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[student.status] || "bg-white/[0.06] text-text-muted"}`}
                >
                  {student.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Batch Info */}
      <div className="space-y-6">
        {/* Trainer info */}
        <div className="glass-card p-5">
          <h2 className="text-base font-semibold text-text-primary mb-4">
            Trainer Information
          </h2>
          {batch.instructor ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <User size={16} className="text-text-muted shrink-0" />
                <span className="text-text-secondary">
                  {batch.instructor.user.name}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail size={16} className="text-text-muted shrink-0" />
                <span className="text-text-secondary">
                  {batch.instructor.user.email}
                </span>
              </div>
              {batch.instructor.user.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone size={16} className="text-text-muted shrink-0" />
                  <span className="text-text-secondary">
                    {batch.instructor.user.phone}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    batch.trainerAccepted
                      ? "bg-green-500/10 text-green-400"
                      : "bg-yellow-500/10 text-yellow-400"
                  }`}
                >
                  {batch.trainerAccepted ? "Accepted" : "Pending Acceptance"}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-text-muted text-sm">No trainer assigned</p>
          )}
        </div>

        {/* Batch details */}
        <div className="glass-card p-5">
          <h2 className="text-base font-semibold text-text-primary mb-4">
            Batch Details
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Mode</span>
              <span className="text-text-secondary">{batch.mode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Capacity</span>
              <span className="text-text-secondary">
                {batch.students?.length || 0}/{batch.capacity}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Location</span>
              <span className="text-text-secondary">
                {batch.location || "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Start Date</span>
              <span className="text-text-secondary">
                {formatDate(batch.startDate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">End Date</span>
              <span className="text-text-secondary">
                {batch.endDate ? formatDate(batch.endDate) : "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Total Days</span>
              <span className="text-text-secondary">
                {batch.batchDays?.length || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Batch Ready</span>
              <span
                className={
                  batch.batchReady ? "text-neon-green" : "text-yellow-400"
                }
              >
                {batch.batchReady ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  READINESS TAB                                                      */
/* ================================================================== */

function ReadinessTab({
  batchId,
  batch,
  onRefresh,
}: {
  batchId: string;
  batch: any;
  onRefresh: () => void;
}) {
  const [saving, setSaving] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const students = batch.students || [];
  const readinessMap: Record<string, any> = {};
  for (const r of batch.readiness || []) {
    readinessMap[r.studentId] = r;
  }

  const checklistFields = [
    { key: "feePaid", label: "Fee Paid" },
    { key: "documentsUploaded", label: "Documents" },
    { key: "softwareInstalled", label: "SW Installed" },
    { key: "softwareVerified", label: "SW Verified" },
    { key: "prerequisitesDone", label: "Prerequisites" },
  ];

  const toggleField = async (studentId: string, field: string) => {
    const current = readinessMap[studentId] || {};
    const newValue = !current[field];

    setSaving(studentId + field);
    try {
      await fetch(`/api/admin/batches/${batchId}/readiness`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          feePaid: field === "feePaid" ? newValue : current.feePaid || false,
          documentsUploaded:
            field === "documentsUploaded"
              ? newValue
              : current.documentsUploaded || false,
          softwareInstalled:
            field === "softwareInstalled"
              ? newValue
              : current.softwareInstalled || false,
          softwareVerified:
            field === "softwareVerified"
              ? newValue
              : current.softwareVerified || false,
          prerequisitesDone:
            field === "prerequisitesDone"
              ? newValue
              : current.prerequisitesDone || false,
        }),
      });
      onRefresh();
    } catch (e) {
      console.error("Toggle readiness error:", e);
    } finally {
      setSaving(null);
    }
  };

  const handleVerifyAll = async () => {
    setVerifying(true);
    try {
      const res = await fetch(`/api/admin/batches/${batchId}/readiness`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify-all" }),
      });
      const data = await res.json();
      alert(data.message);
      onRefresh();
    } catch (e) {
      alert("Failed to verify");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-text-primary">
          Student Readiness Checklist
        </h2>
        <button
          onClick={handleVerifyAll}
          disabled={verifying}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neon-green/10 text-neon-green border border-neon-green/20 hover:bg-neon-green/20 transition-colors text-xs font-medium disabled:opacity-50"
        >
          <CheckCircle size={14} />
          {verifying ? "Verifying..." : "Verify All"}
        </button>
      </div>

      {students.length === 0 ? (
        <p className="text-text-muted text-sm text-center py-4">
          No students enrolled
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-3 py-2 text-text-muted font-medium">
                  Student
                </th>
                {checklistFields.map((f) => (
                  <th
                    key={f.key}
                    className="text-center px-3 py-2 text-text-muted font-medium"
                  >
                    {f.label}
                  </th>
                ))}
                <th className="text-center px-3 py-2 text-text-muted font-medium">
                  Ready
                </th>
              </tr>
            </thead>
            <tbody>
              {students.map((student: any) => {
                const r = readinessMap[student.id] || {};
                return (
                  <tr
                    key={student.id}
                    className="border-b border-white/[0.04]"
                  >
                    <td className="px-3 py-2.5 text-text-primary font-medium">
                      {student.user.name}
                    </td>
                    {checklistFields.map((f) => (
                      <td key={f.key} className="text-center px-3 py-2.5">
                        <button
                          onClick={() => toggleField(student.id, f.key)}
                          disabled={saving === student.id + f.key}
                          className={`w-7 h-7 rounded-md border transition-colors ${
                            r[f.key]
                              ? "bg-neon-green/20 border-neon-green/30 text-neon-green"
                              : "bg-white/[0.03] border-white/[0.08] text-text-muted hover:border-white/[0.15]"
                          } ${saving === student.id + f.key ? "opacity-50" : ""}`}
                        >
                          {r[f.key] ? (
                            <CheckCircle size={14} className="mx-auto" />
                          ) : (
                            <span className="text-xs">-</span>
                          )}
                        </button>
                      </td>
                    ))}
                    <td className="text-center px-3 py-2.5">
                      {r.isReady ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-neon-green/10 text-neon-green">
                          Ready
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/10 text-red-400">
                          Not Ready
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  DAILY SESSIONS TAB                                                 */
/* ================================================================== */

function DailySessionsTab({
  batchId,
  batch,
  onRefresh,
}: {
  batchId: string;
  batch: any;
  onRefresh: () => void;
}) {
  const [generating, setGenerating] = useState(false);
  const [savingDay, setSavingDay] = useState<string | null>(null);
  const [savingAttendance, setSavingAttendance] = useState<string | null>(null);
  const [attendanceState, setAttendanceState] = useState<
    Record<string, Record<string, string>>
  >({});

  const days = batch.batchDays || [];
  const students = batch.students || [];

  // Initialize attendance state from batch data
  const getAttStatus = (dayId: string, studentId: string) => {
    if (attendanceState[dayId]?.[studentId]) {
      return attendanceState[dayId][studentId];
    }
    const day = days.find((d: any) => d.id === dayId);
    if (day) {
      const att = day.attendance?.find(
        (a: any) => a.studentId === studentId
      );
      if (att) return att.status;
    }
    return "ABSENT";
  };

  const setAttStatus = (
    dayId: string,
    studentId: string,
    status: string
  ) => {
    setAttendanceState((prev) => ({
      ...prev,
      [dayId]: { ...(prev[dayId] || {}), [studentId]: status },
    }));
  };

  const handleGenerateDays = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/admin/batches/${batchId}/days`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        onRefresh();
      } else {
        alert(data.error || "Failed to generate days");
      }
    } catch (e) {
      alert("Failed to generate days");
    } finally {
      setGenerating(false);
    }
  };

  const handleDayAction = async (
    dayId: string,
    action: "start" | "end" | "break-start" | "break-end"
  ) => {
    setSavingDay(dayId + action);
    const now = new Date().toISOString();
    const data: any = {};

    switch (action) {
      case "start":
        data.startedAt = now;
        data.status = "IN_PROGRESS";
        break;
      case "end":
        data.endedAt = now;
        data.status = "COMPLETED";
        break;
      case "break-start":
        data.breakStartedAt = now;
        break;
      case "break-end":
        data.breakEndedAt = now;
        break;
    }

    try {
      await fetch(`/api/admin/batches/${batchId}/days?dayId=${dayId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      onRefresh();
    } catch (e) {
      alert("Failed to update day");
    } finally {
      setSavingDay(null);
    }
  };

  const handleSaveAttendance = async (dayId: string) => {
    setSavingAttendance(dayId);
    const records = students.map((s: any) => ({
      studentId: s.id,
      status: getAttStatus(dayId, s.id),
    }));

    try {
      const res = await fetch(
        `/api/admin/batches/${batchId}/days/${dayId}/attendance`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ records }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        onRefresh();
      } else {
        alert(data.error || "Failed to save attendance");
      }
    } catch (e) {
      alert("Failed to save attendance");
    } finally {
      setSavingAttendance(null);
    }
  };

  const handleUpdateDayField = async (
    dayId: string,
    field: string,
    value: string
  ) => {
    try {
      await fetch(`/api/admin/batches/${batchId}/days?dayId=${dayId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
    } catch (e) {
      console.error("Failed to update day field:", e);
    }
  };

  return (
    <div className="space-y-4">
      {days.length === 0 && (
        <div className="glass-card p-8 text-center">
          <p className="text-text-muted text-sm mb-4">
            No batch days generated yet. Generate days from the batch date range.
          </p>
          <button
            onClick={handleGenerateDays}
            disabled={generating}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <Calendar size={16} />
            {generating ? "Generating..." : "Generate Batch Days"}
          </button>
        </div>
      )}

      {days.map((day: any) => (
        <div key={day.id} className="glass-card p-5">
          {/* Day header */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-text-primary">
                Day {day.dayNumber}
              </h3>
              <span className="text-xs text-text-muted">
                {formatDate(day.date)}
              </span>
              <span
                className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${DAY_STATUS_COLORS[day.status] || DAY_STATUS_COLORS.SCHEDULED}`}
              >
                {day.status}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {!day.startedAt && (
                <button
                  onClick={() => handleDayAction(day.id, "start")}
                  disabled={savingDay === day.id + "start"}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors text-xs disabled:opacity-50"
                >
                  <Play size={12} />
                  Start Day
                </button>
              )}
              {day.startedAt && !day.endedAt && !day.breakStartedAt && (
                <button
                  onClick={() => handleDayAction(day.id, "break-start")}
                  disabled={savingDay === day.id + "break-start"}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20 transition-colors text-xs disabled:opacity-50"
                >
                  <Coffee size={12} />
                  Start Break
                </button>
              )}
              {day.breakStartedAt && !day.breakEndedAt && (
                <button
                  onClick={() => handleDayAction(day.id, "break-end")}
                  disabled={savingDay === day.id + "break-end"}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20 transition-colors text-xs disabled:opacity-50"
                >
                  <Coffee size={12} />
                  End Break
                </button>
              )}
              {day.startedAt && !day.endedAt && (
                <button
                  onClick={() => handleDayAction(day.id, "end")}
                  disabled={savingDay === day.id + "end"}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors text-xs disabled:opacity-50"
                >
                  <Square size={12} />
                  End Day
                </button>
              )}
            </div>
          </div>

          {/* Day timestamps */}
          <div className="flex flex-wrap gap-4 text-xs text-text-muted mb-3">
            <span className="flex items-center gap-1">
              <Clock size={11} /> Start: {formatTime(day.startedAt)}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={11} /> End: {formatTime(day.endedAt)}
            </span>
            <span className="flex items-center gap-1">
              <Coffee size={11} /> Break: {formatTime(day.breakStartedAt)} -{" "}
              {formatTime(day.breakEndedAt)}
            </span>
          </div>

          {/* Topic and notes (editable inline) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">
                Topic
              </label>
              <input
                type="text"
                defaultValue={day.topic || ""}
                onBlur={(e) =>
                  handleUpdateDayField(day.id, "topic", e.target.value)
                }
                placeholder="Enter topic..."
                className="w-full px-3 py-1.5 text-sm bg-white/[0.03] border border-white/[0.06] rounded-lg text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-neon-blue/30"
              />
            </div>
            <div>
              <label className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">
                Trainer Notes
              </label>
              <input
                type="text"
                defaultValue={day.trainerNotes || ""}
                onBlur={(e) =>
                  handleUpdateDayField(day.id, "trainerNotes", e.target.value)
                }
                placeholder="Notes..."
                className="w-full px-3 py-1.5 text-sm bg-white/[0.03] border border-white/[0.06] rounded-lg text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-neon-blue/30"
              />
            </div>
          </div>

          {/* Attendance for this day */}
          {students.length > 0 && (
            <div className="border-t border-white/[0.06] pt-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Attendance
                </h4>
                <button
                  onClick={() => handleSaveAttendance(day.id)}
                  disabled={savingAttendance === day.id}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20 transition-colors text-xs disabled:opacity-50"
                >
                  <Save size={12} />
                  {savingAttendance === day.id
                    ? "Saving..."
                    : "Save Attendance"}
                </button>
              </div>
              <div className="space-y-1">
                {students.map((student: any) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-3 py-1.5"
                  >
                    <span className="text-sm text-text-secondary flex-1 truncate">
                      {student.user.name}
                    </span>
                    <select
                      value={getAttStatus(day.id, student.id)}
                      onChange={(e) =>
                        setAttStatus(day.id, student.id, e.target.value)
                      }
                      className="px-2 py-1 text-xs bg-white/[0.03] border border-white/[0.06] rounded-lg text-text-primary focus:outline-none focus:border-neon-blue/30"
                    >
                      <option value="PRESENT">Present</option>
                      <option value="ABSENT">Absent</option>
                      <option value="LATE">Late</option>
                      <option value="EXCUSED">Excused</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ================================================================== */
/*  ATTENDANCE TAB (Summary Grid)                                      */
/* ================================================================== */

function AttendanceTab({ batch }: { batch: any }) {
  const students = batch.students || [];
  const days = batch.batchDays || [];

  // Build attendance lookup: dayId -> studentId -> status
  const attMap: Record<string, Record<string, string>> = {};
  for (const day of days) {
    attMap[day.id] = {};
    for (const att of day.attendance || []) {
      attMap[day.id][att.studentId] = att.status;
    }
  }

  // Calculate per-student attendance %
  const getStudentAttendance = (studentId: string) => {
    let total = 0;
    let present = 0;
    for (const day of days) {
      const status = attMap[day.id]?.[studentId];
      if (status) {
        total++;
        if (status === "PRESENT" || status === "LATE") present++;
      }
    }
    return total > 0 ? Math.round((present / total) * 100) : 0;
  };

  return (
    <div className="glass-card p-5">
      <h2 className="text-base font-semibold text-text-primary mb-4">
        Attendance Summary
      </h2>

      {students.length === 0 || days.length === 0 ? (
        <p className="text-text-muted text-sm text-center py-4">
          {students.length === 0
            ? "No students enrolled"
            : "No batch days generated"}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-3 py-2 text-text-muted font-medium sticky left-0 bg-[#0a0a14] z-10">
                  Student
                </th>
                {days.map((day: any) => (
                  <th
                    key={day.id}
                    className="text-center px-2 py-2 text-text-muted font-medium text-[10px]"
                  >
                    D{day.dayNumber}
                  </th>
                ))}
                <th className="text-center px-3 py-2 text-text-muted font-medium">
                  %
                </th>
              </tr>
            </thead>
            <tbody>
              {students.map((student: any) => (
                <tr
                  key={student.id}
                  className="border-b border-white/[0.04]"
                >
                  <td className="px-3 py-2.5 text-text-primary font-medium sticky left-0 bg-[#0a0a14] z-10 whitespace-nowrap">
                    {student.user.name}
                  </td>
                  {days.map((day: any) => {
                    const status = attMap[day.id]?.[student.id] || "-";
                    return (
                      <td key={day.id} className="text-center px-2 py-2.5">
                        {status === "-" ? (
                          <span className="text-text-muted/30">-</span>
                        ) : (
                          <span
                            className={`inline-flex w-6 h-6 items-center justify-center rounded text-[9px] font-bold ${ATT_BG[status] || ""}`}
                            title={status}
                          >
                            {status[0]}
                          </span>
                        )}
                      </td>
                    );
                  })}
                  <td className="text-center px-3 py-2.5">
                    <span
                      className={`text-xs font-bold ${
                        getStudentAttendance(student.id) >= 80
                          ? "text-green-400"
                          : getStudentAttendance(student.id) >= 60
                            ? "text-yellow-400"
                            : "text-red-400"
                      }`}
                    >
                      {getStudentAttendance(student.id)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  PRACTICAL TAB                                                      */
/* ================================================================== */

function PracticalTab({
  batchId,
  batch,
  onRefresh,
}: {
  batchId: string;
  batch: any;
  onRefresh: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [inviting, setInviting] = useState<string | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "Practical Session - Milton Keynes",
    date: "",
    startTime: "",
    endTime: "",
    location: "8 Lyon Road, Milton Keynes, MK1 1EX",
    trainerId: "",
    notes: "",
    capacity: "6",
    minCapacity: "3",
    bookingDeadline: "",
  });

  const practicals = batch.practicalSessions || [];
  const students = batch.students || [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date) return alert("Date is required");

    setCreating(true);
    try {
      const res = await fetch(`/api/admin/batches/${batchId}/practical`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          trainerId: form.trainerId || undefined,
        }),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({
          title: "Practical Session - Milton Keynes",
          date: "",
          startTime: "",
          endTime: "",
          location: "8 Lyon Road, Milton Keynes, MK1 1EX",
          trainerId: "",
          notes: "",
          capacity: "6",
          minCapacity: "3",
          bookingDeadline: "",
        });
        onRefresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create practical session");
      }
    } catch {
      alert("Failed to create practical session");
    } finally {
      setCreating(false);
    }
  };

  const handleInviteStudents = async (practicalId: string) => {
    if (selectedStudents.length === 0) {
      return alert("Select at least one student to invite");
    }

    const practical = practicals.find((p: any) => p.id === practicalId);
    if (!practical) return;

    setInviting(practicalId);
    try {
      const res = await fetch("/api/admin/practical-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchId,
          title: practical.title,
          date: practical.date,
          startTime: practical.startTime,
          endTime: practical.endTime,
          trainerId: practical.trainerId,
          location: practical.location,
          capacity: practical.capacity || 6,
          minCapacity: practical.minCapacity || 3,
          bookingDeadline: practical.bookingDeadline,
          studentIds: selectedStudents,
        }),
      });
      if (res.ok) {
        setSelectedStudents([]);
        setInviting(null);
        onRefresh();
        alert("Invitations sent successfully!");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to send invitations");
      }
    } catch {
      alert("Failed to send invitations");
    } finally {
      setInviting(null);
    }
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map((s: any) => s.id));
    }
  };

  const PRACTICAL_STATUS: Record<string, string> = {
    SCHEDULED: "bg-cyan/10 text-cyan border-cyan/20",
    COMPLETED: "bg-green-500/10 text-green-400 border-green-500/20",
    CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const BOOKING_STATUS: Record<string, string> = {
    INVITED: "bg-yellow-500/10 text-yellow-400",
    ACCEPTED: "bg-green-500/10 text-green-400",
    DECLINED: "bg-red-500/10 text-red-400",
    CANCELLED: "bg-red-500/10 text-red-400",
    ATTENDED: "bg-neon-blue/10 text-neon-blue",
  };

  return (
    <div className="space-y-4">
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-text-primary">
            Practical Sessions ({practicals.length})
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20 transition-colors text-xs font-medium"
          >
            <Plus size={14} />
            Schedule Practical
          </button>
        </div>

        {practicals.length === 0 ? (
          <p className="text-text-muted text-sm text-center py-4">
            No practical sessions scheduled
          </p>
        ) : (
          <div className="space-y-4">
            {practicals.map((p: any) => {
              const bookings = p.bookings || [];
              const acceptedCount = bookings.filter(
                (b: any) => b.status === "ACCEPTED"
              ).length;
              const declinedCount = bookings.filter(
                (b: any) => b.status === "DECLINED"
              ).length;
              const pendingCount = bookings.filter(
                (b: any) => b.status === "INVITED"
              ).length;
              const hasBookings = bookings.length > 0;

              return (
                <div
                  key={p.id}
                  className="py-3 border-b border-white/[0.04] last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-text-primary font-medium">
                          {p.title}
                        </span>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${PRACTICAL_STATUS[p.status] || PRACTICAL_STATUS.SCHEDULED}`}
                        >
                          {p.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          <Calendar size={10} /> {formatDate(p.date)}
                        </span>
                        {(p.startTime || p.endTime) && (
                          <span className="flex items-center gap-1">
                            <Clock size={10} /> {p.startTime || "-"} -{" "}
                            {p.endTime || "-"}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPin size={10} /> {p.location}
                        </span>
                        {p.trainer && (
                          <span className="flex items-center gap-1">
                            <User size={10} /> {p.trainer.user.name}
                          </span>
                        )}
                      </div>
                      {p.notes && (
                        <p className="text-xs text-text-muted mt-1">
                          {p.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Booking Stats */}
                  {hasBookings && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-green-400">
                          {acceptedCount} accepted
                        </span>
                        <span className="text-red-400">
                          {declinedCount} declined
                        </span>
                        <span className="text-yellow-400">
                          {pendingCount} pending
                        </span>
                        <span className="text-text-muted">
                          / {bookings.length} invited
                        </span>
                      </div>

                      {/* Warning if less than minCapacity accepted */}
                      {acceptedCount < (p.minCapacity || 3) && (
                        <div className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-500/5 px-3 py-1.5 rounded-lg border border-yellow-500/10">
                          <span>
                            Only {acceptedCount} accepted. Need at least{" "}
                            {p.minCapacity || 3} for session to proceed.
                          </span>
                        </div>
                      )}

                      {/* Individual booking statuses */}
                      <div className="flex flex-wrap gap-1.5">
                        {bookings.map((b: any) => (
                          <span
                            key={b.id}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${BOOKING_STATUS[b.status] || BOOKING_STATUS.INVITED}`}
                            title={b.cancelReason ? `Reason: ${b.cancelReason}` : undefined}
                          >
                            {b.student?.user?.name || "Student"}: {b.status}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Invite Students Button */}
                  {!hasBookings && p.status === "SCHEDULED" && (
                    <div className="mt-3">
                      {inviting === p.id ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold text-text-primary">
                              Select Students to Invite
                            </h4>
                            <button
                              onClick={selectAll}
                              className="text-[10px] text-neon-blue hover:underline"
                            >
                              {selectedStudents.length === students.length
                                ? "Deselect All"
                                : "Select All"}
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {students.map((s: any) => (
                              <label
                                key={s.id}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04] cursor-pointer hover:bg-white/[0.04] transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedStudents.includes(s.id)}
                                  onChange={() => toggleStudent(s.id)}
                                  className="rounded"
                                />
                                <div className="min-w-0">
                                  <p className="text-xs text-text-primary truncate">
                                    {s.user.name}
                                  </p>
                                  <p className="text-[10px] text-text-muted truncate">
                                    {s.user.email}
                                  </p>
                                </div>
                              </label>
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleInviteStudents(p.id)}
                              disabled={selectedStudents.length === 0}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20 transition-colors text-xs font-medium disabled:opacity-50"
                            >
                              <Mail size={12} />
                              Send {selectedStudents.length} Invitation
                              {selectedStudents.length !== 1 ? "s" : ""}
                            </button>
                            <button
                              onClick={() => {
                                setInviting(null);
                                setSelectedStudents([]);
                              }}
                              className="px-3 py-1.5 rounded-lg text-text-muted hover:text-text-primary text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setInviting(p.id)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple/10 text-purple border border-purple/20 hover:bg-purple/20 transition-colors text-xs font-medium"
                        >
                          <Mail size={12} />
                          Invite Students
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create form */}
      {showForm && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">
            Schedule New Practical Session
          </h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm bg-white/[0.03] border border-white/[0.06] rounded-lg text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-neon-blue/30"
                />
              </div>
              <div>
                <label className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm({ ...form, date: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 text-sm bg-white/[0.03] border border-white/[0.06] rounded-lg text-text-primary focus:outline-none focus:border-neon-blue/30"
                />
              </div>
              <div>
                <label className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={form.startTime}
                  onChange={(e) =>
                    setForm({ ...form, startTime: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm bg-white/[0.03] border border-white/[0.06] rounded-lg text-text-primary focus:outline-none focus:border-neon-blue/30"
                />
              </div>
              <div>
                <label className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={form.endTime}
                  onChange={(e) =>
                    setForm({ ...form, endTime: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm bg-white/[0.03] border border-white/[0.06] rounded-lg text-text-primary focus:outline-none focus:border-neon-blue/30"
                />
              </div>
              <div>
                <label className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm bg-white/[0.03] border border-white/[0.06] rounded-lg text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-neon-blue/30"
                />
              </div>
              <div>
                <label className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">
                  Capacity
                </label>
                <input
                  type="number"
                  value={form.capacity}
                  onChange={(e) =>
                    setForm({ ...form, capacity: e.target.value })
                  }
                  min="1"
                  max="20"
                  className="w-full px-3 py-2 text-sm bg-white/[0.03] border border-white/[0.06] rounded-lg text-text-primary focus:outline-none focus:border-neon-blue/30"
                />
              </div>
              <div>
                <label className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">
                  Min Capacity
                </label>
                <input
                  type="number"
                  value={form.minCapacity}
                  onChange={(e) =>
                    setForm({ ...form, minCapacity: e.target.value })
                  }
                  min="1"
                  max="20"
                  className="w-full px-3 py-2 text-sm bg-white/[0.03] border border-white/[0.06] rounded-lg text-text-primary focus:outline-none focus:border-neon-blue/30"
                />
              </div>
              <div>
                <label className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">
                  Booking Deadline
                </label>
                <input
                  type="date"
                  value={form.bookingDeadline}
                  onChange={(e) =>
                    setForm({ ...form, bookingDeadline: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm bg-white/[0.03] border border-white/[0.06] rounded-lg text-text-primary focus:outline-none focus:border-neon-blue/30"
                />
              </div>
              <div>
                <label className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) =>
                    setForm({ ...form, notes: e.target.value })
                  }
                  placeholder="Optional notes..."
                  className="w-full px-3 py-2 text-sm bg-white/[0.03] border border-white/[0.06] rounded-lg text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-neon-blue/30"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Session"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/[0.04] transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  FEEDBACK TAB                                                       */
/* ================================================================== */

function FeedbackTab({
  batchId,
  batch,
  onRefresh,
}: {
  batchId: string;
  batch: any;
  onRefresh: () => void;
}) {
  const [feedback, setFeedback] = useState(batch.trainerFeedback || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/batches/${batchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainerFeedback: feedback }),
      });
      if (res.ok) {
        alert("Feedback saved");
        onRefresh();
      } else {
        alert("Failed to save feedback");
      }
    } catch (e) {
      alert("Failed to save feedback");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-card p-5">
      <h2 className="text-base font-semibold text-text-primary mb-4">
        Trainer Feedback
      </h2>

      {batch.trainerFeedback ? (
        <div className="space-y-4">
          <div className="p-4 bg-white/[0.02] rounded-lg border border-white/[0.06]">
            <p className="text-sm text-text-secondary whitespace-pre-wrap">
              {batch.trainerFeedback}
            </p>
          </div>
          <div>
            <label className="block text-[10px] text-text-muted uppercase tracking-wider mb-2">
              Update Feedback
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 text-sm bg-white/[0.03] border border-white/[0.06] rounded-lg text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-neon-blue/30 resize-none"
              placeholder="Update trainer feedback..."
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20 transition-colors text-sm font-medium disabled:opacity-50"
            >
              <Save size={14} />
              {saving ? "Saving..." : "Update Feedback"}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={8}
            className="w-full px-4 py-3 text-sm bg-white/[0.03] border border-white/[0.06] rounded-lg text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-neon-blue/30 resize-none"
            placeholder="Enter trainer feedback for this batch..."
          />
          <button
            onClick={handleSave}
            disabled={saving || !feedback.trim()}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? "Saving..." : "Save Feedback"}
          </button>
        </div>
      )}
    </div>
  );
}
