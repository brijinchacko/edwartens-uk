import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ZadarmaCallEvent } from "@/lib/zadarma";

// Zadarma verification: echoes back zd_echo param to confirm webhook URL
export async function GET(req: NextRequest) {
  const zdEcho = req.nextUrl.searchParams.get("zd_echo");
  if (zdEcho) {
    return new NextResponse(zdEcho, { status: 200 });
  }
  return NextResponse.json({ status: "ok" }, { status: 200 });
}

// Zadarma sends POST webhooks for call events
export async function POST(req: NextRequest) {
  try {
    const body = await req.formData();
    const event = body.get("event") as string;
    const pbxCallId = body.get("pbx_call_id") as string | null;
    const callIdWithRec = body.get("call_id_with_rec") as string | null;
    const callerId = body.get("caller_id") as string | null;
    const calledDid = body.get("called_did") as string | null;
    const destination = body.get("destination") as string | null;
    const internal = body.get("internal") as string | null;
    const duration = body.get("duration") as string | null;
    const disposition = body.get("disposition") as string | null;
    const isRecorded = body.get("is_recorded") as string | null;
    const callStart = body.get("call_start") as string | null;

    if (!event) {
      return NextResponse.json({ status: "ignored" }, { status: 200 });
    }

    // Normalize phone numbers for matching
    const normalizePhone = (phone: string | null) =>
      phone ? phone.replace(/[^+\d]/g, "").replace(/^00/, "+") : null;

    const callerNormalized = normalizePhone(callerId);
    const calledNormalized = normalizePhone(destination || calledDid);

    // Try to match to a lead or student by phone number
    let leadId: string | null = null;
    let studentId: string | null = null;

    const phoneToSearch = event.startsWith("NOTIFY_OUT") ? calledNormalized : callerNormalized;

    if (phoneToSearch) {
      // Search leads
      const lead = await prisma.lead.findFirst({
        where: {
          OR: [
            { phone: { contains: phoneToSearch.slice(-10) } },
            { alternatePhone: { contains: phoneToSearch.slice(-10) } },
          ],
        },
        select: { id: true },
      });
      if (lead) leadId = lead.id;

      // Search students
      if (!leadId) {
        const student = await prisma.student.findFirst({
          where: {
            user: { phone: { contains: phoneToSearch.slice(-10) } },
          },
          select: { id: true },
        });
        if (student) studentId = student.id;
      }
    }

    // Determine direction
    const isOutbound = event.startsWith("NOTIFY_OUT");

    // Try to match CRM employee by their Zadarma number
    let crmUserId: string | null = null;
    const employeePhone = isOutbound ? callerNormalized : calledNormalized;
    if (employeePhone) {
      const emp = await prisma.employee.findFirst({
        where: {
          user: { phone: { contains: employeePhone.slice(-10) } },
        },
        select: { userId: true },
      });
      if (emp) crmUserId = emp.userId;
    }

    // Determine direction and status
    const direction = event === "NOTIFY_INTERNAL" ? "INTERNAL" : isOutbound ? "OUTBOUND" : "INBOUND";

    let status: "RINGING" | "ANSWERED" | "MISSED" | "BUSY" | "FAILED" = "RINGING";
    if (disposition === "answered") status = "ANSWERED";
    else if (disposition === "busy") status = "BUSY";
    else if (disposition === "cancel" || disposition === "no answer") status = "MISSED";
    else if (disposition === "failed") status = "FAILED";

    const zadarmaId = pbxCallId || callIdWithRec || `${event}-${Date.now()}`;

    // Handle different event types
    if (event === "NOTIFY_START" || event === "NOTIFY_OUT_START") {
      // Call started — create a new log
      await prisma.callLog.upsert({
        where: { zadarmaCallId: zadarmaId },
        update: { status: "RINGING" },
        create: {
          zadarmaCallId: zadarmaId,
          direction,
          status: "RINGING",
          callerNumber: callerId || "unknown",
          calledNumber: destination || calledDid || "unknown",
          sipExtension: internal || null,
          leadId,
          studentId,
          userId: crmUserId,
          startedAt: callStart ? new Date(callStart) : new Date(),
        },
      });
    } else if (event === "NOTIFY_ANSWER") {
      // Call answered
      await prisma.callLog.upsert({
        where: { zadarmaCallId: zadarmaId },
        update: { status: "ANSWERED" },
        create: {
          zadarmaCallId: zadarmaId,
          direction,
          status: "ANSWERED",
          callerNumber: callerId || "unknown",
          calledNumber: destination || calledDid || "unknown",
          sipExtension: internal || null,
          leadId,
          studentId,
          userId: crmUserId,
          startedAt: callStart ? new Date(callStart) : new Date(),
        },
      });
    } else if (event === "NOTIFY_END" || event === "NOTIFY_OUT_END") {
      // Call ended — update with final status and duration
      const durationSecs = duration ? parseInt(duration, 10) : 0;
      await prisma.callLog.upsert({
        where: { zadarmaCallId: zadarmaId },
        update: {
          status,
          duration: durationSecs,
          isRecorded: isRecorded === "1",
          endedAt: new Date(),
        },
        create: {
          zadarmaCallId: zadarmaId,
          direction,
          status,
          callerNumber: callerId || "unknown",
          calledNumber: destination || calledDid || "unknown",
          sipExtension: internal || null,
          duration: durationSecs,
          isRecorded: isRecorded === "1",
          leadId,
          studentId,
          userId: crmUserId,
          startedAt: callStart ? new Date(callStart) : new Date(),
          endedAt: new Date(),
        },
      });

      // Auto-update lead status if first call
      if (leadId && status === "ANSWERED") {
        const lead = await prisma.lead.findUnique({ where: { id: leadId }, select: { status: true } });
        if (lead && lead.status === "NEW") {
          await prisma.lead.update({
            where: { id: leadId },
            data: { status: "FIRST_CALL" },
          });
        }
      }
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (error) {
    console.error("Zadarma webhook error:", error);
    return NextResponse.json({ status: "ok" }, { status: 200 }); // Always 200 to avoid retries
  }
}
