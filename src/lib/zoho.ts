// Zoho CRM REST API v2 Client
// Environment variables: ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN, ZOHO_API_DOMAIN

export interface ZohoLead {
  id: string;
  First_Name: string | null;
  Last_Name: string | null;
  Full_Name: string | null;
  Email: string | null;
  Phone: string | null;
  Mobile: string | null;
  Lead_Source: string | null;
  Lead_Status: string | null;
  Description: string | null;
  Company: string | null;
  City: string | null;
  Country: string | null;
  Created_Time: string;
  Modified_Time: string;
}

export interface ZohoContact {
  id: string;
  First_Name: string | null;
  Last_Name: string | null;
  Full_Name: string | null;
  Email: string | null;
  Phone: string | null;
  Mobile: string | null;
  Mailing_City: string | null;
  Mailing_Country: string | null;
  Description: string | null;
  Lead_Source: string | null;
  Created_Time: string;
  Modified_Time: string;
}

export interface ZohoDeal {
  id: string;
  Deal_Name: string;
  Amount: number | null;
  Stage: string | null;
  Contact_Name: { id: string; name: string } | null;
  Closing_Date: string | null;
  Description: string | null;
  Created_Time: string;
  Modified_Time: string;
}

interface ZohoTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  api_domain: string;
  error?: string;
}

interface ZohoListResponse<T> {
  data: T[];
  info: {
    per_page: number;
    count: number;
    page: number;
    more_records: boolean;
  };
}

class ZohoCRM {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  private get clientId(): string {
    return process.env.ZOHO_CLIENT_ID || "";
  }

  private get clientSecret(): string {
    return process.env.ZOHO_CLIENT_SECRET || "";
  }

  private get refreshToken(): string {
    return process.env.ZOHO_REFRESH_TOKEN || "";
  }

  private get apiDomain(): string {
    return process.env.ZOHO_API_DOMAIN || "https://www.zohoapis.eu";
  }

  private get accountsDomain(): string {
    // EU accounts domain for UK company
    const api = this.apiDomain;
    if (api.includes(".eu")) return "https://accounts.zoho.eu";
    if (api.includes(".in")) return "https://accounts.zoho.in";
    if (api.includes(".com.au")) return "https://accounts.zoho.com.au";
    if (api.includes(".com.cn")) return "https://accounts.zoho.com.cn";
    return "https://accounts.zoho.com";
  }

  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret && this.refreshToken);
  }

  async getAccessToken(): Promise<string> {
    // Return cached token if still valid (with 60s buffer)
    if (this.accessToken && Date.now() < this.tokenExpiry - 60000) {
      return this.accessToken;
    }

    const params = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: this.clientId,
      client_secret: this.clientSecret,
      refresh_token: this.refreshToken,
    });

    const response = await fetch(
      `${this.accountsDomain}/oauth/v2/token?${params.toString()}`,
      { method: "POST" }
    );

    if (!response.ok) {
      throw new Error(`Zoho token refresh failed: ${response.status} ${response.statusText}`);
    }

    const data: ZohoTokenResponse = await response.json();

    if (data.error) {
      throw new Error(`Zoho token error: ${data.error}`);
    }

    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + data.expires_in * 1000;

    return this.accessToken;
  }

  private async apiRequest<T>(endpoint: string): Promise<T> {
    const token = await this.getAccessToken();

    const response = await fetch(`${this.apiDomain}/crm/v2${endpoint}`, {
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Zoho API error ${response.status}: ${text}`);
    }

    return response.json();
  }

  async getLeads(page: number = 1): Promise<ZohoLead[]> {
    try {
      const data = await this.apiRequest<ZohoListResponse<ZohoLead>>(
        `/Leads?page=${page}&per_page=200`
      );
      return data.data || [];
    } catch {
      return [];
    }
  }

  async getAllLeads(): Promise<ZohoLead[]> {
    const allLeads: ZohoLead[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const data = await this.apiRequest<ZohoListResponse<ZohoLead>>(
        `/Leads?page=${page}&per_page=200`
      );
      if (data.data && data.data.length > 0) {
        allLeads.push(...data.data);
        hasMore = data.info.more_records;
        page++;
      } else {
        hasMore = false;
      }
    }

    return allLeads;
  }

  async getContacts(page: number = 1): Promise<ZohoContact[]> {
    try {
      const data = await this.apiRequest<ZohoListResponse<ZohoContact>>(
        `/Contacts?page=${page}&per_page=200`
      );
      return data.data || [];
    } catch {
      return [];
    }
  }

  async getAllContacts(): Promise<ZohoContact[]> {
    const allContacts: ZohoContact[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const data = await this.apiRequest<ZohoListResponse<ZohoContact>>(
        `/Contacts?page=${page}&per_page=200`
      );
      if (data.data && data.data.length > 0) {
        allContacts.push(...data.data);
        hasMore = data.info.more_records;
        page++;
      } else {
        hasMore = false;
      }
    }

    return allContacts;
  }

  async getDeals(page: number = 1): Promise<ZohoDeal[]> {
    try {
      const data = await this.apiRequest<ZohoListResponse<ZohoDeal>>(
        `/Deals?page=${page}&per_page=200`
      );
      return data.data || [];
    } catch {
      return [];
    }
  }

  async getAllDeals(): Promise<ZohoDeal[]> {
    const allDeals: ZohoDeal[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const data = await this.apiRequest<ZohoListResponse<ZohoDeal>>(
        `/Deals?page=${page}&per_page=200`
      );
      if (data.data && data.data.length > 0) {
        allDeals.push(...data.data);
        hasMore = data.info.more_records;
        page++;
      } else {
        hasMore = false;
      }
    }

    return allDeals;
  }

  async getLeadNotes(leadId: string): Promise<{ Note_Content: string; Created_Time: string; Created_By: { name: string } }[]> {
    try {
      const data = await this.apiRequest<any>(`/Leads/${leadId}/Notes`);
      return data.data || [];
    } catch {
      return [];
    }
  }

  async getContactNotes(contactId: string): Promise<{ Note_Content: string; Created_Time: string; Created_By: { name: string } }[]> {
    try {
      const data = await this.apiRequest<any>(`/Contacts/${contactId}/Notes`);
      return data.data || [];
    } catch {
      return [];
    }
  }

  async getLeadAttachments(leadId: string): Promise<any[]> {
    try {
      const data = await this.apiRequest<any>(`/Leads/${leadId}/Attachments`);
      return data.data || [];
    } catch {
      return [];
    }
  }

  async downloadAttachment(module: string, recordId: string, attachmentId: string): Promise<Buffer | null> {
    try {
      const token = await this.getAccessToken();
      const res = await fetch(`${this.apiDomain}/crm/v2/${module}/${recordId}/Attachments/${attachmentId}`, {
        headers: { Authorization: `Zoho-oauthtoken ${token}` },
      });
      if (!res.ok) return null;
      return Buffer.from(await res.arrayBuffer());
    } catch {
      return null;
    }
  }

  async getRecordCount(module: string): Promise<number> {
    try {
      const data = await this.apiRequest<ZohoListResponse<unknown>>(
        `/${module}?page=1&per_page=1`
      );
      return data.info?.count || 0;
    } catch {
      return 0;
    }
  }
}

// Singleton instance
export const zohoCRM = new ZohoCRM();
