import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTestSession } from "@/lib/test-session";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = getTestSession("STUDENT");
    const userId = session.user.id;

    const { id: sessionId } = await ctx.params;

    const student = await prisma.student.findUnique({
      where: { userId },
    });
    if (!student) {
      return NextResponse.json(
        { error: "Student record not found" },
        { status: 404 }
      );
    }

    const trainingSession = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        phase: {
          select: {
            id: true,
            name: true,
            number: true,
          },
        },
        instructor: {
          select: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!trainingSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Get the student's progress for this session
    const progress = await prisma.sessionProgress.findUnique({
      where: {
        studentId_sessionId: {
          studentId: student.id,
          sessionId,
        },
      },
    });

    return NextResponse.json({
      id: trainingSession.id,
      title: trainingSession.title,
      description: trainingSession.description,
      videoUrl: trainingSession.videoUrl,
      videoPlatform: trainingSession.videoPlatform,
      videoId: trainingSession.videoId,
      thumbnailUrl: trainingSession.thumbnailUrl,
      duration: trainingSession.duration,
      isMandatory: trainingSession.isMandatory,
      order: trainingSession.order,
      materials: trainingSession.materials,
      phase: trainingSession.phase,
      instructorName: trainingSession.instructor?.user?.name || null,
      progress: progress
        ? {
            status: progress.status,
            watchedSeconds: progress.watchedSeconds,
            completedAt: progress.completedAt,
            lastAccessedAt: progress.lastAccessedAt,
          }
        : null,
    });
  } catch (error) {
    console.error("Fetch session error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
