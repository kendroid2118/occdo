import type { Metadata } from "next";

import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export const metadata: Metadata = {
  title: "Calendar",
};

export default function CalendarPage() {
  return <ModulePlaceholder milestone="M12" title="Calendar" />;
}
