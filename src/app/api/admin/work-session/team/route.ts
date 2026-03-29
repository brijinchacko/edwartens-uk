import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isCrmRole, hasPermission } from "@/lib/rbac";

export async function GET() {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !isCrmRole(session.user.role) ||
      !hasPermission(session.user.role, "users:manage")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Get all employees with their user info
    const employees = await prisma.employee.findMany({
      include: {
        user: {
          select: { name: true, email: true, role: true },
        },
      },
      orderBy: { user: { name: "asc" } },
    });

    const now = new Date();

    const teamStatus = await Promise.all(
      employees.map(async (emp) => {
        // Find active session for today (not checked out)
        const activeSession = await prisma.employeeWorkSession.findFirst({
          where: {
            employeeId: emp.id,
            status: { not: "CHECKED_OUT" },
            checkInAt: { gte: todayStart, lte: todayEnd },
          },
          orderBy: { checkInAt: "desc" },
          include: {
            activities: true,
            breaks: { where: { endedAt: null } },
          },
        });

        // Calculate today's total active minutes across all sessions
        const todaySessions = await prisma.employeeWorkSession.findMany({
          where: {
            employeeId: emp.id,
            checkInAt: { gte: todayStart, lte: todayEnd },
          },
          include: {
            activities: true,
            breaks: true,
          },
        });

        let totalActiveMinutesToday = 0;
        let breaksToday: { startedAt: Date; endedAt: Date | null; reason: string | null }[] = [];

        for (const ws of todaySessions) {
          for (const activity of ws.activities) {
            if (activity.type === "ACTIVE") {
              if (activity.durationMin) {
                totalActiveMinutesToday += activity.durationMin;
              } else if (!activity.endedAt) {
                // Still open, calculate live duration
                totalActiveMinutesToday += Math.round(
                  (now.getTime() - activity.startedAt.getTime()) / 60000
                );
              }
            }
          }
          breaksToday = breaksToday.concat(ws.breaks);
        }

        let currentStatus: string;
        if (!activeSession) {
          currentStatus = "OFFLINE";
        } else {
          currentStatus = activeSession.status;
        }

        return {
          employeeId: emp.id,
          employeeName: emp.user.name,
          email: emp.user.email,
          role: emp.user.role,
          currentStatus,
          checkInTime: activeSession?.checkInAt || null,
          workLocation: activeSession?.workLocation || null,
          totalActiveMinutesToday,
          breaksToday: breaksToday.map((b) => ({
            startedAt: b.startedAt,
            endedAt: b.endedAt,
            reason: b.reason,
          })),
        };
      })
    );

    return NextResponse.json({ team: teamStatus });
  } catch (error) {
    console.error("Work session team view error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
