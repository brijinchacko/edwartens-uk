import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "leads:read")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const status = searchParams.get("status");
    const source = searchParams.get("source");
    const course = searchParams.get("course");
    const assigned = searchParams.get("assigned");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }
    if (source) {
      where.source = source;
    }
    if (course) {
      where.courseInterest = course;
    }
    if (assigned === "unassigned") {
      where.assignedToId = null;
    } else if (assigned) {
      where.assignedToId = assigned;
    }
    if (dateFrom || dateTo) {
      where.createdAt = {
        ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
        ...(dateTo ? { lte: new Date(dateTo + "T23:59:59.999Z") } : {}),
      };
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          assignedTo: {
            include: {
              user: { select: { name: true, email: true } },
            },
          },
          notes: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          _count: { select: { notes: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin leads list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "leads:write")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      email,
      phone,
      qualification,
      courseInterest,
      source,
      assignedToId,
      followUpDate,
      note,
    } = body;

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: "Name, email, and phone are required" },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        qualification: qualification || null,
        courseInterest: courseInterest || null,
        source: source || "manual",
        assignedToId: assignedToId || null,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
      },
      include: {
        assignedTo: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    if (note) {
      await prisma.leadNote.create({
        data: {
          leadId: lead.id,
          content: note,
          createdBy: session.user.name || session.user.email,
        },
      });
    }

    // Track outbound lead generation
    if (["outbound", "manual"].includes(source)) {
      try {
        const emp = await prisma.employee.findUnique({ where: { userId: session.user.id } });
        if (emp) {
          const { recordOutboundLead } = await import("@/lib/incentives");
          await recordOutboundLead(emp.id);
        }
      } catch (e) {
        console.error("Failed to record outbound lead:", e);
      }
    }

    // Auto-create WhatsApp task for the assigned counsellor
    if (assignedToId && phone) {
      try {
        const { createWhatsAppTaskForLead } = await import("@/lib/whatsapp-tasks");
        await createWhatsAppTaskForLead(lead.id, assignedToId);
      } catch (e) {
        console.error("Failed to create WhatsApp task:", e);
      }
    }

    // Audit log
    await logAudit({
      userId: session.user.id as string,
      userName: session.user.name || session.user.email,
      userRole: session.user.role,
      action: "CREATE",
      entity: "lead",
      entityId: lead.id,
      entityName: `${name} (${email})`,
      details: JSON.stringify({ name, email, phone, source: source || "manual", courseInterest }),
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("Admin lead create error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
