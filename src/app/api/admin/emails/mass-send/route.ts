import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendEmail } from "@/lib/microsoft-graph";
import { prisma } from "@/lib/prisma";
import { isCrmRole } from "@/lib/rbac";
import { getTemplateById, fillTemplate } from "@/lib/email-templates";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !isCrmRole(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const employee = await prisma.employee.findUnique({
      where: { userId: session.user.id as string },
      include: { user: { select: { phone: true, role: true } } },
    });
    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const {
      templateId,
      leadIds,
      customSubject,
      customBody,
    }: {
      templateId: string;
      leadIds: string[];
      customSubject?: string;
      customBody?: string;
    } = body;

    if (!templateId || !leadIds || leadIds.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: templateId, leadIds" },
        { status: 400 }
      );
    }

    const template = getTemplateById(templateId);
    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Fetch all leads
    const leads = await prisma.lead.findMany({
      where: { id: { in: leadIds } },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        courseInterest: true,
      },
    });

    if (leads.length === 0) {
      return NextResponse.json({ error: "No leads found" }, { status: 404 });
    }

    // Counsellor / sender info (maps to new variable names)
    const counsellorName = session.user.name || "EDWartens Team";
    const counsellorEmail = employee.msEmail || session.user.email || "";
    const counsellorTitle = employee.department || "Training Advisor";
    const counsellorPhone = employee.user?.phone || "";

    const counsellorVars: Record<string, string> = {
      counsellorName,
      counsellorEmail,
      counsellorTitle,
      counsellorPhone,
      companyName: "EDWartens UK",
      // Legacy aliases for backwards compatibility
      senderName: counsellorName,
      senderEmail: counsellorEmail,
      senderTitle: counsellorTitle,
      senderPhone: counsellorPhone,
    };

    const subjectTemplate = customSubject || template.subject;
    const bodyTemplate = customBody || template.body;

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (let i = 0; i < leads.length; i++) {
      const lead = leads[i];

      try {
        const variables: Record<string, string> = {
          ...counsellorVars,
          name: lead.name || "there",
          firstName: (lead.name || "there").split(" ")[0],
          email: lead.email,
          phone: lead.phone || "",
          course: lead.courseInterest || "Industrial Automation",
          // Legacy alias
          candidateName: lead.name || "there",
        };

        const finalSubject = fillTemplate(subjectTemplate, variables);
        const finalBody = fillTemplate(bodyTemplate, variables);

        await sendEmail(employee.id, lead.email, finalSubject, finalBody);

        // Log as LeadNote
        await prisma.leadNote.create({
          data: {
            leadId: lead.id,
            content: `[Mass Email] Template: ${template.name}\nSubject: ${finalSubject}\nSent by: ${counsellorName}`,
            createdBy: counsellorName,
          },
        });

        sent++;
      } catch (err: unknown) {
        failed++;
        const message =
          err instanceof Error ? err.message : "Unknown error";
        errors.push(`${lead.name} (${lead.email}): ${message}`);
      }

      // Rate limiting: wait 1 second between sends (Microsoft Graph limit)
      if (i < leads.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return NextResponse.json({ sent, failed, errors, total: leads.length });
  } catch (error: unknown) {
    console.error("Error in mass send:", error);
    const message =
      error instanceof Error ? error.message : "Failed to send mass email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
