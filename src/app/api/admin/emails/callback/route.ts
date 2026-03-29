import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exchangeCodeForTokens } from "@/lib/microsoft-graph";

const BASE_URL = process.env.NEXTAUTH_URL || "https://edwartens.co.uk";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const code = searchParams.get("code");
    const state = searchParams.get("state"); // employeeId
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(`${BASE_URL}/admin/emails?error=${encodeURIComponent(error)}`);
    }

    if (!code || !state) {
      return NextResponse.redirect(`${BASE_URL}/admin/emails?error=missing_code`);
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

    return NextResponse.redirect(`${BASE_URL}/admin/emails?connected=true&email=${encodeURIComponent(tokens.email)}`);
  } catch (error: any) {
    console.error("Outlook callback error:", error);
    return NextResponse.redirect(`${BASE_URL}/admin/emails?error=${encodeURIComponent(error.message || "callback_failed")}`);
  }
}
