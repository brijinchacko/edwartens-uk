import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateTempPassword } from "@/lib/utils";
import { hasPermission } from "@/lib/rbac";
import bcrypt from "bcryptjs";

export async function POST(
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
    const { course, batchId } = body;

    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    if (lead.status === "ENROLLED" && lead.convertedToStudentId) {
      return NextResponse.json(
        { error: "Lead has already been converted to a student" },
        { status: 400 }
      );
    }

    // Check if a user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: lead.email },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    const courseType = course || lead.courseInterest;
    if (!courseType) {
      return NextResponse.json(
        { error: "Course type is required" },
        { status: 400 }
      );
    }

    // Generate temporary password
    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Create user and student in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: lead.email,
          password: hashedPassword,
          name: lead.name,
          phone: lead.phone,
          role: "STUDENT",
        },
      });

      const student = await tx.student.create({
        data: {
          userId: user.id,
          course: courseType,
          batchId: batchId || null,
          qualification: lead.qualification,
          status: "ONBOARDING",
        },
      });

      // Update lead status
      await tx.lead.update({
        where: { id },
        data: {
          status: "ENROLLED",
          convertedToStudentId: student.id,
        },
      });

      // Add a note recording the conversion
      await tx.leadNote.create({
        data: {
          leadId: id,
          content: `Converted to student by ${session.user.name || session.user.email}. Student ID: ${student.id}`,
          createdBy: session.user.name || session.user.email,
        },
      });

      return { user, student };
    });

    // Track sale for the assigned employee
    if (lead.assignedToId) {
      try {
        const { recordSale } = await import("@/lib/incentives");
        await recordSale(lead.assignedToId);
      } catch (e) {
        console.error("Failed to record sale:", e);
      }
    }

    // Send welcome email (placeholder - log for now)
    console.log(
      `[WELCOME EMAIL] To: ${lead.email}, Temp Password: ${tempPassword}`
    );
    console.log(
      `[WELCOME EMAIL] Login URL: ${process.env.NEXTAUTH_URL || "https://edwartens.co.uk"}/login`
    );

    return NextResponse.json(
      {
        message: "Lead converted to student successfully",
        studentId: result.student.id,
        userId: result.user.id,
        tempPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Lead conversion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
