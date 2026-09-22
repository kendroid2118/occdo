import type { Metadata } from "next";

import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export const metadata: Metadata = {
  title: "Capacity Building",
};

export default function CapacityBuildingPage() {
  return <ModulePlaceholder milestone="M6" title="Capacity Building" />;
}
