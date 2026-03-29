"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, FileSpreadsheet, Loader2, CheckCircle, AlertCircle, Download, X } from "lucide-react";

type ImportMode = "leads" | "students";

interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
  credentials?: { email: string; tempPassword: string }[];
}

const LEAD_COLUMNS = [
  "Name", "Email", "Phone", "Course Interest", "Qualification", "Source", "Status", "Notes",
];

const STUDENT_COLUMNS = [
  "Name", "Email", "Phone", "Course", "Batch", "Status", "Payment Status", "Paid Amount", "Qualification",
];

const LEAD_FIELD_MAP: Record<string, string> = {
  name: "name",
  "full name": "name",
  "first name": "name",
  email: "email",
  "email address": "email",
  phone: "phone",
  "phone number": "phone",
  mobile: "phone",
  telephone: "phone",
  "course interest": "courseInterest",
  course: "courseInterest",
  "course name": "courseInterest",
  qualification: "qualification",
  degree: "qualification",
  education: "qualification",
  source: "source",
  "lead source": "source",
  status: "status",
  "lead status": "status",
  notes: "notes",
  note: "notes",
  comment: "notes",
  comments: "notes",
};

const STUDENT_FIELD_MAP: Record<string, string> = {
  name: "name",
  "full name": "name",
  email: "email",
  "email address": "email",
  phone: "phone",
  "phone number": "phone",
  mobile: "phone",
  course: "course",
  "course name": "course",
  batch: "batch",
  "batch name": "batch",
  status: "status",
  "student status": "status",
  "payment status": "paymentStatus",
  "paid amount": "paidAmount",
  amount: "paidAmount",
  qualification: "qualification",
  degree: "qualification",
};

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
        if (row.some((c) => c !== "")) rows.push(row);
        row = [];
        current = "";
        if (char === "\r") i++;
      } else {
        current += char;
      }
    }
  }
  row.push(current.trim());
  if (row.some((c) => c !== "")) rows.push(row);

  return rows;
}

function autoDetectMapping(
  headers: string[],
  mode: ImportMode
): Record<number, string> {
  const fieldMap = mode === "leads" ? LEAD_FIELD_MAP : STUDENT_FIELD_MAP;
  const mapping: Record<number, string> = {};

  headers.forEach((header, index) => {
    const normalized = header.toLowerCase().trim();
    if (fieldMap[normalized]) {
      mapping[index] = fieldMap[normalized];
    }
  });

  return mapping;
}

function downloadCredentialsCSV(credentials: { email: string; tempPassword: string }[]) {
  const header = "Email,Temporary Password\n";
  const rows = credentials.map((c) => `${c.email},${c.tempPassword}`).join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `student-credentials-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ImportTool() {
  const [mode, setMode] = useState<ImportMode>("leads");
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<number, string>>({});
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const targetFields =
    mode === "leads"
      ? ["name", "email", "phone", "courseInterest", "qualification", "source", "status", "notes"]
      : ["name", "email", "phone", "course", "batch", "status", "paymentStatus", "paidAmount", "qualification"];

  const fieldLabels: Record<string, string> = {
    name: "Name",
    email: "Email",
    phone: "Phone",
    courseInterest: "Course Interest",
    qualification: "Qualification",
    source: "Source",
    status: "Status",
    notes: "Notes",
    course: "Course",
    batch: "Batch",
    paymentStatus: "Payment Status",
    paidAmount: "Paid Amount",
  };

  const reset = useCallback(() => {
    setFile(null);
    setHeaders([]);
    setRows([]);
    setMapping({});
    setResult(null);
    setError("");
    setProgress({ current: 0, total: 0 });
    if (fileRef.current) fileRef.current.value = "";
  }, []);

  const processFile = useCallback(
    async (f: File) => {
      setError("");
      setResult(null);

      if (!f.name.match(/\.(csv|xlsx?)$/i)) {
        setError("Please upload a CSV or Excel (.xlsx) file");
        return;
      }

      setFile(f);

      try {
        let parsed: string[][];

        if (f.name.match(/\.xlsx?$/i)) {
          // Dynamic import for xlsx
          const XLSX = await import("xlsx");
          const buffer = await f.arrayBuffer();
          const workbook = XLSX.read(buffer, { type: "array" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const data: string[][] = XLSX.utils.sheet_to_json(sheet, {
            header: 1,
            defval: "",
          });
          parsed = data.filter((row) => row.some((cell) => cell !== ""));
        } else {
          const text = await f.text();
          parsed = parseCSV(text);
        }

        if (parsed.length < 2) {
          setError("File must have at least a header row and one data row");
          return;
        }

        const fileHeaders = parsed[0].map(String);
        const fileRows = parsed.slice(1);

        setHeaders(fileHeaders);
        setRows(fileRows);

        const detected = autoDetectMapping(fileHeaders, mode);
        setMapping(detected);
      } catch (err: any) {
        setError(err.message || "Failed to parse file");
      }
    },
    [mode]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) processFile(f);
    },
    [processFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) processFile(f);
    },
    [processFile]
  );

  const updateMapping = (colIndex: number, field: string) => {
    setMapping((prev) => {
      const next = { ...prev };
      if (field === "") {
        delete next[colIndex];
      } else {
        // Remove existing mapping for this field
        Object.keys(next).forEach((key) => {
          if (next[Number(key)] === field) delete next[Number(key)];
        });
        next[colIndex] = field;
      }
      return next;
    });
  };

  const handleImport = async () => {
    setImporting(true);
    setError("");
    setResult(null);

    const mappedValues = Object.values(mapping);
    if (!mappedValues.includes("name") || !mappedValues.includes("email")) {
      setError("Name and Email columns must be mapped");
      setImporting(false);
      return;
    }

    // Build records from rows using mapping
    const records = rows.map((row) => {
      const record: Record<string, string> = {};
      Object.entries(mapping).forEach(([colIndex, field]) => {
        const value = row[Number(colIndex)];
        if (value !== undefined && value !== "") {
          record[field] = String(value);
        }
      });
      return record;
    });

    // Filter out empty rows
    const validRecords = records.filter((r) => r.name && r.email);
    setProgress({ current: 0, total: validRecords.length });

    // Import in batches of 50
    const batchSize = 50;
    let totalImported = 0;
    let totalSkipped = 0;
    const allErrors: string[] = [];
    const allCredentials: { email: string; tempPassword: string }[] = [];

    for (let i = 0; i < validRecords.length; i += batchSize) {
      const batch = validRecords.slice(i, i + batchSize);

      try {
        const res = await fetch("/api/admin/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: mode, records: batch }),
        });

        const data = await res.json();

        if (!res.ok) {
          allErrors.push(data.error || `Batch ${Math.floor(i / batchSize) + 1} failed`);
        } else {
          totalImported += data.imported || 0;
          totalSkipped += data.skipped || 0;
          if (data.errors) allErrors.push(...data.errors);
          if (data.credentials) allCredentials.push(...data.credentials);
        }
      } catch (err: any) {
        allErrors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${err.message}`);
      }

      setProgress({ current: Math.min(i + batchSize, validRecords.length), total: validRecords.length });
    }

    setResult({
      imported: totalImported,
      skipped: totalSkipped,
      errors: allErrors,
      credentials: allCredentials.length > 0 ? allCredentials : undefined,
    });
    setImporting(false);
  };

  return (
    <div className="space-y-6">
      {/* Mode Tabs */}
      <div className="glass-card p-1 inline-flex rounded-lg">
        <button
          onClick={() => {
            setMode("leads");
            reset();
          }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === "leads"
              ? "bg-neon-blue/10 text-neon-blue border border-neon-blue/20"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          Import Leads
        </button>
        <button
          onClick={() => {
            setMode("students");
            reset();
          }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === "students"
              ? "bg-neon-blue/10 text-neon-blue border border-neon-blue/20"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          Import Students
        </button>
      </div>

      {/* Expected Columns Info */}
      <div className="glass-card p-4">
        <p className="text-sm text-text-muted mb-2">
          Expected CSV columns for{" "}
          <span className="text-text-primary font-medium">
            {mode === "leads" ? "Leads" : "Students"}
          </span>
          :
        </p>
        <div className="flex flex-wrap gap-2">
          {(mode === "leads" ? LEAD_COLUMNS : STUDENT_COLUMNS).map((col) => (
            <span
              key={col}
              className="px-2 py-0.5 rounded text-xs bg-white/[0.05] text-text-secondary border border-white/[0.06]"
            >
              {col}
            </span>
          ))}
        </div>
      </div>

      {/* File Upload Area */}
      {!file && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`glass-card p-12 border-2 border-dashed cursor-pointer transition-colors text-center ${
            dragOver
              ? "border-neon-blue/50 bg-neon-blue/5"
              : "border-white/[0.08] hover:border-white/[0.15]"
          }`}
        >
          <Upload size={40} className="mx-auto text-text-muted mb-4" />
          <p className="text-text-primary font-medium mb-1">
            Drop your CSV or Excel file here
          </p>
          <p className="text-sm text-text-muted">
            or click to browse. Supports .csv and .xlsx files.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {/* File loaded - show preview */}
      {file && headers.length > 0 && !result && (
        <>
          {/* File info bar */}
          <div className="glass-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileSpreadsheet size={20} className="text-neon-blue" />
              <div>
                <p className="text-sm text-text-primary font-medium">{file.name}</p>
                <p className="text-xs text-text-muted">
                  {rows.length} row{rows.length !== 1 ? "s" : ""} found &middot;{" "}
                  {headers.length} column{headers.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <button
              onClick={reset}
              className="p-1.5 rounded-md text-text-muted hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Column Mapping */}
          <div className="glass-card p-4 space-y-3">
            <h3 className="text-sm font-medium text-text-primary">
              Column Mapping
            </h3>
            <p className="text-xs text-text-muted">
              Map your CSV columns to system fields. Auto-detected mappings are pre-filled.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {headers.map((header, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-xs text-text-secondary truncate min-w-0 flex-shrink-0 w-28">
                    {header}
                  </span>
                  <span className="text-text-muted text-xs">&rarr;</span>
                  <select
                    value={mapping[index] || ""}
                    onChange={(e) => updateMapping(index, e.target.value)}
                    className="flex-1 px-2 py-1.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-white text-xs focus:outline-none focus:border-neon-blue/40"
                  >
                    <option value="" className="bg-[#0a0a14]">
                      Skip
                    </option>
                    {targetFields.map((field) => (
                      <option key={field} value={field} className="bg-[#0a0a14]">
                        {fieldLabels[field] || field}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Preview Table */}
          <div className="glass-card overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <h3 className="text-sm font-medium text-text-primary">
                Preview (first {Math.min(rows.length, 10)} rows)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {headers.map((h, i) => (
                      <th
                        key={i}
                        className={`text-left px-3 py-2 font-medium whitespace-nowrap ${
                          mapping[i]
                            ? "text-neon-blue"
                            : "text-text-muted"
                        }`}
                      >
                        {h}
                        {mapping[i] && (
                          <span className="block text-[10px] text-text-muted font-normal">
                            &rarr; {fieldLabels[mapping[i]] || mapping[i]}
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 10).map((row, ri) => (
                    <tr
                      key={ri}
                      className="border-b border-white/[0.04] hover:bg-white/[0.02]"
                    >
                      {headers.map((_, ci) => (
                        <td
                          key={ci}
                          className="px-3 py-2 text-text-secondary whitespace-nowrap max-w-[200px] truncate"
                        >
                          {row[ci] || "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Import Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleImport}
              disabled={importing}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {importing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Import {rows.length} Record{rows.length !== 1 ? "s" : ""}
                </>
              )}
            </button>
            <button
              onClick={reset}
              disabled={importing}
              className="px-4 py-2.5 rounded-lg text-text-muted hover:text-text-primary text-sm transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>

          {/* Progress Bar */}
          {importing && progress.total > 0 && (
            <div className="glass-card p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Importing...</span>
                <span className="text-text-muted">
                  {progress.current} of {progress.total}
                </span>
              </div>
              <div className="w-full h-2 bg-white/[0.05] rounded-full overflow-hidden">
                <div
                  className="h-full bg-neon-blue/60 rounded-full transition-all duration-300"
                  style={{
                    width: `${(progress.current / progress.total) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Error */}
      {error && (
        <div className="glass-card p-4 border border-red-500/20 bg-red-500/5">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle size={24} className="text-green-400" />
            <h3 className="text-lg font-semibold text-text-primary">
              Import Complete
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/10">
              <p className="text-2xl font-bold text-green-400">{result.imported}</p>
              <p className="text-xs text-text-muted mt-1">Imported</p>
            </div>
            <div className="p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
              <p className="text-2xl font-bold text-yellow-400">{result.skipped}</p>
              <p className="text-xs text-text-muted mt-1">Skipped (duplicate)</p>
            </div>
            <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/10">
              <p className="text-2xl font-bold text-red-400">{result.errors.length}</p>
              <p className="text-xs text-text-muted mt-1">Errors</p>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {result.errors.slice(0, 20).map((err, i) => (
                <p key={i} className="text-xs text-red-400">
                  {err}
                </p>
              ))}
              {result.errors.length > 20 && (
                <p className="text-xs text-text-muted">
                  ... and {result.errors.length - 20} more errors
                </p>
              )}
            </div>
          )}

          {result.credentials && result.credentials.length > 0 && (
            <button
              onClick={() => downloadCredentialsCSV(result.credentials!)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors text-sm font-medium"
            >
              <Download size={16} />
              Download Credentials CSV ({result.credentials.length} accounts)
            </button>
          )}

          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.05] text-text-secondary hover:text-text-primary border border-white/[0.06] hover:bg-white/[0.08] transition-colors text-sm font-medium"
          >
            Import Another File
          </button>
        </div>
      )}
    </div>
  );
}
