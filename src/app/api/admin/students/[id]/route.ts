import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { notifyStudent, notifyEmployee } from "@/lib/notify";

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "students:write")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;
    const body = await req.json();

    const existing = await prisma.student.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Allow updating: status, batchId, currentPhase, counsellorId, paymentStatus, paidAmount
    const updateData: Record<string, unknown> = {};
    if (body.status !== undefined) updateData.status = body.status;
    if (body.batchId !== undefined) updateData.batchId = body.batchId || null;
    if (body.currentPhase !== undefined) updateData.currentPhase = body.currentPhase;
    if (body.counsellorId !== undefined) updateData.counsellorId = body.counsellorId || null;
    if (body.paymentStatus !== undefined) updateData.paymentStatus = body.paymentStatus;
    if (body.paidAmount !== undefined) updateData.paidAmount = body.paidAmount;

    const student = await prisma.student.update({
      where: { id },
      data: updateData,
      include: { user: { select: { name: true, email: true } } },
    });

    // Create a journey note for status changes when statusNote is provided
    if (body.statusNote && body.status !== undefined && body.status !== existing.status) {
      const noteContent = `[Status changed: ${existing.status} \u2192 ${body.status}] ${body.statusNote}`;
      await prisma.studentJourney.create({
        data: {
          studentId: id,
          eventType: "STATUS_CHANGE",
          title: "Status Change",
          description: noteContent,
          createdBy: session.user.name || session.user.email || "Admin",
          metadata: {
            agentId: session.user.id as string,
            agentName: session.user.name || "Unknown",
            agentRole: session.user.role,
            previousStatus: existing.status,
            newStatus: body.status,
          },
        },
      });
    }

    // Notifications for batch assignment
    if (body.batchId && body.batchId !== existing.batchId) {
      const batch = await prisma.batch.findUnique({ where: { id: body.batchId }, select: { name: true, instructorId: true } });
      await notifyStudent(id, "Batch Assigned", `You have been assigned to batch ${batch?.name}. Check your dashboard for details.`, "/student/dashboard");
      if (batch?.instructorId) await notifyEmployee(batch.instructorId, "New Batch Student", `A student has been assigned to ${batch.name}.`, `/admin/batches/${body.batchId}`);
    }

    // Audit log
    await logAudit({
      userId: session.user.id as string,
      userName: session.user.name || session.user.email,
      userRole: session.user.role,
      action: body.status !== undefined && body.status !== existing.status ? "STATUS_CHANGE" : "UPDATE",
      entity: "student",
      entityId: id,
      entityName: `${student.user.name} (${student.user.email})`,
      details: JSON.stringify(updateData),
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error("Admin student update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
