import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { QuestionBankActions } from "./QuestionBankActions";

export const metadata: Metadata = {
  title: "Question Bank | EDWartens Admin",
  description: "Manage assessment questions for courses",
};

async function getQuestions(
  course?: string,
  category?: string,
  page: number = 1,
  limit: number = 20
) {
  try {
    const where: Record<string, unknown> = {};
    if (course) where.course = course;
    if (category) where.category = category;

    const skip = (page - 1) * limit;

    const [questions, total] = await Promise.all([
      prisma.assessmentQuestion.findMany({
        where,
        orderBy: [{ course: "asc" }, { category: "asc" }, { order: "asc" }],
        skip,
        take: limit,
      }),
      prisma.assessmentQuestion.count({ where }),
    ]);

    return { questions, total };
  } catch {
    return { questions: [], total: 0 };
  }
}

export default async function QuestionBankPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string; category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const course = params.course || undefined;
  const category = params.category || undefined;
  const page = parseInt(params.page || "1", 10);
  const limit = 20;

  const { questions, total } = await getQuestions(course, category, page, limit);
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Question Bank</h1>
          <p className="text-text-muted mt-1">
            {total} question{total !== 1 ? "s" : ""} total
          </p>
        </div>
        <QuestionBankActions questions={[]} mode="add-button" />
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <form className="flex gap-3 flex-wrap" method="GET">
          <select
            name="course"
            defaultValue={course || ""}
            className="bg-dark-secondary border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-neon-blue/50"
          >
            <option value="">All Courses</option>
            <option value="PROFESSIONAL_MODULE">Professional Module</option>
            <option value="AI_MODULE">AI Module</option>
          </select>
          <select
            name="category"
            defaultValue={category || ""}
            className="bg-dark-secondary border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-neon-blue/50"
          >
            <option value="">All Categories</option>
            <option value="PRE_COURSE">Pre-Course</option>
            <option value="THEORY">Theory</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-neon-blue/10 text-neon-blue border border-neon-blue/20 rounded-lg hover:bg-neon-blue/20 transition-colors"
          >
            Filter
          </button>
          {(course || category) && (
            <a
              href="/admin/question-bank"
              className="px-4 py-2 text-sm text-text-muted border border-white/[0.06] rounded-lg hover:bg-white/[0.03] transition-colors"
            >
              Clear
            </a>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-4 py-3 text-text-muted font-medium">
                  Question
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">
                  Course
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">
                  Category
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">
                  Correct Answer
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {questions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-text-muted"
                  >
                    No questions found
                  </td>
                </tr>
              ) : (
                <QuestionBankActions questions={questions} mode="table-rows" />
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-muted">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`/admin/question-bank?${new URLSearchParams({
                  ...(course ? { course } : {}),
                  ...(category ? { category } : {}),
                  page: String(page - 1),
                }).toString()}`}
                className="px-3 py-1.5 text-sm border border-white/[0.06] rounded-lg text-text-secondary hover:bg-white/[0.03] transition-colors"
              >
                Previous
              </a>
            )}
            {page < totalPages && (
              <a
                href={`/admin/question-bank?${new URLSearchParams({
                  ...(course ? { course } : {}),
                  ...(category ? { category } : {}),
                  page: String(page + 1),
                }).toString()}`}
                className="px-3 py-1.5 text-sm border border-white/[0.06] rounded-lg text-text-secondary hover:bg-white/[0.03] transition-colors"
              >
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
