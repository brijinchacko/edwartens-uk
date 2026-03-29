import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = (session.user as { role: string }).role;
    if (!hasPermission(role, "question-bank:manage")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const course = searchParams.get("course");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (course) where.course = course;
    if (category) where.category = category;
    if (search) {
      where.question = { contains: search, mode: "insensitive" };
    }

    const [questions, total] = await Promise.all([
      prisma.assessmentQuestion.findMany({
        where,
        orderBy: [{ course: "asc" }, { category: "asc" }, { order: "asc" }],
        skip,
        take: limit,
      }),
      prisma.assessmentQuestion.count({ where }),
    ]);

    return NextResponse.json({ questions, total, page, limit });
  } catch (error) {
    console.error("Question bank fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = (session.user as { role: string }).role;
    if (!hasPermission(role, "question-bank:manage")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      course,
      category,
      question,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
      explanation,
    } = body;

    if (!course || !question || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
      return NextResponse.json(
        { error: "All fields except explanation are required" },
        { status: 400 }
      );
    }

    // Auto-calculate order: next number for this course+category
    const lastQuestion = await prisma.assessmentQuestion.findFirst({
      where: { course, category: category || "THEORY" },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    const nextOrder = (lastQuestion?.order ?? 0) + 1;

    const created = await prisma.assessmentQuestion.create({
      data: {
        course,
        category: category || "THEORY",
        question,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer,
        explanation: explanation || null,
        order: nextOrder,
        createdBy: session.user.id as string,
      },
    });

    return NextResponse.json({ question: created, message: "Question created" });
  } catch (error) {
    console.error("Question create error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
