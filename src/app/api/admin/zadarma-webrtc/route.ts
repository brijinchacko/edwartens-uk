import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isCrmRole } from "@/lib/rbac";
import crypto from "crypto";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = (session.user as { role: string }).role;
    if (!isCrmRole(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const API_KEY = process.env.ZADARMA_API_KEY;
    const API_SECRET = process.env.ZADARMA_API_SECRET;

    if (!API_KEY || !API_SECRET) {
      return NextResponse.json({ error: "Zadarma not configured" }, { status: 400 });
    }

    // Generate WebRTC key using Zadarma API
    const method = "/v1/webrtc/get_key/";
    const params = "";
    const signStr = `${method}${params}${crypto.createHash("md5").update(params).digest("hex")}`;
    const signature = crypto.createHmac("sha1", API_SECRET).update(signStr).digest("base64");

    const res = await fetch(`https://api.zadarma.com${method}`, {
      headers: {
        Authorization: `${API_KEY}:${signature}`,
      },
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("WebRTC key error:", error);
    return NextResponse.json({ error: "Failed to get WebRTC key" }, { status: 500 });
  }
}
