import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "batches:manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const batch = await prisma.batch.findUnique({
      where: { id },
      select: { startDate: true, endDate: true },
    });

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    if (!batch.endDate) {
      return NextResponse.json(
        { error: "Batch must have an end date to generate days" },
        { status: 400 }
      );
    }

    // Check if days already exist
    const existingDays = await prisma.batchDay.count({
      where: { batchId: id },
    });

    if (existingDays > 0) {
      return NextResponse.json(
        { error: "Batch days already generated. Delete existing days first." },
        { status: 400 }
      );
    }

    // Generate weekday dates between start and end
    const start = new Date(batch.startDate);
    const end = new Date(batch.endDate);
    const days: { batchId: string; dayNumber: number; date: Date }[] = [];
    let dayNumber = 1;
    const current = new Date(start);

    while (current <= end) {
      const dayOfWeek = current.getDay();
      // 0 = Sunday, 6 = Saturday — skip weekends
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // dayNumber cycles 1-5 for each week
        const weekDayNum = ((dayNumber - 1) % 5) + 1;
        days.push({
          batchId: id,
          dayNumber: weekDayNum,
          date: new Date(current),
        });
        dayNumber++;
      }
      current.setDate(current.getDate() + 1);
    }

    if (days.length === 0) {
      return NextResponse.json(
        { error: "No weekdays found between start and end date" },
        { status: 400 }
      );
    }

    // Use sequential day numbers instead of cycling
    const daysWithSequential = days.map((d, idx) => ({
      ...d,
      dayNumber: idx + 1,
    }));

    // Create in transaction to avoid partial inserts
    await prisma.$transaction(
      daysWithSequential.map((day) =>
        prisma.batchDay.create({ data: day })
      )
    );

    return NextResponse.json(
      { message: `${daysWithSequential.length} batch days generated`, count: daysWithSequential.length },
      { status: 201 }
    );
  } catch (error) {
    console.error("Generate batch days error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "batches:manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = req.nextUrl;
    const dayId = searchParams.get("dayId");

    if (!dayId) {
      return NextResponse.json(
        { error: "dayId query parameter is required" },
        { status: 400 }
      );
    }

    // Verify the day belongs to this batch
    const day = await prisma.batchDay.findFirst({
      where: { id: dayId, batchId: id },
    });

    if (!day) {
      return NextResponse.json(
        { error: "Batch day not found" },
        { status: 404 }
      );
    }

    const body = await req.json();

    const data: Record<string, unknown> = {};
    if (body.startedAt !== undefined) data.startedAt = body.startedAt ? new Date(body.startedAt) : null;
    if (body.endedAt !== undefined) data.endedAt = body.endedAt ? new Date(body.endedAt) : null;
    if (body.breakStartedAt !== undefined) data.breakStartedAt = body.breakStartedAt ? new Date(body.breakStartedAt) : null;
    if (body.breakEndedAt !== undefined) data.breakEndedAt = body.breakEndedAt ? new Date(body.breakEndedAt) : null;
    if (body.topic !== undefined) data.topic = body.topic;
    if (body.trainerNotes !== undefined) data.trainerNotes = body.trainerNotes;
    if (body.status !== undefined) data.status = body.status;
    if (body.startedBy !== undefined) data.startedBy = body.startedBy;

    const updated = await prisma.batchDay.update({
      where: { id: dayId },
      data,
      include: {
        attendance: {
          include: {
            student: {
              include: { user: { select: { name: true } } },
            },
          },
        },
      },
    });

    return NextResponse.json({ day: updated });
  } catch (error) {
    console.error("Update batch day error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
