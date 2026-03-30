import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";
import bcrypt from "bcryptjs";
import { generateTempPassword } from "@/lib/utils";

const VALID_LEAD_STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "ENROLLED", "LOST"];
const VALID_COURSE_TYPES = ["PROFESSIONAL_MODULE", "AI_MODULE"];
const VALID_STUDENT_STATUSES = [
  "ONBOARDING", "ACTIVE", "ON_HOLD", "POST_TRAINING",
  "CAREER_SUPPORT", "COMPLETED", "ALUMNI_PLACED", "ALUMNI_NOT_PLACED", "DROPPED",
];
const VALID_PAYMENT_STATUSES = ["PENDING", "PAID", "PARTIAL", "REFUNDED"];

function normalizeCourseType(value: string): string | null {
  if (!value) return null;
  const upper = value.toUpperCase().replace(/[\s-]+/g, "_");
  if (VALID_COURSE_TYPES.includes(upper)) return upper;
  if (upper.includes("PROFESSIONAL") || upper.includes("PROF")) return "PROFESSIONAL_MODULE";
  if (upper.includes("AI")) return "AI_MODULE";
  return null;
}

function normalizeLeadStatus(value: string): string {
  if (!value) return "NEW";
  const upper = value.toUpperCase().replace(/[\s-]+/g, "_");
  if (VALID_LEAD_STATUSES.includes(upper)) return upper;
  return "NEW";
}

function normalizeStudentStatus(value: string): string {
  if (!value) return "ONBOARDING";
  const upper = value.toUpperCase().replace(/[\s-]+/g, "_");
  if (VALID_STUDENT_STATUSES.includes(upper)) return upper;
  return "ONBOARDING";
}

function normalizePaymentStatus(value: string): string {
  if (!value) return "PENDING";
  const upper = value.toUpperCase().replace(/[\s-]+/g, "_");
  if (VALID_PAYMENT_STATUSES.includes(upper)) return upper;
  return "PENDING";
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    if (!session?.user || !role || !hasPermission(role, "users:manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, records } = body;

    if (!type || !records || !Array.isArray(records)) {
      return NextResponse.json(
        { error: "type and records array are required" },
        { status: 400 }
      );
    }

    if (type === "leads") {
      return await importLeads(records, session.user.name || session.user.email);
    } else if (type === "students") {
      return await importStudents(records);
    } else {
      return NextResponse.json(
        { error: "Invalid type. Use 'leads' or 'students'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function importLeads(
  records: Record<string, string>[],
  createdBy: string
) {
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  // Gather all emails to check for duplicates in one query
  const emails = records
    .map((r) => r.email?.toLowerCase().trim())
    .filter(Boolean);

  const existingLeads = await prisma.lead.findMany({
    where: { email: { in: emails } },
    select: { email: true },
  });
  const existingEmails = new Set(existingLeads.map((l) => l.email.toLowerCase()));

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const rowNum = i + 1;

    try {
      const email = record.email?.toLowerCase().trim();
      const name = record.name?.trim();

      if (!name || !email) {
        errors.push(`Row ${rowNum}: Name and email are required`);
        continue;
      }

      if (existingEmails.has(email)) {
        skipped++;
        continue;
      }

      const courseInterest = normalizeCourseType(record.courseInterest || "");
      const status = normalizeLeadStatus(record.status || "");

      await prisma.lead.create({
        data: {
          name,
          email,
          phone: record.phone?.trim() || "",
          qualification: record.qualification?.trim() || null,
          courseInterest: courseInterest as any,
          source: record.source?.trim() || "zoho_import",
          status: status as any,
        },
      });

      // Create initial note if provided
      if (record.notes?.trim()) {
        const lead = await prisma.lead.findFirst({
          where: { email },
          select: { id: true },
        });
        if (lead) {
          await prisma.leadNote.create({
            data: {
              leadId: lead.id,
              content: record.notes.trim(),
              createdBy,
            },
          });
        }
      }

      existingEmails.add(email);
      imported++;
    } catch (err: any) {
      errors.push(`Row ${rowNum}: ${err.message || "Unknown error"}`);
    }
  }

  return NextResponse.json({ imported, skipped, errors });
}

async function importStudents(records: Record<string, string>[]) {
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];
  const credentials: { email: string; tempPassword: string }[] = [];

  // Gather all emails to check for duplicates in one query
  const emails = records
    .map((r) => r.email?.toLowerCase().trim())
    .filter(Boolean);

  const existingUsers = await prisma.user.findMany({
    where: { email: { in: emails } },
    select: { email: true },
  });
  const existingEmails = new Set(existingUsers.map((u) => u.email.toLowerCase()));

  // Find batch IDs if batch names are provided
  const batchNames = [
    ...new Set(records.map((r) => r.batch?.trim()).filter(Boolean)),
  ];
  const batches = batchNames.length > 0
    ? await prisma.batch.findMany({
        where: { name: { in: batchNames } },
        select: { id: true, name: true },
      })
    : [];
  const batchMap = new Map(batches.map((b) => [b.name.toLowerCase(), b.id]));

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const rowNum = i + 1;

    try {
      const email = record.email?.toLowerCase().trim();
      const name = record.name?.trim();

      if (!name || !email) {
        errors.push(`Row ${rowNum}: Name and email are required`);
        continue;
      }

      if (existingEmails.has(email)) {
        skipped++;
        continue;
      }

      const course = normalizeCourseType(record.course || "");
      if (!course) {
        errors.push(`Row ${rowNum}: Valid course is required (Professional Module or AI Module)`);
        continue;
      }

      const tempPassword = generateTempPassword();
      const hashedPassword = await bcrypt.hash(tempPassword, 12);

      const studentStatus = normalizeStudentStatus(record.status || "");
      const paymentStatus = normalizePaymentStatus(record.paymentStatus || "");
      const paidAmount = record.paidAmount ? parseFloat(record.paidAmount) : null;
      const batchId = record.batch
        ? batchMap.get(record.batch.toLowerCase().trim()) || null
        : null;

      const user = await prisma.user.create({
        data: {
          email,
          name,
          phone: record.phone?.trim() || null,
          password: hashedPassword,
          role: "STUDENT",
          isActive: true,
          onboarded: false,
        },
      });

      await prisma.student.create({
        data: {
          userId: user.id,
          course: course as any,
          status: studentStatus as any,
          paymentStatus: paymentStatus as any,
          paidAmount: paidAmount !== null && !isNaN(paidAmount) ? paidAmount : null,
          batchId,
          qualification: record.qualification?.trim() || null,
        },
      });

      credentials.push({ email, tempPassword });
      existingEmails.add(email);
      imported++;
    } catch (err: any) {
      errors.push(`Row ${rowNum}: ${err.message || "Unknown error"}`);
    }
  }

  return NextResponse.json({ imported, skipped, errors, credentials });
}
