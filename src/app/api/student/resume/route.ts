import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTestSession } from "@/lib/test-session";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const UPLOADS_DIR = path.join(process.cwd(), "uploads", "resumes");

export async function GET() {
  try {
    const session = getTestSession("STUDENT");
    const userId = session.user.id;

    const student = await prisma.student.findUnique({
      where: { userId },
      include: {
        documents: {
          where: { type: "CV" },
          orderBy: { uploadedAt: "desc" },
          take: 1,
        },
        resumeReviews: {
          orderBy: { sessionNumber: "asc" },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student record not found" },
        { status: 404 }
      );
    }

    const latestCV = student.documents[0] || null;

    return NextResponse.json({
      cvUrl: latestCV?.fileUrl || null,
      cvName: latestCV?.name || null,
      reviews: student.resumeReviews,
    });
  } catch (error) {
    console.error("Resume GET error:", error);
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
    const action = formData.get("action") as string;

    if (action === "upload_cv") {
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json(
          { error: "No file provided" },
          { status: 400 }
        );
      }

      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: "File exceeds 10MB limit" },
          { status: 400 }
        );
      }

      await mkdir(UPLOADS_DIR, { recursive: true });

      const ext = path.extname(file.name) || ".pdf";
      const filename = `${student.id}-cv-${uuidv4()}${ext}`;
      const filePath = path.join(UPLOADS_DIR, filename);

      const bytes = await file.arrayBuffer();
      await writeFile(filePath, Buffer.from(bytes));

      const fileUrl = `/api/uploads/resumes/${filename}`;

      // Create document record of type CV
      await prisma.document.create({
        data: {
          studentId: student.id,
          name: file.name,
          type: "CV",
          fileUrl,
          fileSize: file.size,
          mimeType: file.type,
          status: "UPLOADED",
        },
      });

      return NextResponse.json({ success: true }, { status: 201 });
    }

    if (action === "request_review") {
      // Check existing review count
      const existingCount = await prisma.resumeReview.count({
        where: { studentId: student.id },
      });

      if (existingCount >= 3) {
        return NextResponse.json(
          { error: "Maximum of 3 review sessions reached" },
          { status: 400 }
        );
      }

      const review = await prisma.resumeReview.create({
        data: {
          studentId: student.id,
          sessionNumber: existingCount + 1,
          status: "PENDING",
        },
      });

      // Log journey event
      await prisma.studentJourney.create({
        data: {
          studentId: student.id,
          eventType: "RESUME_REVIEW",
          title: "Resume Review Requested",
          description: `Resume review session ${existingCount + 1} requested.`,
          createdBy: session.user.id,
        },
      });

      return NextResponse.json(review, { status: 201 });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Resume POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
