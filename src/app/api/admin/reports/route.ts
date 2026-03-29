import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// ─── Helper: parse date range from query ───
function getDateRange(range: string): { from: Date | null; to: Date } {
  const to = new Date();
  to.setHours(23, 59, 59, 999);

  switch (range) {
    case "this_month": {
      const from = new Date(to.getFullYear(), to.getMonth(), 1);
      return { from, to };
    }
    case "last_3_months": {
      const from = new Date();
      from.setMonth(from.getMonth() - 3);
      from.setDate(1);
      from.setHours(0, 0, 0, 0);
      return { from, to };
    }
    case "this_year": {
      const from = new Date(to.getFullYear(), 0, 1);
      return { from, to };
    }
    case "all":
    default:
      return { from: null, to };
  }
}

function dateFilter(range: string) {
  const { from } = getDateRange(range);
  if (!from) return {};
  return { gte: from };
}

// ─── Lead Reports ───
async function getLeadReports(range: string) {
  const createdFilter = dateFilter(range);
  const where = createdFilter.gte ? { createdAt: createdFilter } : {};

  const [
    totalLeads,
    leadsByStatus,
    leadsBySource,
    leadsByCounsellor,
    enrolledCount,
    leadsByMonth,
  ] = await Promise.all([
    prisma.lead.count({ where }),
    prisma.lead.groupBy({ by: ["status"], _count: true, where }),
    prisma.lead.groupBy({ by: ["source"], _count: true, where, orderBy: { _count: { source: "desc" } } }),
    prisma.lead.findMany({
      where: { ...where, assignedToId: { not: null } },
      select: {
        assignedTo: { select: { user: { select: { name: true } } } },
      },
    }),
    prisma.lead.count({ where: { ...where, status: "ENROLLED" } }),
    // Last 12 months
    prisma.$queryRaw<{ month: string; count: bigint }[]>`
      SELECT TO_CHAR("createdAt", 'YYYY-MM') as month, COUNT(*)::bigint as count
      FROM "Lead"
      WHERE "createdAt" >= NOW() - INTERVAL '12 months'
      GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
      ORDER BY month ASC
    `,
  ]);

  // Aggregate counsellor counts
  const counsellorMap: Record<string, number> = {};
  leadsByCounsellor.forEach((l) => {
    const name = l.assignedTo?.user?.name || "Unassigned";
    counsellorMap[name] = (counsellorMap[name] || 0) + 1;
  });

  const conversionRate = totalLeads > 0 ? ((enrolledCount / totalLeads) * 100).toFixed(1) : "0";

  return {
    totalLeads,
    leadsByStatus: leadsByStatus.map((s) => ({ status: s.status, count: s._count })),
    leadsBySource: leadsBySource.map((s) => ({ source: s.source, count: s._count })),
    leadsByMonth: leadsByMonth.map((m) => ({ month: m.month, count: Number(m.count) })),
    leadsByCounsellor: Object.entries(counsellorMap).map(([name, count]) => ({ name, count })),
    conversionRate: parseFloat(conversionRate),
    enrolledCount,
  };
}

// ─── Student Reports ───
async function getStudentReports(range: string) {
  const createdFilter = dateFilter(range);
  const where = createdFilter.gte ? { createdAt: createdFilter } : {};

  const [
    totalStudents,
    studentsByStatus,
    studentsByCourse,
    studentsByBatch,
    completedStudents,
    paymentBreakdown,
  ] = await Promise.all([
    prisma.student.count({ where }),
    prisma.student.groupBy({ by: ["status"], _count: true, where }),
    prisma.student.groupBy({ by: ["course"], _count: true, where }),
    prisma.student.findMany({
      where: { ...where, batchId: { not: null } },
      select: {
        batch: { select: { name: true } },
      },
    }),
    prisma.student.count({ where: { ...where, status: "COMPLETED" } }),
    prisma.student.groupBy({ by: ["paymentStatus"], _count: true, where }),
  ]);

  // Aggregate batch counts
  const batchMap: Record<string, number> = {};
  studentsByBatch.forEach((s) => {
    const name = s.batch?.name || "Unassigned";
    batchMap[name] = (batchMap[name] || 0) + 1;
  });

  const completionRate = totalStudents > 0 ? ((completedStudents / totalStudents) * 100).toFixed(1) : "0";

  return {
    totalStudents,
    studentsByStatus: studentsByStatus.map((s) => ({ status: s.status, count: s._count })),
    studentsByCourse: studentsByCourse.map((s) => ({ course: s.course, count: s._count })),
    studentsByBatch: Object.entries(batchMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    completionRate: parseFloat(completionRate),
    completedStudents,
    paymentBreakdown: paymentBreakdown.map((p) => ({ status: p.paymentStatus, count: p._count })),
  };
}

// ─── Sales Reports ───
async function getSalesReports(range: string) {
  const createdFilter = dateFilter(range);
  const where = createdFilter.gte
    ? { createdAt: createdFilter, status: "completed" }
    : { status: "completed" };

  const [
    payments,
    totalRevenue,
    paymentsByStatus,
    revenueByMonth,
    topSalesPeople,
  ] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.aggregate({ _sum: { amount: true }, where }),
    prisma.payment.groupBy({
      by: ["status"],
      _count: true,
      where: createdFilter.gte ? { createdAt: createdFilter } : {},
    }),
    prisma.$queryRaw<{ month: string; revenue: bigint }[]>`
      SELECT TO_CHAR("createdAt", 'YYYY-MM') as month, SUM(amount)::bigint as revenue
      FROM "Payment"
      WHERE status = 'completed' AND "createdAt" >= NOW() - INTERVAL '12 months'
      GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
      ORDER BY month ASC
    `,
    // Top performers based on leads converted
    prisma.lead.findMany({
      where: { status: "ENROLLED", assignedToId: { not: null } },
      select: {
        assignedTo: {
          select: {
            id: true,
            user: { select: { name: true } },
          },
        },
      },
    }),
  ]);

  // Aggregate sales people
  const salesMap: Record<string, { name: string; count: number }> = {};
  topSalesPeople.forEach((l) => {
    const id = l.assignedTo?.id || "unknown";
    const name = l.assignedTo?.user?.name || "Unknown";
    if (!salesMap[id]) salesMap[id] = { name, count: 0 };
    salesMap[id].count += 1;
  });

  const totalRevenueAmount = totalRevenue._sum.amount || 0;
  const avgDealSize = payments > 0 ? Math.round(totalRevenueAmount / payments) : 0;

  return {
    totalRevenue: totalRevenueAmount, // in pence
    totalPayments: payments,
    avgDealSize, // in pence
    paymentsByStatus: paymentsByStatus.map((p) => ({ status: p.status, count: p._count })),
    revenueByMonth: revenueByMonth.map((m) => ({ month: m.month, revenue: Number(m.revenue) })),
    topSalesPeople: Object.values(salesMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
  };
}

// ─── Batch Reports ───
async function getBatchReports(range: string) {
  const createdFilter = dateFilter(range);
  const where = createdFilter.gte ? { createdAt: createdFilter } : {};

  const [
    batchesByStatus,
    batchesByCourse,
    upcomingBatches,
    allBatches,
    trainerWorkload,
  ] = await Promise.all([
    prisma.batch.groupBy({ by: ["status"], _count: true, where }),
    prisma.batch.groupBy({ by: ["course"], _count: true, where }),
    prisma.batch.count({ where: { ...where, status: "UPCOMING" } }),
    prisma.batch.findMany({
      where,
      select: {
        id: true,
        status: true,
        _count: { select: { students: true } },
      },
    }),
    prisma.batch.findMany({
      where: { ...where, instructorId: { not: null } },
      select: {
        instructor: { select: { user: { select: { name: true } } } },
      },
    }),
  ]);

  // Compute average batch size
  const totalStudentsInBatches = allBatches.reduce((sum, b) => sum + b._count.students, 0);
  const totalBatches = allBatches.length;
  const avgBatchSize = totalBatches > 0 ? (totalStudentsInBatches / totalBatches).toFixed(1) : "0";

  const completedBatches = allBatches.filter((b) => b.status === "COMPLETED").length;
  const batchCompletionRate = totalBatches > 0
    ? ((completedBatches / totalBatches) * 100).toFixed(1)
    : "0";

  // Trainer workload
  const trainerMap: Record<string, number> = {};
  trainerWorkload.forEach((b) => {
    const name = b.instructor?.user?.name || "Unassigned";
    trainerMap[name] = (trainerMap[name] || 0) + 1;
  });

  return {
    totalBatches,
    batchesByStatus: batchesByStatus.map((s) => ({ status: s.status, count: s._count })),
    batchesByCourse: batchesByCourse.map((s) => ({ course: s.course, count: s._count })),
    upcomingBatches,
    avgBatchSize: parseFloat(avgBatchSize),
    batchCompletionRate: parseFloat(batchCompletionRate),
    completedBatches,
    trainerWorkload: Object.entries(trainerMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
  };
}

// ─── Attendance Reports ───
async function getAttendanceReports() {
  const [
    totalRecords,
    presentRecords,
    attendanceByBatch,
    studentAttendance,
  ] = await Promise.all([
    prisma.batchAttendance.count(),
    prisma.batchAttendance.count({ where: { status: "PRESENT" } }),
    prisma.$queryRaw<{ batch_name: string; total: bigint; present: bigint }[]>`
      SELECT b.name as batch_name,
             COUNT(ba.id)::bigint as total,
             COUNT(CASE WHEN ba.status = 'PRESENT' THEN 1 END)::bigint as present
      FROM "BatchAttendance" ba
      JOIN "BatchDay" bd ON ba."batchDayId" = bd.id
      JOIN "Batch" b ON bd."batchId" = b.id
      GROUP BY b.name
      ORDER BY b.name
    `,
    prisma.$queryRaw<{ student_id: string; student_name: string; total: bigint; present: bigint }[]>`
      SELECT s.id as student_id, u.name as student_name,
             COUNT(ba.id)::bigint as total,
             COUNT(CASE WHEN ba.status = 'PRESENT' THEN 1 END)::bigint as present
      FROM "BatchAttendance" ba
      JOIN "Student" s ON ba."studentId" = s.id
      JOIN "User" u ON s."userId" = u.id
      GROUP BY s.id, u.name
      HAVING COUNT(ba.id) > 0
      ORDER BY u.name
    `,
  ]);

  const overallRate = totalRecords > 0
    ? ((presentRecords / totalRecords) * 100).toFixed(1)
    : "0";

  const batchAttendanceData = attendanceByBatch.map((b) => ({
    batchName: b.batch_name,
    total: Number(b.total),
    present: Number(b.present),
    rate: Number(b.total) > 0
      ? parseFloat(((Number(b.present) / Number(b.total)) * 100).toFixed(1))
      : 0,
  }));

  const studentData = studentAttendance.map((s) => ({
    studentId: s.student_id,
    studentName: s.student_name,
    total: Number(s.total),
    present: Number(s.present),
    rate: Number(s.total) > 0
      ? parseFloat(((Number(s.present) / Number(s.total)) * 100).toFixed(1))
      : 0,
  }));

  const lowAttendance = studentData.filter((s) => s.rate < 80 && s.total >= 1);
  const perfectAttendance = studentData.filter((s) => s.rate === 100 && s.total >= 1);

  return {
    overallRate: parseFloat(overallRate),
    totalRecords,
    presentRecords,
    attendanceByBatch: batchAttendanceData,
    lowAttendanceStudents: lowAttendance.sort((a, b) => a.rate - b.rate),
    perfectAttendanceStudents: perfectAttendance,
  };
}

// ─── Employee Reports ───
async function getEmployeeReports(range: string) {
  const createdFilter = dateFilter(range);
  const sessionWhere = createdFilter.gte ? { date: createdFilter } : {};

  // Current month boundaries for "this month" stats
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const [
    totalEmployees,
    allSessions,
    thisMonthSessions,
    breakData,
  ] = await Promise.all([
    prisma.employee.count(),
    // All sessions in the selected range with employee info
    prisma.employeeWorkSession.findMany({
      where: sessionWhere,
      select: {
        id: true,
        employeeId: true,
        date: true,
        checkInAt: true,
        checkOutAt: true,
        workLocation: true,
        totalMinutes: true,
        activeMinutes: true,
        idleMinutes: true,
        breakMinutes: true,
        status: true,
        employee: {
          select: {
            id: true,
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { date: "desc" },
    }),
    // This month check-ins
    prisma.employeeWorkSession.count({
      where: { date: { gte: monthStart, lte: monthEnd } },
    }),
    // Break data for sessions in range
    prisma.employeeBreak.findMany({
      where: {
        session: sessionWhere,
      },
      select: {
        sessionId: true,
        startedAt: true,
        endedAt: true,
      },
    }),
  ]);

  // ── Compute average daily work hours ──
  const sessionsWithMinutes = allSessions.filter((s) => s.totalMinutes != null && s.totalMinutes > 0);
  const totalMinutesAll = sessionsWithMinutes.reduce((sum, s) => sum + (s.totalMinutes || 0), 0);
  const avgDailyHours = sessionsWithMinutes.length > 0
    ? (totalMinutesAll / sessionsWithMinutes.length / 60).toFixed(1)
    : "0";

  // ── Most active employees (ranked by total hours) ──
  const employeeHoursMap: Record<string, { name: string; totalMinutes: number; sessions: number }> = {};
  allSessions.forEach((s) => {
    const empId = s.employeeId;
    const name = s.employee?.user?.name || "Unknown";
    if (!employeeHoursMap[empId]) {
      employeeHoursMap[empId] = { name, totalMinutes: 0, sessions: 0 };
    }
    employeeHoursMap[empId].totalMinutes += s.totalMinutes || 0;
    employeeHoursMap[empId].sessions += 1;
  });

  const mostActiveEmployees = Object.values(employeeHoursMap)
    .map((e) => ({
      name: e.name,
      totalHours: parseFloat((e.totalMinutes / 60).toFixed(1)),
      sessions: e.sessions,
    }))
    .sort((a, b) => b.totalHours - a.totalHours)
    .slice(0, 10);

  // ── Employee attendance table ──
  const breaksBySession: Record<string, { count: number; totalMinutes: number }> = {};
  breakData.forEach((b) => {
    if (!breaksBySession[b.sessionId]) {
      breaksBySession[b.sessionId] = { count: 0, totalMinutes: 0 };
    }
    breaksBySession[b.sessionId].count += 1;
    if (b.startedAt && b.endedAt) {
      const mins = (new Date(b.endedAt).getTime() - new Date(b.startedAt).getTime()) / 60000;
      breaksBySession[b.sessionId].totalMinutes += mins;
    }
  });

  // Aggregate per employee
  const empStatsMap: Record<string, {
    name: string;
    daysWorked: number;
    totalMinutes: number;
    totalBreaks: number;
    totalBreakMinutes: number;
    totalIdleMinutes: number;
    onTimeCount: number;
  }> = {};

  allSessions.forEach((s) => {
    const empId = s.employeeId;
    const name = s.employee?.user?.name || "Unknown";
    if (!empStatsMap[empId]) {
      empStatsMap[empId] = { name, daysWorked: 0, totalMinutes: 0, totalBreaks: 0, totalBreakMinutes: 0, totalIdleMinutes: 0, onTimeCount: 0 };
    }
    empStatsMap[empId].daysWorked += 1;
    empStatsMap[empId].totalMinutes += s.totalMinutes || 0;
    empStatsMap[empId].totalIdleMinutes += s.idleMinutes || 0;

    const sessionBreaks = breaksBySession[s.id];
    if (sessionBreaks) {
      empStatsMap[empId].totalBreaks += sessionBreaks.count;
      empStatsMap[empId].totalBreakMinutes += sessionBreaks.totalMinutes;
    }

    // On-time: checked in before 9:30 AM
    const checkInHour = new Date(s.checkInAt).getHours();
    const checkInMin = new Date(s.checkInAt).getMinutes();
    if (checkInHour < 9 || (checkInHour === 9 && checkInMin <= 30)) {
      empStatsMap[empId].onTimeCount += 1;
    }
  });

  const employeeAttendance = Object.values(empStatsMap)
    .map((e) => ({
      name: e.name,
      daysWorked: e.daysWorked,
      avgHoursPerDay: e.daysWorked > 0 ? parseFloat((e.totalMinutes / e.daysWorked / 60).toFixed(1)) : 0,
      totalBreaks: e.totalBreaks,
      avgBreakMinutes: e.totalBreaks > 0 ? parseFloat((e.totalBreakMinutes / e.totalBreaks).toFixed(0)) : 0,
      idleMinutes: e.totalIdleMinutes,
      onTimeRate: e.daysWorked > 0 ? parseFloat(((e.onTimeCount / e.daysWorked) * 100).toFixed(0)) : 0,
    }))
    .sort((a, b) => b.daysWorked - a.daysWorked);

  // ── Work location breakdown ──
  const locationMap: Record<string, number> = {};
  allSessions.forEach((s) => {
    const loc = s.workLocation || "HOME";
    locationMap[loc] = (locationMap[loc] || 0) + 1;
  });
  const workLocationBreakdown = Object.entries(locationMap)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count);

  // ── Daily activity summary (last 30 days) ──
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const recentSessions = allSessions.filter(
    (s) => new Date(s.date) >= thirtyDaysAgo
  );

  const dailyMap: Record<string, {
    employees: Set<string>;
    startTimes: number[];
    endTimes: number[];
    totalMinutes: number;
  }> = {};

  recentSessions.forEach((s) => {
    const dateKey = new Date(s.date).toISOString().split("T")[0];
    if (!dailyMap[dateKey]) {
      dailyMap[dateKey] = { employees: new Set(), startTimes: [], endTimes: [], totalMinutes: 0 };
    }
    dailyMap[dateKey].employees.add(s.employeeId);
    dailyMap[dateKey].totalMinutes += s.totalMinutes || 0;

    const checkIn = new Date(s.checkInAt);
    dailyMap[dateKey].startTimes.push(checkIn.getHours() * 60 + checkIn.getMinutes());

    if (s.checkOutAt) {
      const checkOut = new Date(s.checkOutAt);
      dailyMap[dateKey].endTimes.push(checkOut.getHours() * 60 + checkOut.getMinutes());
    }
  });

  const formatTimeFromMinutes = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  const dailyActivity = Object.entries(dailyMap)
    .map(([date, d]) => {
      const avgStart = d.startTimes.length > 0
        ? d.startTimes.reduce((a, b) => a + b, 0) / d.startTimes.length
        : 0;
      const avgEnd = d.endTimes.length > 0
        ? d.endTimes.reduce((a, b) => a + b, 0) / d.endTimes.length
        : 0;

      return {
        date,
        employeesActive: d.employees.size,
        avgStartTime: formatTimeFromMinutes(avgStart),
        avgEndTime: d.endTimes.length > 0 ? formatTimeFromMinutes(avgEnd) : "--:--",
        totalHours: parseFloat((d.totalMinutes / 60).toFixed(1)),
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  return {
    totalEmployees,
    avgDailyHours: parseFloat(avgDailyHours),
    checkInsThisMonth: thisMonthSessions,
    mostActiveEmployees,
    employeeAttendance,
    workLocationBreakdown,
    dailyActivity,
  };
}

// ─── GET handler ───
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    if (!role || !["SUPER_ADMIN", "ADMIN"].includes(role)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = request.nextUrl;
    const type = searchParams.get("type") || "leads";
    const range = searchParams.get("range") || "all";

    switch (type) {
      case "leads":
        return Response.json(await getLeadReports(range));
      case "students":
        return Response.json(await getStudentReports(range));
      case "sales":
        return Response.json(await getSalesReports(range));
      case "batches":
        return Response.json(await getBatchReports(range));
      case "attendance":
        return Response.json(await getAttendanceReports());
      case "employee":
        return Response.json(await getEmployeeReports(range));
      default:
        return Response.json({ error: "Invalid report type" }, { status: 400 });
    }
  } catch (error) {
    console.error("Reports API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
