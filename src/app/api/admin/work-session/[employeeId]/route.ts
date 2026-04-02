import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isCrmRole } from "@/lib/rbac";

/**
 * Role hierarchy for visibility:
 * SUPER_ADMIN -> sees everyone
 * ADMIN -> sees all except SUPER_ADMIN
 * SALES_LEAD -> sees ADMISSION_COUNSELLOR, TRAINER (peers/below)
 * ADMISSION_COUNSELLOR -> sees own only
 * TRAINER -> sees own only
 */
const ROLE_VISIBILITY: Record<string, string[]> = {
  SUPER_ADMIN: ["SUPER_ADMIN", "ADMIN", "SALES_LEAD", "ADMISSION_COUNSELLOR", "TRAINER"],
  ADMIN: ["ADMIN", "SALES_LEAD", "ADMISSION_COUNSELLOR", "TRAINER"],
  SALES_LEAD: ["SALES_LEAD", "ADMISSION_COUNSELLOR", "TRAINER"],
  ADMISSION_COUNSELLOR: [],
  TRAINER: [],
};

/** Resolve employee & enforce role visibility. Returns null or error response. */
async function resolveEmployee(employeeId: string, userRole: string, userId: string) {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: {
      user: { select: { id: true, name: true, email: true, role: true, avatar: true } },
    },
  });

  if (!employee) return { error: "Employee not found", status: 404 };

  const visibleRoles = ROLE_VISIBILITY[userRole] || [];
  const isSelf = employee.userId === userId;
  if (!isSelf && visibleRoles.length === 0) return { error: "Forbidden", status: 403 };
  if (!isSelf && !visibleRoles.includes(employee.user.role)) return { error: "Forbidden", status: 403 };

  return { employee, isSelf };
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ employeeId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || !isCrmRole(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { employeeId } = await ctx.params;
    const userRole = session.user.role as string;
    const userId = session.user.id as string;

    const result = await resolveEmployee(employeeId, userRole, userId);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    const { employee } = result;

    // Parse date range params: ?from=YYYY-MM-DD&to=YYYY-MM-DD or ?days=N
    const fromParam = req.nextUrl.searchParams.get("from");
    const toParam = req.nextUrl.searchParams.get("to");
    const daysParam = req.nextUrl.searchParams.get("days");

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    let rangeStart: Date;
    let rangeEnd: Date;
    let days: number;

    if (fromParam && toParam) {
      // Use explicit from/to date range
      rangeStart = new Date(fromParam + "T00:00:00");
      rangeEnd = new Date(toParam + "T23:59:59.999");
      // Cap rangeEnd to today if it's in the future
      if (rangeEnd > todayEnd) rangeEnd = todayEnd;
      days = Math.ceil((rangeEnd.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24));
    } else {
      days = Math.min(Math.max(parseInt(daysParam || "7", 10) || 7, 1), 90);
      rangeStart = new Date(todayStart);
      rangeStart.setDate(rangeStart.getDate() - (days - 1));
      rangeEnd = todayEnd;
    }

    // ── Today's sessions (for timeline) ─────────────────────────
    const todaySessions = await prisma.employeeWorkSession.findMany({
      where: {
        employeeId,
        checkInAt: { gte: todayStart, lte: todayEnd },
      },
      include: {
        activities: { orderBy: { startedAt: "asc" } },
        breaks: { orderBy: { startedAt: "asc" } },
      },
      orderBy: { checkInAt: "desc" },
    });

    // ── All sessions in the date range (for per-day summary) ────
    const rangeSessions = await prisma.employeeWorkSession.findMany({
      where: {
        employeeId,
        checkInAt: { gte: rangeStart, lte: rangeEnd },
      },
      include: {
        activities: { orderBy: { startedAt: "asc" } },
        breaks: { orderBy: { startedAt: "asc" } },
      },
      orderBy: { checkInAt: "asc" },
    });

    // ── Build today's timeline ──────────────────────────────────
    const timeline: Array<{
      type: string;
      startedAt: string;
      endedAt: string | null;
      durationMin: number;
      description: string | null;
      reason?: string | null;
    }> = [];

    let totalActiveSeconds = 0;
    let totalBreakSeconds = 0;
    let totalIdleSeconds = 0;
    let breakCount = 0;

    for (const s of todaySessions) {
      timeline.push({
        type: "CHECK_IN",
        startedAt: s.checkInAt.toISOString(),
        endedAt: null,
        durationMin: 0,
        description: s.checkInNote || `Checked in (${s.workLocation})`,
      });

      for (const a of s.activities) {
        const start = new Date(a.startedAt).getTime();
        const end = a.endedAt ? new Date(a.endedAt).getTime() : Date.now();
        const durationSec = Math.floor((end - start) / 1000);
        const durationMin = Math.round(durationSec / 60);

        if (a.type === "ACTIVE") totalActiveSeconds += durationSec;
        else if (a.type === "IDLE") totalIdleSeconds += durationSec;
        else if (a.type === "BREAK") totalBreakSeconds += durationSec;

        timeline.push({
          type: a.type,
          startedAt: a.startedAt.toISOString(),
          endedAt: a.endedAt?.toISOString() || null,
          durationMin,
          description: a.description,
        });
      }

      for (const b of s.breaks) {
        const start = new Date(b.startedAt).getTime();
        const end = b.endedAt ? new Date(b.endedAt).getTime() : Date.now();
        const durationSec = Math.floor((end - start) / 1000);
        const durationMin = Math.round(durationSec / 60);
        totalBreakSeconds += durationSec;
        breakCount++;

        timeline.push({
          type: "BREAK",
          startedAt: b.startedAt.toISOString(),
          endedAt: b.endedAt?.toISOString() || null,
          durationMin,
          description: null,
          reason: b.reason,
        });
      }

      if (s.checkOutAt) {
        timeline.push({
          type: "CHECK_OUT",
          startedAt: s.checkOutAt.toISOString(),
          endedAt: null,
          durationMin: 0,
          description: s.checkOutSummary || "Checked out",
        });
      }
    }

    timeline.sort(
      (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
    );

    // ── Per-day summary for range ───────────────────────────────
    const dayMap = new Map<
      string,
      {
        date: string;
        checkIn: string | null;
        checkOut: string | null;
        activeMin: number;
        breakMin: number;
        idleMin: number;
        location: string | null;
      }
    >();

    for (const s of rangeSessions) {
      const dateKey = s.checkInAt.toISOString().slice(0, 10);
      let entry = dayMap.get(dateKey);
      if (!entry) {
        entry = {
          date: dateKey,
          checkIn: s.checkInAt.toISOString(),
          checkOut: s.checkOutAt?.toISOString() || null,
          activeMin: 0,
          breakMin: 0,
          idleMin: 0,
          location: s.workLocation,
        };
        dayMap.set(dateKey, entry);
      } else {
        // Earliest check-in
        if (new Date(s.checkInAt) < new Date(entry.checkIn!)) {
          entry.checkIn = s.checkInAt.toISOString();
        }
        // Latest check-out
        if (s.checkOutAt) {
          if (!entry.checkOut || new Date(s.checkOutAt) > new Date(entry.checkOut)) {
            entry.checkOut = s.checkOutAt.toISOString();
          }
        } else {
          entry.checkOut = null; // still active
        }
      }

      for (const a of s.activities) {
        const start = new Date(a.startedAt).getTime();
        const end = a.endedAt ? new Date(a.endedAt).getTime() : Date.now();
        const mins = Math.round((end - start) / 60000);
        if (a.type === "ACTIVE") entry.activeMin += mins;
        else if (a.type === "IDLE") entry.idleMin += mins;
        else if (a.type === "BREAK") entry.breakMin += mins;
      }

      for (const b of s.breaks) {
        const start = new Date(b.startedAt).getTime();
        const end = b.endedAt ? new Date(b.endedAt).getTime() : Date.now();
        entry.breakMin += Math.round((end - start) / 60000);
      }
    }

    const daySummary = Array.from(dayMap.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // ── Work log entries (activities with descriptions) ─────────
    const workLogs = rangeSessions
      .flatMap((s) =>
        s.activities
          .filter((a) => a.description && a.description.trim().length > 0)
          .map((a) => ({
            id: a.id,
            type: a.type,
            description: a.description,
            startedAt: a.startedAt.toISOString(),
            endedAt: a.endedAt?.toISOString() || null,
            sessionId: s.id,
          }))
      )
      .sort(
        (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      );

    // ── Lead interactions (today, after check-in) ────────────────
    const employeeName = employee.user.name;
    // Only count notes created after the first check-in of the day
    const firstCheckIn = todaySessions.length > 0
      ? todaySessions.reduce((earliest, s) =>
          new Date(s.checkInAt) < new Date(earliest.checkInAt) ? s : earliest
        ).checkInAt
      : todayStart;

    const allLeadNotes = await prisma.leadNote.findMany({
      where: {
        createdBy: employeeName,
        createdAt: { gte: firstCheckIn, lte: todayEnd },
      },
      include: {
        lead: { select: { id: true, name: true, email: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Filter out system-generated / bulk-imported notes
    const SYSTEM_NOTE_PREFIXES = [
      "[Quality Lead Detail]",
      "[Admission Result]",
      "[Status changed",
      "[Bulk Import]",
      "[Data Migration]",
    ];
    const leadNotes = allLeadNotes.filter(
      (n) => !SYSTEM_NOTE_PREFIXES.some((prefix) => n.content.startsWith(prefix))
    );

    const totalCallsMade = leadNotes.filter((n) =>
      n.content.includes("Call Log") || n.content.includes("📞 Call")
    ).length;
    const uniqueLeadsContacted = new Set(leadNotes.map((n) => n.leadId)).size;
    const totalNotesAdded = leadNotes.length;

    // ── Current status ──────────────────────────────────────────
    const activeSession = todaySessions.find((s) => s.status !== "CHECKED_OUT");
    let currentStatus = "OFFLINE";
    if (activeSession) {
      const statusMap: Record<string, string> = {
        CHECKED_IN: "ACTIVE",
        ON_BREAK: "BREAK",
        IDLE: "IDLE",
      };
      currentStatus = statusMap[activeSession.status] || "ACTIVE";
    }

    // ── Total stats across range ────────────────────────────────
    const daysWorked = daySummary.filter((d) => d.activeMin > 0).length;
    const totalActiveMinRange = daySummary.reduce((s, d) => s + d.activeMin, 0);
    const avgHoursPerDay = daysWorked > 0 ? Math.round((totalActiveMinRange / daysWorked / 60) * 10) / 10 : 0;

    // On-time rate: check-in before 10:00 AM
    let onTimeDays = 0;
    for (const d of daySummary) {
      if (d.checkIn) {
        const checkInHour = new Date(d.checkIn).getHours();
        const checkInMin = new Date(d.checkIn).getMinutes();
        if (checkInHour < 10 || (checkInHour === 10 && checkInMin === 0)) {
          onTimeDays++;
        }
      }
    }
    const onTimeRate = daysWorked > 0 ? Math.round((onTimeDays / daysWorked) * 100) : 0;

    return NextResponse.json({
      employee: {
        id: employee.id,
        userId: employee.user.id,
        name: employee.user.name,
        email: employee.user.email,
        role: employee.user.role,
        avatar: employee.user.avatar,
        currentStatus,
        checkInTime: activeSession?.checkInAt?.toISOString() || null,
        workLocation: activeSession?.workLocation || null,
      },
      timeline,
      breaks: todaySessions.flatMap((s) =>
        s.breaks.map((b) => ({
          id: b.id,
          startedAt: b.startedAt.toISOString(),
          endedAt: b.endedAt?.toISOString() || null,
          reason: b.reason,
          durationMin: Math.round(
            ((b.endedAt ? new Date(b.endedAt).getTime() : Date.now()) -
              new Date(b.startedAt).getTime()) /
              60000
          ),
        }))
      ),
      leadInteractions: leadNotes.map((n) => ({
        id: n.id,
        leadId: n.leadId,
        leadName: n.lead.name,
        leadEmail: n.lead.email,
        leadStatus: n.lead.status,
        content: n.content,
        createdAt: n.createdAt.toISOString(),
      })),
      workLogs,
      daySummary,
      stats: {
        totalActiveSeconds,
        totalBreakSeconds,
        totalIdleSeconds,
        breakCount,
        totalCallsMade,
        uniqueLeadsContacted,
        totalNotesAdded,
      },
      totalStats: {
        avgHoursPerDay,
        totalDaysWorked: daysWorked,
        onTimeRate,
        rangeDays: days,
      },
    });
  } catch (error) {
    console.error("Employee work detail error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST - Add a work log entry for today's active session
 * Body: { description: string, type?: "TASK" | "CALL" | "MEETING" | "NOTE" }
 */
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ employeeId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || !isCrmRole(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { employeeId } = await ctx.params;
    const userRole = session.user.role as string;
    const userId = session.user.id as string;

    const result = await resolveEmployee(employeeId, userRole, userId);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    // Find an active session for today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const activeSession = await prisma.employeeWorkSession.findFirst({
      where: {
        employeeId,
        status: { not: "CHECKED_OUT" },
        checkInAt: { gte: todayStart, lte: todayEnd },
      },
      orderBy: { checkInAt: "desc" },
    });

    if (!activeSession) {
      return NextResponse.json(
        { error: "No active work session found for today. Employee must check in first." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { description, type: logType } = body;

    if (!description || typeof description !== "string" || description.trim().length === 0) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    const validTypes = ["TASK", "CALL", "MEETING", "NOTE"];
    const activityType = validTypes.includes(logType) ? logType : "TASK";

    const now = new Date();

    // Create an EmployeeActivity record with the description
    const entry = await prisma.employeeActivity.create({
      data: {
        sessionId: activeSession.id,
        type: "ACTIVE",
        startedAt: now,
        endedAt: now,
        durationMin: 0,
        description: `[${activityType}] ${description.trim()}`,
      },
    });

    return NextResponse.json(
      {
        entry: {
          id: entry.id,
          type: entry.type,
          description: entry.description,
          startedAt: entry.startedAt.toISOString(),
          endedAt: entry.endedAt?.toISOString() || null,
          sessionId: entry.sessionId,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Work log POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
