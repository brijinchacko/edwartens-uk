import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id as string;

    const { id: sessionId } = await ctx.params;

    const student = await prisma.student.findUnique({
      where: { userId },
      include: { batch: true },
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
          select: { id: true, name: true, number: true },
        },
        instructor: {
          select: {
            user: { select: { name: true } },
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

    // Get student's progress for this session
    const progress = await prisma.sessionProgress.findUnique({
      where: {
        studentId_sessionId: {
          studentId: student.id,
          sessionId,
        },
      },
    });

    // Get all sessions in this batch to compute next/previous and course nav
    let nextSessionId: string | null = null;
    let previousSessionId: string | null = null;
    let courseNav = null;

    {
      // Get sessions for this student: batch-specific + global (no batch) matching course
      const courseType = student.batch?.course || (student as any).course;
      const allSessions = await prisma.session.findMany({
        where: {
          OR: [
            ...(student.batchId ? [{ batchId: student.batchId }] : []),
            { batchId: null, phase: { course: courseType } },
          ],
        },
        include: {
          phase: { select: { id: true, number: true, name: true, order: true } },
          progress: {
            where: { studentId: student.id },
            select: { status: true },
          },
        },
        orderBy: [{ phase: { order: "asc" } }, { order: "asc" }],
      });

      // Find current index
      const currentIdx = allSessions.findIndex((s) => s.id === sessionId);

      // Build completed set for lock logic
      const completedIds = new Set(
        allSessions
          .filter((s) => s.progress[0]?.status === "COMPLETED")
          .map((s) => s.id)
      );

      // Previous session (just the one before in order)
      if (currentIdx > 0) {
        previousSessionId = allSessions[currentIdx - 1].id;
      }

      // Next session (the one after in order, if not locked)
      if (currentIdx >= 0 && currentIdx < allSessions.length - 1) {
        nextSessionId = allSessions[currentIdx + 1].id;
      }

      // Build course nav grouped by phase
      const phaseMap = new Map<
        string,
        {
          id: string;
          number: number;
          name: string;
          sessions: Array<{
            id: string;
            title: string;
            order: number;
            status: string;
            duration: number | null;
          }>;
        }
      >();

      for (let i = 0; i < allSessions.length; i++) {
        const s = allSessions[i];
        const phaseKey = s.phase.id;

        if (!phaseMap.has(phaseKey)) {
          phaseMap.set(phaseKey, {
            id: s.phase.id,
            number: s.phase.number,
            name: s.phase.name,
            sessions: [],
          });
        }

        // Determine status
        let status = "NOT_STARTED";
        if (completedIds.has(s.id)) {
          status = "COMPLETED";
        } else if (s.progress[0]?.status === "IN_PROGRESS") {
          status = "IN_PROGRESS";
        } else {
          // Check if locked (same logic as sessions list page)
          let locked = false;
          if (i > 0) {
            for (let j = i - 1; j >= 0; j--) {
              if (allSessions[j].isMandatory) {
                if (!completedIds.has(allSessions[j].id)) {
                  locked = true;
                }
                break;
              }
            }
          }
          if (locked) status = "LOCKED";
        }

        phaseMap.get(phaseKey)!.sessions.push({
          id: s.id,
          title: s.title,
          order: s.order,
          status,
          duration: s.duration,
        });
      }

      courseNav = {
        phases: Array.from(phaseMap.values()).sort(
          (a, b) => a.number - b.number
        ),
      };
    }

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
      nextSessionId,
      previousSessionId,
      courseNav,
    });
  } catch (error) {
    console.error("Fetch session error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
