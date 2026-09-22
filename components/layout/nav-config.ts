import type { LucideIcon } from "lucide-react";
import {
  Building2,
  CalendarDays,
  ClipboardCheck,
  FolderOpen,
  GraduationCap,
  HandCoins,
  LayoutDashboard,
  Settings,
  BarChart3,
  Handshake,
} from "lucide-react";

export type NavChild = {
  href: string;
  label: string;
};

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  children?: NavChild[];
};

export const navigation: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/cooperatives",
    label: "Cooperatives",
    icon: Building2,
    children: [
      { href: "/cooperatives", label: "Cooperative Masterlist" },
      { href: "/cooperatives", label: "Cooperative Profile" },
      { href: "/cooperatives/cases", label: "Registration / Accreditation" },
      { href: "/cooperatives", label: "Membership" },
      { href: "/cooperatives", label: "Officers / Contacts" },
    ],
  },
  {
    href: "/programs",
    label: "Programs & Services",
    icon: Handshake,
    children: [
      { href: "/programs", label: "Programs" },
      { href: "/programs", label: "Services Availed" },
      { href: "/programs", label: "Beneficiaries" },
    ],
  },
  {
    href: "/capacity-building",
    label: "Capacity Building",
    icon: GraduationCap,
    children: [
      { href: "/capacity-building", label: "Trainings" },
      { href: "/capacity-building", label: "Seminars" },
      { href: "/capacity-building", label: "Participants" },
    ],
  },
  {
    href: "/financial-assistance",
    label: "Financial Assistance",
    icon: HandCoins,
    children: [
      { href: "/financial-assistance", label: "Assistance Records" },
      { href: "/financial-assistance", label: "Grants / Support" },
      { href: "/financial-assistance", label: "Fund Monitoring" },
    ],
  },
  {
    href: "/monitoring",
    label: "Monitoring & Compliance",
    icon: ClipboardCheck,
    children: [
      { href: "/monitoring", label: "Compliance Records" },
      { href: "/monitoring", label: "Requirements" },
      { href: "/monitoring", label: "Inspections / Monitoring" },
      { href: "/monitoring", label: "Accreditation Status" },
    ],
  },
  {
    href: "/reports",
    label: "Reports",
    icon: BarChart3,
    children: [
      { href: "/reports", label: "Cooperative Reports" },
      { href: "/reports", label: "Membership Reports" },
      { href: "/reports", label: "Assistance Reports" },
      { href: "/reports", label: "Training Reports" },
      { href: "/reports", label: "Compliance Reports" },
      { href: "/reports", label: "Summary / Statistical Reports" },
    ],
  },
  {
    href: "/documents",
    label: "Documents",
    icon: FolderOpen,
    children: [
      { href: "/documents", label: "Cooperative Documents" },
      { href: "/documents/templates", label: "Templates / Forms" },
    ],
  },
  {
    href: "/calendar",
    label: "Calendar",
    icon: CalendarDays,
    children: [
      { href: "/calendar", label: "Activities" },
      { href: "/calendar", label: "Trainings" },
      { href: "/calendar", label: "Deadlines" },
    ],
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    children: [
      { href: "/settings", label: "Users" },
      { href: "/settings", label: "Roles" },
      { href: "/settings", label: "Reference Data" },
      { href: "/settings", label: "System Configuration" },
    ],
  },
];

export function titleForPath(pathname: string): string {
  if (pathname === "/" || pathname === "/dashboard") {
    return "Dashboard";
  }
  if (pathname === "/capacity-building/new") {
    return "New training event";
  }
  if (/^\/capacity-building\/[^/]+\/edit$/.test(pathname)) {
    return "Edit training event";
  }
  if (/^\/capacity-building\/[^/]+$/.test(pathname)) {
    return "Training event";
  }
  if (pathname === "/financial-assistance/new") {
    return "Record assistance";
  }
  if (/^\/financial-assistance\/[^/]+$/.test(pathname)) {
    return "Assistance record";
  }
  if (pathname === "/monitoring/new") {
    return "Create compliance record";
  }
  if (/^\/monitoring\/[^/]+$/.test(pathname)) {
    return "Compliance record";
  }
  if (pathname === "/cooperatives/new") {
    return "New cooperative";
  }
  if (pathname === "/programs/new") {
    return "Record service delivery";
  }
  if (pathname === "/programs") {
    return "Programs & Services";
  }
  if (pathname === "/cooperatives/cases/new") {
    return "File accreditation case";
  }
  if (pathname === "/cooperatives/cases") {
    return "Registration / Accreditation";
  }
  if (/^\/cooperatives\/cases\/[^/]+$/.test(pathname)) {
    return "Accreditation case";
  }
  if (/^\/cooperatives\/[^/]+\/edit$/.test(pathname)) {
    return "Edit cooperative";
  }
  if (/^\/cooperatives\/[^/]+$/.test(pathname)) {
    return "Cooperative profile";
  }

  for (const item of navigation) {
    if (item.href === pathname) {
      return item.label;
    }
    const child = item.children?.find((entry) => entry.href === pathname);
    if (child) {
      return child.label;
    }
  }

  return "OCCDO";
}
