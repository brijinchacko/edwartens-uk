import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";
import { zohoCRM, ZohoLead, ZohoContact } from "@/lib/zoho";
import { writeFile, readFile, mkdir } from "fs/promises";
import path from "path";

// Map Zoho lead source to our source values
function mapLeadSource(zohoSource: string | null): string {
  if (!zohoSource) return "zoho";
  const sourceMap: Record<string, string> = {
    Web: "website",
    Website: "website",
    "Web Form": "website",
    Phone: "phone",
    "Phone Inquiry": "phone",
    Email: "email",
    Referral: "referral",
    "Employee Referral": "referral",
    "External Referral": "referral",
    Partner: "partner",
    "Social Media": "social_media",
    Facebook: "facebook",
    Instagram: "instagram",
    LinkedIn: "linkedin",
    Twitter: "twitter",
    "Google Ads": "google_ads",
    Advertisement: "advertisement",
    "Trade Show": "event",
    Seminar: "event",
    "Cold Call": "outbound",
    Chat: "website",
  };
  return sourceMap[zohoSource] || "zoho";
}

// Map Zoho lead status to our LeadStatus enum
function mapLeadStatus(zohoStatus: string | null): "NEW" | "CONTACTED" | "QUALIFIED" | "ENROLLED" | "LOST" {
  if (!zohoStatus) return "NEW";
  const statusMap: Record<string, "NEW" | "CONTACTED" | "QUALIFIED" | "ENROLLED" | "LOST"> = {
    // Common Zoho lead statuses
    "Not Contacted": "NEW",
    New: "NEW",
    "Attempted to Contact": "CONTACTED",
    Contacted: "CONTACTED",
    "Contact in Future": "CONTACTED",
    "Junk Lead": "LOST",
    Lost: "LOST",
    "Not Qualified": "LOST",
    "Pre-Qualified": "QUALIFIED",
    Qualified: "QUALIFIED",
    "Converted": "ENROLLED",
    Enrolled: "ENROLLED",
    Closed: "ENROLLED",
    // Additional mappings
    Open: "NEW",
    "In Progress": "CONTACTED",
    "Follow Up": "CONTACTED",
    Interested: "QUALIFIED",
    "Not Interested": "LOST",
  };
  return statusMap[zohoStatus] || "NEW";
}

// Build name from Zoho record
function buildName(record: { First_Name: string | null; Last_Name: string | null; Full_Name: string | null }): string {
  if (record.Full_Name) return record.Full_Name;
  const parts = [record.First_Name, record.Last_Name].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "Unknown";
}

// Build phone from Zoho record
function buildPhone(record: { Phone: string | null; Mobile?: string | null }): string {
  return record.Phone || record.Mobile || "";
}

// Save last sync timestamp
async function saveLastSync() {
  const dir = path.join(process.cwd(), ".zoho");
  await mkdir(dir, { recursive: true });
  const filePath = path.join(dir, "last-sync.json");
  await writeFile(filePath, JSON.stringify({ lastSync: new Date().toISOString() }));
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    if (!session?.user || !role || !hasPermission(role, "users:manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!zohoCRM.isConfigured()) {
      return NextResponse.json(
        { error: "Zoho CRM credentials are not configured" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { type } = body as { type: "leads" | "contacts" | "all" };

    if (!type || !["leads", "contacts", "all"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid sync type. Must be 'leads', 'contacts', or 'all'" },
        { status: 400 }
      );
    }

    const results = {
      total: 0,
      imported: 0,
      skipped: 0,
      errors: 0,
      errorDetails: [] as string[],
    };

    // Process Zoho Leads
    if (type === "leads" || type === "all") {
      const zohoLeads = await zohoCRM.getAllLeads();
      results.total += zohoLeads.length;

      for (const zohoLead of zohoLeads) {
        try {
          const email = zohoLead.Email;
          if (!email) {
            results.skipped++;
            continue;
          }

          // Check if email already exists in Lead or User table
          const [existingLead, existingUser] = await Promise.all([
            prisma.lead.findFirst({ where: { email } }),
            prisma.user.findUnique({ where: { email } }),
          ]);

          if (existingLead || existingUser) {
            results.skipped++;
            continue;
          }

          const name = buildName(zohoLead);
          const phone = buildPhone(zohoLead);

          if (!phone) {
            results.skipped++;
            continue;
          }

          // Create lead with mapped fields
          const lead = await prisma.lead.create({
            data: {
              name,
              email,
              phone,
              source: mapLeadSource(zohoLead.Lead_Source),
              status: mapLeadStatus(zohoLead.Lead_Status),
            },
          });

          // Create initial note from description if present
          if (zohoLead.Description) {
            await prisma.leadNote.create({
              data: {
                leadId: lead.id,
                content: zohoLead.Description,
                createdBy: "Zoho CRM Import",
              },
            });
          }

          // Add a note about the Zoho import
          await prisma.leadNote.create({
            data: {
              leadId: lead.id,
              content: `Imported from Zoho CRM (Lead ID: ${zohoLead.id})`,
              createdBy: "Zoho CRM Import",
            },
          });

          results.imported++;
        } catch (error) {
          results.errors++;
          const msg = error instanceof Error ? error.message : "Unknown error";
          results.errorDetails.push(`Lead ${zohoLead.Email || zohoLead.id}: ${msg}`);
        }
      }
    }

    // Process Zoho Contacts
    if (type === "contacts" || type === "all") {
      const zohoContacts = await zohoCRM.getAllContacts();
      results.total += zohoContacts.length;

      for (const zohoContact of zohoContacts) {
        try {
          const email = zohoContact.Email;
          if (!email) {
            results.skipped++;
            continue;
          }

          // Check if email already exists
          const [existingLead, existingUser] = await Promise.all([
            prisma.lead.findFirst({ where: { email } }),
            prisma.user.findUnique({ where: { email } }),
          ]);

          if (existingLead || existingUser) {
            results.skipped++;
            continue;
          }

          const name = buildName(zohoContact);
          const phone = buildPhone(zohoContact);

          if (!phone) {
            results.skipped++;
            continue;
          }

          // Create lead from contact
          const lead = await prisma.lead.create({
            data: {
              name,
              email,
              phone,
              source: mapLeadSource(zohoContact.Lead_Source),
              status: "CONTACTED", // Contacts are already contacted
            },
          });

          // Create initial note from description if present
          if (zohoContact.Description) {
            await prisma.leadNote.create({
              data: {
                leadId: lead.id,
                content: zohoContact.Description,
                createdBy: "Zoho CRM Import",
              },
            });
          }

          // Add a note about the Zoho import
          await prisma.leadNote.create({
            data: {
              leadId: lead.id,
              content: `Imported from Zoho CRM Contact (Contact ID: ${zohoContact.id})`,
              createdBy: "Zoho CRM Import",
            },
          });

          results.imported++;
        } catch (error) {
          results.errors++;
          const msg = error instanceof Error ? error.message : "Unknown error";
          results.errorDetails.push(`Contact ${zohoContact.Email || zohoContact.id}: ${msg}`);
        }
      }
    }

    // Save last sync timestamp
    await saveLastSync();

    return NextResponse.json({
      success: true,
      ...results,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Zoho sync error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
