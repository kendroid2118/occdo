import type { Metadata } from "next";

import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export const metadata: Metadata = {
  title: "Financial Assistance",
};

export default function FinancialAssistancePage() {
  return <ModulePlaceholder milestone="M7" title="Financial Assistance" />;
}
