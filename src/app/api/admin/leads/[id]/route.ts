import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { notifyEmployee, notifyRole } from "@/lib/notify";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "leads:read")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        assignedTo: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        notes: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error("Admin lead get error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "leads:write")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;
    const body = await req.json();

    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const allowedFields: Record<string, unknown> = {};

    if (body.status !== undefined) allowedFields.status = body.status;
    if (body.assignedToId !== undefined)
      allowedFields.assignedToId = body.assignedToId || null;
    if (body.followUpDate !== undefined)
      allowedFields.followUpDate = body.followUpDate
        ? new Date(body.followUpDate)
        : null;
    if (body.name !== undefined) allowedFields.name = body.name;
    if (body.email !== undefined) {
      // Check for duplicate email on another lead
      if (body.email.trim() && body.email.trim().toLowerCase() !== existing.email?.toLowerCase()) {
        const dupEmail = await prisma.lead.findFirst({
          where: {
            email: { equals: body.email.trim(), mode: "insensitive" },
            id: { not: id },
          },
          select: { id: true, name: true, status: true },
        });
        if (dupEmail) {
          return NextResponse.json(
            {
              error: `This email already exists on another lead: ${dupEmail.name} (${dupEmail.status}).`,
              duplicateLeadId: dupEmail.id,
            },
            { status: 409 }
          );
        }
      }
      allowedFields.email = body.email;
    }
    if (body.phone !== undefined) {
      // Check for duplicate phone on another lead
      if (body.phone.trim() !== existing.phone) {
        const dupPhone = await prisma.lead.findFirst({
          where: {
            phone: body.phone.trim(),
            id: { not: id },
          },
          select: { id: true, name: true, status: true },
        });
        if (dupPhone) {
          return NextResponse.json(
            {
              error: `This phone number already exists on another lead: ${dupPhone.name} (${dupPhone.status}).`,
              duplicateLeadId: dupPhone.id,
            },
            { status: 409 }
          );
        }
      }
      allowedFields.phone = body.phone;
    }
    if (body.qualification !== undefined)
      allowedFields.qualification = body.qualification;
    if (body.courseInterest !== undefined)
      allowedFields.courseInterest = body.courseInterest;
    if (body.source !== undefined) allowedFields.source = body.source;
    if (body.category !== undefined) allowedFields.category = body.category || null;
    if (body.alternatePhone !== undefined) allowedFields.alternatePhone = body.alternatePhone || null;
    if (body.enquiryDate !== undefined) allowedFields.enquiryDate = body.enquiryDate ? new Date(body.enquiryDate) : null;

    const lead = await prisma.lead.update({
      where: { id },
      data: allowedFields,
      include: {
        assignedTo: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        notes: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // Create a note for status changes when statusNote is provided
    if (body.statusNote && body.status !== undefined && body.status !== existing.status) {
      const noteContent = `[Status changed: ${existing.status} \u2192 ${body.status}] ${body.statusNote}`;
      await prisma.leadNote.create({
        data: {
          leadId: id,
          content: noteContent,
          createdBy: session.user.name || session.user.email || "Admin",
        },
      });
    }

    // Audit log
    const auditAction = body.status !== undefined && body.status !== existing.status ? "STATUS_CHANGE" : "UPDATE";
    const details: Record<string, unknown> = {};
    if (body.status !== undefined && body.status !== existing.status) {
      details.statusChange = `${existing.status} -> ${body.status}`;
    }
    if (body.assignedToId !== undefined && body.assignedToId !== existing.assignedToId) {
      details.assignedToChanged = true;
    }
    Object.keys(allowedFields).forEach((k) => { details[k] = allowedFields[k]; });

    await logAudit({
      userId: session.user.id as string,
      userName: session.user.name || session.user.email,
      userRole: session.user.role,
      action: auditAction,
      entity: "lead",
      entityId: id,
      entityName: `${lead.name || existing.name} (${lead.email || existing.email})`,
      details: JSON.stringify(details),
    });

    // Notify all counsellors on status change
    if (body.status !== undefined && body.status !== existing.status) {
      const LEAD_STATUS_LABELS: Record<string, string> = {
        NEW: "New", CONTACTED: "Contacted", FIRST_CALL: "First Call",
        CONSULTATION_ARRANGED: "Consultation Arranged", CONSULTATION_COMPLETED: "Consultation Completed",
        QUALIFIED: "Qualified", REGISTERED: "Registered", ENROLLED: "Enrolled", LOST: "Lost",
      };
      const oldLabel = LEAD_STATUS_LABELS[existing.status] || existing.status;
      const newLabel = LEAD_STATUS_LABELS[body.status] || body.status;
      const updatedBy = session.user.name || "Someone";
      notifyRole(
        ["ADMISSION_COUNSELLOR", "SALES_LEAD", "ADMIN", "SUPER_ADMIN"],
        "📋 Lead Status Updated",
        `${existing.name}: ${oldLabel} → ${newLabel} (by ${updatedBy})`,
        `/admin/leads/${id}`
      );
    }

    // Notification for lead assignment
    if (body.assignedToId && body.assignedToId !== existing.assignedToId) {
      await notifyEmployee(body.assignedToId, "Lead Assigned to You", `Lead "${existing.name}" has been assigned to you. Follow up soon.`, `/admin/leads/${id}`);
    }

    // Auto-create WhatsApp task when lead is assigned to a new counsellor
    if (
      body.assignedToId &&
      body.assignedToId !== existing.assignedToId &&
      lead.assignedTo
    ) {
      try {
        const { createWhatsAppTaskForLead } = await import("@/lib/whatsapp-tasks");
        await createWhatsAppTaskForLead(lead.id, body.assignedToId);
      } catch (e) {
        console.error("Failed to create WhatsApp task:", e);
      }
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error("Admin lead update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
