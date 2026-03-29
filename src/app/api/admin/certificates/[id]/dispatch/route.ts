import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { logJourneyEvent } from "@/lib/journey";
import { notifyUser } from "@/lib/notifications";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = (session.user as { role: string }).role;
    if (!hasPermission(role, "certificates:manage")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { trackingNo, notes } = body;

    // Find the dispatch record by certificate ID
    const dispatch = await prisma.certificateDispatch.findUnique({
      where: { certificateId: id },
      include: {
        certificate: {
          include: {
            student: {
              include: { user: { select: { id: true, name: true } } },
            },
          },
        },
      },
    });

    if (!dispatch) {
      return NextResponse.json(
        { error: "Certificate dispatch record not found" },
        { status: 404 }
      );
    }

    // Update dispatch status
    const updated = await prisma.certificateDispatch.update({
      where: { certificateId: id },
      data: {
        status: "SENT",
        sentAt: new Date(),
        trackingNo: trackingNo || null,
        notes: notes || null,
        assignedTo: session.user.id as string,
      },
      include: {
        certificate: {
          include: {
            student: {
              include: { user: { select: { id: true, name: true } } },
            },
          },
        },
      },
    });

    // Notify student
    await notifyUser(
      dispatch.certificate.student.userId,
      "Certificate Dispatched!",
      `Your certificate has been dispatched!${trackingNo ? ` Tracking No: ${trackingNo}` : ""}`,
      "CERTIFICATE_DISPATCHED",
      "/student/certificates"
    );

    // Log journey event
    await logJourneyEvent(
      dispatch.certificate.studentId,
      "CERTIFICATE_SENT" as any,
      "Certificate Dispatched",
      `Certificate ${dispatch.certificate.certificateNo} has been sent.${trackingNo ? ` Tracking: ${trackingNo}` : ""}`,
      {
        certificateId: id,
        certificateNo: dispatch.certificate.certificateNo,
        trackingNo: trackingNo || null,
      },
      session.user.id as string
    );

    return NextResponse.json({
      dispatch: updated,
      message: "Certificate marked as dispatched",
    });
  } catch (error) {
    console.error("Certificate dispatch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
