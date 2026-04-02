import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isCrmRole } from "@/lib/rbac";
import { suggestFollowUp, draftMessage } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !isCrmRole(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, leadId, messageType } = body;

    if (!action) {
      return NextResponse.json({ error: "Action required" }, { status: 400 });
    }

    let result;

    switch (action) {
      case "suggest-followup":
        if (!leadId) return NextResponse.json({ error: "leadId required" }, { status: 400 });
        result = await suggestFollowUp(leadId);
        break;

      case "draft-message":
        if (!leadId || !messageType) return NextResponse.json({ error: "leadId and messageType required" }, { status: 400 });
        result = await draftMessage(leadId, messageType);
        break;

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ result: result.content });
  } catch (error) {
    console.error("AI API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
