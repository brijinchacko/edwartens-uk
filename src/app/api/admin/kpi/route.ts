import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isCrmRole } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !isCrmRole(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const employeeId = searchParams.get("employeeId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const groupBy = searchParams.get("groupBy") || "day"; // day | week | month

    // Non-admin roles can only see their own KPIs
    const isAdmin = ["SUPER_ADMIN", "ADMIN", "HR_MANAGER"].includes(session.user.role);
    let targetEmployeeId = employeeId;

    if (!isAdmin) {
      // Get the employee profile for the current user
      const employee = await prisma.employee.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });
      if (!employee) {
        return NextResponse.json({ error: "Employee profile not found" }, { status: 404 });
      }
      targetEmployeeId = employee.id;
    }

    // Build where clause
    const where: Record<string, unknown> = {};
    if (targetEmployeeId) {
      where.employeeId = targetEmployeeId;
    }
    if (startDate || endDate) {
      where.date = {
        ...(startDate ? { gte: new Date(startDate) } : {}),
        ...(endDate ? { lte: new Date(endDate + "T23:59:59.999Z") } : {}),
      };
    }

    const kpiRows = await prisma.employeeKPI.findMany({
      where,
      include: {
        employee: {
          include: { user: { select: { name: true, avatar: true } } },
        },
      },
      orderBy: { date: "asc" },
    });

    // Group if needed
    if (groupBy === "day") {
      return NextResponse.json({ data: kpiRows });
    }

    // Group by week or month
    const grouped: Record<string, {
      period: string;
      employeeId: string;
      employeeName: string;
      count: number;
      totalScore: number;
      totalCalls: number;
      totalEmails: number;
      totalNotes: number;
      totalActiveMinutes: number;
      totalConversions: number;
      lateArrivals: number;
      excessBreaks: number;
    }> = {};

    for (const row of kpiRows) {
      const d = new Date(row.date);
      let periodKey: string;
      if (groupBy === "week") {
        const weekStart = new Date(d);
        weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay());
        periodKey = `${row.employeeId}_${weekStart.toISOString().split("T")[0]}`;
      } else {
        periodKey = `${row.employeeId}_${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      }

      if (!grouped[periodKey]) {
        grouped[periodKey] = {
          period: periodKey.split("_")[1],
          employeeId: row.employeeId,
          employeeName: row.employee.user.name,
          count: 0,
          totalScore: 0,
          totalCalls: 0,
          totalEmails: 0,
          totalNotes: 0,
          totalActiveMinutes: 0,
          totalConversions: 0,
          lateArrivals: 0,
          excessBreaks: 0,
        };
      }
      const g = grouped[periodKey];
      g.count++;
      g.totalScore += row.productivityScore;
      g.totalCalls += row.callsMade;
      g.totalEmails += row.emailsSent;
      g.totalNotes += row.notesAdded;
      g.totalActiveMinutes += row.activeMinutes;
      g.totalConversions += row.leadsConverted;
      if (row.lateArrival) g.lateArrivals++;
      if (row.excessBreaks) g.excessBreaks++;
    }

    const result = Object.values(grouped).map((g) => ({
      ...g,
      avgScore: Math.round((g.totalScore / g.count) * 100) / 100,
      avgActiveHours: Math.round((g.totalActiveMinutes / g.count / 60) * 100) / 100,
    }));

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("KPI fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
