import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const UPLOADS_DIR = path.join(process.cwd(), "uploads", "documents");

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "documents:manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: studentId } = await ctx.params;

    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const documentType = formData.get("type") as string | null;
    const documentName = formData.get("name") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!documentType) {
      return NextResponse.json(
        { error: "Document type is required" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "File type not allowed. Accepted: PDF, JPEG, PNG, WebP, DOC, DOCX",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 10 MB limit" },
        { status: 400 }
      );
    }

    // Ensure upload directory exists
    await mkdir(UPLOADS_DIR, { recursive: true });

    const ext = path.extname(file.name) || ".pdf";
    const filename = `${studentId}-${uuidv4()}${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);

    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const fileUrl = `/api/uploads/documents/${filename}`;
    const document = await prisma.document.create({
      data: {
        studentId,
        name: documentName || file.name,
        type: documentType,
        fileUrl,
        fileSize: file.size,
        mimeType: file.type,
        status: "UPLOADED",
      },
    });

    // Create journey event
    await prisma.studentJourney.create({
      data: {
        studentId,
        eventType: "DOCUMENT_UPLOADED",
        title: `Document uploaded: ${documentType}`,
        description: `Admin uploaded ${documentName || file.name} (${documentType})`,
        createdBy: session.user.name || session.user.email,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Admin document upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
