import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyRole } from "@/lib/notify";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, qualification, courseInterest, message, subject } = body;

    if (!name || !email || !phone) {
      return NextResponse.json({ error: "Name, email, and phone are required" }, { status: 400 });
    }

    // Check for duplicate phone/email
    const existing = await prisma.lead.findFirst({
      where: {
        OR: [
          { phone: phone.trim() },
          { email: { equals: email.trim(), mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true },
    });
    if (existing) {
      // Still save the message as a note on the existing lead
      if (message || subject) {
        await prisma.leadNote.create({
          data: {
            leadId: existing.id,
            content: `[Website Contact Form] ${subject ? `Subject: ${subject}\n` : ""}${message || ""}`,
            createdBy: "website",
          },
        });
      }
      return NextResponse.json({ success: true, id: existing.id }, { status: 201 });
    }

    // Auto-assign to least-loaded counsellor
    let assignedToId: string | null = null;
    try {
      const counsellors = await prisma.employee.findMany({
        where: {
          user: { role: { in: ["ADMISSION_COUNSELLOR", "SALES_LEAD"] as any }, isActive: true },
        },
        select: {
          id: true,
          _count: { select: { assignedLeads: { where: { status: { notIn: ["ENROLLED", "LOST"] } } } } },
        },
      });
      if (counsellors.length > 0) {
        counsellors.sort((a, b) => a._count.assignedLeads - b._count.assignedLeads);
        assignedToId = counsellors[0].id;
      }
    } catch {}

    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        qualification: qualification || null,
        courseInterest: courseInterest || null,
        source: "website",
        assignedToId,
      },
    });

    // If there's a message/subject, add it as a note
    if (message || subject) {
      await prisma.leadNote.create({
        data: {
          leadId: lead.id,
          content: `[Website Contact Form] ${subject ? `Subject: ${subject}\n` : ""}${message || ""}`,
          createdBy: "website",
        },
      });
    }

    // Notify all counsellors about new website lead
    notifyRole(
      ["ADMISSION_COUNSELLOR", "SALES_LEAD", "ADMIN", "SUPER_ADMIN"],
      "🌐 New Website Enquiry",
      `${name} (${email}, ${phone}) submitted a contact form.${subject ? ` Subject: ${subject}` : ""}`,
      `/admin/leads/${lead.id}`
    ).catch(() => {});

    // Send email notification to info@wartens.com
    try {
      // Find any admin with Outlook connected to send the email
      const senderEmp = await prisma.employee.findFirst({
        where: { msAccessToken: { not: null } },
        select: { id: true },
      });
      if (senderEmp) {
        const { sendEmail } = await import("@/lib/microsoft-graph");
        const emailBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2 style="color: #2891FF;">New Website Enquiry</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px; font-weight: bold; color: #555;">Name:</td><td style="padding: 8px;">${name}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold; color: #555;">Email:</td><td style="padding: 8px;"><a href="mailto:${email}">${email}</a></td></tr>
              <tr><td style="padding: 8px; font-weight: bold; color: #555;">Phone:</td><td style="padding: 8px;">${phone}</td></tr>
              ${subject ? `<tr><td style="padding: 8px; font-weight: bold; color: #555;">Subject:</td><td style="padding: 8px;">${subject}</td></tr>` : ""}
              ${message ? `<tr><td style="padding: 8px; font-weight: bold; color: #555;">Message:</td><td style="padding: 8px;">${message}</td></tr>` : ""}
            </table>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px;">This lead has been auto-assigned and added to the CRM. <a href="https://edwartens.co.uk/admin/leads/${lead.id}">View in CRM</a></p>
          </div>
        `;
        await sendEmail(senderEmp.id, "info@wartens.com", `New Website Enquiry from ${name}`, emailBody);
      }
    } catch (emailErr) {
      console.error("Failed to send contact form email:", emailErr);
    }

    // Auto-WhatsApp welcome message
    try {
      const { createAutoWhatsAppForLead } = await import("@/lib/auto-whatsapp");
      await createAutoWhatsAppForLead(lead.id, name, phone, courseInterest || null, assignedToId);
    } catch {}

    return NextResponse.json({ success: true, id: lead.id }, { status: 201 });
  } catch (error) {
    console.error("Lead creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
