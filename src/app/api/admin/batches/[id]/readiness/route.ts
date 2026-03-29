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

    const readiness = await prisma.batchReadiness.findMany({
      where: { batchId: id },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    return NextResponse.json({ readiness });
  } catch (error) {
    console.error("Get readiness error:", error);
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

    // Check for verify-all action
    if (body.action === "verify-all") {
      const allReadiness = await prisma.batchReadiness.findMany({
        where: { batchId: id },
      });

      const allReady = allReadiness.length > 0 && allReadiness.every((r) => r.isReady);

      if (allReady) {
        await prisma.batch.update({
          where: { id },
          data: { batchReady: true },
        });
        return NextResponse.json({
          message: "All students ready. Batch marked as ready.",
          batchReady: true,
        });
      }

      return NextResponse.json({
        message: "Not all students are ready yet.",
        batchReady: false,
        readyCount: allReadiness.filter((r) => r.isReady).length,
        totalCount: allReadiness.length,
      });
    }

    // Create/update individual readiness
    const { studentId, feePaid, documentsUploaded, softwareInstalled, softwareVerified, prerequisitesDone, notes } = body;

    if (!studentId) {
      return NextResponse.json(
        { error: "studentId is required" },
        { status: 400 }
      );
    }

    const boolFields = {
      feePaid: feePaid ?? false,
      documentsUploaded: documentsUploaded ?? false,
      softwareInstalled: softwareInstalled ?? false,
      softwareVerified: softwareVerified ?? false,
      prerequisitesDone: prerequisitesDone ?? false,
    };

    const isReady = Object.values(boolFields).every(Boolean);

    const readiness = await prisma.batchReadiness.upsert({
      where: {
        batchId_studentId: {
          batchId: id,
          studentId,
        },
      },
      update: {
        ...boolFields,
        isReady,
        notes: notes ?? undefined,
        verifiedBy: isReady ? session.user.id : null,
        verifiedAt: isReady ? new Date() : null,
      },
      create: {
        batchId: id,
        studentId,
        ...boolFields,
        isReady,
        notes: notes ?? undefined,
        verifiedBy: isReady ? session.user.id : null,
        verifiedAt: isReady ? new Date() : null,
      },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    return NextResponse.json({ readiness });
  } catch (error) {
    console.error("Update readiness error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
