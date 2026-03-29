import type { Metadata } from "next";
import EmailClient from "./EmailClient";

export const metadata: Metadata = {
  title: "Emails | EDWartens Admin",
};

export default function EmailsPage() {
  return <EmailClient />;
}
