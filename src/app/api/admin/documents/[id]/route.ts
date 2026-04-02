import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyStudent } from "@/lib/notify";
import { unlink } from "fs/promises";
import path from "path";

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "ADMISSION_COUNSELLOR"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (!ADMIN_ROLES.includes(userRole) && userRole !== "TRAINER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { status, reviewNote } = await req.json();

    if (!status || !["VERIFIED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be VERIFIED or REJECTED" },
        { status: 400 }
      );
    }

    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.document.update({
      where: { id },
      data: {
        status,
        reviewNote: reviewNote || null,
        reviewedBy: session.user.id,
      },
    });

    // Notifications for document status
    if (status === "VERIFIED") {
      await notifyStudent(document.studentId, "Document Verified", `Your ${document.type || "document"} "${document.name}" has been verified.`, "/student/documents");
    }
    if (status === "REJECTED") {
      await notifyStudent(document.studentId, "Document Needs Attention", `Your ${document.type || "document"} "${document.name}" was rejected. Reason: ${reviewNote || "Please re-upload."}`, "/student/documents");
    }

    // Log journey event
    await prisma.studentJourney.create({
      data: {
        studentId: document.studentId,
        eventType: status === "VERIFIED" ? "DOCUMENT_VERIFIED" : "DOCUMENT_UPLOADED",
        title: `Document ${status === "VERIFIED" ? "Verified" : "Rejected"}`,
        description: `Document "${document.name}" was ${status.toLowerCase()}${reviewNote ? `: ${reviewNote}` : ""}.`,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Admin document PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (!ADMIN_ROLES.includes(userRole)) {
      return NextResponse.json(
        { error: "Forbidden - only SUPER_ADMIN, ADMIN, or ADMISSION_COUNSELLOR can delete documents" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Try to delete the physical file
    if (document.fileUrl) {
      try {
        const filename = document.fileUrl.split("/").pop();
        if (filename) {
          const filePath = path.join(
            process.cwd(),
            "uploads",
            "documents",
            filename
          );
          await unlink(filePath);
        }
      } catch {
        // File may not exist on disk, continue with DB deletion
      }
    }

    await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin document DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
