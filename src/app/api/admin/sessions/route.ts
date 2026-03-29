import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "sessions:manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const phaseId = searchParams.get("phaseId");
    const batchId = searchParams.get("batchId");
    const course = searchParams.get("course");

    const where: Record<string, unknown> = {};
    if (phaseId) where.phaseId = phaseId;
    if (batchId) where.batchId = batchId;
    if (course) {
      where.phase = { course };
    }

    const sessions = await prisma.session.findMany({
      where,
      include: {
        phase: {
          select: { id: true, number: true, name: true, course: true },
        },
        batch: {
          select: { id: true, name: true },
        },
        instructor: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        _count: {
          select: { progress: true },
        },
      },
      orderBy: [{ phase: { order: "asc" } }, { order: "asc" }],
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Admin sessions list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "sessions:manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      phaseId,
      batchId,
      instructorId,
      videoUrl,
      videoPlatform,
      videoId,
      thumbnailUrl,
      duration,
      isMandatory,
      order,
      materials,
    } = body;

    if (!title || !phaseId || order === undefined) {
      return NextResponse.json(
        { error: "Title, phaseId, and order are required" },
        { status: 400 }
      );
    }

    const phase = await prisma.phase.findUnique({ where: { id: phaseId } });
    if (!phase) {
      return NextResponse.json({ error: "Phase not found" }, { status: 404 });
    }

    const newSession = await prisma.session.create({
      data: {
        title,
        description: description || null,
        phaseId,
        batchId: batchId || null,
        instructorId: instructorId || null,
        videoUrl: videoUrl || null,
        videoPlatform: videoPlatform || null,
        videoId: videoId || null,
        thumbnailUrl: thumbnailUrl || null,
        duration: duration || null,
        isMandatory: isMandatory !== undefined ? isMandatory : true,
        order,
        materials: materials || null,
      },
      include: {
        phase: {
          select: { id: true, number: true, name: true, course: true },
        },
        batch: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(newSession, { status: 201 });
  } catch (error) {
    console.error("Admin session create error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "sessions:manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    // Delete progress records first
    await prisma.sessionProgress.deleteMany({ where: { sessionId: id } });
    await prisma.session.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin session delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
