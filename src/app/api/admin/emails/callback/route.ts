import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exchangeCodeForTokens } from "@/lib/microsoft-graph";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const code = searchParams.get("code");
    const state = searchParams.get("state"); // employeeId
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        new URL(`/admin/emails?error=${encodeURIComponent(error)}`, req.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/admin/emails?error=missing_code", req.url)
      );
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // Save tokens to the employee record
    await prisma.employee.update({
      where: { id: state },
      data: {
        msAccessToken: tokens.accessToken,
        msRefreshToken: tokens.refreshToken,
        msTokenExpiry: new Date(Date.now() + tokens.expiresIn * 1000),
        msEmail: tokens.email,
      },
    });

    // Redirect back to emails page with success
    return NextResponse.redirect(
      new URL(`/admin/emails?connected=true&email=${encodeURIComponent(tokens.email)}`, req.url)
    );
  } catch (error: any) {
    console.error("Outlook callback error:", error);
    return NextResponse.redirect(
      new URL(`/admin/emails?error=${encodeURIComponent(error.message || "callback_failed")}`, req.url)
    );
  }
}
