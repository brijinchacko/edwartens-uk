import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";
import { getEmployeeToken } from "@/lib/microsoft-graph";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "users:manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all employees with connected Outlook
    const employees = await prisma.employee.findMany({
      where: { msRefreshToken: { not: null } },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    if (employees.length === 0) {
      return NextResponse.json({
        synced: 0,
        skipped: 0,
        errors: 0,
        message: "No employees with connected Outlook accounts",
      });
    }

    // Get all lead emails for quick lookup
    const leads = await prisma.lead.findMany({
      select: { id: true, email: true, name: true },
    });
    const leadsByEmail = new Map<string, { id: string; name: string }[]>();
    for (const lead of leads) {
      const email = lead.email.toLowerCase();
      if (!leadsByEmail.has(email)) {
        leadsByEmail.set(email, []);
      }
      leadsByEmail.get(email)!.push({ id: lead.id, name: lead.name });
    }

    // Get existing email notes from the last 48 hours to avoid duplicates
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const existingNotes = await prisma.leadNote.findMany({
      where: {
        createdAt: { gte: twoDaysAgo },
        OR: [
          { content: { startsWith: "[Email Sent]" } },
          { content: { startsWith: "[Email Received]" } },
        ],
      },
      select: { content: true, leadId: true },
    });
    const existingNoteKeys = new Set(
      existingNotes.map((n) => `${n.leadId}::${n.content.slice(0, 200)}`)
    );

    let synced = 0;
    let skipped = 0;
    let errors = 0;

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    for (const employee of employees) {
      try {
        const token = await getEmployeeToken(employee.id);
        const employeeName = employee.user.name || employee.user.email;
        const employeeEmail = (employee.msEmail || employee.user.email).toLowerCase();

        // Fetch emails from last 24 hours
        const url = `${GRAPH_BASE}/me/messages?$filter=receivedDateTime ge ${oneDayAgo}&$top=50&$orderby=receivedDateTime desc&$select=id,subject,from,toRecipients,receivedDateTime`;
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          console.error(`Graph API error for ${employeeName}:`, await res.text());
          errors++;
          continue;
        }

        const data = await res.json();
        const emails = data.value || [];

        for (const email of emails) {
          const fromAddress = email.from?.emailAddress?.address?.toLowerCase() || "";
          const toAddresses = (email.toRecipients || []).map(
            (r: { emailAddress: { address: string } }) => r.emailAddress.address.toLowerCase()
          );
          const subject = email.subject || "(No Subject)";

          const isSent = fromAddress === employeeEmail;
          const isReceived = toAddresses.includes(employeeEmail);

          if (isSent) {
            // Check if any TO address matches a lead
            for (const toAddr of toAddresses) {
              const matchingLeads = leadsByEmail.get(toAddr);
              if (!matchingLeads) continue;

              for (const lead of matchingLeads) {
                const content = `[Email Sent] Subject: ${subject} | To: ${toAddr} | By: ${employeeName}`;
                const key = `${lead.id}::${content.slice(0, 200)}`;

                if (existingNoteKeys.has(key)) {
                  skipped++;
                  continue;
                }

                await prisma.leadNote.create({
                  data: {
                    leadId: lead.id,
                    content,
                    createdBy: employeeName,
                  },
                });
                existingNoteKeys.add(key);
                synced++;
              }
            }
          }

          if (isReceived) {
            // Check if FROM address matches a lead
            const matchingLeads = leadsByEmail.get(fromAddress);
            if (!matchingLeads) continue;

            for (const lead of matchingLeads) {
              const content = `[Email Received] Subject: ${subject} | From: ${fromAddress}`;
              const key = `${lead.id}::${content.slice(0, 200)}`;

              if (existingNoteKeys.has(key)) {
                skipped++;
                continue;
              }

              await prisma.leadNote.create({
                data: {
                  leadId: lead.id,
                  content,
                  createdBy: "System (Email Sync)",
                },
              });
              existingNoteKeys.add(key);
              synced++;
            }
          }
        }
      } catch (empError) {
        console.error(`Email sync error for employee ${employee.id}:`, empError);
        errors++;
      }
    }

    return NextResponse.json({ synced, skipped, errors });
  } catch (error) {
    console.error("Email sync to leads error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
