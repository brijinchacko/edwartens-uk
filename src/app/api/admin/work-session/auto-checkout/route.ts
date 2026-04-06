import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyRole, notifyEmployee } from "@/lib/notify";

// Auto-checkout stale sessions from previous days
// Called by cron job at midnight or on-demand by admin
export async function POST(req: NextRequest) {
  try {
    // Verify cron secret or admin auth
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "edwartens-auto-checkout-2024";

    if (authHeader !== `Bearer ${cronSecret}`) {
      // Fall back to session auth for admin
      const { auth } = await import("@/lib/auth");
      const session = await auth();
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const user = session.user as { role: string };
      if (!["SUPER_ADMIN", "ADMIN", "HR_MANAGER"].includes(user.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    // Find all sessions that are NOT checked out and were created before today
    const staleSessions = await prisma.employeeWorkSession.findMany({
      where: {
        status: { not: "CHECKED_OUT" },
        checkInAt: { lt: todayStart },
      },
      include: {
        employee: {
          include: { user: { select: { name: true, email: true } } },
        },
        activities: true,
      },
    });

    if (staleSessions.length === 0) {
      return NextResponse.json({ message: "No stale sessions found", count: 0 });
    }

    let checkedOut = 0;

    for (const staleSession of staleSessions) {
      // Set checkout time to 11:59 PM of the session's date
      const checkoutTime = new Date(staleSession.checkInAt);
      checkoutTime.setHours(23, 59, 0, 0);

      await prisma.$transaction(async (tx) => {
        // End any open activities
        await tx.employeeActivity.updateMany({
          where: { sessionId: staleSession.id, endedAt: null },
          data: { endedAt: checkoutTime },
        });

        // End any open breaks
        await tx.employeeBreak.updateMany({
          where: { sessionId: staleSession.id, endedAt: null },
          data: { endedAt: checkoutTime },
        });

        // Recalculate minutes
        const allActivities = await tx.employeeActivity.findMany({
          where: { sessionId: staleSession.id },
        });

        let activeMinutes = 0;
        let idleMinutes = 0;
        let breakMinutes = 0;

        for (const activity of allActivities) {
          const end = activity.endedAt || checkoutTime;
          const mins = Math.round((end.getTime() - activity.startedAt.getTime()) / 60000);
          if (activity.type === "ACTIVE") activeMinutes += mins;
          else if (activity.type === "IDLE") idleMinutes += mins;
          else if (activity.type === "BREAK") breakMinutes += mins;
        }

        const totalMinutes = Math.round(
          (checkoutTime.getTime() - staleSession.checkInAt.getTime()) / 60000
        );

        await tx.employeeWorkSession.update({
          where: { id: staleSession.id },
          data: {
            checkOutAt: checkoutTime,
            checkOutSummary: "[Auto-checkout] Session was not checked out manually",
            status: "CHECKED_OUT",
            totalMinutes,
            activeMinutes,
            idleMinutes,
            breakMinutes,
          },
        });
      });

      // Notify the employee
      notifyEmployee(
        staleSession.employeeId,
        "Auto-Checkout Applied",
        `Your work session from ${staleSession.checkInAt.toLocaleDateString("en-GB")} was auto-checked out because you forgot to check out.`,
        "/admin/dashboard"
      ).catch(() => {});

      const empName = staleSession.employee.user.name || "Unknown";
      console.log(`Auto-checkout: ${empName} (session ${staleSession.id})`);
      checkedOut++;
    }

    // Notify HR about auto-checkouts
    if (checkedOut > 0) {
      const names = staleSessions.map((s) => s.employee.user.name || "Unknown").join(", ");
      notifyRole(
        ["SUPER_ADMIN", "ADMIN", "HR_MANAGER"],
        `Auto-checkout: ${checkedOut} session${checkedOut > 1 ? "s" : ""}`,
        `Employees who forgot to check out: ${names}`,
        "/admin/attendance"
      ).catch(() => {});
    }

    return NextResponse.json({
      message: `Auto-checked out ${checkedOut} stale session(s)`,
      count: checkedOut,
      sessions: staleSessions.map((s) => ({
        employee: s.employee.user.name,
        date: s.checkInAt.toISOString().split("T")[0],
      })),
    });
  } catch (error) {
    console.error("Auto-checkout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
