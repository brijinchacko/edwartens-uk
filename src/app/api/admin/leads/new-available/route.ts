import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isCrmRole } from "@/lib/rbac";

/**
 * GET /api/admin/leads/new-available
 * Returns unassigned leads from the last 24 hours for the popup.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || !isCrmRole(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const leads = await prisma.lead.findMany({
      where: {
        assignedToId: null,
        status: "NEW",
        createdAt: { gte: twentyFourHoursAgo },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        source: true,
        courseInterest: true,
        createdAt: true,
        assignedToId: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      leads: leads.map((l) => ({
        ...l,
        assignedToName: null,
        createdAt: l.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("New available leads error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
