import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAllSequences, seedDefaultSequences } from "@/lib/drip-campaigns";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as { role: string }).role;
    if (!["SUPER_ADMIN", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Seed defaults if none exist
    await seedDefaultSequences();

    const sequences = await getAllSequences();

    // Get recent logs
    const logs = await prisma.emailSequenceLog.findMany({
      orderBy: { sentAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ sequences, logs });
  } catch (error: unknown) {
    console.error("Error fetching sequences:", error);
    return NextResponse.json({ error: "Failed to fetch sequences" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as { role: string }).role;
    if (!["SUPER_ADMIN", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { id, name, description, trigger, isActive, steps } = body;

    if (id) {
      // Update existing
      const updated = await prisma.emailSequence.update({
        where: { id },
        data: {
          name: name || undefined,
          description: description !== undefined ? description : undefined,
          trigger: trigger || undefined,
          isActive: isActive !== undefined ? isActive : undefined,
        },
        include: { steps: true },
      });

      // If steps are provided, replace them
      if (steps && Array.isArray(steps)) {
        await prisma.emailSequenceStep.deleteMany({ where: { sequenceId: id } });
        for (const step of steps) {
          await prisma.emailSequenceStep.create({
            data: {
              sequenceId: id,
              stepNumber: step.stepNumber,
              delayDays: step.delayDays,
              templateId: step.templateId,
              subject: step.subject || null,
              isActive: step.isActive !== undefined ? step.isActive : true,
            },
          });
        }
      }

      return NextResponse.json({ success: true, sequence: updated });
    }

    // Create new
    if (!name || !trigger) {
      return NextResponse.json({ error: "Name and trigger are required" }, { status: 400 });
    }

    const sequence = await prisma.emailSequence.create({
      data: {
        name,
        description: description || null,
        trigger,
        isActive: isActive !== undefined ? isActive : true,
        steps: steps
          ? {
              create: steps.map((s: any) => ({
                stepNumber: s.stepNumber,
                delayDays: s.delayDays,
                templateId: s.templateId,
                subject: s.subject || null,
                isActive: s.isActive !== undefined ? s.isActive : true,
              })),
            }
          : undefined,
      },
      include: { steps: true },
    });

    return NextResponse.json({ success: true, sequence }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error managing sequence:", error);
    const message = error instanceof Error ? error.message : "Failed to manage sequence";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as { role: string }).role;
    if (!["SUPER_ADMIN", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Sequence ID required" }, { status: 400 });
    }

    await prisma.emailSequence.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error deleting sequence:", error);
    return NextResponse.json({ error: "Failed to delete sequence" }, { status: 500 });
  }
}
