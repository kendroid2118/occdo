import type { Metadata } from "next";

import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export const metadata: Metadata = {
  title: "Reports",
};

export default function ReportsPage() {
  return <ModulePlaceholder milestone="M11" title="Reports" />;
}
