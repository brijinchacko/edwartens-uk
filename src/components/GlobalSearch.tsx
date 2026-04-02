"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Users,
  Layers,
  FileText,
  UserCog,
  Loader2,
} from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  href: string;
  icon: string;
}

interface GroupedResults {
  category: string;
  icon: string;
  results: SearchResult[];
}

const ICON_MAP: Record<string, typeof Users> = {
  Users,
  UserCog,
  Layers,
  FileText,
};

function groupResults(results: SearchResult[]): GroupedResults[] {
  const map = new Map<string, GroupedResults>();
  for (const r of results) {
    if (!map.has(r.category)) {
      map.set(r.category, { category: r.category, icon: r.icon, results: [] });
    }
    map.get(r.category)!.results.push(r);
  }
  return Array.from(map.values());
}

export default function GlobalSearch() {
  const router = useRouter();
  const pathname = usePathname();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [focused, setFocused] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close on route change
  useEffect(() => {
    setOpen(false);
    setQuery("");
    setResults([]);
    setActiveIndex(-1);
  }, [pathname]);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch search results with debounce
  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/search?q=${encodeURIComponent(q)}`
      );
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
        setOpen(true);
      }
    } catch {
      // Silently fail
    }
    setLoading(false);
  }, []);

  const handleChange = (value: string) => {
    // Clean pasted phone numbers — remove spaces, dashes, brackets
    const cleaned = value.replace(/^\+/, "").replace(/[\s\-()]/g, "");
    const isPhoneNumber = /^\d{6,}$/.test(cleaned);
    const searchValue = isPhoneNumber ? cleaned : value;

    setQuery(value); // Show original in input
    setActiveIndex(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchValue.trim().length < 2) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(() => {
      doSearch(searchValue.trim());
    }, 300);
  };

  // Flatten for keyboard nav
  const flatResults = results;

  const navigate = (href: string) => {
    setOpen(false);
    setQuery("");
    setResults([]);
    router.push(href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open && e.key !== "Escape") return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) =>
          i < flatResults.length - 1 ? i + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) =>
          i > 0 ? i - 1 : flatResults.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && flatResults[activeIndex]) {
          navigate(flatResults[activeIndex].href);
        }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const grouped = groupResults(results);

  // Track cumulative index for keyboard navigation
  let cumulativeIndex = 0;

  return (
    <div ref={containerRef} className="relative">
      {/* Search Input */}
      <div className="relative flex items-center">
        <Search
          size={14}
          className="absolute left-2.5 text-text-muted pointer-events-none"
        />
        {loading && (
          <Loader2
            size={12}
            className="absolute right-2.5 text-text-muted animate-spin"
          />
        )}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => {
            setFocused(true);
            if (results.length > 0) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search..."
          className={`bg-white/[0.03] border border-white/[0.06] rounded-lg pl-8 pr-8 py-1.5 text-sm text-text-primary placeholder:text-text-muted/50 outline-none transition-all duration-200 ${
            focused ? "w-80" : "w-64"
          } focus:border-white/[0.12] focus:bg-white/[0.05]`}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full mt-1 w-96 max-h-96 overflow-y-auto rounded-xl border border-white/[0.08] bg-[#0c1018] shadow-2xl z-50">
          {results.length === 0 && !loading ? (
            <div className="px-4 py-8 text-center text-text-muted text-xs">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : results.length === 0 && loading ? (
            <div className="px-4 py-8 text-center text-text-muted text-xs">
              Searching...
            </div>
          ) : (
            grouped.map((group) => {
              const IconComponent = ICON_MAP[group.icon] || FileText;
              const groupStartIndex = cumulativeIndex;

              const section = (
                <div key={group.category}>
                  {/* Category header */}
                  <div className="text-[10px] uppercase tracking-wider text-text-muted px-3 py-1.5 bg-white/[0.02] flex items-center gap-2 sticky top-0">
                    <IconComponent size={10} />
                    <span>
                      {group.category} ({group.results.length})
                    </span>
                  </div>

                  {/* Results */}
                  {group.results.map((result, i) => {
                    const flatIdx = groupStartIndex + i;
                    const isActive = flatIdx === activeIndex;

                    return (
                      <button
                        key={result.id}
                        onClick={() => navigate(result.href)}
                        onMouseEnter={() => setActiveIndex(flatIdx)}
                        className={`w-full px-3 py-2 cursor-pointer flex items-center gap-3 text-left transition-colors ${
                          isActive
                            ? "bg-white/[0.05]"
                            : "hover:bg-white/[0.03]"
                        }`}
                      >
                        <IconComponent
                          size={14}
                          className="text-text-muted shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-text-primary font-medium truncate">
                            {result.title}
                          </p>
                          {result.subtitle && (
                            <p className="text-[11px] text-text-muted truncate">
                              {result.subtitle}
                            </p>
                          )}
                        </div>
                        <span className="text-[9px] text-text-muted/50 shrink-0 uppercase">
                          {result.category}
                        </span>
                      </button>
                    );
                  })}
                </div>
              );

              cumulativeIndex += group.results.length;
              return section;
            })
          )}

          {/* Keyboard hint */}
          {results.length > 0 && (
            <div className="px-3 py-1.5 border-t border-white/[0.06] text-[10px] text-text-muted/50 flex items-center gap-3">
              <span>
                <kbd className="px-1 py-0.5 rounded bg-white/[0.06] text-[9px]">
                  &uarr;&darr;
                </kbd>{" "}
                navigate
              </span>
              <span>
                <kbd className="px-1 py-0.5 rounded bg-white/[0.06] text-[9px]">
                  Enter
                </kbd>{" "}
                select
              </span>
              <span>
                <kbd className="px-1 py-0.5 rounded bg-white/[0.06] text-[9px]">
                  Esc
                </kbd>{" "}
                close
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
