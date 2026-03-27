import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: sessionId } = await ctx.params;
    const body = await req.json();
    const { watchedSeconds, status } = body;

    // Get student record for current user
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    });
    if (!student) {
      return NextResponse.json(
        { error: "Student record not found" },
        { status: 404 }
      );
    }

    // Verify the session exists
    const trainingSession = await prisma.session.findUnique({
      where: { id: sessionId },
    });
    if (!trainingSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Upsert session progress
    const updateData: Record<string, unknown> = {
      lastAccessedAt: new Date(),
    };

    if (watchedSeconds !== undefined) {
      updateData.watchedSeconds = watchedSeconds;
    }

    if (status === "COMPLETED") {
      updateData.status = "COMPLETED";
      updateData.completedAt = new Date();
    } else if (status === "IN_PROGRESS") {
      updateData.status = "IN_PROGRESS";
    }

    const progress = await prisma.sessionProgress.upsert({
      where: {
        studentId_sessionId: {
          studentId: student.id,
          sessionId,
        },
      },
      update: updateData,
      create: {
        studentId: student.id,
        sessionId,
        watchedSeconds: watchedSeconds || 0,
        status: status || "IN_PROGRESS",
        lastAccessedAt: new Date(),
        ...(status === "COMPLETED" ? { completedAt: new Date() } : {}),
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Session progress update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
