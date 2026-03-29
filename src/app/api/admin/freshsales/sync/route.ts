import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";
import {
  fetchAllContacts,
  fetchAllDeals,
  fetchDealStages,
  FreshsalesContact,
} from "@/lib/freshsales";

function mapLeadStatus(leadScore: number) {
  if (leadScore >= 30) return "QUALIFIED" as const;
  if (leadScore >= 15) return "CONTACTED" as const;
  return "NEW" as const;
}

function normalizePhone(phone: string | null): string | null {
  if (!phone) return null;
  return phone.replace(/[\s\-\(\)]/g, "").trim() || null;
}

function normalizeEmail(email: string | null): string | null {
  if (!email) return null;
  return email.toLowerCase().trim() || null;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "users:manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const syncType = body.type || "all"; // "contacts", "deals", "all"

    let imported = 0;
    let skipped = 0;
    let merged = 0;
    let dealsImported = 0;
    const errors: string[] = [];

    // Get all existing leads by email for dedup (covers both Zoho and manual imports)
    const existingLeads = await prisma.lead.findMany({
      select: { id: true, email: true, phone: true, source: true, notes: { select: { content: true } } },
    });
    type LeadEntry = { id: string; email: string; phone: string | null; source: string | null; notesText: string };
    const emailIndex = new Map<string, LeadEntry>();
    const phoneIndex = new Map<string, LeadEntry>();
    for (const lead of existingLeads) {
      const notesText = lead.notes.map((n) => n.content).join(" ");
      const entry: LeadEntry = { id: lead.id, email: lead.email, phone: lead.phone, source: lead.source, notesText };
      if (lead.email) emailIndex.set(lead.email.toLowerCase(), entry);
      if (lead.phone) phoneIndex.set(normalizePhone(lead.phone) || "", entry);
    }

    // Fetch deal stages for reference
    let dealStages: Record<number, string> = {};
    if (syncType === "deals" || syncType === "all") {
      dealStages = await fetchDealStages();
    }

    // Sync Contacts → Leads
    if (syncType === "contacts" || syncType === "all") {
      const contacts = await fetchAllContacts();

      for (const contact of contacts) {
        try {
          const email = normalizeEmail(contact.email);
          const phone = normalizePhone(contact.mobile_number || contact.phone_number);
          const name = contact.display_name || `${contact.first_name || ""} ${contact.last_name || ""}`.trim();

          if (!name || (!email && !phone)) {
            skipped++;
            continue;
          }

          // Dedup: Check email first, then phone
          const existingByEmail = email ? emailIndex.get(email) : undefined;
          const existingByPhone = phone ? phoneIndex.get(phone) : undefined;
          const existing = existingByEmail || existingByPhone;

          if (existing) {
            // Merge: Update missing fields and append source note
            const updates: Record<string, any> = {};
            if (!existing.phone && phone) updates.phone = phone;
            if (!existing.email && email) updates.email = email;

            // Add source tracking
            if (existing.source && !existing.source.includes("Freshsales")) {
              updates.source = `${existing.source}, Freshsales`;
            }

            if (Object.keys(updates).length > 0) {
              await prisma.lead.update({
                where: { id: existing.id },
                data: updates,
              });
            }

            // Append Freshsales info as a LeadNote if not already there
            if (!existing.notesText.includes("[Freshsales]")) {
              const jobInfo = contact.job_title ? `Job: ${contact.job_title}` : "";
              const companyInfo = contact.company?.name ? `Company: ${contact.company.name}` : "";
              const addressInfo = [contact.address, contact.city, contact.state, contact.country]
                .filter(Boolean)
                .join(", ");
              const noteContent = [
                `[Freshsales] Lead Score: ${contact.lead_score || 0}`,
                jobInfo,
                companyInfo,
                addressInfo ? `Address: ${addressInfo}` : "",
              ].filter(Boolean).join(" | ");

              await prisma.leadNote.create({
                data: {
                  leadId: existing.id,
                  content: noteContent,
                  createdBy: "Freshsales Sync",
                },
              });
            }

            merged++;
            continue;
          }

          // New lead — create it
          const newLead = await prisma.lead.create({
            data: {
              name,
              email: email || "",
              phone: phone || "",
              courseInterest: "PROFESSIONAL_MODULE",
              qualification: contact.job_title || null,
              source: "Freshsales",
              status: mapLeadStatus(contact.lead_score || 0),
              createdAt: new Date(contact.created_at),
            },
          });

          // Add note with Freshsales details
          const noteContent = [
            contact.recent_note || "",
            contact.job_title ? `Job: ${contact.job_title}` : "",
            contact.company?.name ? `Company: ${contact.company.name}` : "",
            `Lead Score: ${contact.lead_score || 0}`,
            [contact.address, contact.city, contact.state, contact.zipcode, contact.country]
              .filter(Boolean)
              .join(", "),
          ].filter(Boolean).join(" | ");

          if (noteContent) {
            await prisma.leadNote.create({
              data: {
                leadId: newLead.id,
                content: `[Freshsales] ${noteContent}`,
                createdBy: "Freshsales Sync",
              },
            });
          }

          // Index for future dedup within this batch
          const newEntry: LeadEntry = { id: newLead.id, email: newLead.email, phone: newLead.phone, source: "Freshsales", notesText: noteContent };
          if (email) emailIndex.set(email, newEntry);
          if (phone) phoneIndex.set(phone, newEntry);

          imported++;
        } catch (err: any) {
          errors.push(`Contact "${contact.display_name}": ${err.message}`);
          skipped++;
        }
      }
    }

    // Sync Deals
    if (syncType === "deals" || syncType === "all") {
      const deals = await fetchAllDeals();

      for (const deal of deals) {
        try {
          const stageName = deal.deal_stage_id ? dealStages[deal.deal_stage_id] || "Unknown" : "Unknown";

          // Create a lead note for the deal or track as metadata
          // Find the lead associated with this deal by name match
          const dealName = deal.name || "Unknown Deal";

          // Store deal info as a lead note on any matching lead
          const existingDealNote = await prisma.leadNote.findFirst({
            where: {
              content: { contains: `[Freshsales Deal #${deal.id}]` },
            },
          });

          if (!existingDealNote) {
            // Try to find a lead that matches the deal
            // Deals in Freshsales are typically "Course - Contact Name"
            const parts = dealName.split(" - ");
            const contactName = parts.length > 1 ? parts[parts.length - 1].trim() : "";

            let matchedLead = null;
            if (contactName) {
              matchedLead = await prisma.lead.findFirst({
                where: {
                  name: { contains: contactName, mode: "insensitive" },
                },
              });
            }

            if (matchedLead) {
              await prisma.leadNote.create({
                data: {
                  leadId: matchedLead.id,
                  content: `[Freshsales Deal #${deal.id}] ${dealName}\nAmount: £${deal.amount || 0}\nStage: ${stageName}\nCreated: ${deal.created_at}\n${deal.recent_note || ""}`,
                  createdBy: "Freshsales Sync",
                },
              });
              dealsImported++;
            } else {
              // No matching lead — create as a standalone note or skip
              skipped++;
            }
          } else {
            skipped++;
          }
        } catch (err: any) {
          errors.push(`Deal "${deal.name}": ${err.message}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      merged,
      skipped,
      dealsImported,
      errors: errors.slice(0, 20),
      total: imported + merged + skipped,
      syncedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Freshsales sync error:", error);
    return NextResponse.json(
      { error: error.message || "Sync failed" },
      { status: 500 }
    );
  }
}
