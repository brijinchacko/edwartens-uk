"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Currency = "GBP" | "EUR";
const RATE = 1.18; // 1 GBP = 1.18 EUR

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  convert: (gbpAmount: number) => number;
  format: (gbpAmount: number) => string;
  symbol: string;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "GBP",
  setCurrency: () => {},
  convert: (a) => a,
  format: (a) => `\u00a3${a.toLocaleString()}`,
  symbol: "\u00a3",
});

export function CurrencyProvider({
  children,
  defaultCurrency,
}: {
  children: ReactNode;
  defaultCurrency?: Currency;
}) {
  const [currency, setCurrencyState] = useState<Currency>("GBP");

  useEffect(() => {
    const saved = localStorage.getItem("edw-currency") as Currency;
    if (saved === "EUR" || saved === "GBP") setCurrencyState(saved);
    else if (defaultCurrency) setCurrencyState(defaultCurrency);
  }, [defaultCurrency]);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem("edw-currency", c);
  };

  const convert = (gbp: number) =>
    currency === "EUR" ? Math.round(gbp * RATE) : gbp;
  const symbol = currency === "EUR" ? "\u20ac" : "\u00a3";
  const format = (gbp: number) => `${symbol}${convert(gbp).toLocaleString()}`;

  return (
    <CurrencyContext.Provider
      value={{ currency, setCurrency, convert, format, symbol }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
