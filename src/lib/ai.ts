import { prisma } from "./prisma";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

interface AIResponse {
  content: string;
  error?: string;
}

export async function askAI(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 500
): Promise<AIResponse> {
  if (!OPENROUTER_API_KEY) {
    return { content: "", error: "AI not configured" };
  }

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://edwartens.co.uk",
        "X-Title": "EDWartens CRM",
      },
      body: JSON.stringify({
        model: "anthropic/claude-sonnet-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("OpenRouter error:", err);
      return { content: "", error: "AI service unavailable" };
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";
    return { content };
  } catch (err) {
    console.error("AI request failed:", err);
    return { content: "", error: "AI request failed" };
  }
}

// Pre-built AI functions for CRM

export async function suggestFollowUp(leadId: string): Promise<AIResponse> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      notes: { orderBy: { createdAt: "desc" }, take: 5 },
      assignedTo: { include: { user: { select: { name: true } } } },
    },
  });

  if (!lead) return { content: "", error: "Lead not found" };

  const notesContext = lead.notes
    .map((n) => `- ${new Date(n.createdAt).toLocaleDateString("en-GB")}: ${n.content.slice(0, 200)}`)
    .join("\n");

  const prompt = `Lead: ${lead.name}
Email: ${lead.email}
Phone: ${lead.phone}
Status: ${lead.status}
Source: ${lead.source}
Course Interest: ${lead.courseInterest || "Not specified"}
Qualification: ${lead.qualification || "Not specified"}
Follow-up Date: ${lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString("en-GB") : "Not set"}

Recent Notes:
${notesContext || "No notes yet"}

Based on this lead's status and history, suggest:
1. Best follow-up approach (1-2 sentences)
2. A short personalized message to send via WhatsApp (2-3 sentences, friendly and professional)
3. Recommended next status to move this lead to

Format as JSON: { "approach": "...", "message": "...", "nextStatus": "..." }`;

  return askAI(
    "You are a sales advisor for EDWartens UK, an industrial automation training company in Milton Keynes. Help counsellors follow up with leads effectively. Always be concise.",
    prompt,
    400
  );
}

export async function draftMessage(
  leadId: string,
  messageType: "whatsapp" | "email" | "call-script"
): Promise<AIResponse> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: { notes: { orderBy: { createdAt: "desc" }, take: 3 } },
  });

  if (!lead) return { content: "", error: "Lead not found" };

  const typeInstructions = {
    whatsapp: "Write a short, friendly WhatsApp message (2-3 sentences). Keep it casual but professional. Include a clear call-to-action.",
    email: "Write a professional email body (3-5 sentences). Include greeting, value proposition, and call-to-action.",
    "call-script": "Write a brief call script with: opening line, key talking points (2-3 bullets), and closing with next steps.",
  };

  const prompt = `Lead: ${lead.name}
Status: ${lead.status}
Course: ${lead.courseInterest === "PROFESSIONAL_MODULE" ? "Professional PLC/SCADA Module" : lead.courseInterest === "AI_MODULE" ? "AI Module" : "Not specified"}
Last note: ${lead.notes[0]?.content?.slice(0, 200) || "None"}

${typeInstructions[messageType]}`;

  return askAI(
    "You are writing on behalf of EDWartens UK, an industrial automation training company offering PLC, SCADA, and AI courses in Milton Keynes, UK. Be warm, professional, and concise.",
    prompt,
    300
  );
}

export async function generateDailyBriefing(
  employeeId: string,
  todayFollowUps: number,
  overdueCount: number,
  topLeads: { name: string; status: string; daysOverdue?: number }[]
): Promise<AIResponse> {
  const topLeadContext = topLeads
    .slice(0, 3)
    .map((l) => `${l.name} (${l.status}${l.daysOverdue ? `, ${l.daysOverdue}d overdue` : ""})`)
    .join(", ");

  const prompt = `Today's workload: ${todayFollowUps} follow-ups scheduled, ${overdueCount} overdue.
Priority leads: ${topLeadContext || "None flagged"}.

Write a 2-sentence daily briefing for the counsellor. Be motivating and specific about priorities. Don't use generic phrases.`;

  return askAI(
    "You are an AI assistant in EDWartens UK CRM. Give brief, actionable daily briefings to sales counsellors.",
    prompt,
    100
  );
}
