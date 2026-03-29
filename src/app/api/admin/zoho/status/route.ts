import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { zohoCRM } from "@/lib/zoho";
import { readFile } from "fs/promises";
import path from "path";

async function getLastSync(): Promise<string | null> {
  try {
    const filePath = path.join(process.cwd(), ".zoho", "last-sync.json");
    const data = await readFile(filePath, "utf-8");
    const parsed = JSON.parse(data);
    return parsed.lastSync || null;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    if (!session?.user || !role || !hasPermission(role, "users:manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isConfigured = zohoCRM.isConfigured();
    const lastSync = await getLastSync();

    let leadCount = 0;
    let contactCount = 0;
    let connected = false;

    if (isConfigured) {
      try {
        // Quick API call to check connection and get counts
        leadCount = await zohoCRM.getRecordCount("Leads");
        contactCount = await zohoCRM.getRecordCount("Contacts");
        connected = true;
      } catch {
        connected = false;
      }
    }

    return NextResponse.json({
      isConfigured,
      connected,
      lastSync,
      counts: {
        leads: leadCount,
        contacts: contactCount,
      },
    });
  } catch (error) {
    console.error("Zoho status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
