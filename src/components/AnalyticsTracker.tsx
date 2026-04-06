"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  const KEY = "ew_sid";
  let sid = sessionStorage.getItem(KEY);
  if (!sid) {
    sid = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(KEY, sid);
  }
  return sid;
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    // Skip admin/student portal tracking
    if (pathname.startsWith("/admin") || pathname.startsWith("/student")) return;

    const qs = searchParams?.toString();
    const fullPath = qs ? `${pathname}?${qs}` : pathname;

    const payload = {
      path: fullPath,
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
      sessionId: getSessionId(),
    };

    // Fire-and-forget; use keepalive so it survives navigation
    try {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    } catch {}
  }, [pathname, searchParams]);

  return null;
}
