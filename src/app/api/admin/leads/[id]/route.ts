import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";

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
    if (body.email !== undefined) allowedFields.email = body.email;
    if (body.phone !== undefined) allowedFields.phone = body.phone;
    if (body.qualification !== undefined)
      allowedFields.qualification = body.qualification;
    if (body.courseInterest !== undefined)
      allowedFields.courseInterest = body.courseInterest;
    if (body.source !== undefined) allowedFields.source = body.source;

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
