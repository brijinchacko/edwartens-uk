import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasAnyPermission } from "@/lib/rbac";
import {
  createCalendarEvent,
  getCalendarEvents,
  isOutlookConnected,
} from "@/lib/microsoft-graph";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !hasAnyPermission(session.user.role, ["dashboard:read"])
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "startDate and endDate are required" },
        { status: 400 }
      );
    }

    // Get employee record for the logged-in user
    const employee = await prisma.employee.findUnique({
      where: { userId: session.user.id },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Employee profile not found" },
        { status: 404 }
      );
    }

    const outlook = await isOutlookConnected(employee.id);

    if (!outlook.connected) {
      return NextResponse.json({
        events: [],
        connected: false,
        email: null,
      });
    }

    const events = await getCalendarEvents(employee.id, startDate, endDate);

    return NextResponse.json({
      events,
      connected: true,
      email: outlook.email,
    });
  } catch (error) {
    console.error("Calendar GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar events" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !hasAnyPermission(session.user.role, ["dashboard:read"])
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { subject, start, end, location, bodyText, attendees } = body;

    if (!subject || !start || !end) {
      return NextResponse.json(
        { error: "subject, start, and end are required" },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.findUnique({
      where: { userId: session.user.id },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Employee profile not found" },
        { status: 404 }
      );
    }

    const outlook = await isOutlookConnected(employee.id);
    if (!outlook.connected) {
      return NextResponse.json(
        { error: "Outlook not connected. Please connect in Settings." },
        { status: 400 }
      );
    }

    const event = await createCalendarEvent(employee.id, {
      subject,
      start,
      end,
      location,
      body: bodyText,
      attendees,
    });

    return NextResponse.json({ event });
  } catch (error) {
    console.error("Calendar POST error:", error);
    return NextResponse.json(
      { error: "Failed to create calendar event" },
      { status: 500 }
    );
  }
}
