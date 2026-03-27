import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const batches = await prisma.batch.findMany({
      where: {
        status: "UPCOMING",
        startDate: { gte: new Date() },
      },
      include: {
        instructor: {
          include: { user: { select: { name: true } } },
        },
        _count: { select: { students: true } },
      },
      orderBy: { startDate: "asc" },
    });

    const result = batches.map((b) => ({
      id: b.id,
      name: b.name,
      course: b.course,
      startDate: b.startDate.toISOString(),
      endDate: b.endDate?.toISOString() || null,
      capacity: b.capacity,
      enrolledCount: b._count.students,
      availableSeats: b.capacity - b._count.students,
      location: b.location || "Milton Keynes",
      instructor: b.instructor?.user?.name || null,
      status: b.status,
    }));

    return NextResponse.json({ batches: result });
  } catch (error) {
    console.error("Batches API error:", error);
    return NextResponse.json({ error: "Failed to fetch batches" }, { status: 500 });
  }
}
