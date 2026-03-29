import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";
import {
  fetchAllContacts,
  fetchContactDocuments,
  downloadDocument,
} from "@/lib/freshsales";
import * as fs from "fs";
import * as path from "path";

function categorizeFile(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("resume") || lower.includes("cv")) return "RESUME";
  if (lower.includes("photo") || lower.includes("avatar") || lower.includes("passport")) return "ID_PROOF";
  if (lower.includes("certificate") || lower.includes("degree") || lower.includes("qualification") || lower.includes("mtech") || lower.includes("btech")) return "QUALIFICATION";
  if (lower.includes("payment") || lower.includes("fee") || lower.includes("receipt")) return "PAYMENT_PROOF";
  if (lower.includes("terms") || lower.includes("condition") || lower.includes("agreement")) return "TERMS";
  if (lower.includes("share") || lower.includes("sharecode")) return "SHARE_CODE";
  return "OTHER";
}

function getExtension(contentType: string, fileName: string): string {
  if (fileName.includes(".")) return "." + fileName.split(".").pop();
  const map: Record<string, string> = {
    "application/pdf": ".pdf",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  };
  return map[contentType] || ".bin";
}

// Track sync progress in memory
let syncProgress = {
  running: false,
  processed: 0,
  total: 0,
  filesDownloaded: 0,
  filesSkipped: 0,
  errors: 0,
  startedAt: "",
  completedAt: "",
  lastContact: "",
};

export async function GET() {
  return NextResponse.json(syncProgress);
}

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "users:manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (syncProgress.running) {
      return NextResponse.json({
        error: "File sync already in progress",
        progress: syncProgress,
      }, { status: 409 });
    }

    // Start background sync
    syncProgress = {
      running: true,
      processed: 0,
      total: 0,
      filesDownloaded: 0,
      filesSkipped: 0,
      errors: 0,
      startedAt: new Date().toISOString(),
      completedAt: "",
      lastContact: "",
    };

    // Don't await — let it run in background
    runFileSync().catch((err) => {
      console.error("File sync failed:", err);
      syncProgress.running = false;
      syncProgress.completedAt = new Date().toISOString();
    });

    return NextResponse.json({
      message: "File sync started in background",
      progress: syncProgress,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function runFileSync() {
  const uploadsDir = path.join(process.cwd(), "uploads", "documents");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Get all contacts
  const contacts = await fetchAllContacts();
  syncProgress.total = contacts.length;

  // Get existing leads indexed by email for matching
  const leads = await prisma.lead.findMany({
    select: { id: true, email: true, name: true },
  });
  const leadByEmail = new Map(leads.map((l) => [l.email.toLowerCase(), l]));
  const leadByName = new Map(leads.map((l) => [l.name.toLowerCase(), l]));

  for (const contact of contacts) {
    try {
      syncProgress.processed++;
      syncProgress.lastContact = contact.display_name || "Unknown";

      const email = contact.email?.toLowerCase();
      const name = contact.display_name?.toLowerCase() || "";

      // Find matching lead
      const lead = (email ? leadByEmail.get(email) : undefined) || leadByName.get(name);
      if (!lead) {
        continue; // No matching lead in our CRM
      }

      // Get documents for this contact
      const docs = await fetchContactDocuments(contact.id);
      if (docs.length === 0) continue;

      // Check which documents are already imported
      const existingDocs = await prisma.document.findMany({
        where: {
          OR: [
            { name: { in: docs.map((d) => d.name) } },
          ],
        },
        select: { name: true },
      });
      const existingNames = new Set(existingDocs.map((d) => d.name));

      for (const doc of docs) {
        if (existingNames.has(doc.name)) {
          syncProgress.filesSkipped++;
          continue;
        }

        try {
          // Download the file
          const fileData = await downloadDocument(doc.id);
          if (!fileData) {
            syncProgress.filesSkipped++;
            continue;
          }

          // Save file to disk
          const ext = getExtension(doc.content_content_type, doc.name);
          const safeFileName = `${lead.id}-fs-${doc.id}${ext}`;
          const filePath = path.join(uploadsDir, safeFileName);
          fs.writeFileSync(filePath, fileData.buffer);

          // Determine document type
          const docType = categorizeFile(doc.name);

          // Find student linked to this lead (if converted)
          const leadRecord = await prisma.lead.findUnique({
            where: { id: lead.id },
            select: { convertedToStudentId: true },
          });

          let studentId: string | null = null;
          if (leadRecord?.convertedToStudentId) {
            studentId = leadRecord.convertedToStudentId;
          }

          // Create document record
          // If there's a student, link to student. Otherwise store with lead reference in name.
          if (studentId) {
            await prisma.document.create({
              data: {
                studentId,
                name: doc.name,
                type: docType,
                fileUrl: `/api/uploads/documents/${safeFileName}`,
                fileSize: doc.content_file_size,
                mimeType: doc.content_content_type,
                status: "UPLOADED",
                uploadedAt: new Date(doc.created_at),
              },
            });
          }

          // Also create a LeadNote recording the file
          await prisma.leadNote.create({
            data: {
              leadId: lead.id,
              content: `[File Imported] ${doc.name} (${doc.content_file_size_readable}) — /api/uploads/documents/${safeFileName}`,
              createdBy: "Freshsales File Sync",
              createdAt: new Date(doc.created_at),
            },
          });

          syncProgress.filesDownloaded++;
        } catch {
          syncProgress.errors++;
        }

        // Small delay between file downloads
        await new Promise((r) => setTimeout(r, 100));
      }
    } catch {
      syncProgress.errors++;
    }

    // Rate limiting: small delay between contacts
    if (syncProgress.processed % 10 === 0) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  syncProgress.running = false;
  syncProgress.completedAt = new Date().toISOString();
}
