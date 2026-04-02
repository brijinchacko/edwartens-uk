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

    // Zadarma signature algorithm:
    // 1. Sort params by key (no params for this request)
    // 2. paramsStr = http_build_query(sorted_params) => "" for no params
    // 3. md5hash = md5(paramsStr)
    // 4. signStr = methodPath + paramsStr + md5hash
    // 5. signature = base64(hmac_sha1(signStr, secret))
    // 6. Header: Authorization: key:signature

    const method = "/v1/webrtc/get_key/";
    const paramsStr = ""; // No params
    const md5hash = crypto.createHash("md5").update(paramsStr).digest("hex");
    const signStr = method + paramsStr + md5hash;
    const signature = crypto.createHmac("sha1", API_SECRET).update(signStr).digest("base64");

    const res = await fetch(`https://api.zadarma.com${method}`, {
      method: "GET",
      headers: {
        Authorization: `${API_KEY}:${signature}`,
      },
    });

    const data = await res.json();

    if (data.status === "success") {
      return NextResponse.json(data);
    }

    // If the standard method fails, try alternative path formats
    // Some Zadarma docs show without trailing slash
    const method2 = "/v1/webrtc/get_key";
    const signStr2 = method2 + paramsStr + md5hash;
    const signature2 = crypto.createHmac("sha1", API_SECRET).update(signStr2).digest("base64");

    const res2 = await fetch(`https://api.zadarma.com${method2}`, {
      method: "GET",
      headers: {
        Authorization: `${API_KEY}:${signature2}`,
      },
    });

    const data2 = await res2.json();

    if (data2.status === "success") {
      return NextResponse.json(data2);
    }

    // Try /v1/info/balance/ to verify if credentials work at all
    const balanceMethod = "/v1/info/balance/";
    const balanceSign = crypto.createHmac("sha1", API_SECRET)
      .update(balanceMethod + paramsStr + md5hash)
      .digest("base64");

    const balanceRes = await fetch(`https://api.zadarma.com${balanceMethod}`, {
      headers: { Authorization: `${API_KEY}:${balanceSign}` },
    });

    const balanceData = await balanceRes.json();

    return NextResponse.json({
      webrtc_with_slash: data,
      webrtc_without_slash: data2,
      balance_test: balanceData,
      debug: {
        key: API_KEY.substring(0, 6) + "...",
        secretLength: API_SECRET.length,
        signExample: signStr.substring(0, 50) + "...",
      },
    });
  } catch (error) {
    console.error("WebRTC key error:", error);
    return NextResponse.json({ error: "Failed to get WebRTC key", detail: String(error) }, { status: 500 });
  }
}
