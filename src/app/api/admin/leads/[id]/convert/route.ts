import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateTempPassword } from "@/lib/utils";
import { hasPermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { notifyUser, notifyEmployee, notifyAdmins } from "@/lib/notify";
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

    // If no email, generate a placeholder based on phone
    const userEmail = lead.email && lead.email.trim()
      ? lead.email.trim()
      : `${lead.phone.replace(/[^0-9]/g, "")}@noemail.edwartens.co.uk`;

    // Check if a user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userEmail },
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
          email: userEmail,
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
          counsellorId: lead.assignedToId || null,
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

    // Notifications
    await notifyUser(result.user.id, "Welcome to EDWartens!", "Your student account has been created. Complete your onboarding to get started.", "WELCOME", "/student/dashboard");
    if (lead.assignedToId) await notifyEmployee(lead.assignedToId, "Lead Converted", `${lead.name} has been enrolled as a student.`, `/admin/students/${result.student.id}`);
    await notifyAdmins("New Student Enrolled", `${lead.name} has been converted from lead to student.`, `/admin/students/${result.student.id}`);

    // Send welcome email with credentials via Outlook
    try {
      const { sendEmail } = await import("@/lib/microsoft-graph");
      const senderEmployee = await prisma.employee.findUnique({ where: { userId: session.user.id as string } });
      if (senderEmployee && lead.email) {
        const loginUrl = process.env.NEXTAUTH_URL || "https://edwartens.co.uk";
        const welcomeHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #0a0a14; padding: 30px; border-radius: 12px;">
              <h1 style="color: #ffffff; margin: 0 0 20px;">Welcome to EDWartens UK! 🎓</h1>
              <p style="color: #b0b0c0; font-size: 16px;">Hi ${lead.name},</p>
              <p style="color: #b0b0c0; font-size: 16px;">Congratulations on enrolling with EDWartens UK! Your student portal account has been created.</p>
              <div style="background: #111128; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #1e1e3a;">
                <p style="color: #b0b0c0; margin: 0 0 8px; font-size: 14px;"><strong style="color: #ffffff;">Login URL:</strong> <a href="${loginUrl}/login" style="color: #4f9cf7;">${loginUrl}/login</a></p>
                <p style="color: #b0b0c0; margin: 0 0 8px; font-size: 14px;"><strong style="color: #ffffff;">Email:</strong> ${lead.email}</p>
                <p style="color: #b0b0c0; margin: 0; font-size: 14px;"><strong style="color: #ffffff;">Temporary Password:</strong> <code style="background: #1a1a3a; padding: 2px 8px; border-radius: 4px; color: #7BC142;">${tempPassword}</code></p>
              </div>
              <p style="color: #b0b0c0; font-size: 14px;">Please log in and complete your onboarding process. You can change your password after your first login.</p>
              <p style="color: #b0b0c0; font-size: 14px;">If you have any questions, don't hesitate to reach out to your counsellor.</p>
              <hr style="border: none; border-top: 1px solid #1e1e3a; margin: 20px 0;">
              <p style="color: #666; font-size: 12px;">EDWartens UK - Industrial Automation Training</p>
            </div>
          </div>
        `;
        await sendEmail(senderEmployee.id, lead.email, "Welcome to EDWartens UK — Your Student Portal Login", welcomeHtml);
        console.log(`[WELCOME EMAIL] Sent to: ${lead.email}`);
      } else {
        console.log(`[WELCOME EMAIL] Could not send — no employee record or no email. To: ${lead.email}, Temp Password: ${tempPassword}`);
      }
    } catch (emailError) {
      // Non-blocking — email failure shouldn't break conversion
      console.error("[WELCOME EMAIL] Failed to send:", emailError);
    }

    // Audit log for student creation
    await logAudit({
      userId: session.user.id as string,
      userName: session.user.name || session.user.email,
      userRole: session.user.role,
      action: "CREATE",
      entity: "student",
      entityId: result.student.id,
      entityName: `${lead.name} (${lead.email})`,
      details: JSON.stringify({ convertedFromLeadId: id, course: courseType, batchId }),
    });

    // Audit log for lead status change
    await logAudit({
      userId: session.user.id as string,
      userName: session.user.name || session.user.email,
      userRole: session.user.role,
      action: "STATUS_CHANGE",
      entity: "lead",
      entityId: id,
      entityName: `${lead.name} (${lead.email})`,
      details: JSON.stringify({ statusChange: `${lead.status} -> ENROLLED`, convertedToStudentId: result.student.id }),
    });

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
