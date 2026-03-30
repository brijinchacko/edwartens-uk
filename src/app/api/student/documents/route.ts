import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id as string;

    const student = await prisma.student.findUnique({
      where: { userId },
    });
    if (!student) {
      return NextResponse.json(
        { error: "Student record not found" },
        { status: 404 }
      );
    }

    const documents = await prisma.document.findMany({
      where: { studentId: student.id },
      orderBy: { uploadedAt: "desc" },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Fetch documents error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    });
    if (!student) {
      return NextResponse.json(
        { error: "Student record not found" },
        { status: 404 }
      );
    }

    const formData = await req.formData();

    // Support both single-file ("file" + "type" + "name") and multi-file ("files") uploads
    const singleFile = formData.get("file") as File | null;
    const multiFiles = formData.getAll("files") as File[];
    const documentType = formData.get("type") as string | null;
    const documentName = formData.get("name") as string | null;

    const filesToProcess: { file: File; type: string; name: string }[] = [];

    if (singleFile) {
      if (!documentType) {
        return NextResponse.json(
          { error: "Document type is required" },
          { status: 400 }
        );
      }
      filesToProcess.push({
        file: singleFile,
        type: documentType,
        name: documentName || singleFile.name,
      });
    } else if (multiFiles.length > 0) {
      for (const f of multiFiles) {
        filesToProcess.push({
          file: f,
          type: documentType || "Other",
          name: f.name,
        });
      }
    } else {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate all files
    for (const { file } of filesToProcess) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `File type not allowed for "${file.name}". Accepted: PDF, JPEG, PNG, WebP, DOC, DOCX` },
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File "${file.name}" exceeds 10 MB limit` },
          { status: 400 }
        );
      }
    }

    // Ensure upload directory exists
    await mkdir(UPLOADS_DIR, { recursive: true });

    const uploaded = [];
    for (const { file, type, name } of filesToProcess) {
      const ext = path.extname(file.name) || ".pdf";
      const filename = `${student.id}-${uuidv4()}${ext}`;
      const filePath = path.join(UPLOADS_DIR, filename);

      const bytes = await file.arrayBuffer();
      await writeFile(filePath, Buffer.from(bytes));

      const fileUrl = `/api/uploads/documents/${filename}`;
      const document = await prisma.document.create({
        data: {
          studentId: student.id,
          name,
          type,
          fileUrl,
          fileSize: file.size,
          mimeType: file.type,
          status: "UPLOADED",
        },
      });
      uploaded.push(document);
    }

    if (uploaded.length === 1) {
      return NextResponse.json(uploaded[0], { status: 201 });
    }
    return NextResponse.json(uploaded, { status: 201 });
  } catch (error) {
    console.error("Document upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
