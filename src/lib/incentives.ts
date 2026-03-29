import { prisma } from "@/lib/prisma";

// Team targets
const TEAM_MONTHLY_TARGET = 20; // 5 candidates per batch × 4 batches
const HARD_TARGET = 12;         // 3 candidates per batch × 4 batches — MUST achieve
const MANDATORY_SALES = 5;      // Minimum before incentive kicks in
const INCENTIVE_PER_SALE = 107;  // £107 per sale above mandatory

export const TARGET_CONFIG = {
  teamMonthlyTarget: TEAM_MONTHLY_TARGET,
  hardTarget: HARD_TARGET,
  mandatorySales: MANDATORY_SALES,
  incentivePerSale: INCENTIVE_PER_SALE,
};

export function calculateIncentive(totalSales: number): {
  mandatorySales: number;
  eligibleSales: number;
  totalEarned: number;
} {
  const eligibleSales = Math.max(0, totalSales - MANDATORY_SALES);
  const totalEarned = eligibleSales * INCENTIVE_PER_SALE;
  return { mandatorySales: MANDATORY_SALES, eligibleSales, totalEarned };
}

/**
 * Calculate rollover from previous month if hard target wasn't met
 */
export async function calculateRollover(month: number, year: number): Promise<number> {
  // Get previous month
  let prevMonth = month - 1;
  let prevYear = year;
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear = year - 1;
  }

  // Get all team sales targets for previous month
  const prevTargets = await prisma.salesTarget.findMany({
    where: { month: prevMonth, year: prevYear },
  });

  if (prevTargets.length === 0) return 0;

  // Sum up team achieved vs hard target
  const totalAchieved = prevTargets.reduce((sum, t) => sum + t.salesAchieved, 0);
  const totalHardTarget = prevTargets.reduce((sum, t) => sum + t.hardTarget, 0);

  // If team didn't meet hard target, the shortfall rolls over
  const shortfall = Math.max(0, totalHardTarget - totalAchieved);
  return shortfall;
}

export async function getOrCreateMonthlyTarget(employeeId: string, month?: number, year?: number) {
  const now = new Date();
  const m = month || now.getMonth() + 1;
  const y = year || now.getFullYear();

  const target = await prisma.salesTarget.upsert({
    where: { employeeId_month_year: { employeeId, month: m, year: y } },
    update: {},
    create: {
      employeeId,
      month: m,
      year: y,
      salesTarget: TEAM_MONTHLY_TARGET,
      hardTarget: HARD_TARGET,
      leadTarget: 50,
    },
  });

  // Apply rollover if not already done
  if (!target.rolloverApplied) {
    const rollover = await calculateRollover(m, y);
    if (rollover > 0) {
      await prisma.salesTarget.update({
        where: { id: target.id },
        data: {
          rolloverFromPrev: rollover,
          rolloverApplied: true,
          // Hard target increases by rollover amount
          hardTarget: HARD_TARGET + rollover,
          salesTarget: TEAM_MONTHLY_TARGET + rollover,
        },
      });
      target.rolloverFromPrev = rollover;
      target.hardTarget = HARD_TARGET + rollover;
      target.salesTarget = TEAM_MONTHLY_TARGET + rollover;
    } else {
      await prisma.salesTarget.update({
        where: { id: target.id },
        data: { rolloverApplied: true },
      });
    }
    target.rolloverApplied = true;
  }

  return target;
}

export async function getOrCreateMonthlyIncentive(employeeId: string, month?: number, year?: number) {
  const now = new Date();
  const m = month || now.getMonth() + 1;
  const y = year || now.getFullYear();

  return prisma.salesIncentive.upsert({
    where: { employeeId_month_year: { employeeId, month: m, year: y } },
    update: {},
    create: {
      employeeId,
      month: m,
      year: y,
      totalSales: 0,
      mandatorySales: MANDATORY_SALES,
      incentivePerSale: INCENTIVE_PER_SALE,
      totalEarned: 0,
      distributed: 0,
    },
  });
}

export async function recordSale(employeeId: string) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const target = await getOrCreateMonthlyTarget(employeeId, month, year);
  await prisma.salesTarget.update({
    where: { id: target.id },
    data: { salesAchieved: { increment: 1 } },
  });

  const incentive = await getOrCreateMonthlyIncentive(employeeId, month, year);
  const newTotal = incentive.totalSales + 1;
  const { totalEarned } = calculateIncentive(newTotal);

  await prisma.salesIncentive.update({
    where: { id: incentive.id },
    data: { totalSales: newTotal, totalEarned },
  });
}

export async function recordOutboundLead(employeeId: string) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const target = await getOrCreateMonthlyTarget(employeeId, month, year);
  await prisma.salesTarget.update({
    where: { id: target.id },
    data: { leadsGenerated: { increment: 1 } },
  });
}

/**
 * Get team-wide target summary for the current month
 * Visible on dashboard for ALL roles
 */
export async function getTeamTargetSummary(month?: number, year?: number) {
  const now = new Date();
  const m = month || now.getMonth() + 1;
  const y = year || now.getFullYear();

  const targets = await prisma.salesTarget.findMany({
    where: { month: m, year: y },
    include: {
      employee: {
        include: { user: { select: { name: true, role: true } } },
      },
    },
  });

  const totalTarget = targets.length > 0 ? targets[0].salesTarget : TEAM_MONTHLY_TARGET;
  const hardTarget = targets.length > 0 ? targets[0].hardTarget : HARD_TARGET;
  const totalAchieved = targets.reduce((sum, t) => sum + t.salesAchieved, 0);
  const totalLeadsGenerated = targets.reduce((sum, t) => sum + t.leadsGenerated, 0);
  const rollover = targets.length > 0 ? targets[0].rolloverFromPrev : 0;

  const hardTargetMet = totalAchieved >= hardTarget;
  const fullTargetMet = totalAchieved >= totalTarget;
  const hardTargetShortfall = Math.max(0, hardTarget - totalAchieved);
  const daysInMonth = new Date(y, m, 0).getDate();
  const daysPassed = Math.min(now.getDate(), daysInMonth);
  const daysRemaining = daysInMonth - daysPassed;
  const dailyRunRate = daysPassed > 0 ? totalAchieved / daysPassed : 0;
  const projectedTotal = Math.round(dailyRunRate * daysInMonth);

  // Per-employee breakdown
  const employeeBreakdown = targets.map((t) => ({
    name: t.employee.user.name,
    role: t.employee.user.role,
    achieved: t.salesAchieved,
    leads: t.leadsGenerated,
  }));

  return {
    month: m,
    year: y,
    monthName: new Date(y, m - 1).toLocaleString("en-GB", { month: "long", year: "numeric" }),
    totalTarget,
    hardTarget,
    totalAchieved,
    totalLeadsGenerated,
    rollover,
    hardTargetMet,
    fullTargetMet,
    hardTargetShortfall,
    daysRemaining,
    dailyRunRate: Math.round(dailyRunRate * 10) / 10,
    projectedTotal,
    progressPercent: totalTarget > 0 ? Math.round((totalAchieved / totalTarget) * 100) : 0,
    hardTargetPercent: hardTarget > 0 ? Math.round((totalAchieved / hardTarget) * 100) : 0,
    employeeBreakdown,
  };
}
