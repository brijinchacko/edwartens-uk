import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isCrmRole } from "@/lib/rbac";
import { notifyByRole } from "@/lib/notifications";

const IDLE_THRESHOLD_MINUTES = 20;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !isCrmRole(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { isActive } = body;

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "isActive must be a boolean" },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.findUnique({
      where: { userId: session.user.id },
      include: { user: { select: { name: true } } },
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

    // Skip heartbeat processing if on break
    if (activeSession.status === "ON_BREAK") {
      return NextResponse.json({ status: activeSession.status });
    }

    const now = new Date();

    // Get current open activity
    const currentActivity = await prisma.employeeActivity.findFirst({
      where: {
        sessionId: activeSession.id,
        endedAt: null,
      },
      orderBy: { startedAt: "desc" },
    });

    if (!currentActivity) {
      return NextResponse.json({ status: activeSession.status });
    }

    const activityDurationMin = Math.round(
      (now.getTime() - currentActivity.startedAt.getTime()) / 60000
    );

    // Case 1: User is inactive and current activity is ACTIVE, check if idle > threshold
    if (!isActive && currentActivity.type === "ACTIVE") {
      if (activityDurationMin >= IDLE_THRESHOLD_MINUTES) {
        await prisma.$transaction(async (tx) => {
          // End ACTIVE activity
          await tx.employeeActivity.update({
            where: { id: currentActivity.id },
            data: {
              endedAt: now,
              durationMin: activityDurationMin,
            },
          });

          // Create IDLE activity
          await tx.employeeActivity.create({
            data: {
              sessionId: activeSession.id,
              type: "IDLE",
              startedAt: now,
            },
          });

          // Set session status to IDLE
          await tx.employeeWorkSession.update({
            where: { id: activeSession.id },
            data: { status: "IDLE" },
          });
        });

        // Notify admins
        const employeeName = employee.user.name || "An employee";
        await notifyByRole(
          ["SUPER_ADMIN", "ADMIN"],
          "Employee Idle Alert",
          `${employeeName} has been idle for ${IDLE_THRESHOLD_MINUTES}+ minutes`,
          "IDLE_ALERT",
          "/admin/employees"
        );

        return NextResponse.json({ status: "IDLE" });
      }

      // Not yet past threshold, still active
      return NextResponse.json({ status: activeSession.status });
    }

    // Case 2: User is active again and current activity is IDLE
    if (isActive && currentActivity.type === "IDLE") {
      await prisma.$transaction(async (tx) => {
        // End IDLE activity
        const idleDuration = Math.round(
          (now.getTime() - currentActivity.startedAt.getTime()) / 60000
        );
        await tx.employeeActivity.update({
          where: { id: currentActivity.id },
          data: {
            endedAt: now,
            durationMin: idleDuration,
          },
        });

        // Create new ACTIVE activity
        await tx.employeeActivity.create({
          data: {
            sessionId: activeSession.id,
            type: "ACTIVE",
            startedAt: now,
          },
        });

        // Set session status back to CHECKED_IN
        await tx.employeeWorkSession.update({
          where: { id: activeSession.id },
          data: { status: "CHECKED_IN" },
        });
      });

      return NextResponse.json({ status: "CHECKED_IN" });
    }

    // No state change needed
    return NextResponse.json({ status: activeSession.status });
  } catch (error) {
    console.error("Work session heartbeat error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
