/**
 * Auto-WhatsApp Message for New Leads
 *
 * Generates a WhatsApp click-to-chat URL and logs a WhatsApp task.
 * The counsellor sees the task in their WhatsApp popup and can send with one click.
 *
 * For fully automated sending, you'd need WhatsApp Business API (paid).
 * This approach creates the task for the assigned counsellor to send manually.
 */

import { prisma } from "./prisma";

const WELCOME_MESSAGES: Record<string, string> = {
  PROFESSIONAL_MODULE: `Hi {name}! 👋

Thank you for your interest in our *Professional PLC/SCADA Training* at EDWartens UK! 🎓

Our CPD-accredited course covers:
✅ Siemens S7-1200/1500 PLC Programming
✅ WinCC SCADA Configuration
✅ FactoryIO Simulation
✅ Hands-on Lab Training in Milton Keynes

📅 New batches start every week
💷 Course fee: £1,799 (installment options available)
📍 Location: Milton Keynes, UK

Would you like to book a *free consultation* to discuss the course? I can arrange a call at your convenience.

Best regards,
EDWartens UK Team
🌐 edwartens.co.uk`,

  AI_MODULE: `Hi {name}! 👋

Thank you for your interest in our *AI & Automation Module* at EDWartens UK! 🤖

This cutting-edge course covers:
✅ AI in Industrial Automation
✅ Machine Learning for Process Control
✅ Computer Vision Applications
✅ Hands-on Projects

Would you like to book a *free consultation*? I'd be happy to discuss the details.

Best regards,
EDWartens UK Team
🌐 edwartens.co.uk`,

  DEFAULT: `Hi {name}! 👋

Thank you for your enquiry about our *Industrial Automation Training* at EDWartens UK! 🎓

We offer CPD-accredited courses in:
✅ PLC/SCADA Programming (Siemens)
✅ AI & Automation
✅ Hands-on Lab Training in Milton Keynes

📅 New batches start every week
💷 Flexible payment options available

Would you like to book a *free consultation* to learn more? I can arrange a call at your convenience.

Best regards,
EDWartens UK Team
🌐 edwartens.co.uk`,
};

/**
 * Format phone for WhatsApp (remove spaces, add country code)
 */
function formatPhoneForWhatsApp(phone: string): string {
  let cleaned = phone.replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "44" + cleaned.slice(1); // UK
  } else if (cleaned.startsWith("+")) {
    cleaned = cleaned.slice(1);
  } else if (!cleaned.startsWith("44") && cleaned.length === 10) {
    cleaned = "44" + cleaned; // Assume UK
  }
  return cleaned;
}

/**
 * Create a WhatsApp task for the assigned counsellor to send.
 * Also generates the wa.me link for immediate sending.
 */
export async function createAutoWhatsAppForLead(
  leadId: string,
  leadName: string,
  leadPhone: string,
  courseInterest: string | null,
  assignedToId: string | null
): Promise<{ whatsappUrl: string; message: string } | null> {
  try {
    if (!leadPhone) return null;

    const formattedPhone = formatPhoneForWhatsApp(leadPhone);
    const template = courseInterest && WELCOME_MESSAGES[courseInterest]
      ? WELCOME_MESSAGES[courseInterest]
      : WELCOME_MESSAGES.DEFAULT;

    const message = template.replace(/\{name\}/g, leadName.split(" ")[0] || "there");
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;

    // Create WhatsApp task for the counsellor
    if (assignedToId) {
      try {
        await prisma.whatsAppTask.create({
          data: {
            leadId,
            employeeId: assignedToId,
            phoneNumber: leadPhone,
            message: `[Auto-Welcome] Send WhatsApp welcome message to ${leadName}`,
            status: "PENDING",
          },
        });
      } catch (e) {
        console.error("[Auto-WhatsApp] Failed to create task:", e);
      }
    }

    // Log the auto-message as a note
    await prisma.leadNote.create({
      data: {
        leadId,
        content: `📱 [Auto-WhatsApp] Welcome message prepared for ${leadName}. WhatsApp link generated.`,
        createdBy: "System",
      },
    });

    return { whatsappUrl, message };
  } catch (err) {
    console.error("[Auto-WhatsApp] Error:", err);
    return null;
  }
}
