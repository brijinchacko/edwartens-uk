"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X } from "lucide-react";

interface Question {
  id: string;
  course: string;
  category: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string | null;
  order: number;
  isActive: boolean;
}

interface QuestionBankActionsProps {
  questions: Question[];
  mode: "add-button" | "table-rows";
}

const COURSE_LABELS: Record<string, string> = {
  PROFESSIONAL_MODULE: "Professional Module",
  AI_MODULE: "AI Module",
};

const CATEGORY_LABELS: Record<string, string> = {
  PRE_COURSE: "Pre-Course",
  THEORY: "Theory",
};

export function QuestionBankActions({ questions, mode }: QuestionBankActionsProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    course: "PROFESSIONAL_MODULE",
    category: "THEORY",
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A",
    explanation: "",
  });

  const resetForm = () => {
    setForm({
      course: "PROFESSIONAL_MODULE",
      category: "THEORY",
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctAnswer: "A",
      explanation: "",
    });
    setEditingQuestion(null);
  };

  const openAdd = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (q: Question) => {
    setEditingQuestion(q);
    setForm({
      course: q.course,
      category: q.category,
      question: q.question,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingQuestion
        ? `/api/admin/question-bank/${editingQuestion.id}`
        : "/api/admin/question-bank";
      const method = editingQuestion ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Something went wrong");
        return;
      }

      closeModal();
      router.refresh();
    } catch {
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/question-bank/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Something went wrong");
        return;
      }

      setDeleteConfirm(null);
      router.refresh();
    } catch {
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  // Render just the add button
  if (mode === "add-button") {
    return (
      <>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-neon-green/10 text-neon-green border border-neon-green/20 rounded-lg hover:bg-neon-green/20 transition-colors"
        >
          <Plus size={16} />
          Add Question
        </button>

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeModal}
            />
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-dark-primary border border-white/[0.06] rounded-xl shadow-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-text-primary">
                  {editingQuestion ? "Edit Question" : "Add Question"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-white/[0.03] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-text-muted mb-1.5">
                      Course
                    </label>
                    <select
                      value={form.course}
                      onChange={(e) =>
                        setForm({ ...form, course: e.target.value })
                      }
                      className="w-full bg-dark-secondary border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-neon-blue/50"
                    >
                      <option value="PROFESSIONAL_MODULE">
                        Professional Module
                      </option>
                      <option value="AI_MODULE">AI Module</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-text-muted mb-1.5">
                      Category
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                      className="w-full bg-dark-secondary border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-neon-blue/50"
                    >
                      <option value="PRE_COURSE">Pre-Course</option>
                      <option value="THEORY">Theory</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-text-muted mb-1.5">
                    Question
                  </label>
                  <textarea
                    value={form.question}
                    onChange={(e) =>
                      setForm({ ...form, question: e.target.value })
                    }
                    required
                    rows={3}
                    className="w-full bg-dark-secondary border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-neon-blue/50 resize-none"
                    placeholder="Enter the question..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-text-muted mb-1.5">
                      Option A
                    </label>
                    <input
                      type="text"
                      value={form.optionA}
                      onChange={(e) =>
                        setForm({ ...form, optionA: e.target.value })
                      }
                      required
                      className="w-full bg-dark-secondary border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-neon-blue/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-text-muted mb-1.5">
                      Option B
                    </label>
                    <input
                      type="text"
                      value={form.optionB}
                      onChange={(e) =>
                        setForm({ ...form, optionB: e.target.value })
                      }
                      required
                      className="w-full bg-dark-secondary border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-neon-blue/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-text-muted mb-1.5">
                      Option C
                    </label>
                    <input
                      type="text"
                      value={form.optionC}
                      onChange={(e) =>
                        setForm({ ...form, optionC: e.target.value })
                      }
                      required
                      className="w-full bg-dark-secondary border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-neon-blue/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-text-muted mb-1.5">
                      Option D
                    </label>
                    <input
                      type="text"
                      value={form.optionD}
                      onChange={(e) =>
                        setForm({ ...form, optionD: e.target.value })
                      }
                      required
                      className="w-full bg-dark-secondary border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-neon-blue/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-text-muted mb-1.5">
                    Correct Answer
                  </label>
                  <select
                    value={form.correctAnswer}
                    onChange={(e) =>
                      setForm({ ...form, correctAnswer: e.target.value })
                    }
                    className="w-full bg-dark-secondary border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-neon-blue/50"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-text-muted mb-1.5">
                    Explanation (optional)
                  </label>
                  <textarea
                    value={form.explanation}
                    onChange={(e) =>
                      setForm({ ...form, explanation: e.target.value })
                    }
                    rows={2}
                    className="w-full bg-dark-secondary border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-neon-blue/50 resize-none"
                    placeholder="Explain the correct answer..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-sm text-text-muted border border-white/[0.06] rounded-lg hover:bg-white/[0.03] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm bg-neon-blue/10 text-neon-blue border border-neon-blue/20 rounded-lg hover:bg-neon-blue/20 transition-colors disabled:opacity-50"
                  >
                    {loading
                      ? "Saving..."
                      : editingQuestion
                      ? "Update Question"
                      : "Create Question"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  }

  // Render table rows
  return (
    <>
      {questions.map((q) => (
        <tr
          key={q.id}
          className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
        >
          <td className="px-4 py-3 text-text-primary max-w-[300px]">
            <span title={q.question}>
              {q.question.length > 80
                ? q.question.slice(0, 80) + "..."
                : q.question}
            </span>
          </td>
          <td className="px-4 py-3 text-text-secondary text-xs">
            {COURSE_LABELS[q.course] || q.course}
          </td>
          <td className="px-4 py-3 text-text-secondary text-xs">
            {CATEGORY_LABELS[q.category] || q.category}
          </td>
          <td className="px-4 py-3 text-text-secondary font-medium">
            {q.correctAnswer}
          </td>
          <td className="px-4 py-3">
            <span
              className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                q.isActive
                  ? "bg-green-500/10 text-green-400 border-green-500/20"
                  : "bg-red-500/10 text-red-400 border-red-500/20"
              }`}
            >
              {q.isActive ? "Active" : "Inactive"}
            </span>
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => openEdit(q)}
                className="p-1.5 rounded-md text-text-muted hover:text-neon-blue hover:bg-neon-blue/10 transition-colors"
                title="Edit"
              >
                <Pencil size={14} />
              </button>

              {deleteConfirm === q.id ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDelete(q.id)}
                    disabled={loading}
                    className="px-2 py-1 text-xs bg-red-500/10 text-red-400 border border-red-500/20 rounded hover:bg-red-500/20 transition-colors disabled:opacity-50"
                  >
                    {loading ? "..." : "Confirm"}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-2 py-1 text-xs text-text-muted border border-white/[0.06] rounded hover:bg-white/[0.03] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirm(q.id)}
                  className="p-1.5 rounded-md text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Deactivate"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </td>
        </tr>
      ))}

      {/* Modal for editing (shared with add-button mode) */}
      {modalOpen && (
        <tr>
          <td colSpan={6} className="p-0">
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                onClick={closeModal}
              />
              <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-dark-primary border border-white/[0.06] rounded-xl shadow-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-text-primary">
                    Edit Question
                  </h2>
                  <button
                    onClick={closeModal}
                    className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-white/[0.03] transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-text-muted mb-1.5">
                        Course
                      </label>
                      <select
                        value={form.course}
                        onChange={(e) =>
                          setForm({ ...form, course: e.target.value })
                        }
                        className="w-full bg-dark-secondary border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-neon-blue/50"
                      >
                        <option value="PROFESSIONAL_MODULE">
                          Professional Module
                        </option>
                        <option value="AI_MODULE">AI Module</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-text-muted mb-1.5">
                        Category
                      </label>
                      <select
                        value={form.category}
                        onChange={(e) =>
                          setForm({ ...form, category: e.target.value })
                        }
                        className="w-full bg-dark-secondary border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-neon-blue/50"
                      >
                        <option value="PRE_COURSE">Pre-Course</option>
                        <option value="THEORY">Theory</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-text-muted mb-1.5">
                      Question
                    </label>
                    <textarea
                      value={form.question}
                      onChange={(e) =>
                        setForm({ ...form, question: e.target.value })
                      }
                      required
                      rows={3}
                      className="w-full bg-dark-secondary border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-neon-blue/50 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-text-muted mb-1.5">
                        Option A
                      </label>
                      <input
                        type="text"
                        value={form.optionA}
                        onChange={(e) =>
                          setForm({ ...form, optionA: e.target.value })
                        }
                        required
                        className="w-full bg-dark-secondary border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-neon-blue/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-text-muted mb-1.5">
                        Option B
                      </label>
                      <input
                        type="text"
                        value={form.optionB}
                        onChange={(e) =>
                          setForm({ ...form, optionB: e.target.value })
                        }
                        required
                        className="w-full bg-dark-secondary border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-neon-blue/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-text-muted mb-1.5">
                        Option C
                      </label>
                      <input
                        type="text"
                        value={form.optionC}
                        onChange={(e) =>
                          setForm({ ...form, optionC: e.target.value })
                        }
                        required
                        className="w-full bg-dark-secondary border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-neon-blue/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-text-muted mb-1.5">
                        Option D
                      </label>
                      <input
                        type="text"
                        value={form.optionD}
                        onChange={(e) =>
                          setForm({ ...form, optionD: e.target.value })
                        }
                        required
                        className="w-full bg-dark-secondary border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-neon-blue/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-text-muted mb-1.5">
                      Correct Answer
                    </label>
                    <select
                      value={form.correctAnswer}
                      onChange={(e) =>
                        setForm({ ...form, correctAnswer: e.target.value })
                      }
                      className="w-full bg-dark-secondary border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-neon-blue/50"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-text-muted mb-1.5">
                      Explanation (optional)
                    </label>
                    <textarea
                      value={form.explanation}
                      onChange={(e) =>
                        setForm({ ...form, explanation: e.target.value })
                      }
                      rows={2}
                      className="w-full bg-dark-secondary border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-neon-blue/50 resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 text-sm text-text-muted border border-white/[0.06] rounded-lg hover:bg-white/[0.03] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 text-sm bg-neon-blue/10 text-neon-blue border border-neon-blue/20 rounded-lg hover:bg-neon-blue/20 transition-colors disabled:opacity-50"
                    >
                      {loading ? "Saving..." : "Update Question"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
