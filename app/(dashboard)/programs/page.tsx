import type { Metadata } from "next";

import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export const metadata: Metadata = {
  title: "Programs & Services",
};

export default function ProgramsPage() {
  return <ModulePlaceholder milestone="M5" title="Programs & Services" />;
}
