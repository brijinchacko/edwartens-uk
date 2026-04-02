import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Edge middleware: runs BEFORE any page rendering or caching.
 * Checks for the NextAuth session token cookie.
 * If missing → redirect to /login.
 * This prevents cached pages from being shown after logout.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
  matcher: ["/admin/:path*", "/student/:path*"],
};
