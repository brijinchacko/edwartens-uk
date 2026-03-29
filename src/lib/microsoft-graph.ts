// Microsoft Graph API Client — Client Credentials Flow
// Uses application-level permissions with admin consent

const TENANT_ID = process.env.AZURE_AD_TENANT_ID || "9969a7a8-372d-4251-aadb-938c65b27b87";
const CLIENT_ID = process.env.AZURE_AD_CLIENT_ID || "24ed71bc-2998-4fd3-a99c-cf4b98a30a9f";
const GRAPH_BASE = "https://graph.microsoft.com/v1.0";
const TOKEN_URL = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;

// In-memory token cache
let cachedToken: { accessToken: string; expiresAt: number } | null = null;

export async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 5 min buffer)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedToken.accessToken;
  }

  const clientSecret = process.env.AZURE_AD_CLIENT_SECRET;
  if (!clientSecret) {
    throw new Error("AZURE_AD_CLIENT_SECRET environment variable is not set");
  }

  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: clientSecret,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials",
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to get access token: ${res.status} — ${error}`);
  }

  const data = await res.json();

  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return cachedToken.accessToken;
}

// Helper for Graph API calls
async function graphFetch(url: string, options: RequestInit = {}) {
  const token = await getAccessToken();
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

  // Handle 204 No Content (sendMail)
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
 * Fetch recent emails for a user's mailbox
 */
export async function getUserEmails(
  userEmail: string,
  count: number = 20
): Promise<GraphEmail[]> {
  const url = `${GRAPH_BASE}/users/${encodeURIComponent(userEmail)}/messages?$top=${count}&$orderby=receivedDateTime desc&$select=id,subject,from,toRecipients,receivedDateTime,bodyPreview,body,isRead,conversationId,hasAttachments`;
  const data = await graphFetch(url);
  return data.value || [];
}

/**
 * Search emails in a user's mailbox
 */
export async function searchEmails(
  userEmail: string,
  query: string,
  count: number = 20
): Promise<GraphEmail[]> {
  const url = `${GRAPH_BASE}/users/${encodeURIComponent(userEmail)}/messages?$search="${encodeURIComponent(query)}"&$top=${count}&$select=id,subject,from,toRecipients,receivedDateTime,bodyPreview,body,isRead,conversationId,hasAttachments`;
  const data = await graphFetch(url);
  return data.value || [];
}

/**
 * Send an email from a user's mailbox
 */
export async function sendEmail(
  fromEmail: string,
  to: string | string[],
  subject: string,
  body: string
): Promise<{ success: boolean }> {
  const recipients = (Array.isArray(to) ? to : [to]).map((email) => ({
    emailAddress: { address: email },
  }));

  const url = `${GRAPH_BASE}/users/${encodeURIComponent(fromEmail)}/sendMail`;
  return graphFetch(url, {
    method: "POST",
    body: JSON.stringify({
      message: {
        subject,
        body: {
          contentType: "HTML",
          content: body,
        },
        toRecipients: recipients,
      },
      saveToSentItems: true,
    }),
  });
}

/**
 * Get an email thread by message ID (fetches the message and all messages in the same conversation)
 */
export async function getEmailThread(
  userEmail: string,
  messageId: string
): Promise<{ message: GraphEmail; thread: GraphEmail[] }> {
  // Fetch the specific message first
  const messageUrl = `${GRAPH_BASE}/users/${encodeURIComponent(userEmail)}/messages/${messageId}?$select=id,subject,from,toRecipients,receivedDateTime,bodyPreview,body,isRead,conversationId,hasAttachments`;
  const message = await graphFetch(messageUrl);

  // Fetch conversation thread
  const threadUrl = `${GRAPH_BASE}/users/${encodeURIComponent(userEmail)}/messages?$filter=conversationId eq '${message.conversationId}'&$orderby=receivedDateTime asc&$select=id,subject,from,toRecipients,receivedDateTime,bodyPreview,body,isRead,conversationId,hasAttachments`;
  const threadData = await graphFetch(threadUrl);

  return {
    message,
    thread: threadData.value || [],
  };
}

/**
 * Get a single email by ID
 */
export async function getEmailById(
  userEmail: string,
  messageId: string
): Promise<GraphEmail> {
  const url = `${GRAPH_BASE}/users/${encodeURIComponent(userEmail)}/messages/${messageId}?$select=id,subject,from,toRecipients,receivedDateTime,bodyPreview,body,isRead,conversationId,hasAttachments`;
  return graphFetch(url);
}
