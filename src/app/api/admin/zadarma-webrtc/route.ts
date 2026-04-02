import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isCrmRole } from "@/lib/rbac";
import crypto from "crypto";

function zadarmaAuth(method: string, apiKey: string, apiSecret: string, params: Record<string, string> = {}) {
  // 1. Sort params alphabetically by key
  const sortedKeys = Object.keys(params).sort();
  // 2. Build query string (PHP http_build_query with RFC1738)
  const paramsStr = sortedKeys.map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join("&");
  // 3. MD5 of params string
  const md5hash = crypto.createHash("md5").update(paramsStr).digest("hex");
  // 4. signStr = method + paramsStr + md5(paramsStr)
  const signStr = method + paramsStr + md5hash;
  // 5. HMAC-SHA1 with secret, base64 encoded
  const signature = crypto.createHmac("sha1", apiSecret).update(signStr).digest("base64");
  // 6. Auth header: "user_key:signature" (docs show colon without space)
  return { signature, paramsStr, authHeader: `${apiKey}:${signature}` };
}

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

    const API_KEY = process.env.ZADARMA_API_KEY || "";
    const API_SECRET = process.env.ZADARMA_API_SECRET || "";

    if (!API_KEY || !API_SECRET) {
      return NextResponse.json({ error: "Zadarma not configured" }, { status: 400 });
    }

    // Strip any quotes that might be in env vars
    const key = API_KEY.replace(/"/g, "").trim();
    const secret = API_SECRET.replace(/"/g, "").trim();

    // Test with /v1/info/balance/ first (simplest endpoint)
    const method1 = "/v1/info/balance/";
    const auth1 = zadarmaAuth(method1, key, secret);

    const res1 = await fetch(`https://api.zadarma.com${method1}`, {
      headers: { Authorization: auth1.authHeader },
    });
    const data1 = await res1.json();

    // If balance works, try webrtc
    if (data1.status === "success") {
      const method2 = "/v1/webrtc/get_key/";
      const auth2 = zadarmaAuth(method2, key, secret);
      const res2 = await fetch(`https://api.zadarma.com${method2}`, {
        headers: { Authorization: auth2.authHeader },
      });
      const data2 = await res2.json();
      return NextResponse.json(data2);
    }

    // Debug: show what we're sending
    return NextResponse.json({
      error: "API auth failed",
      balance_response: data1,
      debug: {
        key_first6: key.substring(0, 6),
        key_length: key.length,
        secret_length: secret.length,
        auth_header_preview: auth1.authHeader.substring(0, 30) + "...",
        sign_input: (method1 + "" + crypto.createHash("md5").update("").digest("hex")).substring(0, 60),
      },
    });
  } catch (error) {
    console.error("WebRTC key error:", error);
    return NextResponse.json({ error: "Failed", detail: String(error) }, { status: 500 });
  }
}
