import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isCrmRole } from "@/lib/rbac";

/**
 * Role hierarchy for visibility:
 * SUPER_ADMIN → sees everyone
 * ADMIN → sees all except SUPER_ADMIN
 * SALES_LEAD → sees ADMISSION_COUNSELLOR, TRAINER (peers/below)
 * ADMISSION_COUNSELLOR → sees own status only
 * TRAINER → sees own status only
 */
const ROLE_VISIBILITY: Record<string, string[]> = {
  SUPER_ADMIN: ["SUPER_ADMIN", "ADMIN", "SALES_LEAD", "ADMISSION_COUNSELLOR", "TRAINER"],
  ADMIN: ["ADMIN", "SALES_LEAD", "ADMISSION_COUNSELLOR", "TRAINER"],
  SALES_LEAD: ["SALES_LEAD", "ADMISSION_COUNSELLOR", "TRAINER"],
  ADMISSION_COUNSELLOR: [],
  TRAINER: [],
};

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || !isCrmRole(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role as string;
    const userId = session.user.id as string;
    const visibleRoles = ROLE_VISIBILITY[userRole] || [];

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Get employees based on role hierarchy
    const whereClause: any = {};
    if (visibleRoles.length === 0) {
      // Can only see own status
      whereClause.userId = userId;
    } else {
      whereClause.user = { role: { in: visibleRoles } };
    }

    const employees = await prisma.employee.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true, avatar: true },
        },
      },
      orderBy: { user: { name: "asc" } },
    });

    // Get today's work sessions for all visible employees
    const employeeIds = employees.map((e) => e.id);

    const todaySessions = await prisma.employeeWorkSession.findMany({
      where: {
        employeeId: { in: employeeIds },
        checkInAt: { gte: todayStart, lte: todayEnd },
      },
      include: {
        activities: { orderBy: { startedAt: "asc" } },
        breaks: { orderBy: { startedAt: "asc" } },
      },
      orderBy: { checkInAt: "desc" },
    });

    // Build response
    const team = employees.map((emp) => {
      const sessions = todaySessions.filter((s) => s.employeeId === emp.id);
      const activeSession = sessions.find((s) => s.status !== "CHECKED_OUT");

      let currentStatus = "OFFLINE";
      let checkInTime = null;
      let workLocation = null;

      if (activeSession) {
        const statusMap: Record<string, string> = {
          CHECKED_IN: "ACTIVE",
          ON_BREAK: "BREAK",
          IDLE: "IDLE",
        };
        currentStatus = statusMap[activeSession.status] || "ACTIVE";
        checkInTime = activeSession.checkInAt;
        workLocation = activeSession.workLocation;
      }

      // Calculate total active minutes today from all sessions
      let totalActiveMinutes = 0;
      let totalBreakMinutes = 0;
      let totalIdleMinutes = 0;
      let breakCount = 0;

      for (const s of sessions) {
        for (const a of s.activities) {
          const start = new Date(a.startedAt).getTime();
          const end = a.endedAt ? new Date(a.endedAt).getTime() : Date.now();
          const mins = Math.floor((end - start) / 60000);
          if (a.type === "ACTIVE") totalActiveMinutes += mins;
          else if (a.type === "IDLE") totalIdleMinutes += mins;
          else if (a.type === "BREAK") totalBreakMinutes += mins;
        }
        breakCount += s.breaks.length;
      }

      return {
        id: emp.id,
        userId: emp.user.id,
        name: emp.user.name,
        email: emp.user.email,
        role: emp.user.role,
        avatar: emp.user.avatar,
        currentStatus,
        checkInTime,
        workLocation,
        totalActiveMinutes,
        totalBreakMinutes,
        totalIdleMinutes,
        breakCount,
        isSelf: emp.userId === userId,
      };
    });

    return NextResponse.json({ team });
  } catch (error) {
    console.error("Team activity error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
