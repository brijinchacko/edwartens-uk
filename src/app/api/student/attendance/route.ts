import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id as string;

    const student = await prisma.student.findUnique({
      where: { userId },
    });
    if (!student) {
      return NextResponse.json(
        { error: "Student record not found" },
        { status: 404 }
      );
    }

    const records = await prisma.batchAttendance.findMany({
      where: { studentId: student.id },
      include: {
        batchDay: {
          include: {
            batch: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { batchDay: { date: "desc" } },
    });

    const total = records.length;
    const presentCount = records.filter((r) => r.status === "PRESENT").length;
    const absentCount = records.filter((r) => r.status === "ABSENT").length;
    const lateCount = records.filter((r) => r.status === "LATE").length;
    const excusedCount = records.filter((r) => r.status === "EXCUSED").length;
    const attendancePercentage =
      total > 0
        ? Math.round(((presentCount + lateCount) / total) * 100)
        : 0;

    return NextResponse.json({
      records,
      summary: {
        total,
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        excused: excusedCount,
        attendancePercentage,
      },
    });
  } catch (error) {
    console.error("Fetch attendance error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
