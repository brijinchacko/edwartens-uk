import type { Metadata } from "next";
import ImportTool from "./ImportTool";
import ZohoSync from "./ZohoSync";
import FreshsalesSync from "./FreshsalesSync";

export const metadata: Metadata = {
  title: "Data Import | EDWartens Admin",
  description: "Import leads and students from CSV/Excel files or external sources",
};

export default async function ImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Data Import</h1>
        <p className="text-text-muted mt-1">
          Bulk import leads and students from CSV, Excel, or external sources
        </p>
      </div>

      {/* CSV/Excel Import Tool */}
      <ImportTool />

      {/* Zoho CRM Sync Section */}
      <ZohoSync />

      {/* Freshsales CRM Sync Section */}
      <FreshsalesSync />
    </div>
  );
}
