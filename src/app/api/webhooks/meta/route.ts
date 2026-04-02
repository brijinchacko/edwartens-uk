import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyRole } from "@/lib/notify";

/**
 * Meta (Facebook/Instagram) Lead Ads Webhook
 *
 * GET  — Webhook verification (Meta sends a challenge)
 * POST — Receive new leads from Meta Lead Ads
 *
 * Setup in Meta Business Suite:
 * 1. Go to Meta Business Settings > Integrations > Leads Access
 * 2. Or Facebook Developers > Your App > Webhooks
 * 3. Webhook URL: https://edwartens.co.uk/api/webhooks/meta
 * 4. Verify Token: edwartens-meta-webhook-2026
 * 5. Subscribe to: leadgen
 */

const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || "edwartens-meta-webhook-2026";
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || "";

// ─── GET: Webhook Verification ───
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("[Meta Webhook] Verification successful");
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// ─── POST: Receive Lead Data ───
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("[Meta Webhook] Received:", JSON.stringify(body).slice(0, 500));

    // Meta sends: { object: "page", entry: [{ id, time, changes: [{ field, value }] }] }
    if (body.object !== "page" && body.object !== "instagram") {
      return NextResponse.json({ status: "ignored" });
    }

    const entries = body.entry || [];
    let leadsCreated = 0;

    for (const entry of entries) {
      const changes = entry.changes || [];

      for (const change of changes) {
        if (change.field !== "leadgen") continue;

        const leadgenId = change.value?.leadgen_id;
        const pageId = change.value?.page_id;
        const formId = change.value?.form_id;
        const createdTime = change.value?.created_time;

        if (!leadgenId) continue;

        // Fetch full lead data from Meta Graph API
        let leadData = null;
        if (META_ACCESS_TOKEN) {
          try {
            const res = await fetch(
              `https://graph.facebook.com/v19.0/${leadgenId}?access_token=${META_ACCESS_TOKEN}`
            );
            if (res.ok) {
              leadData = await res.json();
            } else {
              console.error("[Meta Webhook] Failed to fetch lead:", await res.text());
            }
          } catch (err) {
            console.error("[Meta Webhook] Graph API error:", err);
          }
        }

        // Extract fields from Meta lead data
        let name = "";
        let email = "";
        let phone = "";
        let courseInterest = "";
        let message = "";

        if (leadData?.field_data) {
          for (const field of leadData.field_data) {
            const val = field.values?.[0] || "";
            const fieldName = (field.name || "").toLowerCase();

            if (fieldName === "full_name" || fieldName === "name") name = val;
            else if (fieldName === "email") email = val;
            else if (fieldName === "phone_number" || fieldName === "phone") phone = val;
            else if (fieldName === "course" || fieldName === "course_interest" || fieldName === "which_course") courseInterest = val;
            else if (fieldName === "message" || fieldName === "comments" || fieldName === "what_are_you_looking_for") message = val;
          }
        }

        // Fallback: if no Graph API access, use whatever data Meta sends
        if (!name && !email && !phone) {
          name = change.value?.field_data?.full_name || `Meta Lead ${leadgenId}`;
          email = change.value?.field_data?.email || "";
          phone = change.value?.field_data?.phone_number || "";
        }

        if (!name && !phone && !email) {
          console.log("[Meta Webhook] No usable data for leadgen:", leadgenId);
          continue;
        }

        // Check for duplicate
        const duplicate = await prisma.lead.findFirst({
          where: {
            OR: [
              ...(phone ? [{ phone: phone.trim() }] : []),
              ...(email ? [{ email: { equals: email.trim(), mode: "insensitive" as const } }] : []),
            ],
          },
          select: { id: true, name: true },
        });

        if (duplicate) {
          // Add note to existing lead
          await prisma.leadNote.create({
            data: {
              leadId: duplicate.id,
              content: `[Meta Lead Ad] Duplicate submission from Facebook/Instagram. Form ID: ${formId || "N/A"}${message ? `\nMessage: ${message}` : ""}`,
              createdBy: "Meta Webhook",
            },
          });
          console.log(`[Meta Webhook] Duplicate lead: ${duplicate.name} (${duplicate.id})`);
          continue;
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

        // Map course interest
        let courseType: string | null = null;
        if (courseInterest) {
          const lower = courseInterest.toLowerCase();
          if (lower.includes("ai") || lower.includes("artificial")) courseType = "AI_MODULE";
          else if (lower.includes("plc") || lower.includes("scada") || lower.includes("professional") || lower.includes("automation")) courseType = "PROFESSIONAL_MODULE";
        }

        // Create lead
        const lead = await prisma.lead.create({
          data: {
            name: name.trim() || `Meta Lead ${leadgenId.slice(-6)}`,
            email: email.trim() || "",
            phone: phone.trim() || "",
            source: "meta_marketing",
            courseInterest: courseType as any,
            assignedToId,
          },
        });

        // Add note with full context
        await prisma.leadNote.create({
          data: {
            leadId: lead.id,
            content: `[Meta Lead Ad] Auto-imported from Facebook/Instagram\nForm ID: ${formId || "N/A"}\nPage ID: ${pageId || "N/A"}\nLeadgen ID: ${leadgenId}${message ? `\nMessage: ${message}` : ""}${courseInterest ? `\nCourse Interest: ${courseInterest}` : ""}`,
            createdBy: "Meta Webhook",
          },
        });

        // Notify all counsellors
        notifyRole(
          ["ADMISSION_COUNSELLOR", "SALES_LEAD", "ADMIN", "SUPER_ADMIN"],
          "📱 New Meta Lead",
          `${name} (${phone || email}) from Facebook/Instagram.${assignedToId ? " Auto-assigned." : " Unassigned — claim it!"}`,
          `/admin/leads/${lead.id}`
        ).catch(() => {});

        // Send email to info@wartens.com
        try {
          const senderEmp = await prisma.employee.findFirst({
            where: { msAccessToken: { not: null } },
            select: { id: true },
          });
          if (senderEmp) {
            const { sendEmail } = await import("@/lib/microsoft-graph");
            await sendEmail(
              senderEmp.id,
              "info@wartens.com",
              `New Meta Lead: ${name}`,
              `<div style="font-family:Arial,sans-serif;">
                <h2 style="color:#2891FF;">New Lead from Facebook/Instagram</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email || "N/A"}</p>
                <p><strong>Phone:</strong> ${phone || "N/A"}</p>
                ${courseInterest ? `<p><strong>Course:</strong> ${courseInterest}</p>` : ""}
                ${message ? `<p><strong>Message:</strong> ${message}</p>` : ""}
                <p style="color:#999;font-size:12px;margin-top:20px;">
                  <a href="https://edwartens.co.uk/admin/leads/${lead.id}">View in CRM</a>
                </p>
              </div>`
            );
          }
        } catch {}

        // Auto-WhatsApp welcome message
        try {
          const { createAutoWhatsAppForLead } = await import("@/lib/auto-whatsapp");
          await createAutoWhatsAppForLead(lead.id, name, phone, courseType, assignedToId);
        } catch {}

        leadsCreated++;
        console.log(`[Meta Webhook] Created lead: ${name} (${lead.id})`);
      }
    }

    return NextResponse.json({ status: "ok", leadsCreated });
  } catch (error) {
    console.error("[Meta Webhook] Error:", error);
    return NextResponse.json({ status: "error" }, { status: 200 }); // Always 200 to Meta
  }
}
