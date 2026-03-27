import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "batches:manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const status = searchParams.get("status");
    const course = searchParams.get("course");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (course) where.course = course;

    const batches = await prisma.batch.findMany({
      where,
      include: {
        instructor: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        _count: {
          select: { students: true, sessions: true },
        },
      },
      orderBy: { startDate: "desc" },
    });

    return NextResponse.json({ batches });
  } catch (error) {
    console.error("Admin batches list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "batches:manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      course,
      startDate,
      endDate,
      capacity,
      instructorId,
      location,
    } = body;

    if (!name || !course || !startDate) {
      return NextResponse.json(
        { error: "Name, course, and start date are required" },
        { status: 400 }
      );
    }

    const batch = await prisma.batch.create({
      data: {
        name,
        course,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        capacity: capacity || 15,
        instructorId: instructorId || null,
        location: location || "Milton Keynes",
      },
      include: {
        instructor: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    return NextResponse.json(batch, { status: 201 });
  } catch (error) {
    console.error("Admin batch create error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "batches:manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const batchId = searchParams.get("id");
    if (!batchId) {
      return NextResponse.json({ error: "Batch ID required" }, { status: 400 });
    }

    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: { _count: { select: { students: true } } },
    });

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    if (batch._count.students > 0) {
      // Don't delete, just cancel
      await prisma.batch.update({
        where: { id: batchId },
        data: { status: "CANCELLED" },
      });
      return NextResponse.json({ message: "Batch cancelled (has enrolled students)" });
    }

    await prisma.batch.delete({ where: { id: batchId } });
    return NextResponse.json({ message: "Batch deleted" });
  } catch (error) {
    console.error("Batch delete error:", error);
    return NextResponse.json({ error: "Failed to delete batch" }, { status: 500 });
  }
}
