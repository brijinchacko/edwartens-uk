import { prisma } from "./prisma";

export async function notifyUser(
  userId: string,
  title: string,
  message: string,
  type: string,
  link?: string
): Promise<void> {
  await prisma.notification.create({
    data: { userId, title, message, type, link },
  });
}

export async function notifyByRole(
  roles: string[],
  title: string,
  message: string,
  type: string,
  link?: string
): Promise<void> {
  const users = await prisma.user.findMany({
    where: { role: { in: roles as [] }, isActive: true },
    select: { id: true },
  });

  if (users.length === 0) return;

  await prisma.notification.createMany({
    data: users.map((u) => ({
      userId: u.id,
      title,
      message,
      type,
      link,
    })),
  });
}
