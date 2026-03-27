import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTestSession } from "@/lib/test-session";

export async function GET() {
  try {
    const session = getTestSession("STUDENT");
    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        dateOfBirth: true,
        address: true,
        emergencyName: true,
        emergencyPhone: true,
        avatar: true,
        onboarded: true,
        termsAccepted: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const student = await prisma.student.findUnique({
      where: { userId },
      select: {
        id: true,
        course: true,
        status: true,
        qualification: true,
        paymentStatus: true,
        paidAmount: true,
        enrollmentDate: true,
        currentPhase: true,
        batch: {
          select: {
            id: true,
            name: true,
            course: true,
          },
        },
      },
    });

    return NextResponse.json({
      ...user,
      qualification: student?.qualification || null,
      course: student?.course || null,
      studentStatus: student?.status || null,
      paymentStatus: student?.paymentStatus || null,
      paidAmount: student?.paidAmount || null,
      enrollmentDate: student?.enrollmentDate || null,
      currentPhase: student?.currentPhase || null,
      batch: student?.batch || null,
      courseFee: 4500,
    });
  } catch (error) {
    console.error("Fetch profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = getTestSession("STUDENT");
    const userId = session.user.id;

    const body = await req.json();
    const { name, phone, address, dateOfBirth, emergencyName, emergencyPhone } =
      body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (dateOfBirth !== undefined)
      updateData.dateOfBirth = new Date(dateOfBirth);
    if (emergencyName !== undefined) updateData.emergencyName = emergencyName;
    if (emergencyPhone !== undefined)
      updateData.emergencyPhone = emergencyPhone;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        dateOfBirth: true,
        address: true,
        emergencyName: true,
        emergencyPhone: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
