import { prisma } from "./prisma";

/**
 * Auto-create a WhatsApp task when a lead is created or assigned.
 * Called from lead creation/update flows.
 */
export async function createWhatsAppTaskForLead(
  leadId: string,
  employeeId: string,
  options?: {
    customMessage?: string;
  }
) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { name: true, phone: true, courseInterest: true },
  });

  if (!lead || !lead.phone) return null;

  const defaultMessage = `Hi ${lead.name}, this is a message from EDWartens UK. Thank you for your interest in our ${lead.courseInterest === "AI_MODULE" ? "AI Module" : "Professional Module"} course. I'd love to discuss how we can help you achieve your career goals. When would be a good time for a quick call?`;

  const message = options?.customMessage || defaultMessage;

  // Check if a pending task already exists for this lead + employee
  const existing = await prisma.whatsAppTask.findFirst({
    where: {
      leadId,
      employeeId,
      status: "PENDING",
    },
  });

  if (existing) return existing;

  return prisma.whatsAppTask.create({
    data: {
      leadId,
      employeeId,
      message,
      phoneNumber: lead.phone,
    },
  });
}
