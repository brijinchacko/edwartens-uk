import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTestSession } from "@/lib/test-session";

export async function GET() {
  try {
    const session = getTestSession("STUDENT");
    const userId = session.user.id;

    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student record not found" },
        { status: 404 }
      );
    }

    // Get application logs
    const logs = await prisma.jobApplicationLog.findMany({
      where: { studentId: student.id },
      orderBy: { date: "desc" },
      take: 50,
    });

    // Get weekly job shares
    const weeklyShares = await prisma.weeklyJobShare.findMany({
      where: { studentId: student.id },
      orderBy: { weekStarting: "desc" },
      take: 10,
    });

    // Calculate totals per platform
    const allLogs = await prisma.jobApplicationLog.findMany({
      where: { studentId: student.id },
    });

    const totals = {
      CV_LIBRARY: 0,
      LINKEDIN: 0,
      INDEED: 0,
      OTHER: 0,
    };

    for (const log of allLogs) {
      const key = log.platform as keyof typeof totals;
      if (key in totals) {
        totals[key] += log.count;
      }
    }

    return NextResponse.json({ logs, weeklyShares, totals });
  } catch (error) {
    console.error("Job applications GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student record not found" },
        { status: 404 }
      );
    }

    const { platform, count, notes } = await req.json();

    const validPlatforms = ["CV_LIBRARY", "LINKEDIN", "INDEED", "OTHER"];
    if (!platform || !validPlatforms.includes(platform)) {
      return NextResponse.json(
        { error: "Invalid platform" },
        { status: 400 }
      );
    }

    if (!count || count < 1) {
      return NextResponse.json(
        { error: "Count must be at least 1" },
        { status: 400 }
      );
    }

    const log = await prisma.jobApplicationLog.create({
      data: {
        studentId: student.id,
        platform,
        count,
        notes: notes || null,
      },
    });

    // Log journey event
    await prisma.studentJourney.create({
      data: {
        studentId: student.id,
        eventType: "JOB_APPLICATION",
        title: "Job Applications Logged",
        description: `${count} application(s) logged on ${platform.replace("_", " ")}.`,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error("Job applications POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
