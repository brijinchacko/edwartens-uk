import { prisma } from "./prisma";

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
  } catch (error) {
    // Never let audit logging break the main flow
    console.error("Audit log error:", error);
  }
}
