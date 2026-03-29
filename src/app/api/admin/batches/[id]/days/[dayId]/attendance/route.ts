import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; dayId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "batches:manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, dayId } = await params;

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

    const attendance = await prisma.batchAttendance.findMany({
      where: { batchDayId: dayId },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    return NextResponse.json({ attendance });
  } catch (error) {
    console.error("Get attendance error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; dayId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "batches:manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, dayId } = await params;

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
    const records: { studentId: string; status: string; notes?: string }[] =
      body.records || body;

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { error: "Array of attendance records is required" },
        { status: 400 }
      );
    }

    const validStatuses = ["PRESENT", "ABSENT", "LATE", "EXCUSED"];

    // Upsert each attendance record
    const results = await prisma.$transaction(
      records.map((record) => {
        const status = validStatuses.includes(record.status)
          ? record.status
          : "ABSENT";

        return prisma.batchAttendance.upsert({
          where: {
            batchDayId_studentId: {
              batchDayId: dayId,
              studentId: record.studentId,
            },
          },
          update: {
            status,
            notes: record.notes ?? undefined,
          },
          create: {
            batchDayId: dayId,
            studentId: record.studentId,
            status,
            notes: record.notes ?? undefined,
          },
        });
      })
    );

    return NextResponse.json({
      message: `${results.length} attendance records saved`,
      attendance: results,
    });
  } catch (error) {
    console.error("Save attendance error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
