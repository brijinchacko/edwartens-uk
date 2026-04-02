import { prisma } from "./prisma";

// Configurable KPI weights and thresholds
export const KPI_CONFIG = {
  // Weights for productivity score (must sum to 1.0)
  weights: {
    activeTimeRatio: 0.30,
    activityVolume: 0.25,
    leadConversion: 0.20,
    punctuality: 0.15,
    responseTime: 0.10,
  },
  // Thresholds
  onTimeThreshold: "09:30", // Check-in before this = on time
  offTimeThreshold: "17:00", // Check-out after this = full day
  maxBreakMinutes: 60,
  maxBreakCount: 4,
  minDailyActivities: 10, // Minimum calls+emails+notes per day
  responseTimeExcellent: 30, // minutes
  responseTimePoor: 240, // minutes (4 hours)
  // Daily activity goals (defaults, can be overridden by PerformanceGoal)
  defaultGoals: {
    CALLS_PER_DAY: 15,
    EMAILS_PER_DAY: 10,
    NOTES_PER_DAY: 20,
    ACTIVE_HOURS: 7,
  },
};

// Helper to get start/end of a date in UTC
function dayStart(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function dayEnd(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

// Parse HH:MM threshold into hours/minutes
function parseTimeThreshold(time: string): { hours: number; minutes: number } {
  const [hours, minutes] = time.split(":").map(Number);
  return { hours, minutes };
}

/**
 * Calculate productivity score (0-100) from KPI data
 */
export function calculateProductivityScore(data: {
  activeMinutes: number;
  breakMinutes: number;
  idleMinutes: number;
  callsMade: number;
  emailsSent: number;
  notesAdded: number;
  leadsContacted: number;
  leadsConverted: number;
  lateArrival: boolean;
  earlyDeparture: boolean;
  excessBreaks: boolean;
  responseTimeAvg: number;
  checkInTime?: Date | null;
  dailyGoalTotal?: number;
}): number {
  const w = KPI_CONFIG.weights;

  // 1. Active time ratio (30%) - activeMinutes / total time, capped at 1.0
  const totalTime = data.activeMinutes + data.idleMinutes + data.breakMinutes;
  const activeRatio = totalTime > 0 ? Math.min(data.activeMinutes / totalTime, 1.0) : 0;
  const activeScore = activeRatio * 100;

  // 2. Activity volume (25%) - (calls + emails + notes) / dailyGoal, capped at 1.0
  const totalActivities = data.callsMade + data.emailsSent + data.notesAdded;
  const dailyGoal = data.dailyGoalTotal ||
    (KPI_CONFIG.defaultGoals.CALLS_PER_DAY + KPI_CONFIG.defaultGoals.EMAILS_PER_DAY + KPI_CONFIG.defaultGoals.NOTES_PER_DAY);
  const volumeRatio = Math.min(totalActivities / dailyGoal, 1.0);
  const volumeScore = volumeRatio * 100;

  // 3. Lead conversion (20%) - conversions / max(contacted, 1), capped at 1.0
  const conversionRatio = Math.min(data.leadsConverted / Math.max(data.leadsContacted, 1), 1.0);
  const conversionScore = conversionRatio * 100;

  // 4. Punctuality (15%) - 1.0 if on-time, 0.5 if <15min late, 0.0 if >15min late
  let punctualityScore = 100;
  if (data.lateArrival && data.checkInTime) {
    const threshold = parseTimeThreshold(KPI_CONFIG.onTimeThreshold);
    const checkInDate = new Date(data.checkInTime);
    const thresholdDate = new Date(checkInDate);
    thresholdDate.setUTCHours(threshold.hours, threshold.minutes, 0, 0);
    const lateMinutes = (checkInDate.getTime() - thresholdDate.getTime()) / 60000;
    if (lateMinutes <= 15) {
      punctualityScore = 50;
    } else {
      punctualityScore = 0;
    }
  }
  // Deduct 25% for excess breaks
  if (data.excessBreaks) {
    punctualityScore = Math.max(punctualityScore - 25, 0);
  }

  // 5. Response time (10%) - 1.0 if avg < 30min, linear decay to 0.0 at 240min
  let responseScore = 100;
  if (data.responseTimeAvg > 0) {
    if (data.responseTimeAvg <= KPI_CONFIG.responseTimeExcellent) {
      responseScore = 100;
    } else if (data.responseTimeAvg >= KPI_CONFIG.responseTimePoor) {
      responseScore = 0;
    } else {
      // Linear decay from 100 to 0 between excellent and poor
      const range = KPI_CONFIG.responseTimePoor - KPI_CONFIG.responseTimeExcellent;
      const elapsed = data.responseTimeAvg - KPI_CONFIG.responseTimeExcellent;
      responseScore = Math.max(0, 100 * (1 - elapsed / range));
    }
  }

  // Weighted total
  const totalScore =
    activeScore * w.activeTimeRatio +
    volumeScore * w.activityVolume +
    conversionScore * w.leadConversion +
    punctualityScore * w.punctuality +
    responseScore * w.responseTime;

  return Math.round(totalScore * 100) / 100;
}

/**
 * Aggregate daily KPI for a given employee and date.
 * Queries EmployeeWorkSession, LeadNote, AuditLog, Lead and upserts into EmployeeKPI.
 */
export async function aggregateDailyKPI(employeeId: string, date: Date): Promise<void> {
  const start = dayStart(date);
  const end = dayEnd(date);

  // 1. Get the employee with user info
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: { user: { select: { id: true, name: true } } },
  });
  if (!employee) return;

  // 2. From EmployeeWorkSession: activeMinutes, breakMinutes, idleMinutes, checkInTime, checkOutTime
  const workSessions = await prisma.employeeWorkSession.findMany({
    where: {
      employeeId,
      date: { gte: start, lte: end },
    },
    include: { breaks: true },
    orderBy: { checkInAt: "asc" },
  });

  let activeMinutes = 0;
  let breakMinutes = 0;
  let idleMinutes = 0;
  let checkInTime: Date | null = null;
  let checkOutTime: Date | null = null;
  let totalBreakCount = 0;

  for (const ws of workSessions) {
    activeMinutes += ws.activeMinutes || 0;
    breakMinutes += ws.breakMinutes || 0;
    idleMinutes += ws.idleMinutes || 0;
    totalBreakCount += ws.breaks.length;

    if (!checkInTime || ws.checkInAt < checkInTime) {
      checkInTime = ws.checkInAt;
    }
    if (ws.checkOutAt && (!checkOutTime || ws.checkOutAt > checkOutTime)) {
      checkOutTime = ws.checkOutAt;
    }
  }

  // 3. From LeadNote (where createdBy = employee name): count notes, count calls
  const leadNotes = await prisma.leadNote.findMany({
    where: {
      createdBy: employee.user.name,
      createdAt: { gte: start, lte: end },
    },
    select: { content: true },
  });

  const notesAdded = leadNotes.length;
  const callsMade = leadNotes.filter(
    (n) => n.content.includes("Call") || n.content.includes("📞")
  ).length;

  // 4. From AuditLog (where userId = employee's userId): count emails sent, lead status changes
  const auditLogs = await prisma.auditLog.findMany({
    where: {
      userId: employee.userId,
      createdAt: { gte: start, lte: end },
    },
    select: { action: true, entity: true, details: true, entityId: true },
  });

  const emailsSent = auditLogs.filter(
    (log) => log.action === "SEND_EMAIL" || log.action.toLowerCase().includes("email")
  ).length;

  // Count leads contacted (status changes or notes)
  const leadStatusChanges = auditLogs.filter(
    (log) => log.entity === "lead" && (log.action === "UPDATE" || log.action === "STATUS_CHANGE")
  );
  const contactedLeadIds = new Set(leadStatusChanges.map((l) => l.entityId).filter(Boolean));
  const leadsContacted = contactedLeadIds.size;

  // 5. From Lead: count leads that changed to ENROLLED attributed to this employee
  const leadsConverted = auditLogs.filter((log) => {
    if (log.entity !== "lead") return false;
    const details = log.details || "";
    return details.includes("ENROLLED");
  }).length;

  // Count leads created
  const leadsCreated = auditLogs.filter(
    (log) => log.entity === "lead" && log.action === "CREATE"
  ).length;

  // Count follow-ups done
  const followUpsDone = auditLogs.filter(
    (log) => log.entity === "lead" && log.action.toLowerCase().includes("follow")
  ).length;

  // 6. Calculate: lateArrival, earlyDeparture, excessBreaks
  const onTimeThreshold = parseTimeThreshold(KPI_CONFIG.onTimeThreshold);
  const offTimeThreshold = parseTimeThreshold(KPI_CONFIG.offTimeThreshold);

  let lateArrival = false;
  if (checkInTime) {
    const checkInHour = checkInTime.getUTCHours();
    const checkInMin = checkInTime.getUTCMinutes();
    if (
      checkInHour > onTimeThreshold.hours ||
      (checkInHour === onTimeThreshold.hours && checkInMin > onTimeThreshold.minutes)
    ) {
      lateArrival = true;
    }
  }

  let earlyDeparture = false;
  if (checkOutTime) {
    const checkOutHour = checkOutTime.getUTCHours();
    const checkOutMin = checkOutTime.getUTCMinutes();
    if (
      checkOutHour < offTimeThreshold.hours ||
      (checkOutHour === offTimeThreshold.hours && checkOutMin < offTimeThreshold.minutes)
    ) {
      earlyDeparture = true;
    }
  }

  const excessBreaks = breakMinutes > KPI_CONFIG.maxBreakMinutes || totalBreakCount > KPI_CONFIG.maxBreakCount;

  // 7. Calculate productivity score
  const productivityScore = calculateProductivityScore({
    activeMinutes,
    breakMinutes,
    idleMinutes,
    callsMade,
    emailsSent,
    notesAdded,
    leadsContacted,
    leadsConverted,
    lateArrival,
    earlyDeparture,
    excessBreaks,
    responseTimeAvg: 0, // Will be updated when we have response time tracking
    checkInTime,
  });

  // 8. Upsert into EmployeeKPI
  const dateOnly = dayStart(date);
  await prisma.employeeKPI.upsert({
    where: { employeeId_date: { employeeId, date: dateOnly } },
    create: {
      employeeId,
      date: dateOnly,
      callsMade,
      emailsSent,
      notesAdded,
      leadsContacted,
      leadsCreated,
      leadsConverted,
      followUpsDone,
      activeMinutes,
      breakMinutes,
      idleMinutes,
      checkInTime,
      checkOutTime,
      lateArrival,
      earlyDeparture,
      excessBreaks,
      productivityScore,
      responseTimeAvg: 0,
    },
    update: {
      callsMade,
      emailsSent,
      notesAdded,
      leadsContacted,
      leadsCreated,
      leadsConverted,
      followUpsDone,
      activeMinutes,
      breakMinutes,
      idleMinutes,
      checkInTime,
      checkOutTime,
      lateArrival,
      earlyDeparture,
      excessBreaks,
      productivityScore,
      responseTimeAvg: 0,
    },
  });
}

/**
 * Get leaderboard ranked by average productivity score for a given period.
 */
export async function getLeaderboard(
  period: "daily" | "weekly" | "monthly",
  limit = 10
): Promise<
  {
    rank: number;
    employeeId: string;
    name: string;
    avatar: string | null;
    avgScore: number;
    totalCalls: number;
    totalConversions: number;
    totalActiveHours: number;
  }[]
> {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case "daily":
      startDate = dayStart(now);
      break;
    case "weekly": {
      const weekStart = new Date(now);
      weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay());
      startDate = dayStart(weekStart);
      break;
    }
    case "monthly": {
      startDate = new Date(now.getUTCFullYear(), now.getUTCMonth(), 1);
      break;
    }
  }

  const kpiRows = await prisma.employeeKPI.findMany({
    where: { date: { gte: startDate } },
    include: {
      employee: {
        include: { user: { select: { name: true, avatar: true } } },
      },
    },
  });

  // Group by employee
  const grouped: Record<
    string,
    {
      employeeId: string;
      name: string;
      avatar: string | null;
      scores: number[];
      totalCalls: number;
      totalConversions: number;
      totalActiveMinutes: number;
    }
  > = {};

  for (const row of kpiRows) {
    if (!grouped[row.employeeId]) {
      grouped[row.employeeId] = {
        employeeId: row.employeeId,
        name: row.employee.user.name,
        avatar: row.employee.user.avatar,
        scores: [],
        totalCalls: 0,
        totalConversions: 0,
        totalActiveMinutes: 0,
      };
    }
    const g = grouped[row.employeeId];
    g.scores.push(row.productivityScore);
    g.totalCalls += row.callsMade;
    g.totalConversions += row.leadsConverted;
    g.totalActiveMinutes += row.activeMinutes;
  }

  // Rank by average score
  const ranked = Object.values(grouped)
    .map((g) => ({
      employeeId: g.employeeId,
      name: g.name,
      avatar: g.avatar,
      avgScore:
        g.scores.length > 0
          ? Math.round((g.scores.reduce((a, b) => a + b, 0) / g.scores.length) * 100) / 100
          : 0,
      totalCalls: g.totalCalls,
      totalConversions: g.totalConversions,
      totalActiveHours: Math.round((g.totalActiveMinutes / 60) * 100) / 100,
    }))
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, limit)
    .map((entry, idx) => ({ ...entry, rank: idx + 1 }));

  return ranked;
}

/**
 * Get KPI summary for an employee over a date range.
 * Returns daily rows, averages, trends, and goal progress.
 */
export async function getEmployeeKPISummary(
  employeeId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  dailyRows: Array<Record<string, unknown>>;
  averages: {
    avgScore: number;
    avgCalls: number;
    avgEmails: number;
    avgNotes: number;
    avgActiveMinutes: number;
    avgConversions: number;
  };
  trends: {
    scoreDirection: "up" | "down" | "stable";
    scoreChange: number;
  };
  goalProgress: Array<{
    metric: string;
    target: number;
    actual: number;
    progress: number;
  }>;
}> {
  const dailyRows = await prisma.employeeKPI.findMany({
    where: {
      employeeId,
      date: { gte: dayStart(startDate), lte: dayEnd(endDate) },
    },
    orderBy: { date: "asc" },
  });

  const count = dailyRows.length || 1;
  const totals = dailyRows.reduce(
    (acc, row) => ({
      score: acc.score + row.productivityScore,
      calls: acc.calls + row.callsMade,
      emails: acc.emails + row.emailsSent,
      notes: acc.notes + row.notesAdded,
      activeMinutes: acc.activeMinutes + row.activeMinutes,
      conversions: acc.conversions + row.leadsConverted,
    }),
    { score: 0, calls: 0, emails: 0, notes: 0, activeMinutes: 0, conversions: 0 }
  );

  const averages = {
    avgScore: Math.round((totals.score / count) * 100) / 100,
    avgCalls: Math.round((totals.calls / count) * 100) / 100,
    avgEmails: Math.round((totals.emails / count) * 100) / 100,
    avgNotes: Math.round((totals.notes / count) * 100) / 100,
    avgActiveMinutes: Math.round((totals.activeMinutes / count) * 100) / 100,
    avgConversions: Math.round((totals.conversions / count) * 100) / 100,
  };

  // Calculate trend by comparing first half vs second half
  let scoreDirection: "up" | "down" | "stable" = "stable";
  let scoreChange = 0;
  if (dailyRows.length >= 2) {
    const mid = Math.floor(dailyRows.length / 2);
    const firstHalf = dailyRows.slice(0, mid);
    const secondHalf = dailyRows.slice(mid);
    const firstAvg = firstHalf.reduce((a, r) => a + r.productivityScore, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, r) => a + r.productivityScore, 0) / secondHalf.length;
    scoreChange = Math.round((secondAvg - firstAvg) * 100) / 100;
    if (scoreChange > 2) scoreDirection = "up";
    else if (scoreChange < -2) scoreDirection = "down";
  }

  // Goal progress
  const goals = await prisma.performanceGoal.findMany({
    where: { employeeId, isActive: true },
  });

  const goalProgress = goals.map((goal) => {
    let actual = 0;
    switch (goal.metric) {
      case "CALLS_PER_DAY":
        actual = averages.avgCalls;
        break;
      case "EMAILS_PER_DAY":
        actual = averages.avgEmails;
        break;
      case "NOTES_PER_DAY":
        actual = averages.avgNotes;
        break;
      case "ACTIVE_HOURS":
        actual = averages.avgActiveMinutes / 60;
        break;
      case "CONVERSION_RATE":
        actual = averages.avgConversions;
        break;
      default:
        actual = 0;
    }
    const progress = goal.targetValue > 0 ? Math.min((actual / goal.targetValue) * 100, 100) : 0;
    return {
      metric: goal.metric,
      target: goal.targetValue,
      actual: Math.round(actual * 100) / 100,
      progress: Math.round(progress * 100) / 100,
    };
  });

  return {
    dailyRows: dailyRows as unknown as Array<Record<string, unknown>>,
    averages,
    trends: { scoreDirection, scoreChange },
    goalProgress,
  };
}
