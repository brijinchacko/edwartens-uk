import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | undefined)?.role;
    if (!session?.user || (role !== "SUPER_ADMIN" && role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const days = Math.min(parseInt(searchParams.get("days") || "30", 10), 365);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Summary counts
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(todayStart.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalViews,
      todayViews,
      weekViews,
      monthViews,
      uniqueSessionsToday,
      uniqueSessionsWeek,
      uniqueSessionsMonth,
      topPages,
      topReferrers,
      topCountries,
      topCities,
      deviceBreakdown,
      browserBreakdown,
      osBreakdown,
      utmSources,
      dailyRaw,
      topPaths24h,
    ] = await Promise.all([
      prisma.pageView.count({ where: { createdAt: { gte: since } } }),
      prisma.pageView.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.pageView.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.pageView.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.pageView.findMany({
        where: { createdAt: { gte: todayStart }, sessionId: { not: null } },
        select: { sessionId: true },
        distinct: ["sessionId"],
      }),
      prisma.pageView.findMany({
        where: { createdAt: { gte: weekStart }, sessionId: { not: null } },
        select: { sessionId: true },
        distinct: ["sessionId"],
      }),
      prisma.pageView.findMany({
        where: { createdAt: { gte: monthStart }, sessionId: { not: null } },
        select: { sessionId: true },
        distinct: ["sessionId"],
      }),
      prisma.pageView.groupBy({
        by: ["path"],
        where: { createdAt: { gte: since } },
        _count: { path: true },
        orderBy: { _count: { path: "desc" } },
        take: 15,
      }),
      prisma.pageView.groupBy({
        by: ["referrerHost"],
        where: { createdAt: { gte: since }, referrerHost: { not: null } },
        _count: { referrerHost: true },
        orderBy: { _count: { referrerHost: "desc" } },
        take: 15,
      }),
      prisma.pageView.groupBy({
        by: ["country", "countryCode"],
        where: { createdAt: { gte: since }, country: { not: null } },
        _count: { country: true },
        orderBy: { _count: { country: "desc" } },
        take: 15,
      }),
      prisma.pageView.groupBy({
        by: ["city", "country"],
        where: { createdAt: { gte: since }, city: { not: null } },
        _count: { city: true },
        orderBy: { _count: { city: "desc" } },
        take: 10,
      }),
      prisma.pageView.groupBy({
        by: ["device"],
        where: { createdAt: { gte: since }, device: { not: null } },
        _count: { device: true },
      }),
      prisma.pageView.groupBy({
        by: ["browser"],
        where: { createdAt: { gte: since }, browser: { not: null } },
        _count: { browser: true },
        orderBy: { _count: { browser: "desc" } },
      }),
      prisma.pageView.groupBy({
        by: ["os"],
        where: { createdAt: { gte: since }, os: { not: null } },
        _count: { os: true },
        orderBy: { _count: { os: "desc" } },
      }),
      prisma.pageView.groupBy({
        by: ["utmSource"],
        where: { createdAt: { gte: since }, utmSource: { not: null } },
        _count: { utmSource: true },
        orderBy: { _count: { utmSource: "desc" } },
        take: 10,
      }),
      prisma.pageView.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.pageView.groupBy({
        by: ["path"],
        where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
        _count: { path: true },
        orderBy: { _count: { path: "desc" } },
        take: 5,
      }),
    ]);

    // Build daily series
    const dayMap = new Map<string, number>();
    for (let i = 0; i < days; i++) {
      const d = new Date(todayStart.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      dayMap.set(key, 0);
    }
    for (const row of dailyRaw) {
      const key = row.createdAt.toISOString().slice(0, 10);
      if (dayMap.has(key)) dayMap.set(key, (dayMap.get(key) || 0) + 1);
    }
    const daily = Array.from(dayMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    return NextResponse.json({
      summary: {
        totalViews,
        todayViews,
        weekViews,
        monthViews,
        uniqueSessionsToday: uniqueSessionsToday.length,
        uniqueSessionsWeek: uniqueSessionsWeek.length,
        uniqueSessionsMonth: uniqueSessionsMonth.length,
      },
      daily,
      topPages: topPages.map((p) => ({ path: p.path, count: p._count.path })),
      topReferrers: topReferrers.map((r) => ({ host: r.referrerHost, count: r._count.referrerHost })),
      topCountries: topCountries.map((c) => ({
        country: c.country,
        countryCode: c.countryCode,
        count: c._count.country,
      })),
      topCities: topCities.map((c) => ({
        city: c.city,
        country: c.country,
        count: c._count.city,
      })),
      devices: deviceBreakdown.map((d) => ({ device: d.device, count: d._count.device })),
      browsers: browserBreakdown.map((b) => ({ browser: b.browser, count: b._count.browser })),
      os: osBreakdown.map((o) => ({ os: o.os, count: o._count.os })),
      utmSources: utmSources.map((u) => ({ source: u.utmSource, count: u._count.utmSource })),
      topPaths24h: topPaths24h.map((p) => ({ path: p.path, count: p._count.path })),
    });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
