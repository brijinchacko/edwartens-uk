import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { COURSE_LABELS, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Users,
  CheckCircle,
  Calendar,
  BarChart3,
  Monitor,
  MapPin,
  ExternalLink,
  User,
} from "lucide-react";
import BatchTabs from "./BatchTabs";

export const metadata: Metadata = {
  title: "Batch Detail | EDWartens Admin",
};

const STATUS_COLORS: Record<string, string> = {
  UPCOMING: "bg-cyan/10 text-cyan border-cyan/20",
  ACTIVE: "bg-green-500/10 text-green-400 border-green-500/20",
  COMPLETED: "bg-neon-blue/10 text-neon-blue border-neon-blue/20",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
};

const MODE_COLORS: Record<string, string> = {
  ONLINE: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  OFFLINE: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  HYBRID: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

async function getBatch(id: string) {
  try {
    return await prisma.batch.findUnique({
      where: { id },
      include: {
        students: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
                avatar: true,
              },
            },
          },
        },
        batchDays: {
          include: {
            attendance: {
              include: {
                student: {
                  include: {
                    user: { select: { name: true, email: true } },
                  },
                },
              },
            },
          },
          orderBy: { dayNumber: "asc" },
        },
        readiness: {
          include: {
            student: {
              include: {
                user: { select: { name: true, email: true } },
              },
            },
          },
        },
        practicalSessions: {
          include: {
            trainer: {
              include: {
                user: { select: { name: true, email: true } },
              },
            },
          },
          orderBy: { date: "asc" },
        },
        instructor: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
          },
        },
      },
    });
  } catch {
    return null;
  }
}

export default async function BatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const batch = await getBatch(id);

  if (!batch) {
    notFound();
  }

  // Compute stats
  const enrolledCount = batch.students.length;
  const readyCount = batch.readiness.filter((r) => r.isReady).length;
  const completedDays = batch.batchDays.filter((d) => d.status === "COMPLETED").length;
  const totalDays = batch.batchDays.length;

  // Attendance rate
  let totalAttendanceRecords = 0;
  let presentCount = 0;
  for (const day of batch.batchDays) {
    for (const att of day.attendance) {
      totalAttendanceRecords++;
      if (att.status === "PRESENT" || att.status === "LATE") {
        presentCount++;
      }
    }
  }
  const attendanceRate =
    totalAttendanceRecords > 0
      ? Math.round((presentCount / totalAttendanceRecords) * 100)
      : 0;

  // Serialize dates for client component
  const serializedBatch = JSON.parse(JSON.stringify(batch));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-5">
        <div className="flex items-start gap-4">
          <Link
            href="/admin/batches"
            className="p-2 rounded-lg hover:bg-white/[0.03] text-text-muted hover:text-text-primary transition-colors mt-1"
          >
            <ArrowLeft size={20} />
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-text-primary">
                {batch.name}
              </h1>
              <span
                className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[batch.status] || "bg-white/[0.06] text-text-muted border-white/[0.08]"}`}
              >
                {batch.status}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${MODE_COLORS[batch.mode] || "bg-white/[0.06] text-text-muted border-white/[0.08]"}`}
              >
                <Monitor size={10} />
                {batch.mode}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neon-blue/10 text-neon-blue border border-neon-blue/20">
                {COURSE_LABELS[batch.course] || batch.course}
              </span>
              {batch.batchReady && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neon-green/10 text-neon-green border border-neon-green/20">
                  <CheckCircle size={10} />
                  Batch Ready
                </span>
              )}
              {batch.trainerAccepted && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                  <CheckCircle size={10} />
                  Trainer Accepted
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-text-muted">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} />
                {formatDate(batch.startDate)}
                {batch.endDate ? ` - ${formatDate(batch.endDate)}` : ""}
              </span>
              {batch.instructor && (
                <span className="flex items-center gap-1.5">
                  <User size={13} />
                  {batch.instructor.user.name}
                </span>
              )}
              {batch.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} />
                  {batch.location}
                </span>
              )}
              {batch.teamsLink && (
                <a
                  href={batch.teamsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-neon-blue hover:text-neon-blue/80 transition-colors"
                >
                  <ExternalLink size={13} />
                  Teams Link
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-neon-blue/10">
              <Users size={18} className="text-neon-blue" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {enrolledCount}
              </p>
              <p className="text-xs text-text-muted">Enrolled Students</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-neon-green/10">
              <CheckCircle size={18} className="text-neon-green" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {readyCount}/{enrolledCount}
              </p>
              <p className="text-xs text-text-muted">Students Ready</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <BarChart3 size={18} className="text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {attendanceRate}%
              </p>
              <p className="text-xs text-text-muted">Attendance Rate</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan/10">
              <Calendar size={18} className="text-cyan" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {completedDays}/{totalDays}
              </p>
              <p className="text-xs text-text-muted">Days Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <BatchTabs batchId={id} batch={serializedBatch} />
    </div>
  );
}
