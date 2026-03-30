import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";

/* ------------------------------------------------------------------ */
/*  GET — List all practical sessions with booking status              */
/* ------------------------------------------------------------------ */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "batches:manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessions = await prisma.practicalSession.findMany({
      include: {
        batch: { select: { id: true, name: true } },
        trainer: {
          include: { user: { select: { name: true, email: true } } },
        },
        bookings: {
          include: {
            student: {
              include: { user: { select: { name: true, email: true } } },
            },
          },
        },
      },
      orderBy: { date: "desc" },
    });

    const result = sessions.map((s) => {
      const accepted = s.bookings.filter((b) => b.status === "ACCEPTED").length;
      const declined = s.bookings.filter((b) => b.status === "DECLINED").length;
      const pending = s.bookings.filter((b) => b.status === "INVITED").length;
      const cancelled = s.bookings.filter((b) => b.status === "CANCELLED").length;
      return {
        ...s,
        acceptedCount: accepted,
        declinedCount: declined,
        pendingCount: pending,
        cancelledCount: cancelled,
      };
    });

    return NextResponse.json({ sessions: result });
  } catch (error) {
    console.error("Get practical bookings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/*  POST — Schedule practical session and invite students              */
/* ------------------------------------------------------------------ */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "batches:manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      batchId,
      title,
      date,
      startTime,
      endTime,
      trainerId,
      location,
      capacity,
      minCapacity,
      bookingDeadline,
      studentIds,
    } = body;

    if (!batchId || !date) {
      return NextResponse.json(
        { error: "batchId and date are required" },
        { status: 400 }
      );
    }

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: "studentIds array is required" },
        { status: 400 }
      );
    }

    // Create the practical session
    const practical = await prisma.practicalSession.create({
      data: {
        batchId,
        title: title || "Practical Session - Milton Keynes",
        date: new Date(date),
        startTime: startTime || null,
        endTime: endTime || null,
        location: location || "8 Lyon Road, Milton Keynes, MK1 1EX",
        trainerId: trainerId || null,
        capacity: capacity || 6,
        minCapacity: minCapacity || 3,
        bookingDeadline: bookingDeadline ? new Date(bookingDeadline) : null,
      },
    });

    // Create bookings for each student
    const bookings = await Promise.all(
      studentIds.map((studentId: string) =>
        prisma.practicalBooking.create({
          data: {
            practicalSessionId: practical.id,
            studentId,
            status: "INVITED",
          },
        })
      )
    );

    // Create notifications for each student
    const students = await prisma.student.findMany({
      where: { id: { in: studentIds } },
      include: { user: { select: { id: true, name: true } } },
    });

    await Promise.all(
      students.map((student) =>
        prisma.notification.create({
          data: {
            userId: student.user.id,
            title: "Practical Session Invitation",
            message: `You have been invited to a practical session on ${new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}. Please respond by accepting or declining.`,
            type: "PRACTICAL_INVITE",
            link: "/student/practical",
          },
        })
      )
    );

    // Return the session with bookings
    const result = await prisma.practicalSession.findUnique({
      where: { id: practical.id },
      include: {
        batch: { select: { id: true, name: true } },
        trainer: {
          include: { user: { select: { name: true, email: true } } },
        },
        bookings: {
          include: {
            student: {
              include: { user: { select: { name: true, email: true } } },
            },
          },
        },
      },
    });

    return NextResponse.json({ session: result, bookings }, { status: 201 });
  } catch (error) {
    console.error("Create practical booking error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
