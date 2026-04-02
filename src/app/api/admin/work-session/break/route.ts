import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isCrmRole } from "@/lib/rbac";
import { notifyRole } from "@/lib/notify";
import { KPI_CONFIG } from "@/lib/kpi";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !isCrmRole(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, reason } = body;

    if (!action || !["start", "end"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'start' or 'end'" },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.findUnique({
      where: { userId: session.user.id },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee record not found" }, { status: 404 });
    }

    const activeSession = await prisma.employeeWorkSession.findFirst({
      where: {
        employeeId: employee.id,
        status: { not: "CHECKED_OUT" },
      },
    });

    if (!activeSession) {
      return NextResponse.json(
        { error: "No active work session found" },
        { status: 404 }
      );
    }

    const now = new Date();

    if (action === "start") {
      if (activeSession.status === "ON_BREAK") {
        return NextResponse.json(
          { error: "You are already on a break" },
          { status: 409 }
        );
      }

      const updatedSession = await prisma.$transaction(async (tx) => {
        // End current open activity (ACTIVE or IDLE)
        const openActivity = await tx.employeeActivity.findFirst({
          where: { sessionId: activeSession.id, endedAt: null },
          orderBy: { startedAt: "desc" },
        });

        if (openActivity) {
          const durationMin = Math.round(
            (now.getTime() - openActivity.startedAt.getTime()) / 60000
          );
          await tx.employeeActivity.update({
            where: { id: openActivity.id },
            data: { endedAt: now, durationMin },
          });
        }

        // Create BREAK activity
        await tx.employeeActivity.create({
          data: {
            sessionId: activeSession.id,
            type: "BREAK",
            startedAt: now,
          },
        });

        // Create EmployeeBreak record
        await tx.employeeBreak.create({
          data: {
            sessionId: activeSession.id,
            startedAt: now,
            reason: reason || null,
          },
        });

        // Update session status
        return tx.employeeWorkSession.update({
          where: { id: activeSession.id },
          data: { status: "ON_BREAK" },
          include: {
            activities: { orderBy: { startedAt: "desc" } },
            breaks: { orderBy: { startedAt: "desc" } },
          },
        });
      });

      // Break abuse detection (fire-and-forget, don't block response)
      (async () => {
        try {
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);

          // Get all of today's work sessions for this employee
          const todaySessions = await prisma.employeeWorkSession.findMany({
            where: {
              employeeId: employee.id,
              date: { gte: todayStart },
            },
            select: { id: true },
          });
          const sessionIds = todaySessions.map((s) => s.id);

          if (sessionIds.length === 0) return;

          // Count today's total breaks for this employee
          const todayBreaks = await prisma.employeeBreak.findMany({
            where: { sessionId: { in: sessionIds } },
            select: { startedAt: true, endedAt: true },
          });

          const breakCount = todayBreaks.length;

          // Calculate cumulative break minutes today (completed breaks only)
          let cumulativeMinutes = 0;
          for (const b of todayBreaks) {
            if (b.endedAt) {
              cumulativeMinutes += Math.round(
                (b.endedAt.getTime() - b.startedAt.getTime()) / 60000
              );
            }
          }

          const empName = session.user.name || session.user.email || "Unknown";

          // Alert if break count exceeds threshold
          if (breakCount > KPI_CONFIG.maxBreakCount) {
            await notifyRole(
              ["SUPER_ADMIN", "ADMIN"],
              "Break Alert: Excessive Count",
              `${empName} has taken ${breakCount} breaks today (limit: ${KPI_CONFIG.maxBreakCount}).`,
              `/admin/kpi`
            );
          }

          // Alert if cumulative break time exceeds threshold
          if (cumulativeMinutes > KPI_CONFIG.maxBreakMinutes) {
            await notifyRole(
              ["SUPER_ADMIN", "ADMIN"],
              "Break Alert: Excessive Duration",
              `${empName} has been on break for ${cumulativeMinutes} minutes today (limit: ${KPI_CONFIG.maxBreakMinutes} min).`,
              `/admin/kpi`
            );
          }
        } catch (err) {
          console.error("Break abuse detection error:", err);
        }
      })();

      return NextResponse.json({ session: updatedSession });
    }

    // action === "end"
    if (activeSession.status !== "ON_BREAK") {
      return NextResponse.json(
        { error: "You are not currently on a break" },
        { status: 409 }
      );
    }

    const updatedSession = await prisma.$transaction(async (tx) => {
      // End current break record
      const openBreak = await tx.employeeBreak.findFirst({
        where: { sessionId: activeSession.id, endedAt: null },
        orderBy: { startedAt: "desc" },
      });

      if (openBreak) {
        await tx.employeeBreak.update({
          where: { id: openBreak.id },
          data: { endedAt: now },
        });
      }

      // End current BREAK activity
      const openActivity = await tx.employeeActivity.findFirst({
        where: {
          sessionId: activeSession.id,
          endedAt: null,
          type: "BREAK",
        },
        orderBy: { startedAt: "desc" },
      });

      if (openActivity) {
        const durationMin = Math.round(
          (now.getTime() - openActivity.startedAt.getTime()) / 60000
        );
        await tx.employeeActivity.update({
          where: { id: openActivity.id },
          data: { endedAt: now, durationMin },
        });
      }

      // Create new ACTIVE activity
      await tx.employeeActivity.create({
        data: {
          sessionId: activeSession.id,
          type: "ACTIVE",
          startedAt: now,
        },
      });

      // Update session status back to CHECKED_IN
      return tx.employeeWorkSession.update({
        where: { id: activeSession.id },
        data: { status: "CHECKED_IN" },
        include: {
          activities: { orderBy: { startedAt: "desc" } },
          breaks: { orderBy: { startedAt: "desc" } },
        },
      });
    });

    return NextResponse.json({ session: updatedSession });
  } catch (error) {
    console.error("Work session break error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
