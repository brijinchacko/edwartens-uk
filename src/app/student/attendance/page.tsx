import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

export default async function AttendancePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  interface AttendanceRecord {
    id: string;
    status: string;
    joinedAt: Date | null;
    leftAt: Date | null;
    notes: string | null;
    batchDay: {
      id: string;
      dayNumber: number;
      date: Date;
      topic: string | null;
      status: string;
      batch: { id: string; name: string };
    };
  }

  let records: AttendanceRecord[] = [];
  let summary = {
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    attendancePercentage: 0,
  };
  let hasBatch = true;

  try {
    const student = await prisma.student.findUnique({
      where: { userId: session?.user?.id },
      include: { batch: true },
    });

    if (!student || !student.batchId) {
      hasBatch = false;
    } else {
      const attendanceRecords = await prisma.batchAttendance.findMany({
        where: { studentId: student.id },
        include: {
          batchDay: {
            include: {
              batch: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { batchDay: { date: "desc" } },
      });

      records = attendanceRecords;

      const total = records.length;
      const presentCount = records.filter((r) => r.status === "PRESENT").length;
      const absentCount = records.filter((r) => r.status === "ABSENT").length;
      const lateCount = records.filter((r) => r.status === "LATE").length;
      const excusedCount = records.filter((r) => r.status === "EXCUSED").length;
      const attendancePercentage =
        total > 0
          ? Math.round(((presentCount + lateCount) / total) * 100)
          : 0;

      summary = {
        total,
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        excused: excusedCount,
        attendancePercentage,
      };
    }
  } catch (error) {
    console.error("Attendance data error:", error);
  }

  function getStatusConfig(status: string) {
    switch (status) {
      case "PRESENT":
        return {
          label: "Present",
          color: "text-neon-green",
          bg: "bg-neon-green/10",
          border: "border-neon-green/20",
          icon: <CheckCircle2 size={16} className="text-neon-green" />,
        };
      case "ABSENT":
        return {
          label: "Absent",
          color: "text-red-400",
          bg: "bg-red-500/10",
          border: "border-red-500/20",
          icon: <XCircle size={16} className="text-red-400" />,
        };
      case "LATE":
        return {
          label: "Late",
          color: "text-yellow-400",
          bg: "bg-yellow-500/10",
          border: "border-yellow-500/20",
          icon: <Clock size={16} className="text-yellow-400" />,
        };
      case "EXCUSED":
        return {
          label: "Excused",
          color: "text-text-muted",
          bg: "bg-white/[0.03]",
          border: "border-border",
          icon: <ShieldCheck size={16} className="text-text-muted" />,
        };
      default:
        return {
          label: status,
          color: "text-text-muted",
          bg: "bg-white/[0.03]",
          border: "border-border",
          icon: <CalendarDays size={16} className="text-text-muted" />,
        };
    }
  }

  function formatTime(date: Date | null) {
    if (!date) return null;
    return new Date(date).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  if (!hasBatch) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Attendance</h1>
          <p className="text-sm text-text-muted mt-1">
            Track your daily attendance
          </p>
        </div>
        <div className="glass-card p-12 text-center">
          <CalendarCheck size={40} className="mx-auto text-text-muted mb-3" />
          <p className="text-text-secondary">
            No batch assigned yet. Your attendance will appear here once you are
            assigned to a batch.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Attendance</h1>
          <p className="text-sm text-text-muted mt-1">
            Track your daily attendance
          </p>
        </div>
        <div
          className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
            summary.attendancePercentage >= 80
              ? "bg-neon-green/10 text-neon-green"
              : summary.attendancePercentage >= 60
                ? "bg-yellow-500/10 text-yellow-400"
                : "bg-red-500/10 text-red-400"
          }`}
        >
          {summary.attendancePercentage}%
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays size={14} className="text-neon-blue" />
            <span className="text-xs text-text-muted">Total Days</span>
          </div>
          <p className="text-xl font-bold text-text-primary">{summary.total}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={14} className="text-neon-green" />
            <span className="text-xs text-text-muted">Present</span>
          </div>
          <p className="text-xl font-bold text-neon-green">{summary.present}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle size={14} className="text-red-400" />
            <span className="text-xs text-text-muted">Absent</span>
          </div>
          <p className="text-xl font-bold text-red-400">{summary.absent}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={14} className="text-yellow-400" />
            <span className="text-xs text-text-muted">Late</span>
          </div>
          <p className="text-xl font-bold text-yellow-400">{summary.late}</p>
        </div>
        <div className="glass-card p-4 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-neon-blue" />
            <span className="text-xs text-text-muted">Attendance %</span>
          </div>
          <p className="text-xl font-bold gradient-text">
            {summary.attendancePercentage}%
          </p>
        </div>
      </div>

      {/* Attendance Progress Bar */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-neon-blue" />
            <span className="text-sm font-medium text-text-primary">
              Overall Attendance
            </span>
          </div>
          <span className="text-sm text-text-muted">
            {summary.present + summary.late} / {summary.total} days
          </span>
        </div>
        <div className="h-3 bg-dark-primary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${summary.attendancePercentage}%`,
              background:
                summary.attendancePercentage >= 80
                  ? "linear-gradient(90deg, #2891FF, #92E02C)"
                  : summary.attendancePercentage >= 60
                    ? "linear-gradient(90deg, #2891FF, #EAB308)"
                    : "linear-gradient(90deg, #EF4444, #EAB308)",
            }}
          />
        </div>
      </div>

      {/* Day-by-Day Timeline */}
      {records.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <CalendarCheck size={40} className="mx-auto text-text-muted mb-3" />
          <p className="text-text-secondary">
            No attendance records yet. Records will appear once classes begin.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record, index) => {
            const config = getStatusConfig(record.status);
            const joinTime = formatTime(record.joinedAt);
            const leftTime = formatTime(record.leftAt);

            return (
              <div key={record.id} className="flex gap-3">
                {/* Timeline connector */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${config.bg} border ${config.border}`}
                  >
                    {config.icon}
                  </div>
                  {index < records.length - 1 && (
                    <div className="w-0.5 flex-1 my-1 bg-border" />
                  )}
                </div>

                {/* Record Card */}
                <div className="glass-card p-4 flex-1 mb-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-purple bg-purple/10 px-2 py-0.5 rounded">
                          Day {record.batchDay.dayNumber}
                        </span>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded ${config.bg} ${config.color}`}
                        >
                          {config.label}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-text-primary mt-2">
                        {formatDate(record.batchDay.date)}
                      </p>
                      {record.batchDay.topic && (
                        <p className="text-xs text-text-muted mt-1">
                          {record.batchDay.topic}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-text-muted shrink-0">
                      {record.batchDay.batch.name}
                    </span>
                  </div>

                  {/* Join/Leave times */}
                  {(joinTime || leftTime) && (
                    <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
                      {joinTime && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          Joined: {joinTime}
                        </span>
                      )}
                      {leftTime && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          Left: {leftTime}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  {record.notes && (
                    <p className="text-xs text-text-muted mt-2 italic border-t border-border pt-2">
                      {record.notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
