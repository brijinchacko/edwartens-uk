import { NextResponse } from "next/server";

/**
 * Custom logout endpoint that clears all auth cookies and redirects to login.
 * This ensures a clean logout — no stale sessions.
 */
export async function POST() {
  const response = NextResponse.redirect(
    new URL("/login", process.env.NEXTAUTH_URL || "https://edwartens.co.uk"),
    { status: 302 }
  );

  // Clear all possible NextAuth session cookies
  const cookieNames = [
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "authjs.callback-url",
    "__Secure-authjs.callback-url",
    "authjs.csrf-token",
    "__Secure-authjs.csrf-token",
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "next-auth.callback-url",
    "next-auth.csrf-token",
  ];

  for (const name of cookieNames) {
    response.cookies.set(name, "", {
      expires: new Date(0),
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }

  // Prevent caching of this response
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  response.headers.set("Pragma", "no-cache");

  return response;
}

export async function GET() {
  return POST();
}
