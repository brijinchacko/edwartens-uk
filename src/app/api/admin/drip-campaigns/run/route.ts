import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { runAllSequences } from "@/lib/drip-campaigns";

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

    // Get the employee record for sending emails
    let employeeId: string | null = null;
    try {
      const employee = await prisma.employee.findUnique({
        where: { userId: session.user.id as string },
      });
      if (employee?.msAccessToken) {
        employeeId = employee.id;
      }
    } catch {
      // No employee found — will log without sending
    }

    const result = await runAllSequences(employeeId);

    return NextResponse.json({
      success: true,
      processed: result.processed,
      sent: result.sent,
      skipped: result.skipped,
      failed: result.failed,
    });
  } catch (error: unknown) {
    console.error("Error running drip campaigns:", error);
    const message = error instanceof Error ? error.message : "Failed to run drip campaigns";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
