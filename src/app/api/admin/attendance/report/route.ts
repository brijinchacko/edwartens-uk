import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN", "HR_MANAGER"];

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = session.user as { role: string };
    if (!ALLOWED_ROLES.includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "json";
    const period = searchParams.get("period") || "weekly";
    const employeeId = searchParams.get("employeeId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const role = searchParams.get("role"); // filter by employee role
    const department = searchParams.get("department"); // filter by department
    const workLocation = searchParams.get("workLocation"); // HOME, OFFICE, REMOTE
    const status = searchParams.get("status"); // CHECKED_IN, CHECKED_OUT, IDLE, ON_BREAK
    const lateAfter = searchParams.get("lateAfter"); // e.g. "09:30" — flag late arrivals
    const minHours = searchParams.get("minHours"); // filter employees with >= N hours
    const maxHours = searchParams.get("maxHours"); // filter employees with <= N hours
    const sortBy = searchParams.get("sortBy") || "name"; // name, totalHours, activeHours, idleHours, daysWorked
    const sortOrder = searchParams.get("sortOrder") || "asc";

    // Calculate date range
    const now = new Date();
    let from: Date;
    let to: Date;

    if (startDate && endDate) {
      from = new Date(startDate);
      to = new Date(endDate);
      to.setHours(23, 59, 59, 999);
    } else if (period === "daily") {
      from = new Date(now);
      from.setHours(0, 0, 0, 0);
      to = new Date(now);
      to.setHours(23, 59, 59, 999);
    } else if (period === "monthly") {
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else {
      from = new Date(now);
      from.setDate(from.getDate() - 6);
      from.setHours(0, 0, 0, 0);
      to = new Date(now);
      to.setHours(23, 59, 59, 999);
    }

    // Build where clause
    const where: Record<string, unknown> = {
      checkInAt: { gte: from, lte: to },
    };
    if (employeeId) where.employeeId = employeeId;
    if (workLocation) where.workLocation = workLocation;
    if (status) where.status = status;

    // Employee-level filters
    const employeeWhere: Record<string, unknown> = {};
    if (role) employeeWhere.user = { role };
    if (department) employeeWhere.department = department;

    if (Object.keys(employeeWhere).length > 0) {
      where.employee = employeeWhere;
    }

    const sessions = await prisma.employeeWorkSession.findMany({
      where,
      include: {
        employee: {
          include: {
            user: { select: { name: true, email: true, role: true } },
          },
        },
      },
      orderBy: [{ employeeId: "asc" }, { checkInAt: "asc" }],
    });

    // Parse lateAfter threshold
    let lateThresholdMinutes = 0;
    if (lateAfter) {
      const [h, m] = lateAfter.split(":").map(Number);
      lateThresholdMinutes = (h || 0) * 60 + (m || 0);
    }

    // Aggregate per employee
    const employeeMap = new Map<string, {
      employeeId: string;
      name: string;
      email: string;
      role: string;
      department: string | null;
      days: {
        date: string;
        checkIn: string;
        checkOut: string | null;
        workLocation: string;
        status: string;
        totalMinutes: number;
        activeMinutes: number;
        idleMinutes: number;
        breakMinutes: number;
        summary: string | null;
        isLate: boolean;
      }[];
      totalMinutes: number;
      activeMinutes: number;
      idleMinutes: number;
      breakMinutes: number;
      daysWorked: number;
      lateDays: number;
      avgDailyHours: number;
      autoCheckouts: number;
    }>();

    for (const s of sessions) {
      const key = s.employeeId;
      if (!employeeMap.has(key)) {
        employeeMap.set(key, {
          employeeId: s.employeeId,
          name: s.employee.user.name || "Unknown",
          email: s.employee.user.email || "",
          role: s.employee.user.role || "",
          department: (s.employee as any).department || null,
          days: [],
          totalMinutes: 0,
          activeMinutes: 0,
          idleMinutes: 0,
          breakMinutes: 0,
          daysWorked: 0,
          lateDays: 0,
          avgDailyHours: 0,
          autoCheckouts: 0,
        });
      }
      const emp = employeeMap.get(key)!;

      // Check if late
      let isLate = false;
      if (lateAfter) {
        const checkInDate = new Date(s.checkInAt);
        const checkInMinutes = checkInDate.getHours() * 60 + checkInDate.getMinutes();
        // Adjust for IST (+5:30)
        const istMinutes = (checkInMinutes + 330) % 1440;
        isLate = istMinutes > lateThresholdMinutes;
      }

      const isAutoCheckout = (s.checkOutSummary || "").includes("[Auto-checkout]");

      emp.days.push({
        date: s.checkInAt.toISOString().split("T")[0],
        checkIn: s.checkInAt.toISOString(),
        checkOut: s.checkOutAt?.toISOString() || null,
        workLocation: s.workLocation,
        status: s.status,
        totalMinutes: s.totalMinutes || 0,
        activeMinutes: s.activeMinutes || 0,
        idleMinutes: s.idleMinutes || 0,
        breakMinutes: s.breakMinutes || 0,
        summary: s.checkOutSummary,
        isLate,
      });
      emp.totalMinutes += s.totalMinutes || 0;
      emp.activeMinutes += s.activeMinutes || 0;
      emp.idleMinutes += s.idleMinutes || 0;
      emp.breakMinutes += s.breakMinutes || 0;
      emp.daysWorked++;
      if (isLate) emp.lateDays++;
      if (isAutoCheckout) emp.autoCheckouts++;
    }

    // Calculate averages and apply hour filters
    let employees = Array.from(employeeMap.values());
    for (const emp of employees) {
      emp.avgDailyHours = emp.daysWorked > 0 ? Math.round((emp.totalMinutes / emp.daysWorked / 60) * 10) / 10 : 0;
    }

    // Apply min/max hour filters
    if (minHours) {
      const min = parseFloat(minHours) * 60;
      employees = employees.filter((e) => e.totalMinutes >= min);
    }
    if (maxHours) {
      const max = parseFloat(maxHours) * 60;
      employees = employees.filter((e) => e.totalMinutes <= max);
    }

    // Sort
    const dir = sortOrder === "desc" ? -1 : 1;
    employees.sort((a, b) => {
      switch (sortBy) {
        case "totalHours": return (a.totalMinutes - b.totalMinutes) * dir;
        case "activeHours": return (a.activeMinutes - b.activeMinutes) * dir;
        case "idleHours": return (a.idleMinutes - b.idleMinutes) * dir;
        case "daysWorked": return (a.daysWorked - b.daysWorked) * dir;
        case "lateDays": return (a.lateDays - b.lateDays) * dir;
        default: return a.name.localeCompare(b.name) * dir;
      }
    });

    if (format === "csv") {
      const rows: string[] = [
        "Employee Name,Email,Role,Department,Date,Check In (IST),Check Out (IST),Work Location,Status,Total Hours,Active Hours,Idle Hours,Break Hours,Late,Auto-Checkout,Summary",
      ];

      for (const emp of employees) {
        for (const day of emp.days) {
          const checkIn = new Date(day.checkIn).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });
          const checkOut = day.checkOut
            ? new Date(day.checkOut).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
            : "—";
          const totalH = (day.totalMinutes / 60).toFixed(2);
          const activeH = (day.activeMinutes / 60).toFixed(2);
          const idleH = (day.idleMinutes / 60).toFixed(2);
          const breakH = (day.breakMinutes / 60).toFixed(2);
          const summary = (day.summary || "").replace(/"/g, '""').replace(/\n/g, " ");
          const isAuto = (day.summary || "").includes("[Auto-checkout]") ? "Yes" : "No";

          rows.push(
            `"${emp.name}","${emp.email}","${emp.role}","${emp.department || ""}","${day.date}","${checkIn}","${checkOut}","${day.workLocation}","${day.status}","${totalH}","${activeH}","${idleH}","${breakH}","${day.isLate ? "Yes" : "No"}","${isAuto}","${summary}"`
          );
        }
      }

      const csv = rows.join("\n");
      const fileName = `attendance_${period}_${from.toISOString().split("T")[0]}_to_${to.toISOString().split("T")[0]}.csv`;

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${fileName}"`,
        },
      });
    }

    // Also fetch available departments and roles for filter dropdowns
    const allEmployees = await prisma.employee.findMany({
      select: {
        id: true,
        department: true,
        user: { select: { name: true, role: true } },
      },
    });

    const departments = [...new Set(allEmployees.map((e) => e.department).filter(Boolean))] as string[];
    const roles = [...new Set(allEmployees.map((e) => e.user.role).filter(Boolean))] as string[];
    const employeeList = allEmployees.map((e) => ({ id: e.id, name: e.user.name || "Unknown" })).sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      period,
      from: from.toISOString(),
      to: to.toISOString(),
      employees,
      totalSessions: sessions.length,
      filters: { departments, roles, employeeList },
    });
  } catch (error) {
    console.error("Attendance report error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
