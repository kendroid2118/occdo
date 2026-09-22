import type { Metadata } from "next";

import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return <ModulePlaceholder milestone="M13" title="Settings" />;
}
