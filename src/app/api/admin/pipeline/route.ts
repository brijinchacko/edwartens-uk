import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";

// Lead stages in pipeline order
const LEAD_STAGES = ["NEW", "CONTACTED", "QUALIFIED", "ENROLLED", "LOST"] as const;

// Student stages in pipeline order
const STUDENT_STAGES = [
  "ONBOARDING",
  "ACTIVE",
  "ON_HOLD",
  "POST_TRAINING",
  "CAREER_SUPPORT",
  "COMPLETED",
  "ALUMNI",
  "DROPPED",
] as const;

// Which stages belong to each view
const VIEW_STAGES: Record<string, { leadStatuses: string[]; studentStatuses: string[] }> = {
  full: {
    leadStatuses: ["NEW", "CONTACTED", "QUALIFIED", "ENROLLED", "LOST"],
    studentStatuses: ["ONBOARDING", "ACTIVE", "ON_HOLD", "POST_TRAINING", "CAREER_SUPPORT", "COMPLETED", "ALUMNI", "DROPPED"],
  },
  sales: {
    leadStatuses: ["NEW", "CONTACTED", "QUALIFIED", "ENROLLED"],
    studentStatuses: [],
  },
  training: {
    leadStatuses: [],
    studentStatuses: ["ONBOARDING", "ACTIVE", "POST_TRAINING"],
  },
  career: {
    leadStatuses: [],
    studentStatuses: ["CAREER_SUPPORT", "COMPLETED", "ALUMNI"],
  },
  risk: {
    leadStatuses: ["LOST"],
    studentStatuses: ["DROPPED", "ON_HOLD"],
  },
};

function daysBetween(from: Date, to: Date): number {
  return Math.max(0, Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)));
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "pipeline:read")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const view = (searchParams.get("view") || "full") as string;
    const search = searchParams.get("search") || "";
    const source = searchParams.get("source") || "";
    const course = searchParams.get("course") || "";
    const assignedTo = searchParams.get("assignedTo") || "";
    const batch = searchParams.get("batch") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    const followUpFilter = searchParams.get("followUp") || "";

    const viewConfig = VIEW_STAGES[view] || VIEW_STAGES.full;
    const now = new Date();

    // ---- Build lead query ----
    const leadWhere: any = {};
    const leadAND: any[] = [];

    if (viewConfig.leadStatuses.length > 0) {
      leadWhere.status = { in: viewConfig.leadStatuses };
    }

    if (search) {
      leadAND.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      });
    }
    if (source) {
      leadWhere.source = { contains: source, mode: "insensitive" };
    }
    if (course) {
      leadWhere.courseInterest = course;
    }
    if (assignedTo) {
      leadWhere.assignedToId = assignedTo;
    }
    if (dateFrom || dateTo) {
      leadWhere.createdAt = {};
      if (dateFrom) leadWhere.createdAt.gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        leadWhere.createdAt.lte = end;
      }
    }
    if (followUpFilter === "yes") {
      leadAND.push({ followUpDate: { not: null } });
    } else if (followUpFilter === "no") {
      leadAND.push({ followUpDate: null });
    } else if (followUpFilter === "overdue") {
      leadAND.push({ followUpDate: { lt: now } });
      leadAND.push({ status: { notIn: ["ENROLLED", "LOST"] } });
    }

    if (leadAND.length > 0) leadWhere.AND = leadAND;

    // ---- Build student query ----
    const studentWhere: any = {};
    const studentAND: any[] = [];

    if (viewConfig.studentStatuses.length > 0) {
      studentWhere.status = { in: viewConfig.studentStatuses };
    }

    if (search) {
      studentAND.push({
        user: {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        },
      });
    }
    if (course) {
      studentWhere.course = course;
    }
    if (assignedTo) {
      studentWhere.counsellorId = assignedTo;
    }
    if (batch) {
      studentWhere.batchId = batch;
    }
    if (dateFrom || dateTo) {
      studentWhere.createdAt = {};
      if (dateFrom) studentWhere.createdAt.gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        studentWhere.createdAt.lte = end;
      }
    }

    if (studentAND.length > 0) studentWhere.AND = studentAND;

    // ---- Fetch data ----
    const [leads, students, employees, sources, batches, lastLeadNotes, lastStudentEvents] =
      await Promise.all([
        viewConfig.leadStatuses.length > 0
          ? prisma.lead.findMany({
              where: leadWhere,
              include: {
                assignedTo: { include: { user: { select: { name: true } } } },
              },
              orderBy: { updatedAt: "desc" },
            })
          : Promise.resolve([]),
        viewConfig.studentStatuses.length > 0
          ? prisma.student.findMany({
              where: studentWhere,
              include: {
                user: { select: { name: true, email: true, phone: true } },
                batch: { select: { name: true } },
                counsellor: { include: { user: { select: { name: true } } } },
              },
              orderBy: { updatedAt: "desc" },
            })
          : Promise.resolve([]),
        prisma.employee.findMany({
          include: { user: { select: { name: true } } },
          orderBy: { user: { name: "asc" } },
        }),
        prisma.lead.groupBy({
          by: ["source"],
          _count: true,
          orderBy: { _count: { source: "desc" } },
        }),
        prisma.batch.findMany({
          where: { status: { in: ["UPCOMING", "ACTIVE"] } },
          select: { id: true, name: true },
          orderBy: { startDate: "desc" },
        }),
        // Last note per lead (raw query approach: just get recent notes)
        prisma.leadNote.findMany({
          orderBy: { createdAt: "desc" },
          take: 500,
          select: { leadId: true, createdAt: true },
        }),
        // Last journey event per student
        prisma.studentJourney.findMany({
          orderBy: { createdAt: "desc" },
          take: 500,
          select: { studentId: true, createdAt: true },
        }),
      ]);

    // Build last-activity maps
    const leadLastActivity: Record<string, Date> = {};
    for (const note of lastLeadNotes) {
      if (!leadLastActivity[note.leadId]) {
        leadLastActivity[note.leadId] = note.createdAt;
      }
    }
    const studentLastActivity: Record<string, Date> = {};
    for (const ev of lastStudentEvents) {
      if (!studentLastActivity[ev.studentId]) {
        studentLastActivity[ev.studentId] = ev.createdAt;
      }
    }

    // ---- For "risk" view, also include overdue follow-up leads ----
    let overdueLeads: typeof leads = [];
    if (view === "risk") {
      overdueLeads = await prisma.lead.findMany({
        where: {
          followUpDate: { lt: now },
          status: { notIn: ["ENROLLED", "LOST"] },
          ...(search
            ? {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { email: { contains: search, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        include: {
          assignedTo: { include: { user: { select: { name: true } } } },
        },
        orderBy: { updatedAt: "desc" },
      });
    }

    // ---- Build stages ----
    type StageItem = {
      id: string;
      name: string;
      email: string;
      phone: string;
      type: "lead" | "student";
      status: string;
      assignedTo: string | null;
      followUpDate: string | null;
      lastActivity: string | null;
      daysInStage: number;
      course: string | null;
      source: string | null;
      batchName: string | null;
      isOverdue: boolean;
      isIdle: boolean;
    };

    type Stage = {
      name: string;
      status: string;
      type: "lead" | "student";
      count: number;
      items: StageItem[];
    };

    const stages: Stage[] = [];

    // Lead stages
    for (const status of viewConfig.leadStatuses) {
      const stageLeads = leads.filter((l: any) => l.status === status);
      const items: StageItem[] = stageLeads.map((lead: any) => {
        const lastAct = leadLastActivity[lead.id] || null;
        const daysInStage = daysBetween(new Date(lead.updatedAt), now);
        const isOverdue =
          lead.followUpDate &&
          new Date(lead.followUpDate) < now &&
          !["ENROLLED", "LOST"].includes(lead.status);
        const isIdle = daysInStage > 7 && !["ENROLLED", "LOST"].includes(lead.status);
        return {
          id: lead.id,
          name: lead.name,
          email: lead.email,
          phone: lead.phone || "",
          type: "lead" as const,
          status: lead.status,
          assignedTo: lead.assignedTo?.user?.name || null,
          followUpDate: lead.followUpDate ? lead.followUpDate.toISOString() : null,
          lastActivity: lastAct ? lastAct.toISOString() : null,
          daysInStage,
          course: lead.courseInterest || null,
          source: lead.source || null,
          batchName: null,
          isOverdue: !!isOverdue,
          isIdle: !!isIdle,
        };
      });
      stages.push({ name: status, status, type: "lead", count: items.length, items });
    }

    // Student stages
    for (const status of viewConfig.studentStatuses) {
      const stageStudents = students.filter((s: any) => s.status === status);
      const items: StageItem[] = stageStudents.map((student: any) => {
        const lastAct = studentLastActivity[student.id] || null;
        const daysInStage = daysBetween(new Date(student.updatedAt), now);
        const isIdle = daysInStage > 7 && !["COMPLETED", "ALUMNI", "DROPPED"].includes(student.status);
        return {
          id: student.id,
          name: student.user.name,
          email: student.user.email,
          phone: student.user.phone || "",
          type: "student" as const,
          status: student.status,
          assignedTo: student.counsellor?.user?.name || null,
          followUpDate: null,
          lastActivity: lastAct ? lastAct.toISOString() : null,
          daysInStage,
          course: student.course || null,
          source: null,
          batchName: student.batch?.name || null,
          isOverdue: false,
          isIdle: !!isIdle,
        };
      });
      stages.push({ name: status, status, type: "student", count: items.length, items });
    }

    // For risk view, add overdue leads as a separate stage
    if (view === "risk" && overdueLeads.length > 0) {
      // Deduplicate: remove any overdue leads already in LOST stage
      const existingIds = new Set(stages.flatMap((s) => s.items.map((i) => i.id)));
      const uniqueOverdue = overdueLeads.filter((l: any) => !existingIds.has(l.id));
      if (uniqueOverdue.length > 0) {
        const items: StageItem[] = uniqueOverdue.map((lead: any) => {
          const lastAct = leadLastActivity[lead.id] || null;
          const daysInStage = daysBetween(new Date(lead.updatedAt), now);
          return {
            id: lead.id,
            name: lead.name,
            email: lead.email,
            phone: lead.phone || "",
            type: "lead" as const,
            status: lead.status,
            assignedTo: lead.assignedTo?.user?.name || null,
            followUpDate: lead.followUpDate ? lead.followUpDate.toISOString() : null,
            lastActivity: lastAct ? lastAct.toISOString() : null,
            daysInStage,
            course: lead.courseInterest || null,
            source: lead.source || null,
            batchName: null,
            isOverdue: true,
            isIdle: daysInStage > 7,
          };
        });
        stages.push({
          name: "OVERDUE_FOLLOWUP",
          status: "OVERDUE_FOLLOWUP",
          type: "lead",
          count: items.length,
          items,
        });
      }
    }

    // ---- Calculate summary stats ----
    const allLeads = await prisma.lead.findMany({
      select: { status: true, createdAt: true, updatedAt: true, followUpDate: true },
    });

    const totalInPipeline =
      stages.reduce((sum, s) => sum + s.count, 0);

    const totalNonLost = allLeads.filter((l) => l.status !== "LOST").length;
    const totalEnrolled = allLeads.filter((l) => l.status === "ENROLLED").length;
    const conversionRate = totalNonLost > 0 ? Math.round((totalEnrolled / totalNonLost) * 100) : 0;

    // Average days from NEW to ENROLLED
    const enrolledLeads = allLeads.filter((l) => l.status === "ENROLLED");
    const avgDaysToConvert =
      enrolledLeads.length > 0
        ? Math.round(
            enrolledLeads.reduce(
              (sum, l) => sum + daysBetween(new Date(l.createdAt), new Date(l.updatedAt)),
              0
            ) / enrolledLeads.length
          )
        : 0;

    // At risk: overdue follow-ups + idle leads (>7 days in stage, not terminal)
    const atRiskCount = allLeads.filter((l) => {
      if (["ENROLLED", "LOST"].includes(l.status)) return false;
      const isOverdue = l.followUpDate && new Date(l.followUpDate) < now;
      const isIdle = daysBetween(new Date(l.updatedAt), now) > 7;
      return isOverdue || isIdle;
    }).length;

    // Revenue potential: QUALIFIED count * 2568
    const qualifiedCount = allLeads.filter((l) => l.status === "QUALIFIED").length;
    const revenuePotential = qualifiedCount * 2568;

    const summary = {
      total: totalInPipeline,
      conversionRate,
      avgDaysToConvert,
      atRisk: atRiskCount,
      revenuePotential,
    };

    // Filter options
    const filterOptions = {
      employees: employees.map((e: any) => ({ id: e.id, name: e.user.name })),
      sources: sources.map((s: any) => ({ value: s.source, count: s._count })),
      batches: batches.map((b: any) => ({ id: b.id, name: b.name })),
    };

    return NextResponse.json({ stages, summary, filterOptions });
  } catch (error) {
    console.error("Pipeline GET error:", error);
    return NextResponse.json({ error: "Failed to fetch pipeline" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "pipeline:read")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, type, newStatus } = body;

    if (!id || !type || !newStatus) {
      return NextResponse.json({ error: "Missing id, type, or newStatus" }, { status: 400 });
    }

    if (type === "lead") {
      const validStatuses = ["NEW", "CONTACTED", "QUALIFIED", "ENROLLED", "LOST"];
      if (!validStatuses.includes(newStatus)) {
        return NextResponse.json({ error: "Invalid lead status" }, { status: 400 });
      }
      await prisma.lead.update({
        where: { id },
        data: { status: newStatus },
      });
    } else if (type === "student") {
      const validStatuses = [
        "ONBOARDING", "ACTIVE", "ON_HOLD", "POST_TRAINING",
        "CAREER_SUPPORT", "COMPLETED", "ALUMNI", "DROPPED",
      ];
      if (!validStatuses.includes(newStatus)) {
        return NextResponse.json({ error: "Invalid student status" }, { status: 400 });
      }
      await prisma.student.update({
        where: { id },
        data: { status: newStatus },
      });
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Pipeline PATCH error:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
