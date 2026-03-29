"use client";

import { useState, useRef } from "react";
import {
  Upload,
  FileSpreadsheet,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  Download,
} from "lucide-react";

interface ImportResult {
  created: number;
  skipped: number;
  errors: string[];
}

const EXPECTED_COLUMNS = [
  "Title",
  "Description",
  "Phase Number",
  "Course",
  "Video URL",
  "Duration (min)",
  "Order",
  "Mandatory",
];

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let current = "";
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        row.push(current.trim());
        current = "";
      } else if (char === "\n" || (char === "\r" && next === "\n")) {
        row.push(current.trim());
        if (row.some((c) => c)) rows.push(row);
        row = [];
        current = "";
        if (char === "\r") i++;
      } else {
        current += char;
      }
    }
  }
  row.push(current.trim());
  if (row.some((c) => c)) rows.push(row);

  return rows;
}

export default function BulkImportSessions({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"upload" | "preview" | "importing" | "done">(
    "upload"
  );
  const [rows, setRows] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep("upload");
    setRows([]);
    setHeaders([]);
    setResult(null);
    setError("");
    setProgress(0);
  };

  const handleFile = async (file: File) => {
    setError("");
    const text = await file.text();
    const parsed = parseCSV(text);
    if (parsed.length < 2) {
      setError("File must have a header row and at least one data row.");
      return;
    }
    setHeaders(parsed[0]);
    setRows(parsed.slice(1));
    setStep("preview");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleImport = async () => {
    setStep("importing");
    setProgress(0);

    // Map headers to field names
    const headerMap: Record<string, number> = {};
    const normalized = headers.map((h) => h.toLowerCase().trim());
    const fieldMap: Record<string, string> = {
      title: "title",
      description: "description",
      "phase number": "phaseNumber",
      phase: "phaseNumber",
      course: "course",
      "video url": "videoUrl",
      video: "videoUrl",
      "duration (min)": "duration",
      duration: "duration",
      order: "order",
      mandatory: "mandatory",
    };

    normalized.forEach((h, i) => {
      const mapped = fieldMap[h];
      if (mapped) headerMap[mapped] = i;
    });

    if (headerMap["title"] === undefined) {
      setError("Could not find 'Title' column in CSV.");
      setStep("preview");
      return;
    }

    // Build session objects
    const sessions = rows.map((row) => ({
      title: row[headerMap["title"]] || "",
      description: row[headerMap["description"]] || "",
      phaseNumber: parseInt(row[headerMap["phaseNumber"]]) || 0,
      course: (row[headerMap["course"]] || "PROFESSIONAL_MODULE")
        .toUpperCase()
        .includes("AI")
        ? "AI_MODULE"
        : "PROFESSIONAL_MODULE",
      videoUrl: row[headerMap["videoUrl"]] || "",
      duration: parseInt(row[headerMap["duration"]]) || 0,
      order: parseInt(row[headerMap["order"]]) || 0,
      mandatory:
        headerMap["mandatory"] !== undefined
          ? !["no", "false", "0", "optional"]
              .includes((row[headerMap["mandatory"]] || "").toLowerCase().trim())
          : true,
    }));

    // Send to API in batches of 20
    const batchSize = 20;
    let totalCreated = 0;
    let totalSkipped = 0;
    const allErrors: string[] = [];

    for (let i = 0; i < sessions.length; i += batchSize) {
      const batch = sessions.slice(i, i + batchSize);
      try {
        const res = await fetch("/api/admin/sessions/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessions: batch }),
        });
        const data = await res.json();
        if (res.ok) {
          totalCreated += data.created || 0;
          totalSkipped += data.skipped || 0;
          if (data.errors?.length) allErrors.push(...data.errors);
        } else {
          allErrors.push(data.error || "Batch failed");
        }
      } catch {
        allErrors.push(`Batch ${Math.floor(i / batchSize) + 1} failed`);
      }
      setProgress(Math.round(((i + batch.length) / sessions.length) * 100));
    }

    setResult({ created: totalCreated, skipped: totalSkipped, errors: allErrors });
    setStep("done");
    if (totalCreated > 0) onSuccess?.();
  };

  const downloadTemplate = () => {
    const csv = EXPECTED_COLUMNS.join(",") + "\n" +
      "Introduction to PLC,Learn the basics of PLC programming,1,PROFESSIONAL_MODULE,https://www.youtube.com/watch?v=example,45,1,yes\n" +
      "SCADA Fundamentals,Understanding SCADA systems,1,PROFESSIONAL_MODULE,https://vimeo.com/123456789,60,2,yes\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sessions_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <button
        onClick={() => {
          setOpen(true);
          reset();
        }}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-purple/10 text-purple border border-purple/20 hover:bg-purple/20 transition-colors text-sm font-medium"
      >
        <Upload size={16} />
        Bulk Import
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => step !== "importing" && setOpen(false)}
          />
          <div className="relative w-full max-w-2xl mx-4 rounded-xl border border-white/[0.06] bg-[#0a0a14]/95 backdrop-blur-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/[0.06] bg-[#0a0a14]/95 backdrop-blur-xl">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-purple" />
                Bulk Import Sessions
              </h2>
              <button
                onClick={() => step !== "importing" && setOpen(false)}
                className="text-text-muted hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              {/* Upload Step */}
              {step === "upload" && (
                <div className="space-y-4">
                  <div
                    className="border-2 border-dashed border-white/[0.1] rounded-xl p-8 text-center hover:border-purple/40 transition-colors cursor-pointer"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                  >
                    <Upload
                      size={32}
                      className="mx-auto text-text-muted mb-3"
                    />
                    <p className="text-sm text-text-secondary mb-1">
                      Drag & drop a CSV file or click to browse
                    </p>
                    <p className="text-xs text-text-muted">
                      CSV format with columns: Title, Phase Number, Course,
                      Video URL, Duration, Order
                    </p>
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".csv,.txt"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFile(file);
                      }}
                    />
                  </div>

                  <button
                    onClick={downloadTemplate}
                    className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-neon-blue transition-colors"
                  >
                    <Download size={14} />
                    Download CSV template
                  </button>

                  {error && (
                    <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                      {error}
                    </p>
                  )}
                </div>
              )}

              {/* Preview Step */}
              {step === "preview" && (
                <div className="space-y-4">
                  <p className="text-sm text-text-secondary">
                    {rows.length} session{rows.length !== 1 ? "s" : ""} found.
                    Review before importing:
                  </p>

                  <div className="overflow-x-auto max-h-60 overflow-y-auto rounded-lg border border-white/[0.06]">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-white/[0.03]">
                          {headers.map((h, i) => (
                            <th
                              key={i}
                              className="px-3 py-2 text-left text-text-muted font-medium whitespace-nowrap"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.slice(0, 10).map((row, ri) => (
                          <tr
                            key={ri}
                            className="border-t border-white/[0.04]"
                          >
                            {row.map((cell, ci) => (
                              <td
                                key={ci}
                                className="px-3 py-2 text-text-secondary whitespace-nowrap max-w-[200px] truncate"
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {rows.length > 10 && (
                    <p className="text-xs text-text-muted">
                      Showing 10 of {rows.length} rows
                    </p>
                  )}

                  {error && (
                    <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                      {error}
                    </p>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={reset}
                      className="px-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-text-secondary text-sm hover:bg-white/[0.06] transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleImport}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20 transition-colors text-sm font-medium"
                    >
                      <Upload size={16} />
                      Import {rows.length} Sessions
                    </button>
                  </div>
                </div>
              )}

              {/* Importing Step */}
              {step === "importing" && (
                <div className="py-8 text-center space-y-4">
                  <Loader2
                    size={32}
                    className="mx-auto animate-spin text-neon-blue"
                  />
                  <p className="text-sm text-text-secondary">
                    Importing sessions...
                  </p>
                  <div className="w-full h-2 bg-dark-primary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-neon-blue rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-text-muted">{progress}%</p>
                </div>
              )}

              {/* Done Step */}
              {step === "done" && result && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <CheckCircle size={20} className="text-green-400 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-400">
                        Import Complete
                      </p>
                      <p className="text-xs text-text-secondary mt-1">
                        {result.created} created, {result.skipped} skipped
                      </p>
                    </div>
                  </div>

                  {result.errors.length > 0 && (
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle size={16} className="text-red-400" />
                        <p className="text-sm font-medium text-red-400">
                          {result.errors.length} error
                          {result.errors.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {result.errors.map((err, i) => (
                          <p key={i} className="text-xs text-red-300">
                            {err}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setOpen(false)}
                    className="w-full px-4 py-2.5 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20 transition-colors text-sm font-medium"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
