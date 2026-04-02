import { prisma } from "./prisma";
import { notifyRole, notifyEmployee } from "./notify";
import { KPI_CONFIG } from "./kpi";

/**
 * Check daily alerts for an employee. Called at checkout or by batch job.
 * Returns the list of alert messages generated, or an empty array if none.
 */
export async function checkDailyAlerts(employeeId: string): Promise<string[]> {
  try {
    // Get employee info
    const emp = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { user: { select: { name: true } } },
    });
    if (!emp) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's KPI
    const kpi = await prisma.employeeKPI.findUnique({
      where: { employeeId_date: { employeeId, date: today } },
    });

    const alerts: string[] = [];

    // 1. Late arrival
    if (kpi?.lateArrival) {
      const checkInDisplay = kpi.checkInTime
        ? new Date(kpi.checkInTime).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Europe/London",
          })
        : "unknown";
      alerts.push(`Late arrival (checked in at ${checkInDisplay})`);
    }

    // 2. Excess breaks
    if (kpi?.excessBreaks) {
      alerts.push(`Excessive breaks (${kpi.breakMinutes} min total)`);
    }

    // 3. Low activity
    const totalActivity =
      (kpi?.callsMade || 0) + (kpi?.emailsSent || 0) + (kpi?.notesAdded || 0);
    if (kpi && totalActivity < KPI_CONFIG.minDailyActivities) {
      alerts.push(
        `Low activity (${totalActivity} actions, minimum ${KPI_CONFIG.minDailyActivities})`
      );
    }

    // 4. Low productivity score
    if (kpi && kpi.productivityScore > 0 && kpi.productivityScore < 50) {
      alerts.push(
        `Low productivity score (${Math.round(kpi.productivityScore)}%)`
      );
    }

    // 5. Early departure
    if (kpi?.earlyDeparture) {
      const checkOutDisplay = kpi.checkOutTime
        ? new Date(kpi.checkOutTime).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Europe/London",
          })
        : "unknown";
      alerts.push(`Early departure (checked out at ${checkOutDisplay})`);
    }

    // 6. Uncontacted leads assigned to this employee (>24h with no notes)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const uncontactedCount = await prisma.lead.count({
      where: {
        assignedToId: employeeId,
        status: { notIn: ["ENROLLED", "LOST"] },
        createdAt: { lt: twentyFourHoursAgo },
        notes: { none: {} },
      },
    });

    if (uncontactedCount > 0) {
      alerts.push(
        `${uncontactedCount} uncontacted lead(s) assigned >24h ago`
      );
    }

    // Send alert notification to admins if any alerts exist
    if (alerts.length > 0) {
      const alertMsg = alerts.map((a) => `\u2022 ${a}`).join("\n");
      await notifyRole(
        ["SUPER_ADMIN", "ADMIN"],
        `Performance Alert: ${emp.user.name}`,
        `${emp.user.name} has ${alerts.length} alert(s) today:\n${alertMsg}`,
        `/admin/kpi`
      );
    }

    return alerts;
  } catch (error) {
    console.error(
      `[performance-alerts] checkDailyAlerts failed for employee ${employeeId}:`,
      error
    );
    return [];
  }
}

/**
 * Check for uncontacted leads across all employees.
 * Finds leads assigned >24h ago with zero notes and notifies the responsible employees.
 * Returns the total number of uncontacted leads found.
 */
export async function checkUncontactedLeads(): Promise<number> {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Find leads assigned >24h ago with zero notes
    const uncontacted = await prisma.lead.findMany({
      where: {
        assignedToId: { not: null },
        status: { notIn: ["ENROLLED", "LOST"] },
        createdAt: { lt: twentyFourHoursAgo },
        notes: { none: {} },
      },
      include: {
        assignedTo: { include: { user: { select: { name: true } } } },
      },
      take: 50,
    });

    if (uncontacted.length === 0) return 0;

    // Group by employee and notify each one
    const byEmployee = new Map<
      string,
      { name: string; count: number }
    >();

    for (const lead of uncontacted) {
      if (!lead.assignedTo || !lead.assignedToId) continue;
      const existing = byEmployee.get(lead.assignedToId) || {
        name: lead.assignedTo.user.name,
        count: 0,
      };
      existing.count++;
      byEmployee.set(lead.assignedToId, existing);
    }

    // Notify each employee about their uncontacted leads
    for (const [empId, data] of byEmployee) {
      await notifyEmployee(
        empId,
        "Uncontacted Leads",
        `You have ${data.count} assigned lead(s) with no follow-up notes. Please contact them today.`,
        "/admin/leads?assignedTo=" + empId
      );
    }

    // Also notify admins with a summary
    if (byEmployee.size > 0) {
      const summary = Array.from(byEmployee.entries())
        .map(([, data]) => `\u2022 ${data.name}: ${data.count} lead(s)`)
        .join("\n");
      await notifyRole(
        ["SUPER_ADMIN", "ADMIN"],
        "Uncontacted Leads Summary",
        `${uncontacted.length} lead(s) across ${byEmployee.size} employee(s) have had no contact in 24+ hours:\n${summary}`,
        `/admin/leads`
      );
    }

    return uncontacted.length;
  } catch (error) {
    console.error(
      "[performance-alerts] checkUncontactedLeads failed:",
      error
    );
    return 0;
  }
}

/**
 * Run all daily alerts for all active employees.
 * Intended to be called by a scheduled batch job (e.g., end of day cron).
 */
export async function runDailyAlertsForAll(): Promise<{
  processed: number;
  alertsGenerated: number;
}> {
  try {
    const employees = await prisma.employee.findMany({
      where: { user: { isActive: true } },
      select: { id: true },
    });

    let totalAlerts = 0;
    for (const emp of employees) {
      const alerts = await checkDailyAlerts(emp.id);
      totalAlerts += alerts.length;
    }

    // Also check uncontacted leads across all employees
    await checkUncontactedLeads();

    return { processed: employees.length, alertsGenerated: totalAlerts };
  } catch (error) {
    console.error("[performance-alerts] runDailyAlertsForAll failed:", error);
    return { processed: 0, alertsGenerated: 0 };
  }
}
