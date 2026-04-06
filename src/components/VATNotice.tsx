"use client";

import { useState } from "react";
import { useCurrency } from "./CurrencyProvider";
import { Info, ChevronDown } from "lucide-react";

const EU_VAT_RATES: Record<string, { rate: number; name: string }> = {
  DE: { rate: 19, name: "Germany" },
  FR: { rate: 20, name: "France" },
  NL: { rate: 21, name: "Netherlands" },
  IE: { rate: 23, name: "Ireland" },
  PL: { rate: 23, name: "Poland" },
  BE: { rate: 21, name: "Belgium" },
  SE: { rate: 25, name: "Sweden" },
  CZ: { rate: 21, name: "Czech Republic" },
  IT: { rate: 22, name: "Italy" },
  AT: { rate: 20, name: "Austria" },
  ES: { rate: 21, name: "Spain" },
  PT: { rate: 23, name: "Portugal" },
  DK: { rate: 25, name: "Denmark" },
  FI: { rate: 24, name: "Finland" },
  NO: { rate: 25, name: "Norway" },
  CH: { rate: 8.1, name: "Switzerland" },
  HU: { rate: 27, name: "Hungary" },
  RO: { rate: 19, name: "Romania" },
};

interface VATNoticeProps {
  /** Base price in GBP to show VAT calculation example */
  basePrice?: number;
}

export default function VATNotice({ basePrice = 2140 }: VATNoticeProps) {
  const { currency, convert, symbol } = useCurrency();
  const [selectedCountry, setSelectedCountry] = useState<string>("");

  const countryData = selectedCountry ? EU_VAT_RATES[selectedCountry] : null;
  const convertedPrice = convert(basePrice);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 mt-4">
      <div className="flex items-start gap-2.5">
        <Info size={16} className="text-neon-blue mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          {currency === "GBP" ? (
            <p className="text-xs text-text-secondary leading-relaxed">
              All prices exclude UK VAT (20%). VAT added at checkout.
            </p>
          ) : (
            <>
              <p className="text-xs text-text-secondary leading-relaxed mb-3">
                Prices exclude local VAT. EU VAT applied at checkout per EU
                Directive 2022/542.
              </p>

              {/* Country dropdown */}
              <div className="relative mb-2">
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-xs appearance-none cursor-pointer focus:border-neon-blue/50 focus:outline-none transition-colors pr-8"
                >
                  <option value="" className="bg-dark-secondary">
                    Select your country for VAT estimate...
                  </option>
                  {Object.entries(EU_VAT_RATES)
                    .sort((a, b) => a[1].name.localeCompare(b[1].name))
                    .map(([code, data]) => (
                      <option
                        key={code}
                        value={code}
                        className="bg-dark-secondary"
                      >
                        {data.name} ({data.rate}%)
                      </option>
                    ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                />
              </div>

              {/* VAT calculation */}
              {countryData && (
                <div className="rounded-lg bg-neon-blue/5 border border-neon-blue/10 px-3 py-2">
                  <p className="text-xs text-white font-medium">
                    {symbol}
                    {convertedPrice.toLocaleString()} + {countryData.rate}% VAT (
                    {countryData.name}) ={" "}
                    <span className="text-neon-blue font-semibold">
                      {symbol}
                      {Math.round(
                        convertedPrice * (1 + countryData.rate / 100)
                      ).toLocaleString()}{" "}
                      total
                    </span>
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export { EU_VAT_RATES };
