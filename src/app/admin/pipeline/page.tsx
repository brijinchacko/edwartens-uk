import type { Metadata } from "next";
import PipelineClient from "./PipelineClient";

export const metadata: Metadata = {
  title: "Lifecycle Pipeline | EDWartens Admin",
  description: "Lead to Student to Alumni lifecycle pipeline view",
};

export const dynamic = "force-dynamic";

export default function PipelinePage() {
  return <PipelineClient />;
}
