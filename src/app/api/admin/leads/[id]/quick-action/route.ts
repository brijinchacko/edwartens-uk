import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isCrmRole } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";

type QuickAction = "call" | "note" | "reschedule" | "done";
type CallResult = "ANSWERED" | "NO_ANSWER" | "BUSY";

interface QuickActionBody {
  action: QuickAction;
  content?: string;
  callResult?: CallResult;
  newDate?: string;
}

/**
 * POST /api/admin/leads/[id]/quick-action
 * Handles inline actions from the My Day dashboard.
 */
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || !isCrmRole(session.user.role as string)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;
    const userId = session.user.id as string;
    const userName = session.user.name || session.user.email || "Unknown";
    const userRole = session.user.role as string;

    const body: QuickActionBody = await req.json();
    const { action, content, callResult, newDate } = body;

    if (!action || !["call", "note", "reschedule", "done"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be: call, note, reschedule, or done" },
        { status: 400 }
      );
    }

    // Verify lead exists
    const lead = await prisma.lead.findUnique({
      where: { id },
      select: { id: true, name: true, status: true, assignedToId: true },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    let noteContent = "";
    let statusUpdate: string | null = null;
    let followUpUpdate: Date | null | undefined = undefined; // undefined = no change

    switch (action) {
      case "call": {
        const result = callResult || "NO_ANSWER";
        const msg = content ? ` \u2014 ${content}` : "";
        noteContent = `\u{1F4DE} Call: ${result}${msg}`;

        // Auto-advance status on answered call
        if (result === "ANSWERED") {
          if (lead.status === "NEW") {
            statusUpdate = "CONTACTED";
          } else if (lead.status === "CONTACTED") {
            statusUpdate = "FIRST_CALL";
          }
        }
        break;
      }

      case "note": {
        if (!content || content.trim().length === 0) {
          return NextResponse.json(
            { error: "Content is required for note action" },
            { status: 400 }
          );
        }
        noteContent = content.trim();
        break;
      }

      case "reschedule": {
        if (!newDate) {
          return NextResponse.json(
            { error: "newDate is required for reschedule action" },
            { status: 400 }
          );
        }
        const parsedDate = new Date(newDate);
        if (isNaN(parsedDate.getTime())) {
          return NextResponse.json(
            { error: "Invalid date format" },
            { status: 400 }
          );
        }
        followUpUpdate = parsedDate;
        const formatted = parsedDate.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
          timeZone: "Europe/London",
        });
        noteContent = `\u{1F4C5} Follow-up rescheduled to ${formatted}`;
        break;
      }

      case "done": {
        // Set follow-up to 7 days from now
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        followUpUpdate = sevenDaysFromNow;
        const msg = content ? ` \u2014 ${content}` : "";
        noteContent = `\u2705 Follow-up completed${msg}`;
        break;
      }
    }

    // Create the note
    await prisma.leadNote.create({
      data: {
        leadId: id,
        content: noteContent,
        createdBy: userName,
      },
    });

    // Build lead update data
    const leadUpdateData: Record<string, any> = {};
    if (statusUpdate) {
      leadUpdateData.status = statusUpdate;
    }
    if (followUpUpdate !== undefined) {
      leadUpdateData.followUpDate = followUpUpdate;
    }

    if (Object.keys(leadUpdateData).length > 0) {
      await prisma.lead.update({
        where: { id },
        data: leadUpdateData,
      });
    }

    // Audit log
    await logAudit({
      userId,
      userName,
      userRole,
      action: `QUICK_${action.toUpperCase()}`,
      entity: "lead",
      entityId: id,
      entityName: lead.name,
      details: JSON.stringify({
        action,
        content: noteContent,
        statusChange: statusUpdate,
        followUpChange: followUpUpdate,
      }),
    });

    return NextResponse.json({
      success: true,
      message: `Action "${action}" completed for ${lead.name}`,
      statusUpdated: statusUpdate,
      noteCreated: noteContent,
    });
  } catch (error) {
    console.error("Quick action error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
