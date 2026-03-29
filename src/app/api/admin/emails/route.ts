import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserEmails, searchEmails } from "@/lib/microsoft-graph";
import { isCrmRole } from "@/lib/rbac";

export async function GET(req: NextRequest) {
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

    const { searchParams } = req.nextUrl;
    const count = parseInt(searchParams.get("count") || "20", 10);
    const search = searchParams.get("search");

    let emails;
    if (search) {
      emails = await searchEmails(userEmail, search, count);
    } else {
      emails = await getUserEmails(userEmail, count);
    }

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
      bodyContentType: email.body?.contentType || "text",
      isRead: email.isRead,
      conversationId: email.conversationId,
      hasAttachments: email.hasAttachments,
    }));

    return NextResponse.json({ emails: formatted });
  } catch (error: unknown) {
    console.error("Error fetching emails:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch emails";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
