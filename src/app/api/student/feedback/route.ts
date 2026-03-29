import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id as string;

    const student = await prisma.student.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const feedback = await prisma.studentFeedback.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Feedback GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id as string;

    const student = await prisma.student.findUnique({
      where: { userId },
      select: { id: true, batchId: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const body = await req.json();
    const { type, npsScore, rating, feedback, testimonial, canPublish } = body;

    // Validate NPS score
    if (npsScore !== undefined && npsScore !== null) {
      if (typeof npsScore !== "number" || npsScore < 0 || npsScore > 10) {
        return NextResponse.json({ error: "NPS score must be between 0 and 10" }, { status: 400 });
      }
    }

    // Validate rating
    if (rating !== undefined && rating !== null) {
      if (typeof rating !== "number" || rating < 1 || rating > 5) {
        return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
      }
    }

    const created = await prisma.studentFeedback.create({
      data: {
        studentId: student.id,
        type: type || "NPS",
        npsScore: npsScore ?? null,
        rating: rating ?? null,
        feedback: feedback || null,
        testimonial: testimonial || null,
        canPublish: canPublish || false,
        batchId: student.batchId || null,
      },
    });

    return NextResponse.json({ feedback: created }, { status: 201 });
  } catch (error) {
    console.error("Feedback POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
