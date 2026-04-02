import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isCrmRole } from "@/lib/rbac";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as { role: string }).role;
    if (!isCrmRole(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await req.json();
    const { name, phone, bio, department, specialization, designation, zadarmaNumber } = body;

    // Update user fields
    const userUpdate: Record<string, unknown> = {};
    if (name !== undefined) userUpdate.name = name;
    if (phone !== undefined) userUpdate.phone = phone;

    if (Object.keys(userUpdate).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: userUpdate,
      });
    }

    // Update employee fields
    const employeeUpdate: Record<string, unknown> = {};
    if (bio !== undefined) employeeUpdate.bio = bio;
    if (department !== undefined) employeeUpdate.department = department;
    if (specialization !== undefined) employeeUpdate.specialization = specialization;
    if (designation !== undefined) employeeUpdate.designation = designation;
    if (zadarmaNumber !== undefined) employeeUpdate.zadarmaNumber = zadarmaNumber;

    if (Object.keys(employeeUpdate).length > 0) {
      await prisma.employee.upsert({
        where: { userId },
        update: employeeUpdate,
        create: {
          userId,
          ...employeeUpdate,
        },
      });
    }

    return NextResponse.json({ message: "Profile updated" });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
