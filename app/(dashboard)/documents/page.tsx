import type { Metadata } from "next";

import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export const metadata: Metadata = {
  title: "Documents",
};

export default function DocumentsPage() {
  return <ModulePlaceholder milestone="M9" title="Documents" />;
}
