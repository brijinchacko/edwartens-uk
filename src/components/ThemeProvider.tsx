"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ThemeMode = "dark" | "light";

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  accent: string;
  setAccent: (hex: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const THEME_KEY = "edw-theme";
const ACCENT_KEY = "edw-accent";
const DEFAULT_ACCENT = "#2891FF"; // neon-blue

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [accent, setAccentState] = useState(DEFAULT_ACCENT);
  const [mounted, setMounted] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY) as ThemeMode | null;
    const savedAccent = localStorage.getItem(ACCENT_KEY);
    if (savedTheme === "light" || savedTheme === "dark") {
      setThemeState(savedTheme);
    }
    if (savedAccent && /^#[0-9A-Fa-f]{6}$/.test(savedAccent)) {
      setAccentState(savedAccent);
    }
    setMounted(true);
  }, []);

  // Apply theme class + accent variable to <body>
  useEffect(() => {
    if (!mounted) return;
    const body = document.body;

    // Theme class
    body.classList.remove("theme-dark", "theme-light");
    body.classList.add(`theme-${theme}`);

    // Accent CSS variable
    body.style.setProperty("--accent-color", accent);

    // Persist
    localStorage.setItem(THEME_KEY, theme);
    localStorage.setItem(ACCENT_KEY, accent);
  }, [theme, accent, mounted]);

  const setTheme = useCallback((t: ThemeMode) => {
    setThemeState(t);
  }, []);

  const setAccent = useCallback((hex: string) => {
    setAccentState(hex);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, accent, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
