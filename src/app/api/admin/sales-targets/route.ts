import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "dashboard:read")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const now = new Date();
    const month = parseInt(searchParams.get("month") || String(now.getMonth() + 1), 10);
    const year = parseInt(searchParams.get("year") || String(now.getFullYear()), 10);
    const employeeId = searchParams.get("employeeId");

    const where: any = { month, year };
    if (employeeId) where.employeeId = employeeId;

    // If SALES_LEAD, only show own targets
    if (session.user.role === "SALES_LEAD") {
      const emp = await prisma.employee.findUnique({ where: { userId: session.user.id } });
      if (emp) where.employeeId = emp.id;
    }

    const targets = await prisma.salesTarget.findMany({
      where,
      include: { employee: { include: { user: { select: { name: true, email: true } } } } },
    });

    const incentives = await prisma.salesIncentive.findMany({
      where,
      include: { employee: { include: { user: { select: { name: true } } } } },
    });

    return NextResponse.json({ targets, incentives });
  } catch (error) {
    console.error("Sales targets error:", error);
    return NextResponse.json({ error: "Failed to fetch targets" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = session.user.role;
    if (!["SUPER_ADMIN", "ADMIN", "HR_MANAGER"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { employeeId, month, year, salesTarget, leadTarget, hardTarget } = body;

    if (!employeeId || !month || !year) {
      return NextResponse.json({ error: "employeeId, month, and year are required" }, { status: 400 });
    }

    const target = await prisma.salesTarget.upsert({
      where: { employeeId_month_year: { employeeId, month, year } },
      update: {
        ...(salesTarget !== undefined ? { salesTarget } : {}),
        ...(leadTarget !== undefined ? { leadTarget } : {}),
        ...(hardTarget !== undefined ? { hardTarget } : {}),
      },
      create: {
        employeeId,
        month,
        year,
        salesTarget: salesTarget ?? 20,
        leadTarget: leadTarget ?? 50,
        hardTarget: hardTarget ?? 12,
      },
    });

    return NextResponse.json({ target });
  } catch (error) {
    console.error("Sales target update error:", error);
    return NextResponse.json({ error: "Failed to update target" }, { status: 500 });
  }
}
