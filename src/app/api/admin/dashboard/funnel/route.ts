import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isCrmRole } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = (session.user as { role: string }).role;
    if (!isCrmRole(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // Funnel counts for all time
    const [totalLeads, contacted, qualified, enrolled, lost] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { status: "CONTACTED" } }),
      prisma.lead.count({ where: { status: "QUALIFIED" } }),
      prisma.lead.count({ where: { status: "ENROLLED" } }),
      prisma.lead.count({ where: { status: "LOST" } }),
    ]);

    // This month counts
    const thisMonthFilter = { createdAt: { gte: thisMonthStart } };
    const [tmTotal, tmContacted, tmQualified, tmEnrolled] = await Promise.all([
      prisma.lead.count({ where: thisMonthFilter }),
      prisma.lead.count({ where: { ...thisMonthFilter, status: "CONTACTED" } }),
      prisma.lead.count({ where: { ...thisMonthFilter, status: "QUALIFIED" } }),
      prisma.lead.count({ where: { ...thisMonthFilter, status: "ENROLLED" } }),
    ]);

    // Last month counts
    const lastMonthFilter = { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } };
    const [lmTotal, lmContacted, lmQualified, lmEnrolled] = await Promise.all([
      prisma.lead.count({ where: lastMonthFilter }),
      prisma.lead.count({ where: { ...lastMonthFilter, status: "CONTACTED" } }),
      prisma.lead.count({ where: { ...lastMonthFilter, status: "QUALIFIED" } }),
      prisma.lead.count({ where: { ...lastMonthFilter, status: "ENROLLED" } }),
    ]);

    // Source breakdown
    const allLeads = await prisma.lead.findMany({
      select: { source: true, status: true },
    });

    const sourceMap: Record<string, { total: number; contacted: number; qualified: number; enrolled: number }> = {};
    for (const lead of allLeads) {
      const src = lead.source || "unknown";
      if (!sourceMap[src]) {
        sourceMap[src] = { total: 0, contacted: 0, qualified: 0, enrolled: 0 };
      }
      sourceMap[src].total++;
      if (lead.status === "CONTACTED") sourceMap[src].contacted++;
      if (lead.status === "QUALIFIED") sourceMap[src].qualified++;
      if (lead.status === "ENROLLED") sourceMap[src].enrolled++;
    }

    const sourceBreakdown = Object.entries(sourceMap)
      .map(([source, counts]) => ({
        source,
        ...counts,
        conversionRate: counts.total > 0
          ? Math.round((counts.enrolled / counts.total) * 100)
          : 0,
      }))
      .sort((a, b) => b.conversionRate - a.conversionRate);

    // Calculate conversion rates
    const calcRate = (from: number, to: number) =>
      from > 0 ? Math.round((to / from) * 100) : 0;

    return NextResponse.json({
      funnel: {
        totalLeads,
        contacted,
        qualified,
        enrolled,
        lost,
        rates: {
          leadToContacted: calcRate(totalLeads, contacted + qualified + enrolled),
          contactedToQualified: calcRate(contacted + qualified + enrolled, qualified + enrolled),
          qualifiedToEnrolled: calcRate(qualified + enrolled, enrolled),
          overall: calcRate(totalLeads, enrolled),
        },
      },
      thisMonth: {
        totalLeads: tmTotal,
        contacted: tmContacted,
        qualified: tmQualified,
        enrolled: tmEnrolled,
      },
      lastMonth: {
        totalLeads: lmTotal,
        contacted: lmContacted,
        qualified: lmQualified,
        enrolled: lmEnrolled,
      },
      sourceBreakdown,
    });
  } catch (error) {
    console.error("Funnel API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
