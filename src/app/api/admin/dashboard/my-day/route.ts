import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isCrmRole } from "@/lib/rbac";

const UK_TZ = "Europe/London";

function getGreeting(name: string): string {
  const hour = new Date().toLocaleString("en-GB", {
    hour: "numeric",
    hour12: false,
    timeZone: UK_TZ,
  });
  const h = parseInt(hour, 10);
  if (h < 12) return `Good morning, ${name}!`;
  if (h < 17) return `Good afternoon, ${name}!`;
  return `Good evening, ${name}!`;
}

function getTodayRangeUK(): { todayStart: Date; todayEnd: Date } {
  // Get the current date string in UK timezone
  const now = new Date();
  const ukDate = now.toLocaleDateString("en-CA", { timeZone: UK_TZ }); // YYYY-MM-DD
  const todayStart = new Date(`${ukDate}T00:00:00.000Z`);
  // Adjust for UK offset: if UK is in BST (UTC+1), midnight UK = 23:00 UTC previous day
  const offset = getUKOffsetMs(now);
  todayStart.setTime(todayStart.getTime() - offset);
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1);
  return { todayStart, todayEnd };
}

function getUKOffsetMs(date: Date): number {
  // Calculate the UTC offset for UK at the given date
  const utcStr = date.toLocaleString("en-US", { timeZone: "UTC" });
  const ukStr = date.toLocaleString("en-US", { timeZone: UK_TZ });
  return new Date(ukStr).getTime() - new Date(utcStr).getTime();
}

/**
 * GET /api/admin/dashboard/my-day
 * Returns everything an agent needs for their daily dashboard.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || !isCrmRole(session.user.role as string)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;
    const userName = session.user.name || session.user.email || "there";
    const userRole = session.user.role as string;
    const firstName = userName.split(" ")[0];

    // Get employee record
    const employee = await prisma.employee.findUnique({
      where: { userId },
      select: { id: true, user: { select: { name: true } } },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Employee record not found" },
        { status: 400 }
      );
    }

    const empId = employee.id;
    const empName = employee.user.name;
    const { todayStart, todayEnd } = getTodayRangeUK();

    // 24 hours ago for uncontacted leads
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Build all queries in parallel
    const [
      todayFollowUpsRaw,
      overdueFollowUpsRaw,
      uncontactedLeadsRaw,
      availableLeads,
      notesTodayCount,
      callsTodayCount,
      leadsConvertedCount,
      forecastCounts,
    ] = await Promise.all([
      // Today's follow-ups
      prisma.lead.findMany({
        where: {
          assignedToId: empId,
          followUpDate: { gte: todayStart, lte: todayEnd },
          status: { notIn: ["ENROLLED", "LOST"] },
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          status: true,
          courseInterest: true,
          followUpDate: true,
          notes: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { content: true, createdAt: true },
          },
        },
        orderBy: { followUpDate: "asc" },
      }),

      // Overdue follow-ups
      prisma.lead.findMany({
        where: {
          assignedToId: empId,
          followUpDate: { lt: todayStart },
          status: { notIn: ["ENROLLED", "LOST"] },
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          status: true,
          courseInterest: true,
          followUpDate: true,
          notes: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { content: true, createdAt: true },
          },
        },
        orderBy: { followUpDate: "asc" },
      }),

      // Uncontacted leads: assigned to me, created > 24h ago, no notes, not terminal
      prisma.lead.findMany({
        where: {
          assignedToId: empId,
          createdAt: { lt: twentyFourHoursAgo },
          status: { notIn: ["ENROLLED", "LOST"] },
          notes: { none: {} },
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          status: true,
          courseInterest: true,
          followUpDate: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      }),

      // Available leads (unassigned)
      prisma.lead.findMany({
        where: {
          assignedToId: null,
          status: { notIn: ["ENROLLED", "LOST"] },
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          status: true,
          courseInterest: true,
          createdAt: true,
          source: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),

      // Notes today by this employee (using employee name as createdBy)
      prisma.leadNote.count({
        where: {
          createdBy: empName,
          createdAt: { gte: todayStart, lte: todayEnd },
        },
      }),

      // Calls today (notes containing "Call" or phone emoji)
      prisma.leadNote.count({
        where: {
          createdBy: empName,
          createdAt: { gte: todayStart, lte: todayEnd },
          OR: [
            { content: { contains: "Call" } },
            { content: { contains: "\u{1F4DE}" } },
          ],
        },
      }),

      // Leads converted to ENROLLED today
      prisma.lead.count({
        where: {
          assignedToId: empId,
          status: "ENROLLED",
          updatedAt: { gte: todayStart, lte: todayEnd },
        },
      }),

      // 7-day forecast: count follow-ups for each of the next 7 days
      Promise.all(
        Array.from({ length: 7 }, (_, i) => {
          const dayStart = new Date(todayStart.getTime() + i * 24 * 60 * 60 * 1000);
          const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000 - 1);
          return prisma.lead.count({
            where: {
              assignedToId: empId,
              followUpDate: { gte: dayStart, lte: dayEnd },
              status: { notIn: ["ENROLLED", "LOST"] },
            },
          });
        })
      ),
    ]);

    // Format follow-up items with latest note
    const formatLead = (lead: any) => ({
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      status: lead.status,
      courseInterest: lead.courseInterest,
      followUpDate: lead.followUpDate,
      lastNote: lead.notes?.[0]?.content || null,
      lastNoteDate: lead.notes?.[0]?.createdAt || null,
      createdAt: lead.createdAt || null,
    });

    const todayFollowUps = todayFollowUpsRaw.map(formatLead);
    const overdueFollowUps = overdueFollowUpsRaw.map(formatLead);
    const uncontactedLeads = uncontactedLeadsRaw.map((lead) => ({
      ...formatLead(lead),
      createdAt: lead.createdAt,
    }));

    // 7-day forecast labels
    const forecast = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(todayStart.getTime() + i * 24 * 60 * 60 * 1000);
      return {
        label: d.toLocaleDateString("en-GB", {
          weekday: "short",
          day: "numeric",
          timeZone: UK_TZ,
        }),
        count: forecastCounts[i],
        isToday: i === 0,
      };
    });

    // Format date for header
    const dateStr = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: UK_TZ,
    });

    // Generate AI daily briefing (fire-and-forget, non-blocking)
    let aiBriefing = "";
    try {
      const { generateDailyBriefing } = await import("@/lib/ai");
      const topLeads = [...todayFollowUps.slice(0, 2), ...overdueFollowUps.slice(0, 1)].map((l: any) => ({
        name: l.name,
        status: l.status,
        daysOverdue: l.followUpDate ? Math.floor((Date.now() - new Date(l.followUpDate).getTime()) / 86400000) : undefined,
      }));
      const briefing = await generateDailyBriefing(empId, todayFollowUps.length, overdueFollowUps.length, topLeads);
      aiBriefing = briefing.content || "";
    } catch {}

    return NextResponse.json({
      greeting: getGreeting(firstName),
      date: dateStr,
      aiBriefing,
      summary: {
        followUpsToday: todayFollowUps.length,
        overdue: overdueFollowUps.length,
        uncontacted: uncontactedLeads.length,
        available: availableLeads.length,
      },
      stats: {
        callsToday: callsTodayCount,
        notesToday: notesTodayCount,
        leadsConverted: leadsConvertedCount,
      },
      todayFollowUps,
      overdueFollowUps,
      uncontactedLeads,
      availableLeads,
      forecast,
    });
  } catch (error) {
    console.error("My Day API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
