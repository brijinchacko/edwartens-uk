import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";

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
    const {
      feedback,
      duration,
      outcome,
      nextFollowUpDate,
      nextFollowUpMedium,
      notes,
    } = body;

    // Validate required fields
    if (!feedback?.trim()) {
      return NextResponse.json(
        { error: "Feedback is required" },
        { status: 400 }
      );
    }
    if (!outcome) {
      return NextResponse.json(
        { error: "Outcome is required" },
        { status: 400 }
      );
    }

    const validOutcomes = [
      "INTERESTED",
      "NOT_INTERESTED",
      "CALLBACK",
      "NO_ANSWER",
      "DROPPED",
    ];
    if (!validOutcomes.includes(outcome)) {
      return NextResponse.json(
        { error: "Invalid outcome" },
        { status: 400 }
      );
    }

    // Check lead exists
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const outcomeLabels: Record<string, string> = {
      INTERESTED: "Interested",
      NOT_INTERESTED: "Not Interested",
      CALLBACK: "Callback Required",
      NO_ANSWER: "No Answer",
      DROPPED: "Dropped",
    };

    const createdBy = session.user.name || session.user.email;
    const durationStr = duration ? `${duration} min` : "N/A";

    // Build formatted note content
    let noteContent = `\u{1F4DE} Call Log | Duration: ${durationStr} | Outcome: ${outcomeLabels[outcome]}`;
    noteContent += `\nFeedback: ${feedback.trim()}`;
    if (notes?.trim()) {
      noteContent += `\nNotes: ${notes.trim()}`;
    }
    if (nextFollowUpDate) {
      const followDate = new Date(nextFollowUpDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      noteContent += `\nNext Follow-up: ${followDate}`;
      if (nextFollowUpMedium) {
        noteContent += ` via ${nextFollowUpMedium}`;
      }
    }
    noteContent += `\n\u2014 Logged by ${createdBy} at ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;

    // Create the lead note
    await prisma.leadNote.create({
      data: {
        leadId: id,
        content: noteContent,
        createdBy,
      },
    });

    // Build lead update data
    const leadUpdate: Record<string, unknown> = {};

    // If outcome is DROPPED -> mark lead as LOST
    if (outcome === "DROPPED") {
      leadUpdate.status = "LOST";
    }

    // If outcome is INTERESTED -> mark lead as QUALIFIED
    if (outcome === "INTERESTED") {
      leadUpdate.status = "QUALIFIED";
    }

    // If nextFollowUpDate -> update lead.followUpDate
    if (nextFollowUpDate) {
      leadUpdate.followUpDate = new Date(nextFollowUpDate);
    }

    // Update lead if there are changes
    let updatedLead = lead;
    if (Object.keys(leadUpdate).length > 0) {
      updatedLead = await prisma.lead.update({
        where: { id },
        data: leadUpdate,
      });
    }

    // Return updated lead with notes
    const fullLead = await prisma.lead.findUnique({
      where: { id },
      include: {
        assignedTo: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        notes: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json(fullLead, { status: 201 });
  } catch (error) {
    console.error("Call log create error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
