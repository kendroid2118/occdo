import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CatalogForm } from "@/components/settings/catalog-form";
import { getCurrentSessionUser } from "@/lib/auth/current-session";
import {
  CATALOG_KIND_META,
  canAdministerReferenceData,
  catalogKindFromSlug,
} from "@/lib/settings/access";

export const metadata: Metadata = {
  title: "Add catalog item",
};

type NewCatalogPageProps = {
  params: Promise<{ kind: string }>;
};

export default async function NewCatalogItemPage({ params }: NewCatalogPageProps) {
  const sessionUser = await getCurrentSessionUser();
  if (!sessionUser || !canAdministerReferenceData(sessionUser.role)) {
    notFound();
  }

  const { kind: slug } = await params;
  const kind = catalogKindFromSlug(slug);
  if (!kind) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Add {CATALOG_KIND_META[kind].singular.toLowerCase()}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Codes are stored in PostgreSQL and can be added without a code change.
        </p>
      </div>
      <CatalogForm kind={kind} />
    </div>
  );
}
