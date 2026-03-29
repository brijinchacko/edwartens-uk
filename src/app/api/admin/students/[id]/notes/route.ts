import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = (session.user as { role: string }).role;
    if (!hasPermission(role, "students:read")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { content, type } = body;

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // Create a journey event as a note
    const note = await prisma.studentJourney.create({
      data: {
        studentId: id,
        eventType: "NOTE_ADDED",
        title: type || "Note",
        description: content,
        createdBy: session.user.name || session.user.email || "Admin",
        metadata: {
          agentId: (session.user as { id: string }).id,
          agentName: session.user.name || "Unknown",
          agentRole: role,
        },
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("Student note error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
