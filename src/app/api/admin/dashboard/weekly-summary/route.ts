import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isCrmRole } from "@/lib/rbac";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || !isCrmRole(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const employee = await prisma.employee.findUnique({
      where: { userId: session.user.id },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee record not found" }, { status: 404 });
    }

    // Get sessions for the last 7 days
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const sessions = await prisma.employeeWorkSession.findMany({
      where: {
        employeeId: employee.id,
        status: "CHECKED_OUT",
        checkInAt: { gte: sevenDaysAgo },
      },
      orderBy: { checkInAt: "asc" },
    });

    // Build day-by-day data (Europe/London timezone)
    const days: {
      date: string;
      activeHours: number;
      breakHours: number;
      idleHours: number;
      checkIn: string | null;
      checkOut: string | null;
    }[] = [];

    let totalHours = 0;
    let totalBreakHours = 0;
    let totalIdleHours = 0;
    let daysWorked = 0;
    let onTimeDays = 0;

    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      const label = d.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        timeZone: "Europe/London",
      });

      const daySessions = sessions.filter((s) => {
        const checkIn = new Date(s.checkInAt);
        return checkIn >= dayStart && checkIn <= dayEnd;
      });

      if (daySessions.length === 0) {
        days.push({
          date: label,
          activeHours: 0,
          breakHours: 0,
          idleHours: 0,
          checkIn: null,
          checkOut: null,
        });
        continue;
      }

      daysWorked++;

      let dayActive = 0;
      let dayBreak = 0;
      let dayIdle = 0;
      let firstCheckIn: Date | null = null;
      let lastCheckOut: Date | null = null;

      for (const s of daySessions) {
        dayActive += s.activeMinutes || 0;
        dayBreak += s.breakMinutes || 0;
        dayIdle += s.idleMinutes || 0;

        if (!firstCheckIn || new Date(s.checkInAt) < firstCheckIn) {
          firstCheckIn = new Date(s.checkInAt);
        }
        if (s.checkOutAt && (!lastCheckOut || new Date(s.checkOutAt) > lastCheckOut)) {
          lastCheckOut = new Date(s.checkOutAt);
        }
      }

      // Consider "on time" if checked in before 9:30 AM London
      if (firstCheckIn) {
        const checkInHour = parseInt(
          firstCheckIn.toLocaleString("en-GB", { hour: "2-digit", hour12: false, timeZone: "Europe/London" })
        );
        const checkInMin = parseInt(
          firstCheckIn.toLocaleString("en-GB", { minute: "2-digit", timeZone: "Europe/London" })
        );
        if (checkInHour < 9 || (checkInHour === 9 && checkInMin <= 30)) {
          onTimeDays++;
        }
      }

      const dayTotalHours = (dayActive + dayBreak + dayIdle) / 60;
      totalHours += dayTotalHours;
      totalBreakHours += dayBreak / 60;
      totalIdleHours += dayIdle / 60;

      days.push({
        date: label,
        activeHours: Math.round((dayActive / 60) * 10) / 10,
        breakHours: Math.round((dayBreak / 60) * 10) / 10,
        idleHours: Math.round((dayIdle / 60) * 10) / 10,
        checkIn: firstCheckIn
          ? firstCheckIn.toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "Europe/London",
            })
          : null,
        checkOut: lastCheckOut
          ? lastCheckOut.toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "Europe/London",
            })
          : null,
      });
    }

    const avgHoursPerDay = daysWorked > 0 ? Math.round((totalHours / daysWorked) * 10) / 10 : 0;
    const onTimeRate = daysWorked > 0 ? Math.round((onTimeDays / daysWorked) * 100) : 0;

    return NextResponse.json({
      days,
      totals: {
        totalHours: Math.round(totalHours * 10) / 10,
        avgHoursPerDay,
        totalBreakHours: Math.round(totalBreakHours * 10) / 10,
        totalIdleHours: Math.round(totalIdleHours * 10) / 10,
        daysWorked,
        onTimeRate,
      },
    });
  } catch (error) {
    console.error("Weekly summary error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
