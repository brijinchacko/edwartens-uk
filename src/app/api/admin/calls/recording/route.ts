import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { getCallRecording, isZadarmaEnabled } from "@/lib/zadarma";
import { prisma } from "@/lib/prisma";

// GET: Fetch recording URL for a specific call
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as { role: string }).role;
  if (!hasPermission(role, "leads:read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!isZadarmaEnabled()) {
    return NextResponse.json({ error: "Zadarma not configured" }, { status: 400 });
  }

  const callLogId = req.nextUrl.searchParams.get("id");
  if (!callLogId) {
    return NextResponse.json({ error: "Call log ID required" }, { status: 400 });
  }

  const callLog = await prisma.callLog.findUnique({ where: { id: callLogId } });
  if (!callLog || !callLog.zadarmaCallId) {
    return NextResponse.json({ error: "Call not found" }, { status: 404 });
  }

  if (!callLog.isRecorded) {
    return NextResponse.json({ error: "No recording for this call" }, { status: 404 });
  }

  try {
    const result = await getCallRecording(callLog.zadarmaCallId);

    // Cache the recording URL
    if (result?.link) {
      await prisma.callLog.update({
        where: { id: callLogId },
        data: { recordingUrl: result.link },
      });
    }

    return NextResponse.json({ url: result?.link || null });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get recording" },
      { status: 500 }
    );
  }
}
