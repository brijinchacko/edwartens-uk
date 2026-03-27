import { prisma } from "@/lib/prisma";

const MANDATORY_SALES = 5;
const INCENTIVE_PER_SALE = 107; // 5% of £2,140

export function calculateIncentive(totalSales: number): {
  mandatorySales: number;
  eligibleSales: number;
  totalEarned: number;
} {
  const eligibleSales = Math.max(0, totalSales - MANDATORY_SALES);
  const totalEarned = eligibleSales * INCENTIVE_PER_SALE;
  return { mandatorySales: MANDATORY_SALES, eligibleSales, totalEarned };
}

export async function getOrCreateMonthlyTarget(employeeId: string, month?: number, year?: number) {
  const now = new Date();
  const m = month || now.getMonth() + 1;
  const y = year || now.getFullYear();

  return prisma.salesTarget.upsert({
    where: { employeeId_month_year: { employeeId, month: m, year: y } },
    update: {},
    create: {
      employeeId,
      month: m,
      year: y,
      salesTarget: 15,
      leadTarget: 50,
    },
  });
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

  // Update sales target
  const target = await getOrCreateMonthlyTarget(employeeId, month, year);
  await prisma.salesTarget.update({
    where: { id: target.id },
    data: { salesAchieved: { increment: 1 } },
  });

  // Update incentive
  const incentive = await getOrCreateMonthlyIncentive(employeeId, month, year);
  const newTotal = incentive.totalSales + 1;
  const { totalEarned } = calculateIncentive(newTotal);

  await prisma.salesIncentive.update({
    where: { id: incentive.id },
    data: {
      totalSales: newTotal,
      totalEarned,
    },
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
