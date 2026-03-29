"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2, Search, Upload } from "lucide-react";

const CERT_TYPES = [
  { value: "CPD", label: "CPD" },
  { value: "EXPERIENCE", label: "Experience" },
  { value: "ISO", label: "ISO" },
  { value: "COMPLETION", label: "Completion" },
];

interface StudentResult {
  id: string;
  user: { name: string; email: string };
}

export default function GenerateCertificateModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Student search state
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<StudentResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentResult | null>(
    null
  );
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [type, setType] = useState("CPD");
  const [expiryDate, setExpiryDate] = useState("");
  const [manualFile, setManualFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const searchStudents = useCallback(async (query: string) => {
    if (query.length < 2) {
      setStudents([]);
      setShowDropdown(false);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(
        `/api/admin/students?search=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setStudents(data.students || data || []);
      setShowDropdown(true);
    } catch {
      setStudents([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedStudent(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchStudents(value), 300);
  };

  const handleSelectStudent = (student: StudentResult) => {
    setSelectedStudent(student);
    setSearchQuery(student.user.name);
    setShowDropdown(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      setError("Please select a student");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const body: Record<string, string> = {
        studentId: selectedStudent.id,
        type,
      };
      if (expiryDate) body.expiryDate = expiryDate;

      // Step 1: Generate certificate record (replaces existing if same type)
      const res = await fetch("/api/admin/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate certificate");
      }

      // Step 2: If manual file was selected, upload it to replace the auto-generated one
      if (manualFile && data.id) {
        const formData = new FormData();
        formData.append("file", manualFile);
        const uploadRes = await fetch(`/api/admin/certificates/${data.id}`, {
          method: "PATCH",
          body: formData,
        });
        if (!uploadRes.ok) {
          console.error("Manual upload failed, auto-generated cert kept");
        }
      }

      // Step 3: If resume file was provided, upload it to the student's documents
      if (resumeFile && selectedStudent) {
        const resumeData = new FormData();
        resumeData.append("file", resumeFile);
        resumeData.append("type", "RESUME");
        resumeData.append("studentId", selectedStudent.id);
        const resumeRes = await fetch(`/api/admin/students/${selectedStudent.id}/documents`, {
          method: "POST",
          body: resumeData,
        });
        if (!resumeRes.ok) {
          console.error("Resume upload failed");
        }
      }

      setSuccess(data.replaced
        ? "Certificate replaced successfully!"
        : "Certificate generated successfully!"
      );
      setTimeout(() => {
        setOpen(false);
        setSuccess("");
        setSearchQuery("");
        setSelectedStudent(null);
        setType("CPD");
        setExpiryDate("");
        setManualFile(null);
        setResumeFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (resumeInputRef.current) resumeInputRef.current.value = "";
        router.refresh();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    if (loading) return;
    setOpen(false);
    setError("");
    setSuccess("");
    setSearchQuery("");
    setSelectedStudent(null);
    setStudents([]);
    setShowDropdown(false);
    setManualFile(null);
    setResumeFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (resumeInputRef.current) resumeInputRef.current.value = "";
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neon-green/10 text-neon-green border border-neon-green/20 hover:bg-neon-green/20 transition-colors text-sm font-medium w-fit"
      >
        <Plus size={16} />
        Generate Certificate
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={resetAndClose}
          />
          <div className="relative w-full max-w-md mx-4 rounded-xl border border-white/[0.06] bg-[#0a0a14]/95 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/[0.06]">
              <h2 className="text-lg font-semibold text-white">
                Generate Certificate
              </h2>
              <button
                onClick={resetAndClose}
                className="text-text-muted hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Student Search */}
              <div ref={dropdownRef} className="relative">
                <label className="block text-sm text-text-muted mb-1.5">
                  Student
                </label>
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() =>
                      students.length > 0 && setShowDropdown(true)
                    }
                    placeholder="Search students by name..."
                    className="w-full pl-8 pr-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white placeholder:text-text-muted text-sm focus:outline-none focus:border-neon-blue/40 transition-colors"
                  />
                  {searching && (
                    <Loader2
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted animate-spin"
                    />
                  )}
                </div>

                {showDropdown && students.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-white/[0.06] bg-[#0a0a14] shadow-xl">
                    {students.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSelectStudent(s)}
                        className="w-full text-left px-3 py-2 hover:bg-white/[0.04] transition-colors"
                      >
                        <p className="text-sm text-white">{s.user.name}</p>
                        <p className="text-xs text-text-muted">
                          {s.user.email}
                        </p>
                      </button>
                    ))}
                  </div>
                )}

                {showDropdown &&
                  !searching &&
                  students.length === 0 &&
                  searchQuery.length >= 2 && (
                    <div className="absolute z-10 mt-1 w-full rounded-lg border border-white/[0.06] bg-[#0a0a14] shadow-xl px-3 py-2">
                      <p className="text-sm text-text-muted">
                        No students found
                      </p>
                    </div>
                  )}

                {selectedStudent && (
                  <p className="mt-1 text-xs text-neon-green">
                    Selected: {selectedStudent.user.name}
                  </p>
                )}
              </div>

              {/* Certificate Type */}
              <div>
                <label className="block text-sm text-text-muted mb-1.5">
                  Certificate Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm focus:outline-none focus:border-neon-blue/40 transition-colors"
                >
                  {CERT_TYPES.map((t) => (
                    <option key={t.value} value={t.value} className="bg-[#0a0a14] text-white">
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm text-text-muted mb-1.5">
                  Expiry Date{" "}
                  <span className="text-text-muted/60">(optional)</span>
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm focus:outline-none focus:border-neon-blue/40 transition-colors [color-scheme:dark]"
                />
              </div>

              {/* Manual Upload (optional) */}
              <div>
                <label className="block text-sm text-text-muted mb-1.5">
                  Upload Custom Certificate{" "}
                  <span className="text-text-muted/60">(optional — overrides auto-generated)</span>
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(e) => setManualFile(e.target.files?.[0] || null)}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-white/[0.1] bg-white/[0.02] text-text-muted text-sm hover:border-neon-blue/30 hover:text-neon-blue transition-colors"
                >
                  <Upload size={14} />
                  {manualFile ? manualFile.name : "Choose file (PDF, PNG, JPG)"}
                </button>
                {manualFile && (
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-xs text-neon-green">File selected: {(manualFile.size / 1024).toFixed(0)} KB</p>
                    <button
                      type="button"
                      onClick={() => { setManualFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Resume Upload (optional) */}
              <div>
                <label className="block text-sm text-text-muted mb-1.5">
                  Update Resume{" "}
                  <span className="text-text-muted/60">(optional — updates student&apos;s resume on file)</span>
                </label>
                <input
                  ref={resumeInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                />
                <button
                  type="button"
                  onClick={() => resumeInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-white/[0.1] bg-white/[0.02] text-text-muted text-sm hover:border-neon-blue/30 hover:text-neon-blue transition-colors"
                >
                  <Upload size={14} />
                  {resumeFile ? resumeFile.name : "Upload Resume (PDF, DOC, DOCX)"}
                </button>
                {resumeFile && (
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-xs text-neon-green">Resume: {(resumeFile.size / 1024).toFixed(0)} KB</p>
                    <button
                      type="button"
                      onClick={() => { setResumeFile(null); if (resumeInputRef.current) resumeInputRef.current.value = ""; }}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              {success && (
                <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                  {success}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !selectedStudent}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-neon-green/10 text-neon-green border border-neon-green/20 hover:bg-neon-green/20 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Generate Certificate
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
