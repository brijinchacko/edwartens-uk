import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const runtime = "nodejs";

function parseUA(ua: string): { device: string; browser: string; os: string } {
  const lower = ua.toLowerCase();
  let device = "desktop";
  if (/mobile|iphone|android.*mobile/i.test(ua)) device = "mobile";
  else if (/tablet|ipad/i.test(ua)) device = "tablet";

  let browser = "Other";
  if (lower.includes("edg/")) browser = "Edge";
  else if (lower.includes("chrome/") && !lower.includes("edg/")) browser = "Chrome";
  else if (lower.includes("firefox/")) browser = "Firefox";
  else if (lower.includes("safari/") && !lower.includes("chrome/")) browser = "Safari";
  else if (lower.includes("opera") || lower.includes("opr/")) browser = "Opera";

  let os = "Other";
  if (lower.includes("windows")) os = "Windows";
  else if (lower.includes("mac os") || lower.includes("macintosh")) os = "macOS";
  else if (lower.includes("android")) os = "Android";
  else if (lower.includes("iphone") || lower.includes("ipad") || lower.includes("ios")) os = "iOS";
  else if (lower.includes("linux")) os = "Linux";

  return { device, browser, os };
}

function extractHost(referrer: string | null): string | null {
  if (!referrer) return null;
  try {
    const url = new URL(referrer);
    // Strip own domain
    if (url.hostname.includes("edwartens.co.uk")) return null;
    return url.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

async function lookupCountry(ip: string): Promise<{ country?: string; countryCode?: string; city?: string; region?: string }> {
  // Skip for private/local IPs
  if (!ip || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172.")) {
    return {};
  }
  try {
    // ipapi.co free tier: 1000/day, no key needed
    const res = await fetch(`https://ipapi.co/${ip}/json/`, {
      signal: AbortSignal.timeout(2000),
      headers: { "User-Agent": "edwartens-analytics/1.0" },
    });
    if (!res.ok) return {};
    const data = await res.json();
    return {
      country: data.country_name,
      countryCode: data.country_code,
      city: data.city,
      region: data.region,
    };
  } catch {
    return {};
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { path, referrer, sessionId, userId } = body;

    if (!path || typeof path !== "string") {
      return NextResponse.json({ error: "path required" }, { status: 400 });
    }

    // Skip tracking for admin/student portals and API routes
    if (path.startsWith("/admin") || path.startsWith("/student") || path.startsWith("/api")) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    // Parse URL params for UTM
    let utmSource: string | null = null;
    let utmMedium: string | null = null;
    let utmCampaign: string | null = null;
    try {
      const url = new URL(path, "https://edwartens.co.uk");
      utmSource = url.searchParams.get("utm_source");
      utmMedium = url.searchParams.get("utm_medium");
      utmCampaign = url.searchParams.get("utm_campaign");
    } catch {}

    // Get IP from headers (Next.js behind reverse proxy)
    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const ip = (forwardedFor?.split(",")[0] || realIp || "").trim();

    // Hash IP for privacy (GDPR-friendly)
    const ipHash = ip
      ? crypto
          .createHash("sha256")
          .update(ip + (process.env.NEXTAUTH_SECRET || "salt"))
          .digest("hex")
          .slice(0, 16)
      : null;

    const userAgent = req.headers.get("user-agent") || "";
    const { device, browser, os } = parseUA(userAgent);

    // Country lookup (non-blocking best-effort)
    const geo = await lookupCountry(ip);

    // Clean path (strip query string)
    const cleanPath = path.split("?")[0];

    await prisma.pageView.create({
      data: {
        path: cleanPath,
        referrer: referrer || null,
        referrerHost: extractHost(referrer),
        utmSource,
        utmMedium,
        utmCampaign,
        country: geo.country || null,
        countryCode: geo.countryCode || null,
        city: geo.city || null,
        region: geo.region || null,
        device,
        browser,
        os,
        userAgent: userAgent.slice(0, 500),
        ipHash,
        sessionId: sessionId || null,
        userId: userId || null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Analytics track error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
