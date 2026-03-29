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

    const employee = await prisma.employee.findUnique({
      where: { userId: session.user.id },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee record not found" }, { status: 404 });
    }

    // Get current active session (not checked out)
    const activeSession = await prisma.employeeWorkSession.findFirst({
      where: {
        employeeId: employee.id,
        status: { not: "CHECKED_OUT" },
      },
      orderBy: { checkInAt: "desc" },
      include: {
        activities: { orderBy: { startedAt: "desc" } },
        breaks: { orderBy: { startedAt: "desc" } },
      },
    });

    // Get today's sessions history
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todaySessions = await prisma.employeeWorkSession.findMany({
      where: {
        employeeId: employee.id,
        checkInAt: { gte: todayStart, lte: todayEnd },
      },
      orderBy: { checkInAt: "desc" },
      include: {
        activities: { orderBy: { startedAt: "asc" } },
        breaks: { orderBy: { startedAt: "asc" } },
      },
    });

    return NextResponse.json({ activeSession, todaySessions });
  } catch (error) {
    console.error("Work session GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !isCrmRole(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { workLocation, note } = body;

    if (!workLocation || !["HOME", "OFFICE", "REMOTE"].includes(workLocation)) {
      return NextResponse.json(
        { error: "Invalid workLocation. Must be HOME, OFFICE, or REMOTE" },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.findUnique({
      where: { userId: session.user.id },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee record not found" }, { status: 404 });
    }

    // Check no active session exists
    const existingSession = await prisma.employeeWorkSession.findFirst({
      where: {
        employeeId: employee.id,
        status: { not: "CHECKED_OUT" },
      },
    });

    if (existingSession) {
      return NextResponse.json(
        { error: "You already have an active work session. Please check out first." },
        { status: 409 }
      );
    }

    const now = new Date();

    // Create work session and initial ACTIVE activity in a transaction
    const workSession = await prisma.$transaction(async (tx) => {
      const newSession = await tx.employeeWorkSession.create({
        data: {
          employeeId: employee.id,
          date: now,
          checkInAt: now,
          workLocation,
          checkInNote: note || null,
          status: "CHECKED_IN",
        },
      });

      await tx.employeeActivity.create({
        data: {
          sessionId: newSession.id,
          type: "ACTIVE",
          startedAt: now,
        },
      });

      return tx.employeeWorkSession.findUnique({
        where: { id: newSession.id },
        include: {
          activities: true,
          breaks: true,
        },
      });
    });

    return NextResponse.json({ session: workSession }, { status: 201 });
  } catch (error) {
    console.error("Work session check-in error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
