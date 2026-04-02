import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { notifyRole } from "@/lib/notify";

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
      alternatePhone,
      qualification,
      courseInterest,
      source,
      assignedToId,
      followUpDate,
      enquiryDate,
      note,
    } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and phone are required" },
        { status: 400 }
      );
    }

    // Normalize phone for dedup: strip spaces, dashes, parens; extract last 10 digits
    const normalizeForDedup = (p: string) => {
      const cleaned = p.replace(/[\s\-()]/g, "");
      return cleaned.slice(-10); // Last 10 digits match regardless of country code
    };

    // Check for duplicate by phone, email, OR similar name
    const duplicateChecks: any[] = [];
    // Check phone (fuzzy match on last 10 digits to handle country code differences)
    if (phone) {
      const last10 = normalizeForDedup(phone);
      duplicateChecks.push({ phone: { contains: last10 } });
    }
    // Check alternate phone against both phone fields
    if (alternatePhone) {
      const altLast10 = normalizeForDedup(alternatePhone);
      duplicateChecks.push({ phone: { contains: altLast10 } });
      duplicateChecks.push({ alternatePhone: { contains: altLast10 } });
    }
    // Check email (exact match, case-insensitive) — skip empty/default
    if (email && email.trim() && email.trim() !== "") {
      duplicateChecks.push({ email: { equals: email.trim(), mode: "insensitive" } });
    }

    if (duplicateChecks.length > 0) {
      const existingLead = await prisma.lead.findFirst({
        where: { OR: duplicateChecks },
        select: { id: true, name: true, email: true, phone: true, status: true },
      });
      if (existingLead) {
        // Determine which field matched
        const phoneMatch = existingLead.phone === phone?.trim();
        const emailMatch = existingLead.email?.toLowerCase() === email?.trim().toLowerCase();
        const matchField = phoneMatch && emailMatch ? "phone and email" : phoneMatch ? "phone number" : "email";
        return NextResponse.json(
          {
            error: `A lead with this ${matchField} already exists: ${existingLead.name} (${existingLead.status}). Duplicate entries are not allowed.`,
            duplicateLeadId: existingLead.id,
          },
          { status: 409 }
        );
      }
    }

    // Also check against existing students
    const normalizedPhone = phone?.trim().replace(/[\s\-()]/g, "");
    const phoneLast10 = normalizedPhone ? normalizedPhone.slice(-10) : null;
    if (phoneLast10) {
      const existingStudent = await prisma.user.findFirst({
        where: {
          role: "STUDENT",
          phone: { contains: phoneLast10 },
        },
        select: { id: true, name: true, phone: true },
      });
      if (existingStudent) {
        return NextResponse.json(
          {
            error: `This person is already registered as a student: ${existingStudent.name}. Duplicate entries are not allowed.`,
          },
          { status: 409 }
        );
      }
    }

    // Auto-assign to least-loaded counsellor if no assignedToId provided
    let finalAssignedToId = assignedToId || null;
    if (!finalAssignedToId) {
      try {
        // Get all active counsellors
        const counsellors = await prisma.employee.findMany({
          where: {
            user: { role: { in: ["ADMISSION_COUNSELLOR", "SALES_LEAD"] }, isActive: true },
          },
          select: {
            id: true,
            user: { select: { name: true } },
            _count: { select: { assignedLeads: { where: { status: { notIn: ["ENROLLED", "LOST"] } } } } },
          },
        });

        if (counsellors.length > 0) {
          // Sort by active lead count (ascending) — least loaded first
          counsellors.sort((a, b) => a._count.assignedLeads - b._count.assignedLeads);
          finalAssignedToId = counsellors[0].id;
        }
      } catch {}
    }

    // Validate dates
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    if (enquiryDate && new Date(enquiryDate) > now) {
      return NextResponse.json({ error: "Enquiry date cannot be in the future" }, { status: 400 });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (followUpDate && new Date(followUpDate) < today) {
      return NextResponse.json({ error: "Follow-up date cannot be in the past" }, { status: 400 });
    }

    // Validate initial note is provided
    if (!note || !note.trim()) {
      return NextResponse.json({ error: "Initial note is mandatory" }, { status: 400 });
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        email: email || "",
        phone,
        alternatePhone: alternatePhone || null,
        qualification: qualification || null,
        courseInterest: courseInterest || null,
        source: source || "manual",
        assignedToId: finalAssignedToId,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        enquiryDate: enquiryDate ? new Date(enquiryDate) : new Date(),
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
    if (finalAssignedToId && phone) {
      try {
        const { createWhatsAppTaskForLead } = await import("@/lib/whatsapp-tasks");
        await createWhatsAppTaskForLead(lead.id, finalAssignedToId);
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

    // Notify all counsellors about new lead (so they can claim it)
    const courseLabel = courseInterest === "AI_MODULE" ? "AI Module" : courseInterest === "PROFESSIONAL_MODULE" ? "Professional" : courseInterest || "N/A";
    if (!finalAssignedToId) {
      // Unassigned — notify all counsellors for first-come-first-serve
      notifyRole(
        ["ADMISSION_COUNSELLOR", "SALES_LEAD", "ADMIN", "SUPER_ADMIN"],
        "🆕 New Lead Available",
        `${name} (${courseLabel}) — unassigned. Claim it now!`,
        `/admin/leads/${lead.id}`
      );
    } else {
      // Assigned — still notify admins and other counsellors for visibility
      notifyRole(
        ["ADMISSION_COUNSELLOR", "SALES_LEAD", "ADMIN", "SUPER_ADMIN"],
        "🆕 New Lead Created",
        `${name} (${courseLabel}) — assigned to ${lead.assignedTo?.user?.name || "someone"}.`,
        `/admin/leads/${lead.id}`
      );
    }

    // Auto-WhatsApp welcome message
    if (phone) {
      try {
        const { createAutoWhatsAppForLead } = await import("@/lib/auto-whatsapp");
        await createAutoWhatsAppForLead(lead.id, name, phone, courseInterest || null, finalAssignedToId);
      } catch {}
    }

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("Admin lead create error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
