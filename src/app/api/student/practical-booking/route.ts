import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/* ------------------------------------------------------------------ */
/*  GET — Get student's practical session invitations                  */
/* ------------------------------------------------------------------ */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;
    const student = await prisma.student.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const bookings = await prisma.practicalBooking.findMany({
      where: { studentId: student.id },
      include: {
        practicalSession: {
          include: {
            batch: { select: { id: true, name: true } },
            trainer: {
              include: { user: { select: { name: true } } },
            },
          },
        },
      },
      orderBy: { invitedAt: "desc" },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Get student practical bookings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/*  POST — Respond to invitation (accept / decline)                    */
/* ------------------------------------------------------------------ */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;
    const body = await req.json();
    const { bookingId, action, reason } = body;

    if (!bookingId || !action) {
      return NextResponse.json(
        { error: "bookingId and action are required" },
        { status: 400 }
      );
    }

    if (!["accept", "decline"].includes(action)) {
      return NextResponse.json(
        { error: "action must be 'accept' or 'decline'" },
        { status: 400 }
      );
    }

    // Find the student
    const student = await prisma.student.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Find the booking and verify it belongs to this student
    const booking = await prisma.practicalBooking.findUnique({
      where: { id: bookingId },
      include: {
        practicalSession: {
          include: {
            batch: { select: { name: true } },
          },
        },
      },
    });

    if (!booking || booking.studentId !== student.id) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.status !== "INVITED") {
      return NextResponse.json(
        { error: `Booking already ${booking.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    // Check booking deadline
    if (
      booking.practicalSession.bookingDeadline &&
      new Date() > new Date(booking.practicalSession.bookingDeadline)
    ) {
      return NextResponse.json(
        { error: "Booking deadline has passed" },
        { status: 400 }
      );
    }

    // Check capacity for accepts
    if (action === "accept") {
      const acceptedCount = await prisma.practicalBooking.count({
        where: {
          practicalSessionId: booking.practicalSessionId,
          status: "ACCEPTED",
        },
      });

      if (acceptedCount >= booking.practicalSession.capacity) {
        return NextResponse.json(
          { error: "Session is at full capacity" },
          { status: 400 }
        );
      }
    }

    // Update the booking
    const updatedBooking = await prisma.practicalBooking.update({
      where: { id: bookingId },
      data: {
        status: action === "accept" ? "ACCEPTED" : "DECLINED",
        respondedAt: new Date(),
        cancelReason: action === "decline" ? reason || null : null,
      },
      include: {
        practicalSession: {
          include: {
            trainer: {
              include: { user: { select: { name: true } } },
            },
          },
        },
      },
    });

    // Notify admins
    const admins = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
      select: { id: true },
    });

    const userName = session.user.name || "A student";
    const sessionDate = booking.practicalSession.date.toLocaleDateString(
      "en-GB",
      { day: "numeric", month: "short", year: "numeric" }
    );

    await Promise.all(
      admins.map((admin) =>
        prisma.notification.create({
          data: {
            userId: admin.id,
            title: `Practical Session ${action === "accept" ? "Accepted" : "Declined"}`,
            message: `${userName} has ${action === "accept" ? "accepted" : "declined"} the practical session on ${sessionDate}.${reason ? ` Reason: ${reason}` : ""}`,
            type: "PRACTICAL_RESPONSE",
            link: "/admin/batches",
          },
        })
      )
    );

    return NextResponse.json({ booking: updatedBooking });
  } catch (error) {
    console.error("Respond to practical booking error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
