import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTestSession } from "@/lib/test-session";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const UPLOADS_DIR = path.join(process.cwd(), "uploads", "projects");

export async function GET() {
  try {
    const session = getTestSession("STUDENT");
    const userId = session.user.id;

    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student record not found" },
        { status: 404 }
      );
    }

    const submissions = await prisma.projectSubmission.findMany({
      where: { studentId: student.id },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json(submissions);
  } catch (error) {
    console.error("Project GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "STUDENT") {
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
    const title = formData.get("title") as string;
    const description = formData.get("description") as string | null;
    const file = formData.get("file") as File | null;

    if (!title?.trim()) {
      return NextResponse.json(
        { error: "Project title is required" },
        { status: 400 }
      );
    }

    let fileUrl: string | null = null;
    let fileSize: number | null = null;

    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        return NextResponse.json(
          { error: "File exceeds 50MB limit" },
          { status: 400 }
        );
      }

      await mkdir(UPLOADS_DIR, { recursive: true });

      const ext = path.extname(file.name) || ".zip";
      const filename = `${student.id}-${uuidv4()}${ext}`;
      const filePath = path.join(UPLOADS_DIR, filename);

      const bytes = await file.arrayBuffer();
      await writeFile(filePath, Buffer.from(bytes));

      fileUrl = `/api/uploads/projects/${filename}`;
      fileSize = file.size;
    }

    const submission = await prisma.projectSubmission.create({
      data: {
        studentId: student.id,
        title: title.trim(),
        description: description?.trim() || null,
        fileUrl,
        fileSize,
        status: "SUBMITTED",
      },
    });

    // Log journey event
    await prisma.studentJourney.create({
      data: {
        studentId: student.id,
        eventType: "PROJECT_SUBMITTED",
        title: "Project Submitted",
        description: `Project "${title.trim()}" submitted for review.`,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error("Project POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
