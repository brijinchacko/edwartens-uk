import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { searchEmails, isOutlookConnected } from "@/lib/microsoft-graph";
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

    // Get employee record
    const employee = await prisma.employee.findUnique({
      where: { userId: session.user.id as string },
    });
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Check if Outlook connected
    const connection = await isOutlookConnected(employee.id);
    if (!connection.connected) {
      return NextResponse.json({
        error: "Outlook not connected. Please connect your Outlook account in Settings.",
        needsConnection: true,
      }, { status: 400 });
    }

    const { leadId } = await params;

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { email: true, name: true },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Search employee's mailbox for emails to/from the lead
    const emails = await searchEmails(employee.id, lead.email, 30);

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
    const message = error instanceof Error ? error.message : "Failed to fetch lead emails";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
