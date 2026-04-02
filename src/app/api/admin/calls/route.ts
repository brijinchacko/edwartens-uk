import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { initiateCallback, getCallRecording, isZadarmaEnabled } from "@/lib/zadarma";

// GET: Fetch call logs with filtering
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as { role: string }).role;
  if (!hasPermission(role, "leads:read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const leadId = searchParams.get("leadId");
  const studentId = searchParams.get("studentId");
  const userId = searchParams.get("userId");
  const direction = searchParams.get("direction");
  const status = searchParams.get("status");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const page = parseInt(searchParams.get("page") || "1", 10);

  const where: Record<string, unknown> = {};
  if (leadId) where.leadId = leadId;
  if (studentId) where.studentId = studentId;
  if (userId) where.userId = userId;
  if (direction) where.direction = direction;
  if (status) where.status = status;
  if (dateFrom || dateTo) {
    where.startedAt = {};
    if (dateFrom) (where.startedAt as Record<string, unknown>).gte = new Date(dateFrom);
    if (dateTo) (where.startedAt as Record<string, unknown>).lte = new Date(dateTo);
  }

  const [calls, total] = await Promise.all([
    prisma.callLog.findMany({
      where,
      include: {
        lead: { select: { id: true, name: true, phone: true } },
        student: { select: { id: true, user: { select: { name: true, phone: true } } } },
        user: { select: { id: true, name: true } },
      },
      orderBy: { startedAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
    }),
    prisma.callLog.count({ where }),
  ]);

  return NextResponse.json({
    calls,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

// POST: Initiate a click-to-call
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as { role: string }).role;
  if (!hasPermission(role, "leads:read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!isZadarmaEnabled()) {
    return NextResponse.json({ error: "Zadarma not configured" }, { status: 400 });
  }

  const body = await req.json();
  const { sipExtension, phoneNumber, leadId, studentId } = body;

  if (!sipExtension || !phoneNumber) {
    return NextResponse.json({ error: "sipExtension and phoneNumber are required" }, { status: 400 });
  }

  try {
    const result = await initiateCallback(sipExtension, phoneNumber);

    // Log the outbound call attempt
    await prisma.callLog.create({
      data: {
        direction: "OUTBOUND",
        status: "RINGING",
        callerNumber: sipExtension,
        calledNumber: phoneNumber,
        sipExtension,
        leadId: leadId || null,
        studentId: studentId || null,
        userId: (session.user as { id: string }).id,
      },
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Call failed" },
      { status: 500 }
    );
  }
}
