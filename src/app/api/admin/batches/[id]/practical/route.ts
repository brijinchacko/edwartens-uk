import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "batches:manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const practicalSessions = await prisma.practicalSession.findMany({
      where: { batchId: id },
      include: {
        trainer: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ practicalSessions });
  } catch (error) {
    console.error("Get practical sessions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
    const body = await req.json();
    const { title, date, startTime, endTime, location, trainerId, notes } = body;

    if (!date) {
      return NextResponse.json(
        { error: "Date is required" },
        { status: 400 }
      );
    }

    const practical = await prisma.practicalSession.create({
      data: {
        batchId: id,
        title: title || "Practical Session - Milton Keynes",
        date: new Date(date),
        startTime: startTime || null,
        endTime: endTime || null,
        location: location || "8 Lyon Road, Milton Keynes, MK1 1EX",
        trainerId: trainerId || null,
        notes: notes || null,
      },
      include: {
        trainer: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    return NextResponse.json({ practical }, { status: 201 });
  } catch (error) {
    console.error("Create practical session error:", error);
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
    const practicalId = searchParams.get("practicalId");

    if (!practicalId) {
      return NextResponse.json(
        { error: "practicalId query parameter is required" },
        { status: 400 }
      );
    }

    // Verify it belongs to this batch
    const existing = await prisma.practicalSession.findFirst({
      where: { id: practicalId, batchId: id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Practical session not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const data: Record<string, unknown> = {};

    if (body.title !== undefined) data.title = body.title;
    if (body.date !== undefined) data.date = new Date(body.date);
    if (body.startTime !== undefined) data.startTime = body.startTime;
    if (body.endTime !== undefined) data.endTime = body.endTime;
    if (body.location !== undefined) data.location = body.location;
    if (body.trainerId !== undefined) data.trainerId = body.trainerId;
    if (body.status !== undefined) data.status = body.status;
    if (body.notes !== undefined) data.notes = body.notes;

    const practical = await prisma.practicalSession.update({
      where: { id: practicalId },
      data,
      include: {
        trainer: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    return NextResponse.json({ practical });
  } catch (error) {
    console.error("Update practical session error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
