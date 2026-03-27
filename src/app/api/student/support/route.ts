import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTestSession } from "@/lib/test-session";

export async function POST(req: NextRequest) {
  try {
    const session = getTestSession("STUDENT");
    const userId = session.user.id;

    const body = await req.json();
    const { subject, message, category } = body;

    if (!subject || !message) {
      return NextResponse.json(
        { error: "Subject and message are required" },
        { status: 400 }
      );
    }

    // Save as a notification for the admin to review
    const notification = await prisma.notification.create({
      data: {
        userId,
        title: `Support: ${subject}`,
        message: `${category ? `[${category}] ` : ""}${message}`,
        type: "SUPPORT_TICKET",
        read: false,
      },
    });

    return NextResponse.json(
      {
        message: "Support ticket submitted successfully",
        ticketId: notification.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Support ticket error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
