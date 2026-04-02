import crypto from "crypto";

const API_KEY = (process.env.ZADARMA_API_KEY || "").replace(/"/g, "").trim();
const API_SECRET = (process.env.ZADARMA_API_SECRET || "").replace(/"/g, "").trim();
const BASE_URL = "https://api.zadarma.com";

function generateSignature(method: string, params: Record<string, string> = {}): string {
  const sorted = Object.keys(params).sort();
  const paramStr = sorted.map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join("&");
  const signStr = `${method}${paramStr}${crypto.createHash("md5").update(paramStr).digest("hex")}`;
  const sha1hex = crypto.createHmac("sha1", API_SECRET).update(signStr).digest("hex");
  return Buffer.from(sha1hex).toString("base64");
}

async function apiRequest(method: string, endpoint: string, params: Record<string, string> = {}) {
  if (!API_KEY || !API_SECRET) {
    throw new Error("Zadarma API credentials not configured");
  }

  const signature = generateSignature(endpoint, params);
  const sorted = Object.keys(params).sort();
  const paramsString = sorted.map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join("&");
  const url = method === "GET" && paramsString
    ? `${BASE_URL}${endpoint}?${paramsString}`
    : `${BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    Authorization: `${API_KEY}:${signature}`,
  };

  const options: RequestInit = { method, headers };

  if (method === "POST") {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    options.body = paramsString;
  }

  const res = await fetch(url, options);
  const data = await res.json();
  if (data.status === "error") {
    throw new Error(`Zadarma API error: ${data.message}`);
  }
  return data;
}

// ──────────────────────────────────────────────
// Click-to-Call
// ──────────────────────────────────────────────
export async function initiateCallback(fromSip: string, toNumber: string) {
  return apiRequest("GET", "/v1/request/callback/", {
    from: fromSip,
    to: toNumber,
  });
}

// ──────────────────────────────────────────────
// Call Statistics
// ──────────────────────────────────────────────
export async function getCallStatistics(start: string, end: string, skip = "0", limit = "50") {
  return apiRequest("GET", "/v1/statistics/", { start, end, skip, limit });
}

export async function getPbxStatistics(start: string, end: string, skip = "0", limit = "50") {
  return apiRequest("GET", "/v1/statistics/pbx/", { start, end, skip, limit, version: "2" });
}

export async function getIncomingCallStats(start: string, end: string) {
  return apiRequest("GET", "/v1/statistics/incoming-calls/", { start, end });
}

// ──────────────────────────────────────────────
// Call Recording
// ──────────────────────────────────────────────
export async function getCallRecording(callId: string) {
  return apiRequest("GET", "/v1/pbx/record/request/", { call_id: callId, lifetime: "7200" });
}

export async function deleteCallRecording(callId: string) {
  return apiRequest("DELETE", "/v1/pbx/record/request/", { call_id: callId });
}

// ──────────────────────────────────────────────
// PBX Info
// ──────────────────────────────────────────────
export async function getPbxExtensions() {
  return apiRequest("GET", "/v1/pbx/internal/");
}

export async function getSipAccounts() {
  return apiRequest("GET", "/v1/sip/");
}

// ──────────────────────────────────────────────
// Webhook configuration
// ──────────────────────────────────────────────
export async function setWebhookUrl(url: string) {
  return apiRequest("POST", "/v1/pbx/callinfo/url/", { url });
}

export async function enableNotifications() {
  return apiRequest("POST", "/v1/pbx/callinfo/notifications/", {
    notify_start: "true",
    notify_answer: "true",
    notify_end: "true",
    notify_out_start: "true",
    notify_out_end: "true",
  });
}

// ──────────────────────────────────────────────
// Webhook signature verification
// ──────────────────────────────────────────────
export function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.ZADARMA_API_SECRET || "";
  const expected = crypto.createHmac("sha1", secret).update(body).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
export type ZadarmaCallEvent = {
  event: "NOTIFY_START" | "NOTIFY_ANSWER" | "NOTIFY_END" | "NOTIFY_OUT_START" | "NOTIFY_OUT_END" | "NOTIFY_INTERNAL";
  call_start?: string;
  pbx_call_id?: string;
  call_id_with_rec?: string;
  caller_id?: string;
  called_did?: string;
  destination?: string;
  internal?: string;
  duration?: string;
  disposition?: string;
  status_code?: string;
  is_recorded?: string;
};

export function isZadarmaEnabled(): boolean {
  return !!(API_KEY && API_SECRET);
}
