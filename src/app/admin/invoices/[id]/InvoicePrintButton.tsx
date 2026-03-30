"use client";

import { Download, Printer } from "lucide-react";

export default function InvoicePrintButton() {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-text-muted text-xs hover:bg-white/[0.06] transition-colors"
      >
        <Printer size={12} /> Print
      </button>
      <button
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neon-blue/10 border border-neon-blue/20 text-neon-blue text-xs font-medium hover:bg-neon-blue/20 transition-colors"
      >
        <Download size={12} /> Download PDF
      </button>
    </div>
  );
}
