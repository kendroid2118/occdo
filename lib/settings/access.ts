import type { AuthRole } from "@/lib/auth/roles";

export const REFERENCE_ADMIN_ROLES = ["SUPER_ADMIN", "DEVELOPER"] as const;

export const SYSTEM_CONFIG_ROLES = ["SUPER_ADMIN", "DEVELOPER"] as const;

export function canAdministerReferenceData(role: AuthRole): boolean {
  return (REFERENCE_ADMIN_ROLES as readonly AuthRole[]).includes(role);
}

export function canAdministerSystemConfig(role: AuthRole): boolean {
  return (SYSTEM_CONFIG_ROLES as readonly AuthRole[]).includes(role);
}

export const CATALOG_KINDS = [
  "sector",
  "type",
  "status",
  "barangay",
  "program",
  "assistanceType",
  "requirement",
  "documentType",
] as const;

export type CatalogKind = (typeof CATALOG_KINDS)[number];

export const CATALOG_KIND_META: Record<
  CatalogKind,
  { slug: string; label: string; entityType: string; singular: string }
> = {
  sector: { slug: "sector", label: "Sectors", entityType: "CooperativeSector", singular: "Sector" },
  type: { slug: "type", label: "Types", entityType: "CooperativeType", singular: "Type" },
  status: {
    slug: "status",
    label: "Statuses",
    entityType: "CooperativeStatus",
    singular: "Status",
  },
  barangay: { slug: "barangay", label: "Barangays", entityType: "Barangay", singular: "Barangay" },
  program: { slug: "program", label: "Programs", entityType: "Program", singular: "Program" },
  assistanceType: {
    slug: "assistance-type",
    label: "Assistance types",
    entityType: "AssistanceType",
    singular: "Assistance type",
  },
  requirement: {
    slug: "requirement",
    label: "Requirements",
    entityType: "ComplianceRequirement",
    singular: "Requirement",
  },
  documentType: {
    slug: "document-type",
    label: "Document types",
    entityType: "DocumentType",
    singular: "Document type",
  },
};

export function catalogKindFromSlug(slug: string): CatalogKind | null {
  const match = (Object.entries(CATALOG_KIND_META) as [CatalogKind, (typeof CATALOG_KIND_META)[CatalogKind]][]).find(
    ([, meta]) => meta.slug === slug,
  );
  return match ? match[0] : null;
}
