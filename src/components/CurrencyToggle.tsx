"use client";

import { useCurrency } from "./CurrencyProvider";

export default function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="flex items-center rounded-full border border-white/[0.08] bg-white/[0.03] p-0.5 text-xs">
      <button
        onClick={() => setCurrency("GBP")}
        className={`px-2.5 py-1 rounded-full transition-all font-medium ${
          currency === "GBP"
            ? "bg-neon-blue/20 text-neon-blue border border-neon-blue/30"
            : "text-text-muted hover:text-white border border-transparent"
        }`}
      >
        £ GBP
      </button>
      <button
        onClick={() => setCurrency("EUR")}
        className={`px-2.5 py-1 rounded-full transition-all font-medium ${
          currency === "EUR"
            ? "bg-neon-blue/20 text-neon-blue border border-neon-blue/30"
            : "text-text-muted hover:text-white border border-transparent"
        }`}
      >
        € EUR
      </button>
    </div>
  );
}
