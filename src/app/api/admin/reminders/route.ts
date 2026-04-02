import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";
import { notifyUser, notifyAdmins } from "@/lib/notify";

// Helper: start and end of today (UTC)
function todayRange() {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date();
  end.setUTCHours(23, 59, 59, 999);
  return { start, end };
}

// Check if a reminder notification was already sent today for a given key
async function alreadySentToday(userId: string, titlePrefix: string) {
  const { start, end } = todayRange();
  const existing = await prisma.notification.findFirst({
    where: {
      userId,
      title: { startsWith: titlePrefix },
      createdAt: { gte: start, lte: end },
    },
  });
  return !!existing;
}

// 1. Leads with overdue follow-up -> notify assigned counsellor
async function checkOverdueFollowups() {
  const now = new Date();
  const overdueLeads = await prisma.lead.findMany({
    where: {
      followUpDate: { lt: now },
      status: { notIn: ["ENROLLED", "LOST"] },
      assignedToId: { not: null },
    },
    include: {
      assignedTo: { select: { userId: true, user: { select: { name: true } } } },
    },
  });

  let count = 0;
  for (const lead of overdueLeads) {
    if (!lead.assignedTo?.userId) continue;
    const sent = await alreadySentToday(
      lead.assignedTo.userId,
      "Overdue Follow-up:"
    );
    if (!sent) {
      await notifyUser(
        lead.assignedTo.userId,
        `Overdue Follow-up: ${lead.name}`,
        `Lead "${lead.name}" (${lead.phone}) has an overdue follow-up scheduled for ${lead.followUpDate?.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/London" })}.`,
        "REMINDER",
        `/admin/leads?search=${encodeURIComponent(lead.name)}`
      );
      count++;
    }
  }
  return count;
}

// 2. Students with pending payment > 30 days -> notify admin
async function checkPendingPayments() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const students = await prisma.student.findMany({
    where: {
      paymentStatus: { in: ["PENDING", "PARTIAL"] },
      enrollmentDate: { lt: thirtyDaysAgo },
      status: { notIn: ["DROPPED"] },
    },
    include: { user: { select: { name: true } } },
  });

  let count = 0;
  if (students.length > 0) {
    // Find admin users to check if already notified
    const admins = await prisma.user.findMany({
      where: { role: { in: ["SUPER_ADMIN", "ADMIN"] }, isActive: true },
      select: { id: true },
    });

    for (const admin of admins) {
      const sent = await alreadySentToday(admin.id, "Pending Payments Alert");
      if (!sent) {
        const names = students
          .map((s) => s.user.name)
          .slice(0, 5)
          .join(", ");
        await notifyUser(
          admin.id,
          "Pending Payments Alert",
          `${students.length} student(s) have pending payments for over 30 days: ${names}${students.length > 5 ? "..." : ""}.`,
          "REMINDER",
          "/admin/students?paymentStatus=PENDING"
        );
        count++;
      }
    }
  }
  return count;
}

// 3. Students with incomplete onboarding > 7 days -> notify counsellor
async function checkIncompleteOnboarding() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const students = await prisma.student.findMany({
    where: {
      status: "ONBOARDING",
      enrollmentDate: { lt: sevenDaysAgo },
      counsellorId: { not: null },
    },
    include: {
      user: { select: { name: true } },
      counsellor: { select: { userId: true, user: { select: { name: true } } } },
    },
  });

  let count = 0;
  for (const student of students) {
    if (!student.counsellor?.userId) continue;
    const sent = await alreadySentToday(
      student.counsellor.userId,
      "Incomplete Onboarding:"
    );
    if (!sent) {
      await notifyUser(
        student.counsellor.userId,
        `Incomplete Onboarding: ${student.user.name}`,
        `Student "${student.user.name}" has been in onboarding for over 7 days. Please follow up.`,
        "REMINDER",
        `/admin/students/${student.id}`
      );
      count++;
    }
  }
  return count;
}

// 4. Documents pending review > 3 days -> notify admin
async function checkPendingDocuments() {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const pendingDocs = await prisma.document.findMany({
    where: {
      status: "UPLOADED",
      uploadedAt: { lt: threeDaysAgo },
    },
    include: {
      student: { include: { user: { select: { name: true } } } },
    },
  });

  let count = 0;
  if (pendingDocs.length > 0) {
    const admins = await prisma.user.findMany({
      where: { role: { in: ["SUPER_ADMIN", "ADMIN"] }, isActive: true },
      select: { id: true },
    });

    for (const admin of admins) {
      const sent = await alreadySentToday(admin.id, "Pending Document Reviews");
      if (!sent) {
        await notifyUser(
          admin.id,
          "Pending Document Reviews",
          `${pendingDocs.length} document(s) have been awaiting review for over 3 days.`,
          "REMINDER",
          "/admin/documents?status=UPLOADED"
        );
        count++;
      }
    }
  }
  return count;
}

// 5. Upcoming batches starting in 2 days -> notify students + trainer
async function checkUpcomingBatches() {
  const now = new Date();
  const twoDaysFromNow = new Date();
  twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

  // Set to start/end of the target day
  const dayStart = new Date(twoDaysFromNow);
  dayStart.setUTCHours(0, 0, 0, 0);
  const dayEnd = new Date(twoDaysFromNow);
  dayEnd.setUTCHours(23, 59, 59, 999);

  const upcomingBatches = await prisma.batch.findMany({
    where: {
      status: "UPCOMING",
      startDate: { gte: dayStart, lte: dayEnd },
    },
    include: {
      students: { select: { id: true, userId: true } },
      instructor: { select: { userId: true, user: { select: { name: true } } } },
    },
  });

  let count = 0;
  for (const batch of upcomingBatches) {
    // Notify students
    for (const student of batch.students) {
      const sent = await alreadySentToday(
        student.userId,
        "Batch Starting Soon:"
      );
      if (!sent) {
        await notifyUser(
          student.userId,
          `Batch Starting Soon: ${batch.name}`,
          `Your batch "${batch.name}" starts on ${batch.startDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/London" })}. Please ensure all onboarding is complete.`,
          "REMINDER",
          "/student/dashboard"
        );
        count++;
      }
    }

    // Notify trainer
    if (batch.instructor?.userId) {
      const sent = await alreadySentToday(
        batch.instructor.userId,
        "Batch Starting Soon:"
      );
      if (!sent) {
        await notifyUser(
          batch.instructor.userId,
          `Batch Starting Soon: ${batch.name}`,
          `Batch "${batch.name}" with ${batch.students.length} student(s) starts on ${batch.startDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/London" })}.`,
          "REMINDER",
          "/admin/batches"
        );
        count++;
      }
    }
  }
  return count;
}

// GET: Return current reminder stats without sending notifications
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !hasPermission(session.user.role, "users:manage")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    const dayStart = new Date(twoDaysFromNow);
    dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(twoDaysFromNow);
    dayEnd.setUTCHours(23, 59, 59, 999);

    const [
      overdueFollowups,
      pendingPayments,
      incompleteOnboarding,
      pendingDocs,
      upcomingBatches,
    ] = await Promise.all([
      prisma.lead.count({
        where: {
          followUpDate: { lt: now },
          status: { notIn: ["ENROLLED", "LOST"] },
          assignedToId: { not: null },
        },
      }),
      prisma.student.count({
        where: {
          paymentStatus: { in: ["PENDING", "PARTIAL"] },
          enrollmentDate: { lt: thirtyDaysAgo },
          status: { notIn: ["DROPPED"] },
        },
      }),
      prisma.student.count({
        where: {
          status: "ONBOARDING",
          enrollmentDate: { lt: sevenDaysAgo },
        },
      }),
      prisma.document.count({
        where: {
          status: "UPLOADED",
          uploadedAt: { lt: threeDaysAgo },
        },
      }),
      prisma.batch.count({
        where: {
          status: "UPCOMING",
          startDate: { gte: dayStart, lte: dayEnd },
        },
      }),
    ]);

    return NextResponse.json({
      overdueFollowups,
      pendingPayments,
      incompleteOnboarding,
      pendingDocs,
      upcomingBatches,
    });
  } catch (error) {
    console.error("Reminder stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Run all reminder checks and send notifications
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !hasPermission(session.user.role, "users:manage")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      overdueFollowups,
      pendingPayments,
      incompleteOnboarding,
      pendingDocs,
      upcomingBatches,
    ] = await Promise.all([
      checkOverdueFollowups(),
      checkPendingPayments(),
      checkIncompleteOnboarding(),
      checkPendingDocuments(),
      checkUpcomingBatches(),
    ]);

    return NextResponse.json({
      overdueFollowups,
      pendingPayments,
      incompleteOnboarding,
      pendingDocs,
      upcomingBatches,
      message: "Reminder checks completed",
    });
  } catch (error) {
    console.error("Reminder checks error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
