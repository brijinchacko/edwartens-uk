import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { searchEmails } from "@/lib/microsoft-graph";
import { prisma } from "@/lib/prisma";
import { isCrmRole } from "@/lib/rbac";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
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

    const { leadId } = await params;

    // Get lead's email from database
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { email: true, name: true },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Search employee's mailbox for emails to/from the lead's email
    const emails = await searchEmails(userEmail, lead.email, 30);

    const formatted = emails.map((email) => ({
      id: email.id,
      subject: email.subject || "(No Subject)",
      from: {
        name: email.from?.emailAddress?.name || "",
        email: email.from?.emailAddress?.address || "",
      },
      to: (email.toRecipients || []).map((r) => ({
        name: r.emailAddress?.name || "",
        email: r.emailAddress?.address || "",
      })),
      receivedDateTime: email.receivedDateTime,
      bodyPreview: email.bodyPreview || "",
      body: email.body?.content || "",
      isRead: email.isRead,
      hasAttachments: email.hasAttachments,
    }));

    return NextResponse.json({
      leadEmail: lead.email,
      leadName: lead.name,
      emails: formatted,
    });
  } catch (error: unknown) {
    console.error("Error fetching lead emails:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch lead emails";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
