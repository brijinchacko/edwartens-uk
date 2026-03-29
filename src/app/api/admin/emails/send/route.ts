import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendEmail } from "@/lib/microsoft-graph";
import { prisma } from "@/lib/prisma";
import { isCrmRole } from "@/lib/rbac";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !isCrmRole(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email;
    if (!userEmail) {
      return NextResponse.json(
        { error: "No email found for user" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { to, subject, body: emailBody, leadId } = body;

    if (!to || !subject || !emailBody) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, body" },
        { status: 400 }
      );
    }

    // Send email via Microsoft Graph
    await sendEmail(userEmail, to, subject, emailBody);

    // If linked to a lead, create a LeadNote
    if (leadId) {
      await prisma.leadNote.create({
        data: {
          leadId,
          content: `[Email Sent] Subject: ${subject} To: ${to}`,
          createdBy: session.user.name || session.user.email,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error sending email:", error);
    const message =
      error instanceof Error ? error.message : "Failed to send email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
