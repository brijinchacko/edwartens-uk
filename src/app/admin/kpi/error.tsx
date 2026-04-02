"use client";

export default function KPIError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="space-y-4 p-6">
      <h2 className="text-xl font-bold text-text-primary">KPI Dashboard Error</h2>
      <p className="text-text-muted text-sm">
        Something went wrong loading the KPI dashboard.
      </p>
      <pre className="text-xs text-red-400 bg-red-500/5 border border-red-500/20 rounded-lg p-3 overflow-auto max-h-48">
        {error.message}
      </pre>
      <button
        onClick={reset}
        className="px-4 py-2 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20 text-sm"
      >
        Try Again
      </button>
    </div>
  );
}
