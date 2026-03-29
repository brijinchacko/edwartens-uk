import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isCrmRole } from "@/lib/rbac";
import { getAuthUrl, isOutlookConnected, isOutlookConfigured } from "@/lib/microsoft-graph";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = (session.user as { role: string }).role;
    if (!isCrmRole(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!isOutlookConfigured()) {
      return NextResponse.json({ error: "Outlook integration not configured" }, { status: 400 });
    }

    const employee = await prisma.employee.findUnique({
      where: { userId: session.user.id as string },
    });
    if (!employee) {
      return NextResponse.json({ error: "Employee record not found" }, { status: 404 });
    }

    // Check current connection status
    const status = await isOutlookConnected(employee.id);

    // Generate auth URL with employee ID as state
    const authUrl = getAuthUrl(employee.id);

    return NextResponse.json({
      connected: status.connected,
      email: status.email,
      authUrl,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
