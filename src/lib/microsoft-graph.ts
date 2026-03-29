/**
 * Microsoft Graph API Client — Per-User Delegated OAuth Flow
 * Each employee connects their own Outlook account via OAuth authorization code flow.
 * Tokens are stored per-employee in the database.
 */

import { prisma } from "./prisma";

const TENANT_ID = process.env.AZURE_AD_TENANT_ID || "";
const CLIENT_ID = process.env.AZURE_AD_CLIENT_ID || "";
const CLIENT_SECRET = process.env.AZURE_AD_CLIENT_SECRET || "";
const GRAPH_BASE = "https://graph.microsoft.com/v1.0";
const TOKEN_URL = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;
const AUTH_URL = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/authorize`;
const REDIRECT_URI = process.env.NEXTAUTH_URL
  ? `${process.env.NEXTAUTH_URL}/api/admin/emails/callback`
  : "https://edwartens.co.uk/api/admin/emails/callback";
const SCOPES = "openid offline_access Mail.Read Mail.Send User.Read";

export function isOutlookConfigured(): boolean {
  return !!(TENANT_ID && CLIENT_ID && CLIENT_SECRET);
}

/**
 * Generate the OAuth authorization URL for a user to connect their Outlook
 */
export function getAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    response_mode: "query",
    state,
    prompt: "consent",
  });
  return `${AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for access + refresh tokens
 */
export async function exchangeCodeForTokens(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  email: string;
}> {
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code,
    redirect_uri: REDIRECT_URI,
    grant_type: "authorization_code",
    scope: SCOPES,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token exchange failed: ${res.status} — ${err}`);
  }

  const data = await res.json();

  // Get user's email from Graph API
  const meRes = await fetch(`${GRAPH_BASE}/me`, {
    headers: { Authorization: `Bearer ${data.access_token}` },
  });
  const meData = await meRes.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    email: meData.mail || meData.userPrincipalName || "",
  };
}

/**
 * Refresh an expired access token using the stored refresh token
 */
async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
    scope: SCOPES,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token refresh failed: ${res.status} — ${err}`);
  }

  const data = await res.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
    expiresIn: data.expires_in,
  };
}

/**
 * Get a valid access token for an employee (auto-refreshes if expired)
 */
export async function getEmployeeToken(employeeId: string): Promise<string> {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { msAccessToken: true, msRefreshToken: true, msTokenExpiry: true, msEmail: true },
  });

  if (!employee?.msRefreshToken) {
    throw new Error("Outlook not connected. Please connect your Outlook account in Settings.");
  }

  // Check if token is still valid (with 5 min buffer)
  if (employee.msAccessToken && employee.msTokenExpiry && employee.msTokenExpiry > new Date(Date.now() + 5 * 60 * 1000)) {
    return employee.msAccessToken;
  }

  // Refresh the token
  const tokens = await refreshAccessToken(employee.msRefreshToken);

  // Save new tokens
  await prisma.employee.update({
    where: { id: employeeId },
    data: {
      msAccessToken: tokens.accessToken,
      msRefreshToken: tokens.refreshToken,
      msTokenExpiry: new Date(Date.now() + tokens.expiresIn * 1000),
    },
  });

  return tokens.accessToken;
}

/**
 * Check if an employee has connected their Outlook
 */
export async function isOutlookConnected(employeeId: string): Promise<{ connected: boolean; email: string | null }> {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { msRefreshToken: true, msEmail: true },
  });
  return {
    connected: !!employee?.msRefreshToken,
    email: employee?.msEmail || null,
  };
}

// Helper for Graph API calls with employee token
async function graphFetch(token: string, url: string, options: RequestInit = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Graph API error: ${res.status} — ${error}`);
  }

  if (res.status === 202 || res.status === 204) {
    return { success: true };
  }

  return res.json();
}

export interface GraphEmail {
  id: string;
  subject: string;
  from: { emailAddress: { name: string; address: string } };
  toRecipients: { emailAddress: { name: string; address: string } }[];
  receivedDateTime: string;
  bodyPreview: string;
  body: { contentType: string; content: string };
  isRead: boolean;
  conversationId: string;
  hasAttachments: boolean;
}

/**
 * Fetch recent emails for the authenticated employee
 */
export async function getUserEmails(
  employeeId: string,
  count: number = 20
): Promise<GraphEmail[]> {
  const token = await getEmployeeToken(employeeId);
  const url = `${GRAPH_BASE}/me/messages?$top=${count}&$orderby=receivedDateTime desc&$select=id,subject,from,toRecipients,receivedDateTime,bodyPreview,body,isRead,conversationId,hasAttachments`;
  const data = await graphFetch(token, url);
  return data.value || [];
}

/**
 * Search emails in the authenticated employee's mailbox
 */
export async function searchEmails(
  employeeId: string,
  query: string,
  count: number = 20
): Promise<GraphEmail[]> {
  const token = await getEmployeeToken(employeeId);
  const url = `${GRAPH_BASE}/me/messages?$search="${encodeURIComponent(query)}"&$top=${count}&$select=id,subject,from,toRecipients,receivedDateTime,bodyPreview,body,isRead,conversationId,hasAttachments`;
  const data = await graphFetch(token, url);
  return data.value || [];
}

/**
 * Send an email from the authenticated employee's mailbox
 */
export async function sendEmail(
  employeeId: string,
  to: string | string[],
  subject: string,
  body: string
): Promise<{ success: boolean }> {
  const token = await getEmployeeToken(employeeId);
  const recipients = (Array.isArray(to) ? to : [to]).map((email) => ({
    emailAddress: { address: email },
  }));

  return graphFetch(token, `${GRAPH_BASE}/me/sendMail`, {
    method: "POST",
    body: JSON.stringify({
      message: {
        subject,
        body: { contentType: "HTML", content: body },
        toRecipients: recipients,
      },
      saveToSentItems: true,
    }),
  });
}

/**
 * Get email thread by message ID
 */
export async function getEmailThread(
  employeeId: string,
  messageId: string
): Promise<{ message: GraphEmail; thread: GraphEmail[] }> {
  const token = await getEmployeeToken(employeeId);
  const message = await graphFetch(token, `${GRAPH_BASE}/me/messages/${messageId}?$select=id,subject,from,toRecipients,receivedDateTime,bodyPreview,body,isRead,conversationId,hasAttachments`);
  const threadData = await graphFetch(token, `${GRAPH_BASE}/me/messages?$filter=conversationId eq '${message.conversationId}'&$orderby=receivedDateTime asc&$select=id,subject,from,toRecipients,receivedDateTime,bodyPreview,body,isRead,conversationId,hasAttachments`);
  return { message, thread: threadData.value || [] };
}

/**
 * Get a single email by ID
 */
export async function getEmailById(
  employeeId: string,
  messageId: string
): Promise<GraphEmail> {
  const token = await getEmployeeToken(employeeId);
  return graphFetch(token, `${GRAPH_BASE}/me/messages/${messageId}?$select=id,subject,from,toRecipients,receivedDateTime,bodyPreview,body,isRead,conversationId,hasAttachments`);
}

// ─── Calendar Functions ────────────────────────────────────────────

export interface GraphCalendarEvent {
  id: string;
  subject: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  location?: { displayName: string };
  body?: { contentType: string; content: string };
  attendees?: { emailAddress: { name: string; address: string }; type: string }[];
  isAllDay?: boolean;
  organizer?: { emailAddress: { name: string; address: string } };
  webLink?: string;
}

/**
 * Create a calendar event in the employee's Outlook calendar
 */
export async function createCalendarEvent(
  employeeId: string,
  event: {
    subject: string;
    start: string; // ISO datetime
    end: string;
    location?: string;
    body?: string;
    attendees?: string[]; // email addresses
  }
): Promise<GraphCalendarEvent> {
  const token = await getEmployeeToken(employeeId);

  const payload: Record<string, unknown> = {
    subject: event.subject,
    start: { dateTime: event.start, timeZone: "UTC" },
    end: { dateTime: event.end, timeZone: "UTC" },
  };

  if (event.location) {
    payload.location = { displayName: event.location };
  }

  if (event.body) {
    payload.body = { contentType: "HTML", content: event.body };
  }

  if (event.attendees && event.attendees.length > 0) {
    payload.attendees = event.attendees.map((email) => ({
      emailAddress: { address: email },
      type: "required",
    }));
  }

  return graphFetch(token, `${GRAPH_BASE}/me/events`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Get calendar events for a date range from the employee's Outlook calendar
 */
export async function getCalendarEvents(
  employeeId: string,
  startDate: string,
  endDate: string
): Promise<GraphCalendarEvent[]> {
  const token = await getEmployeeToken(employeeId);
  const url = `${GRAPH_BASE}/me/calendarView?startDateTime=${encodeURIComponent(startDate)}&endDateTime=${encodeURIComponent(endDate)}&$orderby=start/dateTime&$top=100&$select=id,subject,start,end,location,body,attendees,isAllDay,organizer,webLink`;
  const data = await graphFetch(token, url, {
    headers: { Prefer: 'outlook.timezone="UTC"' },
  });
  return data.value || [];
}
