import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "jobs:manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const targetCourse = searchParams.get("targetCourse");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (targetCourse) where.targetCourse = targetCourse;

    const [jobs, total] = await Promise.all([
      prisma.jobNotification.findMany({
        where,
        include: {
          _count: { select: { applications: true } },
        },
        orderBy: { sentAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.jobNotification.count({ where }),
    ]);

    return NextResponse.json({
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin jobs list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "jobs:manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      company,
      role,
      location,
      salaryRange,
      description,
      requirements,
      targetCourse,
      targetBatchId,
    } = body;

    if (!company || !role || !description) {
      return NextResponse.json(
        { error: "Company, role, and description are required" },
        { status: 400 }
      );
    }

    // Find students to notify based on target course and batch
    const studentWhere: Record<string, unknown> = {
      status: { in: ["ACTIVE", "COMPLETED"] },
    };
    if (targetCourse) studentWhere.course = targetCourse;
    if (targetBatchId) studentWhere.batchId = targetBatchId;

    const students = await prisma.student.findMany({
      where: studentWhere,
      include: { user: { select: { email: true } } },
    });

    const sentToEmails = students.map((s) => s.user.email);

    const job = await prisma.jobNotification.create({
      data: {
        company,
        role,
        location: location || null,
        salaryRange: salaryRange || null,
        description,
        requirements: requirements || null,
        targetCourse: targetCourse || null,
        targetBatchId: targetBatchId || null,
        sentTo: sentToEmails,
        createdBy: session.user.id,
      },
    });

    // Create in-app notifications for each student
    if (students.length > 0) {
      await prisma.notification.createMany({
        data: students.map((s) => ({
          userId: s.userId,
          title: `New Job Opportunity: ${role} at ${company}`,
          message: `${description.substring(0, 200)}${description.length > 200 ? "..." : ""}`,
          type: "JOB_NOTIFICATION",
          link: `/student/jobs/${job.id}`,
        })),
      });
    }

    return NextResponse.json(
      {
        ...job,
        notifiedCount: sentToEmails.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin job create error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
