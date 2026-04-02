import { prisma } from "./prisma";

export async function notifyUser(userId: string, title: string, message: string, type: string = "INFO", link?: string) {
  try {
    await prisma.notification.create({ data: { userId, title, message, type, link } });
  } catch {} // fire-and-forget
}

export async function notifyStudent(studentId: string, title: string, message: string, link?: string) {
  try {
    const student = await prisma.student.findUnique({ where: { id: studentId }, select: { userId: true } });
    if (student) await notifyUser(student.userId, title, message, "STUDENT", link);
  } catch {}
}

export async function notifyAdmins(title: string, message: string, link?: string) {
  try {
    const admins = await prisma.user.findMany({ where: { role: { in: ["SUPER_ADMIN", "ADMIN"] as any }, isActive: true }, select: { id: true } });
    await prisma.notification.createMany({ data: admins.map(a => ({ userId: a.id, title, message, type: "ADMIN", link })) });
  } catch {}
}

export async function notifyRole(roles: string[], title: string, message: string, link?: string) {
  try {
    const users = await prisma.user.findMany({ where: { role: { in: roles as any }, isActive: true }, select: { id: true } });
    await prisma.notification.createMany({ data: users.map(u => ({ userId: u.id, title, message, type: "SYSTEM", link })) });
  } catch {}
}

export async function notifyEmployee(employeeId: string, title: string, message: string, link?: string) {
  try {
    const emp = await prisma.employee.findUnique({ where: { id: employeeId }, select: { userId: true } });
    if (emp) await notifyUser(emp.userId, title, message, "EMPLOYEE", link);
  } catch {}
}

export async function notifyBatchStudents(batchId: string, title: string, message: string, link?: string) {
  try {
    const students = await prisma.student.findMany({ where: { batchId }, select: { userId: true } });
    await prisma.notification.createMany({ data: students.map(s => ({ userId: s.userId, title, message, type: "BATCH", link })) });
  } catch {}
}
