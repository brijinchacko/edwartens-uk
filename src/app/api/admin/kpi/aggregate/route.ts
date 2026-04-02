import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { aggregateDailyKPI } from "@/lib/kpi";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const dateStr = body.date || new Date().toISOString().split("T")[0];
    const date = new Date(dateStr);

    // Get all active employees
    const employees = await prisma.employee.findMany({
      where: { user: { isActive: true } },
      select: { id: true },
    });

    const results: { employeeId: string; status: string }[] = [];

    for (const emp of employees) {
      try {
        await aggregateDailyKPI(emp.id, date);
        results.push({ employeeId: emp.id, status: "success" });
      } catch (error) {
        console.error(`KPI aggregation failed for ${emp.id}:`, error);
        results.push({ employeeId: emp.id, status: "error" });
      }
    }

    const successCount = results.filter((r) => r.status === "success").length;
    const errorCount = results.filter((r) => r.status === "error").length;

    return NextResponse.json({
      message: `Aggregated KPIs for ${successCount} employees (${errorCount} errors)`,
      date: dateStr,
      results,
    });
  } catch (error) {
    console.error("KPI aggregation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
