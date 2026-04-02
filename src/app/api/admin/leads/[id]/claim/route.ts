import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isCrmRole } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { notifyRole } from "@/lib/notify";

/**
 * POST /api/admin/leads/[id]/claim
 * First-come-first-serve lead claim for counsellors.
 * Uses atomic update with a WHERE condition to prevent race conditions.
 */
export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || !isCrmRole(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;
    const userId = session.user.id as string;
    const userRole = session.user.role as string;

    // Get the employee record for the current user
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

    // Atomic claim: only succeeds if lead is currently unassigned
    // This prevents race conditions — only the first request wins
    const result = await prisma.lead.updateMany({
      where: {
        id,
        assignedToId: null, // ONLY if currently unassigned
      },
      data: {
        assignedToId: employee.id,
      },
    });

    if (result.count === 0) {
      // Either lead doesn't exist or was already claimed
      const lead = await prisma.lead.findUnique({
        where: { id },
        select: {
          assignedToId: true,
          assignedTo: {
            select: { user: { select: { name: true } } },
          },
        },
      });

      if (!lead) {
        return NextResponse.json({ error: "Lead not found" }, { status: 404 });
      }

      const claimedBy = lead.assignedTo?.user?.name || "someone else";
      return NextResponse.json(
        { error: `This lead has already been claimed by ${claimedBy}.` },
        { status: 409 } // Conflict
      );
    }

    // Success — fetch the updated lead for response
    const lead = await prisma.lead.findUnique({
      where: { id },
      select: { name: true, email: true },
    });

    // Audit log
    await logAudit({
      userId,
      userName: session.user.name || session.user.email,
      userRole,
      action: "CLAIM",
      entity: "lead",
      entityId: id,
      entityName: `${lead?.name || "Unknown"} (${lead?.email || ""})`,
      details: JSON.stringify({ claimedByEmployeeId: employee.id }),
    });

    // Notify everyone that this lead was claimed
    notifyRole(
      ["ADMISSION_COUNSELLOR", "SALES_LEAD", "ADMIN", "SUPER_ADMIN"],
      "🤚 Lead Claimed",
      `${lead?.name || "A lead"} was claimed by ${employee.user.name}.`,
      `/admin/leads/${id}`
    );

    // Create a WhatsApp task for the new owner
    try {
      const fullLead = await prisma.lead.findUnique({ where: { id }, select: { phone: true } });
      if (fullLead?.phone) {
        const { createWhatsAppTaskForLead } = await import("@/lib/whatsapp-tasks");
        await createWhatsAppTaskForLead(id, employee.id);
      }
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Lead claimed successfully by ${employee.user.name}.`,
    });
  } catch (error) {
    console.error("Lead claim error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
