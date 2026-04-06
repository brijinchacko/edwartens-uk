import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isCrmRole } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || !isCrmRole(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const employee = await prisma.employee.findUnique({
      where: { userId: session.user.id },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee record not found" }, { status: 404 });
    }

    // Get current active session (not checked out)
    const activeSession = await prisma.employeeWorkSession.findFirst({
      where: {
        employeeId: employee.id,
        status: { not: "CHECKED_OUT" },
      },
      orderBy: { checkInAt: "desc" },
      include: {
        activities: { orderBy: { startedAt: "desc" } },
        breaks: { orderBy: { startedAt: "desc" } },
      },
    });

    // Get today's sessions history
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todaySessions = await prisma.employeeWorkSession.findMany({
      where: {
        employeeId: employee.id,
        checkInAt: { gte: todayStart, lte: todayEnd },
      },
      orderBy: { checkInAt: "desc" },
      include: {
        activities: { orderBy: { startedAt: "asc" } },
        breaks: { orderBy: { startedAt: "asc" } },
      },
    });

    return NextResponse.json({ activeSession, todaySessions });
  } catch (error) {
    console.error("Work session GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !isCrmRole(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { workLocation, note } = body;

    if (!workLocation || !["HOME", "OFFICE", "REMOTE"].includes(workLocation)) {
      return NextResponse.json(
        { error: "Invalid workLocation. Must be HOME, OFFICE, or REMOTE" },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.findUnique({
      where: { userId: session.user.id },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee record not found" }, { status: 404 });
    }

    // Check no active session exists
    const existingSession = await prisma.employeeWorkSession.findFirst({
      where: {
        employeeId: employee.id,
        status: { not: "CHECKED_OUT" },
      },
    });

    if (existingSession) {
      return NextResponse.json(
        { error: "You already have an active work session. Please check out first." },
        { status: 409 }
      );
    }

    const now = new Date();

    // Create work session and initial ACTIVE activity in a transaction
    const workSession = await prisma.$transaction(async (tx) => {
      const newSession = await tx.employeeWorkSession.create({
        data: {
          employeeId: employee.id,
          date: now,
          checkInAt: now,
          workLocation,
          checkInNote: note || null,
          status: "CHECKED_IN",
        },
      });

      await tx.employeeActivity.create({
        data: {
          sessionId: newSession.id,
          type: "ACTIVE",
          startedAt: now,
        },
      });

      return tx.employeeWorkSession.findUnique({
        where: { id: newSession.id },
        include: {
          activities: true,
          breaks: true,
        },
      });
    });

    // Audit log
    await logAudit({
      userId: session.user.id as string,
      userName: session.user.name || session.user.email,
      userRole: session.user.role,
      action: "CHECK_IN",
      entity: "work-session",
      entityId: workSession?.id,
      entityName: `${session.user.name} - ${workLocation}`,
      details: JSON.stringify({ workLocation, note }),
    });

    // Notify HR about check-in (fire-and-forget)
    try {
      const { notifyRole } = await import("@/lib/notify");
      notifyRole(
        ["SUPER_ADMIN", "ADMIN", "HR_MANAGER"],
        `🟢 ${session.user.name || "Employee"} checked in`,
        `Location: ${workLocation}${note ? ` | Note: ${note}` : ""}`,
        `/admin/team-activity`
      ).catch(() => {});
    } catch {}

    // Send follow-up reminder on check-in (fire-and-forget)
    try {
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

      const followUpCount = await prisma.lead.count({
        where: {
          assignedToId: employee.id,
          followUpDate: { gte: todayStart, lte: todayEnd },
          status: { notIn: ["ENROLLED", "LOST"] },
        },
      });

      const overdueCount = await prisma.lead.count({
        where: {
          assignedToId: employee.id,
          followUpDate: { lt: todayStart },
          status: { notIn: ["ENROLLED", "LOST"] },
        },
      });

      if (followUpCount > 0 || overdueCount > 0) {
        const { notifyUser } = await import("@/lib/notify");
        const parts: string[] = [];
        if (followUpCount > 0) parts.push(`${followUpCount} follow-up${followUpCount > 1 ? "s" : ""} scheduled for today`);
        if (overdueCount > 0) parts.push(`${overdueCount} overdue`);
        await notifyUser(session.user.id as string, "\ud83d\udccb Today's Workload", `You have ${parts.join(" and ")}. Check your My Day dashboard.`, "REMINDER", "/admin/dashboard");
      }
    } catch {}

    // Auto-create monthly sales target if not exists (fire-and-forget)
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const existing = await prisma.salesTarget.findUnique({
        where: { employeeId_month_year: { employeeId: employee.id, month, year } },
      });
      if (!existing) {
        await prisma.salesTarget.create({
          data: { employeeId: employee.id, month, year, salesTarget: 20, leadTarget: 50, hardTarget: 12 },
        });
      }
    } catch {}

    return NextResponse.json({ session: workSession }, { status: 201 });
  } catch (error) {
    console.error("Work session check-in error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
