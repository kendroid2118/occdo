import type { Metadata } from "next";

import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export const metadata: Metadata = {
  title: "Monitoring & Compliance",
};

export default function MonitoringPage() {
  return <ModulePlaceholder milestone="M8" title="Monitoring & Compliance" />;
}
