import { Metadata } from "next";
import CalendarClient from "./CalendarClient";

export const metadata: Metadata = {
  title: "Calendar - EDWartens UK",
};

export default function CalendarPage() {
  return <CalendarClient />;
}
