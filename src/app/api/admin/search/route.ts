import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isCrmRole } from "@/lib/rbac";

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  href: string;
  icon: string;
}

const LIMIT_PER_CATEGORY = 5;
const TOTAL_LIMIT = 20;

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !isCrmRole(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawQ = req.nextUrl.searchParams.get("q")?.trim() || "";
    // Clean phone numbers: remove +, spaces, dashes, brackets
    const cleanedPhone = rawQ.replace(/^\+/, "").replace(/[\s\-()]/g, "");
    const isPhoneLike = /^\d{6,}$/.test(cleanedPhone);
    const q = isPhoneLike ? cleanedPhone : rawQ;
    if (!q || q.length < 2) {
      return NextResponse.json({ results: [], totalCount: 0 });
    }

    const role = session.user.role;
    const userId = session.user.id as string;

    // Resolve employee ID for role-based filtering
    let employeeId: string | null = null;
    if (role === "SALES_LEAD" || role === "ADMISSION_COUNSELLOR") {
      const emp = await prisma.employee.findUnique({
        where: { userId },
        select: { id: true },
      });
      employeeId = emp?.id ?? null;
    }

    const isRestricted = role === "SALES_LEAD" || role === "ADMISSION_COUNSELLOR";

    // Build lead filter
    const leadWhere: Record<string, unknown> = {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
      ],
    };
    if (isRestricted && employeeId) {
      leadWhere.assignedToId = employeeId;
    }

    // Build student filter
    const studentWhere: Record<string, unknown> = {
      user: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q, mode: "insensitive" } },
        ],
      },
    };
    if (isRestricted && employeeId) {
      studentWhere.counsellorId = employeeId;
    }

    // Run all queries in parallel
    const [leads, students, employees, batches, invoices, documents] =
      await Promise.all([
        // 1. Leads
        prisma.lead.findMany({
          where: leadWhere,
          take: LIMIT_PER_CATEGORY,
          orderBy: { updatedAt: "desc" },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            status: true,
          },
        }),

        // 2. Students (via User relation)
        prisma.student.findMany({
          where: studentWhere,
          take: LIMIT_PER_CATEGORY,
          orderBy: { updatedAt: "desc" },
          include: {
            user: { select: { name: true, email: true, phone: true } },
          },
        }),

        // 3. Employees (via User relation) -- only for ADMIN/SUPER_ADMIN
        isRestricted
          ? Promise.resolve([])
          : prisma.employee.findMany({
              where: {
                user: {
                  OR: [
                    { name: { contains: q, mode: "insensitive" } },
                    { email: { contains: q, mode: "insensitive" } },
                  ],
                },
              },
              take: LIMIT_PER_CATEGORY,
              include: {
                user: {
                  select: { name: true, email: true, role: true },
                },
              },
            }),

        // 4. Batches
        isRestricted
          ? Promise.resolve([])
          : prisma.batch.findMany({
              where: {
                name: { contains: q, mode: "insensitive" },
              },
              take: LIMIT_PER_CATEGORY,
              orderBy: { startDate: "desc" },
              select: {
                id: true,
                name: true,
                status: true,
                _count: { select: { students: true } },
              },
            }),

        // 5. Invoices
        isRestricted
          ? Promise.resolve([])
          : prisma.invoice.findMany({
              where: {
                invoiceNumber: { contains: q, mode: "insensitive" },
              },
              take: LIMIT_PER_CATEGORY,
              orderBy: { date: "desc" },
              select: {
                id: true,
                invoiceNumber: true,
                total: true,
                status: true,
                studentId: true,
              },
            }),

        // 6. Documents
        isRestricted
          ? Promise.resolve([])
          : prisma.document.findMany({
              where: {
                name: { contains: q, mode: "insensitive" },
              },
              take: LIMIT_PER_CATEGORY,
              orderBy: { uploadedAt: "desc" },
              select: {
                id: true,
                name: true,
                type: true,
                studentId: true,
                student: {
                  select: {
                    user: { select: { name: true } },
                  },
                },
              },
            }),
      ]);

    // Map results to unified format
    const results: SearchResult[] = [];

    for (const lead of leads) {
      results.push({
        id: lead.id,
        title: lead.name || lead.email || lead.phone,
        subtitle: [lead.phone, lead.status?.replace(/_/g, " ")]
          .filter(Boolean)
          .join(" \u00B7 "),
        category: "Lead",
        href: `/admin/leads/${lead.id}`,
        icon: "Users",
      });
    }

    for (const student of students) {
      results.push({
        id: student.id,
        title: student.user.name,
        subtitle: [student.user.email, student.status?.replace(/_/g, " ")]
          .filter(Boolean)
          .join(" \u00B7 "),
        category: "Student",
        href: `/admin/students/${student.id}`,
        icon: "Users",
      });
    }

    for (const emp of employees) {
      results.push({
        id: emp.id,
        title: emp.user.name,
        subtitle: [emp.user.email, emp.user.role?.replace(/_/g, " ")]
          .filter(Boolean)
          .join(" \u00B7 "),
        category: "Employee",
        href: `/admin/employees/${emp.id}`,
        icon: "UserCog",
      });
    }

    for (const batch of batches) {
      results.push({
        id: batch.id,
        title: batch.name,
        subtitle: `${batch._count.students} students \u00B7 ${batch.status}`,
        category: "Batch",
        href: `/admin/batches/${batch.id}`,
        icon: "Layers",
      });
    }

    for (const inv of invoices) {
      const amountStr = `\u00A3${(inv.total / 100).toLocaleString("en-GB")}`;
      results.push({
        id: inv.id,
        title: inv.invoiceNumber,
        subtitle: `${amountStr} \u00B7 ${inv.status}`,
        category: "Invoice",
        href: `/admin/invoices`,
        icon: "FileText",
      });
    }

    for (const doc of documents) {
      results.push({
        id: doc.id,
        title: doc.name,
        subtitle: [doc.type, doc.student?.user?.name]
          .filter(Boolean)
          .join(" \u00B7 "),
        category: "Document",
        href: `/admin/students/${doc.studentId}`,
        icon: "FileText",
      });
    }

    // Trim to total limit
    const trimmed = results.slice(0, TOTAL_LIMIT);

    return NextResponse.json({
      results: trimmed,
      totalCount: results.length,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
