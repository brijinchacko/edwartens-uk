import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id as string;

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
