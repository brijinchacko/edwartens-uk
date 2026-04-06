import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Edge middleware: runs BEFORE any page rendering or caching.
 * Checks for the NextAuth session token cookie.
 * If missing → redirect to /login.
 * This prevents cached pages from being shown after logout.
 */
// 301 redirects for old URLs that Google indexed
const REDIRECTS: Record<string, string> = {
  "/plc-scada-training-in-uk": "/plc-training-uk",
  "/plc-training": "/courses/professional",
  "/scada-training": "/courses/professional",
  "/automation-training": "/training",
  "/plc-courses": "/courses",
  "/courses/plc-scada-training": "/courses/professional",
  "/plc-scada-training": "/courses/professional",
  "/plc-programming-course": "/courses/professional",
  "/industrial-automation-training": "/training",
  "/scada-hmi-training": "/courses/professional",
  "/siemens-plc-training": "/courses/professional",
  "/plc-training-near-me": "/plc-training-uk",
  "/plc-course-uk": "/plc-training-uk",
  "/scada-course-uk": "/plc-training-uk",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle old URL redirects (301 permanent)
  const redirect = REDIRECTS[pathname] || REDIRECTS[pathname.toLowerCase()];
  if (redirect) {
    return NextResponse.redirect(new URL(redirect, request.url), 301);
  }

  // Check for NextAuth session cookie (works for both JWT and database sessions)
  const sessionToken =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value ||
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;

  const isProtectedRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/student");

  if (isProtectedRoute && !sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);

    const response = NextResponse.redirect(loginUrl);
    // Prevent browser from caching the redirect
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    response.headers.set("Pragma", "no-cache");
    return response;
  }

  // For protected routes, add no-cache headers to prevent stale pages after logout
  if (isProtectedRoute) {
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/student/:path*",
    "/plc-scada-training-in-uk",
    "/plc-training",
    "/scada-training",
    "/automation-training",
    "/plc-courses",
    "/courses/plc-scada-training",
    "/plc-scada-training",
    "/plc-programming-course",
    "/industrial-automation-training",
    "/scada-hmi-training",
    "/siemens-plc-training",
    "/plc-training-near-me",
    "/plc-course-uk",
    "/scada-course-uk",
  ],
};
