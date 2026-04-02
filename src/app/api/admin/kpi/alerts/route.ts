import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isCrmRole } from "@/lib/rbac";
import { KPI_CONFIG } from "@/lib/kpi";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || !isCrmRole(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const alerts: Array<{
      type: string;
      severity: "warning" | "critical";
      employeeId: string;
      employeeName: string;
      message: string;
      value?: number;
    }> = [];

    // Get today's KPI data
    const todayKPIs = await prisma.employeeKPI.findMany({
      where: { date: today },
      include: {
        employee: {
          include: { user: { select: { name: true } } },
        },
      },
    });

    for (const kpi of todayKPIs) {
      const name = kpi.employee.user.name;

      // Late arrivals today
      if (kpi.lateArrival) {
        alerts.push({
          type: "LATE_ARRIVAL",
          severity: "warning",
          employeeId: kpi.employeeId,
          employeeName: name,
          message: `${name} arrived late today${kpi.checkInTime ? ` at ${new Date(kpi.checkInTime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}` : ""}`,
        });
      }

      // Excess breaks today
      if (kpi.excessBreaks) {
        alerts.push({
          type: "EXCESS_BREAKS",
          severity: "warning",
          employeeId: kpi.employeeId,
          employeeName: name,
          message: `${name} exceeded break limits (${kpi.breakMinutes} min)`,
          value: kpi.breakMinutes,
        });
      }

      // Low activity (below minimum)
      const totalActivities = kpi.callsMade + kpi.emailsSent + kpi.notesAdded;
      if (totalActivities < KPI_CONFIG.minDailyActivities) {
        alerts.push({
          type: "LOW_ACTIVITY",
          severity: "warning",
          employeeId: kpi.employeeId,
          employeeName: name,
          message: `${name} has low activity today: ${totalActivities} actions (min: ${KPI_CONFIG.minDailyActivities})`,
          value: totalActivities,
        });
      }

      // Low scores (below 50)
      if (kpi.productivityScore < 50 && kpi.productivityScore > 0) {
        alerts.push({
          type: "LOW_SCORE",
          severity: "critical",
          employeeId: kpi.employeeId,
          employeeName: name,
          message: `${name} has a low productivity score: ${kpi.productivityScore}`,
          value: kpi.productivityScore,
        });
      }
    }

    // Uncontacted leads (assigned >24h with no notes)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const uncontactedLeads = await prisma.lead.findMany({
      where: {
        assignedToId: { not: null },
        createdAt: { lte: twentyFourHoursAgo },
        status: "NEW",
        notes: { none: {} },
      },
      include: {
        assignedTo: {
          include: { user: { select: { name: true } } },
        },
      },
      take: 50,
    });

    for (const lead of uncontactedLeads) {
      if (lead.assignedTo) {
        alerts.push({
          type: "UNCONTACTED_LEAD",
          severity: "critical",
          employeeId: lead.assignedToId!,
          employeeName: lead.assignedTo.user.name,
          message: `Lead "${lead.name}" assigned to ${lead.assignedTo.user.name} for >24h with no notes`,
        });
      }
    }

    // Sort: critical first, then warning
    alerts.sort((a, b) => {
      if (a.severity === "critical" && b.severity !== "critical") return -1;
      if (a.severity !== "critical" && b.severity === "critical") return 1;
      return 0;
    });

    return NextResponse.json({
      alerts,
      summary: {
        total: alerts.length,
        critical: alerts.filter((a) => a.severity === "critical").length,
        warning: alerts.filter((a) => a.severity === "warning").length,
      },
    });
  } catch (error) {
    console.error("KPI alerts error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
