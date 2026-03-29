import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    if (!type || !["PRE_COURSE", "THEORY"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be PRE_COURSE or THEORY." },
        { status: 400 }
      );
    }

    const attempts = await prisma.assessmentAttempt.findMany({
      where: {
        studentId: student.id,
        type: type as "PRE_COURSE" | "THEORY",
      },
      orderBy: { startedAt: "desc" },
      select: {
        id: true,
        score: true,
        totalQuestions: true,
        passed: true,
        suggestions: true,
        attemptNumber: true,
        startedAt: true,
        completedAt: true,
        type: true,
      },
    });

    return NextResponse.json(attempts);
  } catch (error) {
    console.error("Fetch attempts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch attempts" },
      { status: 500 }
    );
  }
}
