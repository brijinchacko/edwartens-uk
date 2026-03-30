import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";

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

    const batch = await prisma.batch.findUnique({
      where: { id },
      include: {
        students: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
                avatar: true,
              },
            },
          },
        },
        batchDays: {
          include: {
            attendance: {
              include: {
                student: {
                  include: {
                    user: { select: { name: true, email: true } },
                  },
                },
              },
            },
          },
          orderBy: { dayNumber: "asc" },
        },
        readiness: {
          include: {
            student: {
              include: {
                user: { select: { name: true, email: true } },
              },
            },
          },
        },
        practicalSessions: {
          include: {
            trainer: {
              include: {
                user: { select: { name: true, email: true } },
              },
            },
            bookings: {
              include: {
                student: {
                  include: {
                    user: { select: { name: true, email: true } },
                  },
                },
              },
            },
          },
          orderBy: { date: "asc" },
        },
        instructor: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
          },
        },
        _count: {
          select: { students: true, sessions: true },
        },
      },
    });

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    return NextResponse.json({ batch });
  } catch (error) {
    console.error("Batch detail GET error:", error);
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
    const body = await req.json();

    const allowedFields = [
      "status",
      "instructorId",
      "teamsLink",
      "mode",
      "trainerFeedback",
      "trainerAccepted",
      "batchReady",
      "location",
      "capacity",
    ];

    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        data[field] = body[field];
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const batch = await prisma.batch.update({
      where: { id },
      data,
      include: {
        instructor: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    // Audit log
    await logAudit({
      userId: session.user.id as string,
      userName: session.user.name || session.user.email,
      userRole: session.user.role,
      action: "UPDATE",
      entity: "batch",
      entityId: id,
      entityName: batch.name,
      details: JSON.stringify(data),
    });

    return NextResponse.json({ batch });
  } catch (error) {
    console.error("Batch detail PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
