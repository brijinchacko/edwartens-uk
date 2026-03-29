import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "leads:read")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const employee = await prisma.employee.findUnique({
      where: { userId: session.user.id },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Employee profile not found" },
        { status: 404 }
      );
    }

    const tasks = await prisma.whatsAppTask.findMany({
      where: {
        employeeId: employee.id,
        status: { in: ["PENDING", "SENT"] },
      },
      include: {
        lead: {
          select: { id: true, name: true, phone: true, email: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("WhatsApp tasks GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "leads:write")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { leadId, message, phoneNumber } = body;

    if (!leadId || !message || !phoneNumber) {
      return NextResponse.json(
        { error: "leadId, message, and phoneNumber are required" },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.findUnique({
      where: { userId: session.user.id },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Employee profile not found" },
        { status: 404 }
      );
    }

    // Check lead exists
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const task = await prisma.whatsAppTask.create({
      data: {
        leadId,
        employeeId: employee.id,
        message,
        phoneNumber,
      },
      include: {
        lead: {
          select: { id: true, name: true, phone: true, email: true },
        },
      },
    });

    return NextResponse.json({ task });
  } catch (error) {
    console.error("WhatsApp tasks POST error:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "leads:read")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { taskId, note, action } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: "taskId is required" },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.findUnique({
      where: { userId: session.user.id },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Employee profile not found" },
        { status: 404 }
      );
    }

    const task = await prisma.whatsAppTask.findUnique({
      where: { id: taskId },
    });

    if (!task || task.employeeId !== employee.id) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (action === "mark_sent") {
      // Mark as sent (intermediate step)
      const updated = await prisma.whatsAppTask.update({
        where: { id: taskId },
        data: {
          status: "SENT",
          sentAt: new Date(),
        },
      });
      return NextResponse.json({ task: updated });
    }

    // Full acknowledge
    const updated = await prisma.whatsAppTask.update({
      where: { id: taskId },
      data: {
        status: "ACKNOWLEDGED",
        acknowledgedAt: new Date(),
        acknowledgeNote: note || null,
        sentAt: task.sentAt || new Date(),
      },
    });

    return NextResponse.json({ task: updated });
  } catch (error) {
    console.error("WhatsApp tasks PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}
