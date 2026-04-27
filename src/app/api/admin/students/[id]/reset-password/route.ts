import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { generateTempPassword } from "@/lib/utils";

/**
 * POST /api/admin/students/[id]/reset-password
 *
 * Generates a new temporary password for the student's underlying User
 * record, bcrypt-hashes it, and returns the plaintext password ONCE in
 * the response so the admin can share it with the student manually.
 *
 * The plaintext is never persisted anywhere — once the response is
 * dismissed it cannot be retrieved.
 *
 * Permission: students:write (SUPER_ADMIN, ADMIN, ADMISSION_COUNSELLOR).
 * This matches the existing PATCH on the same student.
 */
export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "students:write")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;

    const student = await prisma.student.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    await prisma.user.update({
      where: { id: student.userId },
      data: { password: hashedPassword },
    });

    // Audit log — record that a password reset happened, but never store
    // the plaintext password.
    await logAudit({
      userId: session.user.id as string,
      userName: session.user.name || session.user.email,
      userRole: session.user.role,
      action: "UPDATE",
      entity: "student",
      entityId: id,
      entityName: `${student.user.name} (${student.user.email})`,
      details: JSON.stringify({ passwordReset: true }),
    });

    return NextResponse.json({
      success: true,
      email: student.user.email,
      tempPassword,
    });
  } catch (error) {
    console.error("Student password reset error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
