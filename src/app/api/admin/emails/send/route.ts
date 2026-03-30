import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendEmail } from "@/lib/microsoft-graph";
import { prisma } from "@/lib/prisma";
import { isCrmRole } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !isCrmRole(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const employee = await prisma.employee.findUnique({
      where: { userId: session.user.id as string },
    });
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const body = await req.json();
    const { to, subject, body: emailBody, leadId } = body;

    if (!to || !subject || !emailBody) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, body" },
        { status: 400 }
      );
    }

    // Send email via Microsoft Graph using employee's own account
    await sendEmail(employee.id, to, subject, emailBody);

    const senderName = session.user.name || session.user.email || "CRM";
    const recipientEmail = Array.isArray(to) ? to[0] : to;

    // If linked to a lead, create a LeadNote
    if (leadId) {
      await prisma.leadNote.create({
        data: {
          leadId,
          content: `[Email Sent] Subject: ${subject}\nTo: ${recipientEmail}\nSent by: ${senderName}`,
          createdBy: senderName,
        },
      });
    }

    // Also search for ALL leads matching the recipient email and log to each one
    const matchingLeads = await prisma.lead.findMany({
      where: {
        email: { equals: recipientEmail, mode: "insensitive" },
        ...(leadId ? { id: { not: leadId } } : {}),
      },
      select: { id: true },
    });

    for (const lead of matchingLeads) {
      await prisma.leadNote.create({
        data: {
          leadId: lead.id,
          content: `[Email Sent] Subject: ${subject} | To: ${recipientEmail} | By: ${senderName}`,
          createdBy: senderName,
        },
      });
    }

    // Audit log
    await logAudit({
      userId: session.user.id as string,
      userName: senderName,
      userRole: session.user.role,
      action: "SEND_EMAIL",
      entity: "email",
      entityName: subject,
      details: JSON.stringify({ to: recipientEmail, subject, leadId: leadId || null, autoLoggedLeads: matchingLeads.length }),
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error sending email:", error);
    const message = error instanceof Error ? error.message : "Failed to send email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
