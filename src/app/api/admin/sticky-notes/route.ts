import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isCrmRole } from "@/lib/rbac";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || !isCrmRole(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notes = await prisma.stickyNote.findMany({
      where: { userId: session.user.id as string },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error("StickyNotes GET error:", error);
    return NextResponse.json({ notes: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !isCrmRole(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { content = "", color = "yellow" } = body;

    const note = await prisma.stickyNote.create({
      data: {
        userId: session.user.id as string,
        content,
        color,
      },
    });

    return NextResponse.json({ note });
  } catch (error) {
    console.error("StickyNotes POST error:", error);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !isCrmRole(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, content, color } = body;

    if (!id) {
      return NextResponse.json({ error: "Note ID required" }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.stickyNote.findFirst({
      where: { id, userId: session.user.id as string },
    });
    if (!existing) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const updateData: Record<string, string> = {};
    if (content !== undefined) updateData.content = content;
    if (color !== undefined) updateData.color = color;

    const note = await prisma.stickyNote.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ note });
  } catch (error) {
    console.error("StickyNotes PATCH error:", error);
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !isCrmRole(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Note ID required" }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.stickyNote.findFirst({
      where: { id, userId: session.user.id as string },
    });
    if (!existing) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    await prisma.stickyNote.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("StickyNotes DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
