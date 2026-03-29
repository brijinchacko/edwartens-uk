import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
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

    const { type } = await req.json();

    if (!type || !["PRE_COURSE", "THEORY"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid assessment type. Must be PRE_COURSE or THEORY." },
        { status: 400 }
      );
    }

    const count = type === "PRE_COURSE" ? 20 : 50;

    // For THEORY: check if student already passed
    if (type === "THEORY") {
      const alreadyPassed = await prisma.assessmentAttempt.findFirst({
        where: { studentId: student.id, type: "THEORY", passed: true },
      });
      if (alreadyPassed) {
        return NextResponse.json(
          { error: "You have already passed the Theory Assessment." },
          { status: 400 }
        );
      }
    }

    // Select random questions using raw query
    const questions: { id: string; question: string; optionA: string; optionB: string; optionC: string; optionD: string }[] =
      await prisma.$queryRaw`SELECT id, question, "optionA", "optionB", "optionC", "optionD" FROM "AssessmentQuestion" WHERE course::text = ${student.course} AND category::text = ${type} AND "isActive" = true ORDER BY RANDOM() LIMIT ${count}`;

    if (questions.length === 0) {
      return NextResponse.json(
        { error: "No questions available for this assessment." },
        { status: 400 }
      );
    }

    // Compute attempt number
    const existingAttempts = await prisma.assessmentAttempt.count({
      where: { studentId: student.id, type: type as "PRE_COURSE" | "THEORY" },
    });
    const attemptNumber = existingAttempts + 1;

    const questionIds = questions.map((q) => q.id);

    // Create assessment attempt
    const attempt = await prisma.assessmentAttempt.create({
      data: {
        studentId: student.id,
        course: student.course,
        type: type as "PRE_COURSE" | "THEORY",
        score: 0,
        totalQuestions: questions.length,
        passed: false,
        answers: {},
        questionIds,
        attemptNumber,
        startedAt: new Date(),
        completedAt: null,
      },
    });

    return NextResponse.json({
      attemptId: attempt.id,
      questions: questions.map((q) => ({
        id: q.id,
        question: q.question,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
      })),
    });
  } catch (error) {
    console.error("Start assessment error:", error);
    return NextResponse.json(
      { error: "Failed to start assessment" },
      { status: 500 }
    );
  }
}
