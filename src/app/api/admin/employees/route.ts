import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "batches:manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const roleParam = searchParams.get("role");

    const roles = roleParam
      ? roleParam.split(",").map((r) => r.trim())
      : undefined;

    const employees = await prisma.employee.findMany({
      where: roles
        ? { user: { role: { in: roles as any[] } } }
        : undefined,
      include: {
        user: {
          select: { name: true, email: true, role: true },
        },
      },
      orderBy: { user: { name: "asc" } },
    });

    return NextResponse.json({ employees });
  } catch (error) {
    console.error("Admin employees list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
