import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const now = new Date();
    const month = parseInt(searchParams.get("month") || String(now.getMonth() + 1), 10);
    const year = parseInt(searchParams.get("year") || String(now.getFullYear()), 10);

    const emp = await prisma.employee.findUnique({ where: { userId: session.user.id } });
    if (!emp) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const incentive = await prisma.salesIncentive.findUnique({
      where: { employeeId_month_year: { employeeId: emp.id, month, year } },
    });

    return NextResponse.json({ incentive: incentive || { totalSales: 0, totalEarned: 0, distributed: 0, distributions: null } });
  } catch (error) {
    console.error("Incentive error:", error);
    return NextResponse.json({ error: "Failed to fetch incentive" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !["SUPER_ADMIN", "ADMIN", "SALES_LEAD"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { distributions } = body; // [{ toName, amount }]

    const emp = await prisma.employee.findUnique({ where: { userId: session.user.id } });
    if (!emp) return NextResponse.json({ error: "Employee not found" }, { status: 404 });

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const incentive = await prisma.salesIncentive.findUnique({
      where: { employeeId_month_year: { employeeId: emp.id, month, year } },
    });

    if (!incentive) return NextResponse.json({ error: "No incentive record" }, { status: 404 });

    const totalDistribution = distributions.reduce((sum: number, d: any) => sum + (d.amount || 0), 0);
    const remaining = incentive.totalEarned - incentive.distributed;

    if (totalDistribution > remaining) {
      return NextResponse.json({ error: `Cannot distribute more than \u00a3${remaining.toFixed(2)} remaining` }, { status: 400 });
    }

    const existingDist = (incentive.distributions as any[]) || [];
    const updated = await prisma.salesIncentive.update({
      where: { id: incentive.id },
      data: {
        distributed: { increment: totalDistribution },
        distributions: [...existingDist, ...distributions.map((d: any) => ({ ...d, date: new Date().toISOString() }))],
      },
    });

    return NextResponse.json({ incentive: updated });
  } catch (error) {
    console.error("Distribution error:", error);
    return NextResponse.json({ error: "Failed to record distribution" }, { status: 500 });
  }
}
