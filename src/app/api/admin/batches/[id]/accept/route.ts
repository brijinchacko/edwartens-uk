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
      include: {
        instructor: {
          select: { userId: true },
        },
      },
    });

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    // Only the assigned trainer can accept
    if (!batch.instructor || batch.instructor.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the assigned trainer can accept this batch" },
        { status: 403 }
      );
    }

    if (batch.trainerAccepted) {
      return NextResponse.json(
        { error: "Batch already accepted" },
        { status: 400 }
      );
    }

    const updated = await prisma.batch.update({
      where: { id },
      data: {
        trainerAccepted: true,
        trainerAcceptedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Batch accepted successfully",
      batch: updated,
    });
  } catch (error) {
    console.error("Trainer accept batch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
