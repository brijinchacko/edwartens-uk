import { prisma } from "./prisma";

/**
 * Fire-and-forget KPI increment based on audit action.
 * Upserts the EmployeeKPI row for today and atomically increments the relevant counter.
 */
function stampKPI(userId: string, action: string, entity: string, details?: string | null) {
  // Determine which KPI field(s) to increment
  const increments: Record<string, number> = {};

  const actionLower = action.toLowerCase();
  const entityLower = entity.toLowerCase();

  // Call-related actions
  if (actionLower.includes("call") || (details && (details.includes("Call") || details.includes("📞")))) {
    increments.callsMade = 1;
  }

  // Email-related actions
  if (actionLower.includes("email") || action === "SEND_EMAIL") {
    increments.emailsSent = 1;
  }

  // Note creation
  if (entityLower === "lead_note" || (entityLower === "lead" && actionLower === "add_note")) {
    increments.notesAdded = 1;
  }

  // Lead conversion to ENROLLED
  if (entityLower === "lead" && details && details.includes("ENROLLED")) {
    increments.leadsConverted = 1;
  }

  // No relevant KPI field to increment
  if (Object.keys(increments).length === 0) return;

  // Get the employee profile for this user and upsert KPI — fire and forget
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  prisma.employee
    .findUnique({ where: { userId }, select: { id: true } })
    .then((employee) => {
      if (!employee) return;

      return prisma.employeeKPI.upsert({
        where: { employeeId_date: { employeeId: employee.id, date: today } },
        create: {
          employeeId: employee.id,
          date: today,
          ...increments,
        },
        update: {
          callsMade: increments.callsMade ? { increment: increments.callsMade } : undefined,
          emailsSent: increments.emailsSent ? { increment: increments.emailsSent } : undefined,
          notesAdded: increments.notesAdded ? { increment: increments.notesAdded } : undefined,
          leadsConverted: increments.leadsConverted ? { increment: increments.leadsConverted } : undefined,
        },
      });
    })
    .catch((err) => {
      // Never let KPI stamping break the main flow
      console.error("KPI stamp error:", err);
    });
}

export async function logAudit(params: {
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  entity: string;
  entityId?: string;
  entityName?: string;
  details?: string;
  ipAddress?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        userName: params.userName,
        userRole: params.userRole,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId || null,
        entityName: params.entityName || null,
        details: params.details || null,
        ipAddress: params.ipAddress || null,
      },
    });

    // Fire-and-forget KPI increment — non-blocking
    stampKPI(params.userId, params.action, params.entity, params.details);
  } catch (error) {
    // Never let audit logging break the main flow
    console.error("Audit log error:", error);
  }
}
