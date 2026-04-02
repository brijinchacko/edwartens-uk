import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isCrmRole } from "@/lib/rbac";
import crypto from "crypto";

function zadarmaSign(method: string, params: Record<string, string> = {}) {
  const API_KEY = process.env.ZADARMA_API_KEY || "";
  const API_SECRET = process.env.ZADARMA_API_SECRET || "";

  // 1. Sort params alphabetically by key
  const sortedKeys = Object.keys(params).sort();
  // 2. Build query string (RFC 1738 encoding like PHP http_build_query)
  const paramsStr = sortedKeys.map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join("&");
  // 3. MD5 of the params string
  const md5Hash = crypto.createHash("md5").update(paramsStr).digest("hex");
  // 4. Concatenate: method + paramsStr + md5(paramsStr)
  const signStr = method + paramsStr + md5Hash;
  // 5. HMAC-SHA1 with secret, base64 encode
  const signature = crypto.createHmac("sha1", API_SECRET).update(signStr).digest("base64");

  return { key: API_KEY, signature, paramsStr };
}

async function zadarmaRequest(method: string, httpMethod: string = "GET", params: Record<string, string> = {}) {
  const API_KEY = process.env.ZADARMA_API_KEY || "";
  const { signature, paramsStr } = zadarmaSign(method, params);

  const url = httpMethod === "GET" && paramsStr
    ? `https://api.zadarma.com${method}?${paramsStr}`
    : `https://api.zadarma.com${method}`;

  const headers: Record<string, string> = {
    Authorization: `${API_KEY}:${signature}`,
  };

  const options: RequestInit = { method: httpMethod, headers };
  if (httpMethod === "POST") {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    options.body = paramsStr;
  }

  const res = await fetch(url, options);
  return res.json();
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

    const API_KEY = process.env.ZADARMA_API_KEY;
    const API_SECRET = process.env.ZADARMA_API_SECRET;

    if (!API_KEY || !API_SECRET) {
      return NextResponse.json({ error: "Zadarma not configured" }, { status: 400 });
    }

    // Try to get WebRTC key
    const webrtcData = await zadarmaRequest("/v1/webrtc/get_key/");

    // If WebRTC endpoint fails, try getting SIP info as fallback
    if (webrtcData.status === "error") {
      // Try the basic info endpoint to verify credentials work
      const sipData = await zadarmaRequest("/v1/info/balance/");
      return NextResponse.json({
        webrtc: webrtcData,
        sip: sipData,
        debug: {
          keyPresent: !!API_KEY,
          secretPresent: !!API_SECRET,
          keyLength: API_KEY.length,
        },
      });
    }

    return NextResponse.json(webrtcData);
  } catch (error) {
    console.error("WebRTC key error:", error);
    return NextResponse.json({ error: "Failed to get WebRTC key" }, { status: 500 });
  }
}
