/**
 * Freshsales CRM API integration
 * Docs: https://developers.freshworks.com/crm/api/
 */

const FRESHSALES_API_KEY = process.env.FRESHSALES_API_KEY || "";
const FRESHSALES_DOMAIN = process.env.FRESHSALES_DOMAIN || "wartens.myfreshworks.com";
const BASE_URL = `https://${FRESHSALES_DOMAIN}/crm/sales/api`;

// Filter IDs for "All" views
const FILTERS = {
  ALL_CONTACTS: 202002404666,
  ALL_LEADS: 202002404653,
  ALL_DEALS: 202002404679,
};

async function freshsalesRequest(endpoint: string) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Token token=${FRESHSALES_API_KEY}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.errors?.message?.[0] || `Freshsales API error: ${res.status}`);
  }
  return res.json();
}

export function isFreshsalesConfigured(): boolean {
  return !!FRESHSALES_API_KEY;
}

export async function getFreshsalesCounts() {
  if (!isFreshsalesConfigured()) return { contacts: 0, leads: 0, deals: 0 };

  const [contactsData, leadsData, dealsData] = await Promise.all([
    freshsalesRequest(`/contacts/view/${FILTERS.ALL_CONTACTS}?per_page=1`).catch(() => ({ meta: { total: 0 } })),
    freshsalesRequest(`/leads/view/${FILTERS.ALL_LEADS}?per_page=1`).catch(() => ({ meta: { total: 0 } })),
    freshsalesRequest(`/deals/view/${FILTERS.ALL_DEALS}?per_page=1`).catch(() => ({ meta: { total: 0 } })),
  ]);

  return {
    contacts: contactsData?.meta?.total || 0,
    leads: leadsData?.meta?.total || 0,
    deals: dealsData?.meta?.total || 0,
  };
}

export interface FreshsalesContact {
  id: number;
  display_name: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  mobile_number: string | null;
  phone_number: string | null;
  job_title: string | null;
  company: { name: string } | null;
  lead_score: number;
  lead_source_id: number | null;
  custom_field: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zipcode: string | null;
  country: string | null;
  recent_note: string | null;
}

export interface FreshsalesDeal {
  id: number;
  name: string;
  amount: number | null;
  expected_close: string | null;
  closed_date: string | null;
  deal_stage_id: number | null;
  probability: number | null;
  created_at: string;
  updated_at: string;
  recent_note: string | null;
  custom_field: Record<string, any> | null;
}

/**
 * Fetch all contacts from Freshsales (paginated, 100 per page)
 */
export async function fetchAllContacts(
  onProgress?: (fetched: number, total: number) => void
): Promise<FreshsalesContact[]> {
  const allContacts: FreshsalesContact[] = [];
  let page = 1;
  let totalPages = 1;
  let total = 0;

  do {
    const data = await freshsalesRequest(
      `/contacts/view/${FILTERS.ALL_CONTACTS}?per_page=100&page=${page}`
    );
    const contacts = data.contacts || [];
    allContacts.push(...contacts);

    if (page === 1) {
      totalPages = data.meta?.total_pages || 1;
      total = data.meta?.total || contacts.length;
    }

    onProgress?.(allContacts.length, total);
    page++;

    // Small delay to avoid rate limiting
    if (page <= totalPages) {
      await new Promise((r) => setTimeout(r, 200));
    }
  } while (page <= totalPages);

  return allContacts;
}

/**
 * Fetch all deals from Freshsales
 */
export async function fetchAllDeals(): Promise<FreshsalesDeal[]> {
  const allDeals: FreshsalesDeal[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const data = await freshsalesRequest(
      `/deals/view/${FILTERS.ALL_DEALS}?per_page=100&page=${page}`
    );
    const deals = data.deals || [];
    allDeals.push(...deals);

    if (page === 1) {
      totalPages = data.meta?.total_pages || 1;
    }

    page++;
    if (page <= totalPages) {
      await new Promise((r) => setTimeout(r, 200));
    }
  } while (page <= totalPages);

  return allDeals;
}

/**
 * Fetch notes for a contact
 */
export async function fetchContactNotes(contactId: number): Promise<any[]> {
  try {
    const data = await freshsalesRequest(`/contacts/${contactId}/notes?per_page=100`);
    return data.notes || [];
  } catch {
    return [];
  }
}

/**
 * Fetch document associations (files) for a contact
 */
export interface FreshsalesDocument {
  id: number;
  name: string;
  content_file_size: number;
  content_content_type: string;
  content_file_size_readable: string;
  created_at: string;
  url: string;
}

export async function fetchContactDocuments(contactId: number): Promise<FreshsalesDocument[]> {
  try {
    const data = await freshsalesRequest(`/contacts/${contactId}/document_associations?per_page=100`);
    return data.documents || [];
  } catch {
    return [];
  }
}

/**
 * Download a document file from Freshsales
 * Returns the file buffer and content type
 */
export async function downloadDocument(docId: number): Promise<{ buffer: Buffer; contentType: string; fileName: string } | null> {
  try {
    // Freshsales redirects to S3 signed URL
    const downloadUrl = `https://${FRESHSALES_DOMAIN}/crm/sales/documents/${docId}`;
    const res = await fetch(downloadUrl, {
      headers: {
        Authorization: `Token token=${FRESHSALES_API_KEY}`,
      },
      redirect: "follow",
    });
    if (!res.ok) return null;

    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") || "application/octet-stream";
    // Extract filename from content-disposition or URL
    const disposition = res.headers.get("content-disposition") || "";
    const match = disposition.match(/filename="?([^"]+)"?/);
    const fileName = match ? match[1] : `doc-${docId}`;

    return { buffer, contentType, fileName };
  } catch {
    return null;
  }
}

/**
 * Fetch deal stages
 */
export async function fetchDealStages(): Promise<Record<number, string>> {
  try {
    const data = await freshsalesRequest("/deal_stages");
    const stages: Record<number, string> = {};
    for (const stage of data.deal_stages || []) {
      stages[stage.id] = stage.name;
    }
    return stages;
  } catch {
    return {};
  }
}
