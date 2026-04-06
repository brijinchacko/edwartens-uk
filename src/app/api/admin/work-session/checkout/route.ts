import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isCrmRole } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { aggregateDailyKPI } from "@/lib/kpi";
import { checkDailyAlerts } from "@/lib/performance-alerts";
import { notifyRole } from "@/lib/notify";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !isCrmRole(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { summary } = body;

    if (!summary || typeof summary !== "string") {
      return NextResponse.json(
        { error: "A checkout summary is required" },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.findUnique({
      where: { userId: session.user.id },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee record not found" }, { status: 404 });
    }

    // Find active session
    const activeSession = await prisma.employeeWorkSession.findFirst({
      where: {
        employeeId: employee.id,
        status: { not: "CHECKED_OUT" },
      },
      include: {
        activities: true,
        breaks: true,
      },
    });

    if (!activeSession) {
      return NextResponse.json(
        { error: "No active work session found" },
        { status: 404 }
      );
    }

    const now = new Date();

    const updatedSession = await prisma.$transaction(async (tx) => {
      // End any open activities
      await tx.employeeActivity.updateMany({
        where: {
          sessionId: activeSession.id,
          endedAt: null,
        },
        data: {
          endedAt: now,
        },
      });

      // Calculate durations for activities that were just closed
      const openActivities = activeSession.activities.filter((a) => !a.endedAt);
      for (const activity of openActivities) {
        const durationMin = Math.round(
          (now.getTime() - activity.startedAt.getTime()) / 60000
        );
        await tx.employeeActivity.update({
          where: { id: activity.id },
          data: { durationMin },
        });
      }

      // End any open breaks
      await tx.employeeBreak.updateMany({
        where: {
          sessionId: activeSession.id,
          endedAt: null,
        },
        data: {
          endedAt: now,
        },
      });

      // Recalculate all activity minutes from the session
      const allActivities = await tx.employeeActivity.findMany({
        where: { sessionId: activeSession.id },
      });

      let activeMinutes = 0;
      let idleMinutes = 0;
      let breakMinutes = 0;

      for (const activity of allActivities) {
        const end = activity.endedAt || now;
        const mins = Math.round(
          (end.getTime() - activity.startedAt.getTime()) / 60000
        );
        if (activity.type === "ACTIVE") activeMinutes += mins;
        else if (activity.type === "IDLE") idleMinutes += mins;
        else if (activity.type === "BREAK") breakMinutes += mins;
      }

      const totalMinutes = Math.round(
        (now.getTime() - activeSession.checkInAt.getTime()) / 60000
      );

      // Update the session
      return tx.employeeWorkSession.update({
        where: { id: activeSession.id },
        data: {
          checkOutAt: now,
          checkOutSummary: summary,
          status: "CHECKED_OUT",
          totalMinutes,
          activeMinutes,
          idleMinutes,
          breakMinutes,
        },
        include: {
          activities: { orderBy: { startedAt: "asc" } },
          breaks: { orderBy: { startedAt: "asc" } },
        },
      });
    });

    // Audit log
    await logAudit({
      userId: session.user.id as string,
      userName: session.user.name || session.user.email,
      userRole: session.user.role,
      action: "CHECK_OUT",
      entity: "work-session",
      entityId: updatedSession.id,
      entityName: `${session.user.name} - ${updatedSession.workLocation}`,
      details: JSON.stringify({ totalMinutes: updatedSession.totalMinutes, activeMinutes: updatedSession.activeMinutes, summary }),
    });

    // Notify all admins about employee checkout with summary
    const empName = session.user.name || "An employee";
    const hours = Math.floor((updatedSession.totalMinutes || 0) / 60);
    const mins = (updatedSession.totalMinutes || 0) % 60;
    const activeH = Math.floor((updatedSession.activeMinutes || 0) / 60);
    const activeMins = (updatedSession.activeMinutes || 0) % 60;
    const idleH = Math.floor((updatedSession.idleMinutes || 0) / 60);
    const idleMins = (updatedSession.idleMinutes || 0) % 60;
    const breakH = Math.floor((updatedSession.breakMinutes || 0) / 60);
    const breakMins = (updatedSession.breakMinutes || 0) % 60;

    notifyRole(
      ["SUPER_ADMIN", "ADMIN", "HR_MANAGER"],
      `🔴 ${empName} checked out`,
      `Total: ${hours}h ${mins}m | Active: ${activeH}h ${activeMins}m | Idle: ${idleH}h ${idleMins}m | Breaks: ${breakH}h ${breakMins}m\nSummary: ${summary}`,
      `/admin/team-activity`
    ).catch(() => {});

    // Fire-and-forget: Aggregate daily KPI and check performance alerts
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    aggregateDailyKPI(employee.id, today).catch((err) =>
      console.error("Post-checkout KPI aggregation error:", err)
    );
    checkDailyAlerts(employee.id).catch((err) =>
      console.error("Post-checkout alert check error:", err)
    );

    return NextResponse.json({
      session: updatedSession,
      stats: {
        totalMinutes: updatedSession.totalMinutes,
        activeMinutes: updatedSession.activeMinutes,
        idleMinutes: updatedSession.idleMinutes,
        breakMinutes: updatedSession.breakMinutes,
      },
    });
  } catch (error) {
    console.error("Work session checkout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
