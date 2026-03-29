import type { Metadata } from "next";
import DripCampaignsClient from "./DripCampaignsClient";

export const metadata: Metadata = {
  title: "Drip Campaigns | EDWartens Admin",
  description: "Manage automated email drip campaigns",
};

export default function DripCampaignsPage() {
  return <DripCampaignsClient />;
}
